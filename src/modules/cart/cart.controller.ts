import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddToCartDto, SyncCartDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.service';

@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiOperation({ summary: 'Get user cart items from database' })
  getUserCart(@Request() req: { user: JwtPayload }) {
    return this.cartService.getUserCart(req.user.sub);
  }

  @Post()
  @ApiOperation({ summary: 'Add or increment item in user cart' })
  addToCart(@Request() req: { user: JwtPayload }, @Body() dto: AddToCartDto) {
    return this.cartService.addToCart(req.user.sub, dto);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Synchronize cart items batch from local browser storage to database' })
  syncCart(@Request() req: { user: JwtPayload }, @Body() dto: SyncCartDto) {
    return this.cartService.syncCart(req.user.sub, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiParam({ name: 'id', description: 'Cart Item ID' })
  updateQuantity(
    @Request() req: { user: JwtPayload },
    @Param('id') id: string,
    @Body('quantity') quantity: number,
  ) {
    return this.cartService.updateQuantity(req.user.sub, id, quantity);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove item from cart' })
  @ApiParam({ name: 'id', description: 'Cart Item ID' })
  removeItem(@Request() req: { user: JwtPayload }, @Param('id') id: string) {
    return this.cartService.removeItem(req.user.sub, id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear user cart' })
  clearCart(@Request() req: { user: JwtPayload }) {
    return this.cartService.clearCart(req.user.sub);
  }
}
