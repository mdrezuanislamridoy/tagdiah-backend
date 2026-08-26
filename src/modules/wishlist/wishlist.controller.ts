import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { WishlistService } from './wishlist.service';
import { SyncWishlistDto, ToggleWishlistDto } from './dto/wishlist.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtPayload } from '../auth/auth.service';

@ApiTags('Wishlist')
@Controller('wishlist')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class WishlistController {
  constructor(private readonly wishlistService: WishlistService) {}

  @Get()
  @ApiOperation({ summary: 'Get user wishlist product IDs from database' })
  getUserWishlist(@Request() req: { user: JwtPayload }) {
    return this.wishlistService.getUserWishlist(req.user.sub);
  }

  @Post('toggle')
  @ApiOperation({ summary: 'Toggle product in user wishlist' })
  toggleWishlist(@Request() req: { user: JwtPayload }, @Body() dto: ToggleWishlistDto) {
    return this.wishlistService.toggleWishlist(req.user.sub, dto);
  }

  @Post('sync')
  @ApiOperation({ summary: 'Synchronize wishlist array from local browser storage to database' })
  syncWishlist(@Request() req: { user: JwtPayload }, @Body() dto: SyncWishlistDto) {
    return this.wishlistService.syncWishlist(req.user.sub, dto);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear user wishlist' })
  clearWishlist(@Request() req: { user: JwtPayload }) {
    return this.wishlistService.clearWishlist(req.user.sub);
  }
}
