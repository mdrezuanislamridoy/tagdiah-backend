import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/order.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtPayload } from '../auth/auth.service';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new Cash on Delivery order (Authenticated Customers Only)' })
  @ApiResponse({ status: 201, description: 'Order placed successfully' })
  create(@Body() dto: CreateOrderDto, @Request() req: any) {
    const userId = req.user?.sub;
    return this.ordersService.create(dto, userId);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get order history for the logged-in customer' })
  @ApiResponse({ status: 200, description: 'Return customer order list' })
  getMyOrders(@Request() req: { user: JwtPayload }) {
    return this.ordersService.findMyOrders(req.user.sub, req.user.email);
  }

  @Get('dashboard/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get aggregated dashboard KPIs, revenue analytics, and recent orders (Admin only)' })
  getDashboardStats() {
    return this.ordersService.getDashboardStats();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all orders in the system (Admin only)' })
  @ApiResponse({ status: 200, description: 'Return all orders' })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details and live tracking by ID or Order Number' })
  @ApiParam({ name: 'id', description: 'Order ID or Order Number (e.g. TGD-28941)' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update order status and courier tracking info (Admin only)' })
  @ApiParam({ name: 'id', description: 'Order ID or Order Number' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}
