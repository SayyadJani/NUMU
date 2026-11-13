import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ProblemsModule } from '../problems/problems.module';
import { AdminController } from './admin.controller';
import { AdminScopeService } from './admin-scope.service';
import { AdminService } from './admin.service';
import { AdminDsaHubController } from './admin-dsa-hub.controller';
import { AdminDsaHubService } from './admin-dsa-hub.service';
import { AdminPracticeController } from './admin-practice.controller';
import { AdminPracticeService } from './admin-practice.service';

@Module({
  imports: [PrismaModule, AuthModule, ProblemsModule],
  controllers: [
    AdminController,
    AdminDsaHubController,
    AdminPracticeController,
  ],
  providers: [
    AdminService,
    AdminScopeService,
    AdminDsaHubService,
    AdminPracticeService,
  ],
  exports: [
    AdminService,
    AdminScopeService,
    AdminDsaHubService,
    AdminPracticeService,
  ],
})
export class AdminModule {}

