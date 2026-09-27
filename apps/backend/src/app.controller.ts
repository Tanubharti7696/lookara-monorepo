import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './common/guards/jwt-auth.guard.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('api/v1/health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
