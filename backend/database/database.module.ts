import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uri = config.get<string>('mongoUri');

        if (!uri) {
          console.warn('[DatabaseModule] MONGO_URI not set. Skipping DB connection.');
          return {};
        }

        return { uri };
      },
    }),
  ],
})

export class DatabaseModule {}