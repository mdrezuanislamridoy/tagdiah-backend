import { Controller, Get, Patch, Post, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('System & Notifications')
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
  @ApiOperation({ summary: 'Get live admin notifications feed and unread count' })
  @ApiResponse({ status: 200, description: 'Aggregated notifications' })
  getNotifications() {
    return this.appService.getNotifications();
  }

  @Patch('notifications/:id/read')
  @ApiOperation({ summary: 'Mark single notification as read' })
  markAsRead(@Param('id') id: string) {
    return this.appService.markAsRead(id);
  }

  @Post('notifications/read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  markAllAsRead() {
    return this.appService.markAllAsRead();
  }
}
