import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/module';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from './auth/auth.module';
import { InterviewsModule } from '../interviews/interviews.module';
import { HealthModule } from '../health/health.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule, InterviewsModule, HealthModule,
    ThrottlerModule.forRoot({
      throttlers: [
        { name: 'default', ttl: 60_000, limit: 5 }
      ],
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule { }
