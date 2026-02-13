import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { timestamp } from 'rxjs';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) { }
  @Get()
  ok() {
    // return { ok: true };
    const dbState = this.connection.readyState === 1 ? 'connected' : 'disconnected';

    return {
      status: 'ok',
      db: dbState,
      timestamp: new Date().toISOString(),
    }
  }
}