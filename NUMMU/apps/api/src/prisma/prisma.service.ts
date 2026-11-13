import { Injectable, type OnModuleInit, type OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const dbUrl = configService.get<string>('DATABASE_URL') || process.env['DATABASE_URL'];
    super(
      dbUrl
        ? {
            datasources: {
              db: { url: dbUrl },
            },
          }
        : undefined,
    );
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL database');
    } catch (err) {
      this.logger.warn(
        `Database connection not established on boot: ${(err as Error).message}. Verify DATABASE_URL in .env if PostgreSQL is running.`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
