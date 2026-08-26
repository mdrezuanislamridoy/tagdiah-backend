import { Controller, Get, Put, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SettingsService } from './settings.service';
import { UpdateDeliverySettingsDto } from './dto/settings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Settings & Configuration')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('all')
  @ApiOperation({ summary: 'Get all store settings sections (Public/Admin)' })
  @ApiResponse({ status: 200, description: 'All settings' })
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Get('delivery')
  @ApiOperation({ summary: 'Get active delivery methods and shipping fees (Public)' })
  @ApiResponse({ status: 200, description: 'Delivery configuration' })
  getDeliverySettings() {
    return this.settingsService.getDeliverySettings();
  }

  @Put('delivery')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update delivery methods and shipping thresholds (Admin only)' })
  updateDeliverySettings(@Body() dto: UpdateDeliverySettingsDto) {
    return this.settingsService.updateDeliverySettings(dto);
  }

  @Put('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update all store settings sections (Admin only)' })
  updateAllSettings(@Body() body: any) {
    return this.settingsService.updateAllSettings(body);
  }

  @Put(':section')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a specific settings section (Admin only)' })
  updateSectionSettings(@Param('section') section: string, @Body() body: any) {
    return this.settingsService.updateSectionSettings(section, body);
  }
}
