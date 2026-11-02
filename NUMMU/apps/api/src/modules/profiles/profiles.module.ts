import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { ProgressModule } from '../progress/progress.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [UsersModule, AuthModule, ProgressModule, GamificationModule],
  controllers: [ProfilesController],
})
export class ProfilesModule {}
