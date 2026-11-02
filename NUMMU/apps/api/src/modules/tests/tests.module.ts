import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller';
import { AdminTestsController } from './admin-tests.controller';
import { TestsService } from './tests.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { SubmissionsModule } from '../submissions/submissions.module';
import { GamificationModule } from '../gamification/gamification.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, SubmissionsModule, GamificationModule, AuthModule],
  controllers: [TestsController, AdminTestsController],
  providers: [TestsService],
  exports: [TestsService],
})
export class TestsModule {}
