import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/module';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from './auth/auth.module';
import { InterviewsModule } from '../interviews/interviews.module';
import { HealthModule } from '../health/health.module';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule, InterviewsModule, HealthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
