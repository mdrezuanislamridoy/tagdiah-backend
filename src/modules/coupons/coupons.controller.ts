import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Coupons')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate a promotional coupon code against a cart subtotal (Public)' })
  @ApiResponse({ status: 200, description: 'Discount details if valid' })
  validate(@Body() dto: ValidateCouponDto) {
    return this.couponsService.validate(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all promotional coupons (Admin only)' })
  findAll() {
    return this.couponsService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get coupon details by ID or code (Admin only)' })
  findOne(@Param('id') id: string) {
    return this.couponsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new promotional coupon code (Admin only)' })
  create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update coupon discount rate, limits or status (Admin only)' })
  update(@Param('id') id: string, @Body() dto: UpdateCouponDto) {
    return this.couponsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete promotional coupon (Admin only)' })
  remove(@Param('id') id: string) {
    return this.couponsService.remove(id);
  }
}
