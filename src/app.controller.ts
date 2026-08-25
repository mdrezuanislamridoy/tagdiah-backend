import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System & Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  @ApiOperation({ summary: 'Backend Health Check' })
  @ApiResponse({ status: 200, description: 'API is healthy and running' })
  getHealth() {
    return this.appService.getHealthStatus();
  }

  @Get('notifications')
  @ApiOperation({ summary: 'Get live admin notifications feed' })
  @ApiResponse({ status: 200, description: 'Aggregated notifications' })
  getNotifications() {
    return this.appService.getNotifications();
  }
}
