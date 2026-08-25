import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateDeliverySettingsDto } from './dto/settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Settings & Delivery')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('delivery')
  @ApiOperation({ summary: 'Get active delivery methods and shipping fees (Public)' })
  @ApiResponse({ status: 200, description: 'Delivery configuration' })
  getDeliverySettings() {
    return this.settingsService.getDeliverySettings();
  }

  @Put('delivery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update delivery methods and shipping thresholds (Admin only)' })
  updateDeliverySettings(@Body() dto: UpdateDeliverySettingsDto) {
    return this.settingsService.updateDeliverySettings(dto);
  }
}
