import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SubmissionsController } from './submissions.controller';
import { SubmissionsService } from './submissions.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { EXECUTION_PROVIDER } from './providers/execution-provider.interface';
import { MockExecutionProvider } from './providers/mock-execution.provider';
import { Judge0ExecutionProvider } from './providers/judge0-execution.provider';
import { LanguageRegistry } from './registry/language.registry';
import { DriverRegistry } from './registry/driver.registry';
import { OutputComparatorService } from './comparators/output-comparator.service';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
  imports: [PrismaModule, AuthModule, ConfigModule, GamificationModule],
  controllers: [SubmissionsController],
  providers: [
    SubmissionsService,
    LanguageRegistry,
    DriverRegistry,
    OutputComparatorService,
    Judge0ExecutionProvider,
    MockExecutionProvider,
    {
      provide: EXECUTION_PROVIDER,
      useFactory: (
        configService: ConfigService,
        judge0Provider: Judge0ExecutionProvider,
        mockProvider: MockExecutionProvider,
      ) => {
        const providerName = configService.get<string>('EXECUTION_PROVIDER', 'judge0');
        if (providerName.toLowerCase() === 'mock') {
          return mockProvider;
        }
        return judge0Provider;
      },
      inject: [ConfigService, Judge0ExecutionProvider, MockExecutionProvider],
    },
  ],
  exports: [
    SubmissionsService,
    LanguageRegistry,
    DriverRegistry,
    OutputComparatorService,
    EXECUTION_PROVIDER,
  ],
})
export class SubmissionsModule {}
