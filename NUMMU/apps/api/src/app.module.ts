import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { TopicsModule } from './modules/topics/topics.module';
import { ProblemsModule } from './modules/problems/problems.module';
import { SubmissionsModule } from './modules/submissions/submissions.module';
import { ProgressModule } from './modules/progress/progress.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { TestsModule } from './modules/tests/tests.module';
import { NotesModule } from './modules/notes/notes.module';
import { AdminModule } from './modules/admin/admin.module';
import { PracticeModule } from './modules/practice/practice.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        'apps/api/.env.local',
        'apps/api/.env',
        '.env.local',
        '.env',
      ],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per minute per IP
      },
    ]),
    PrismaModule,
    HealthModule,
    AuthModule,
    UsersModule,
    ProfilesModule,
    OrganizationsModule,
    TopicsModule,
    ProblemsModule,
    SubmissionsModule,
    ProgressModule,
    GamificationModule,
    TestsModule,
    NotesModule,
    AdminModule,
    PracticeModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
