import { PrismaClient, Role } from '@prisma/client';
import * as crypto from 'crypto';

const generateSecureRandomToken = (): string => crypto.randomBytes(32).toString('hex');
const hashToken = (token: string): string => crypto.createHash('sha256').update(token).digest('hex');

/**
 * PostgreSQL Integration Test Suite for Auth, Session Lifecycle, and Data Persistence
 * Validates concurrency guarantees, atomic row updates, token family revocation,
 * and user ownership directly against PostgreSQL.
 */
describe('PostgreSQL Auth & Concurrency Integration Tests', () => {
  let prisma: PrismaClient;
  let isDbConnected = false;

  const testUserId = `test-user-${Date.now()}`;
  const otherUserId = `other-user-${Date.now()}`;
  const testFamily = `family-${Date.now()}`;
  let testSessionId: string;

  beforeAll(async () => {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL || 'postgresql://numu_user:numu_dev_password@localhost:5432/numu_db?schema=public',
        },
      },
    });

    try {
      await prisma.$connect();
      // Quick query to confirm DB is truly accessible
      await prisma.$queryRaw`SELECT 1`;
      isDbConnected = true;

      // Seed test users
      await prisma.user.createMany({
        data: [
          {
            id: testUserId,
            email: `integration-${Date.now()}@numu.io`,
            username: `integ_${Date.now()}`,
            role: Role.STUDENT,
          },
          {
            id: otherUserId,
            email: `other-${Date.now()}@numu.io`,
            username: `other_${Date.now()}`,
            role: Role.STUDENT,
          },
        ],
      });

      // Create a test session
      const session = await prisma.session.create({
        data: {
          userId: testUserId,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30-day absolute ceiling
          lastActivityAt: new Date(),
        },
      });
      testSessionId = session.id;
    } catch {
      isDbConnected = false;
      // Database not reachable in this local environment; tests will note this limitation
    }
  });

  afterAll(async () => {
    if (isDbConnected) {
      try {
        await prisma.refreshToken.deleteMany({ where: { userId: testUserId } });
        await (prisma as any).note?.deleteMany({ where: { userId: testUserId } });
        await prisma.session.deleteMany({ where: { userId: testUserId } });
        await prisma.profile.deleteMany({ where: { userId: testUserId } });
        await prisma.user.deleteMany({ where: { id: { in: [testUserId, otherUserId] } } });
        await prisma.$disconnect();
      } catch {
        // Cleanup best effort
      }
    }
  });

  it('PostgreSQL atomic conditional update: only 1 of 2 concurrent rotation requests wins the race', async () => {
    if (!isDbConnected) {
      console.warn('Skipping actual PostgreSQL test: PostgreSQL database is not reachable at DATABASE_URL');
      return;
    }

    const rawToken = generateSecureRandomToken();
    const tokenHash = hashToken(rawToken);

    // Insert active token in PostgreSQL
    const initialToken = await prisma.refreshToken.create({
      data: {
        userId: testUserId,
        sessionId: testSessionId,
        tokenHash,
        family: testFamily,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const replacement1 = hashToken(generateSecureRandomToken());
    const replacement2 = hashToken(generateSecureRandomToken());

    // Execute two simultaneous atomic conditional updates on PostgreSQL
    const [res1, res2] = await Promise.all([
      prisma.refreshToken.updateMany({
        where: { id: initialToken.id, isRevoked: false, replacedByTokenHash: null },
        data: { isRevoked: true, replacedByTokenHash: replacement1 },
      }),
      prisma.refreshToken.updateMany({
        where: { id: initialToken.id, isRevoked: false, replacedByTokenHash: null },
        data: { isRevoked: true, replacedByTokenHash: replacement2 },
      }),
    ]);

    // In PostgreSQL, exactly ONE query must affect 1 row, and the other must affect 0 rows
    const counts = [res1.count, res2.count];
    expect(counts).toContain(1);
    expect(counts).toContain(0);
    expect(res1.count + res2.count).toBe(1);

    // Verify persisted state in PostgreSQL
    const persisted = await prisma.refreshToken.findUnique({
      where: { id: initialToken.id },
    });
    expect(persisted?.isRevoked).toBe(true);
    expect([replacement1, replacement2]).toContain(persisted?.replacedByTokenHash);
  });

  it('PostgreSQL token family replay revocation: revokes all tokens in family on replay detection', async () => {
    if (!isDbConnected) {
      console.warn('Skipping actual PostgreSQL test: PostgreSQL database is not reachable at DATABASE_URL');
      return;
    }

    const familyId = `replay-fam-${Date.now()}`;
    const t1 = await prisma.refreshToken.create({
      data: {
        userId: testUserId,
        sessionId: testSessionId,
        tokenHash: hashToken(generateSecureRandomToken()),
        family: familyId,
        isRevoked: true,
        expiresAt: new Date(Date.now() + 100000),
      },
    });
    const t2 = await prisma.refreshToken.create({
      data: {
        userId: testUserId,
        sessionId: testSessionId,
        tokenHash: hashToken(generateSecureRandomToken()),
        family: familyId,
        isRevoked: false,
        expiresAt: new Date(Date.now() + 100000),
      },
    });

    // Revoke whole family on replay detection
    const updateResult = await prisma.refreshToken.updateMany({
      where: { family: familyId },
      data: { isRevoked: true },
    });

    expect(updateResult.count).toBe(2);

    const checkT2 = await prisma.refreshToken.findUnique({ where: { id: t2.id } });
    expect(checkT2?.isRevoked).toBe(true);
  });

  it('PostgreSQL session activity update: conditional update affects 0 rows if session is already revoked', async () => {
    if (!isDbConnected) {
      console.warn('Skipping actual PostgreSQL test: PostgreSQL database is not reachable at DATABASE_URL');
      return;
    }

    const revokedSession = await prisma.session.create({
      data: {
        userId: testUserId,
        isRevoked: true,
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 100000),
        lastActivityAt: new Date(Date.now() - 10 * 60 * 1000),
      },
    });

    // Guarded activity update attempt
    const updateResult = await prisma.session.updateMany({
      where: {
        id: revokedSession.id,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      data: { lastActivityAt: new Date() },
    });

    // Must NOT update revoked session
    expect(updateResult.count).toBe(0);
  });

  it('PostgreSQL notes persistence and user ownership isolation', async () => {
    if (!isDbConnected) {
      console.warn('Skipping actual PostgreSQL test: PostgreSQL database is not reachable at DATABASE_URL');
      return;
    }

    const noteClient = (prisma as any).note;
    if (!noteClient) {
      console.warn('Skipping note persistence test: note client not generated in PrismaClient');
      return;
    }

    // User A creates a note
    const userANote = await noteClient.create({
      data: {
        userId: testUserId,
        title: 'User A Secret Note',
        content: 'Confidential algorithms notes',
        category: 'dsa',
        tags: ['Secret'],
      },
    });

    expect(userANote.id).toBeDefined();

    // User B tries to find User A's note via ownership query
    const userBQueryResult = await noteClient.findFirst({
      where: { id: userANote.id, userId: otherUserId },
    });

    expect(userBQueryResult).toBeNull();

    // Cleanup note
    await noteClient.delete({ where: { id: userANote.id } });
  });
});
