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
import { ReviewsService } from './reviews.service';
import { CreateReviewDto, UpdateReviewStatusDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a product review and rating (Verified Buyers Only)' })
  @ApiResponse({ status: 201, description: 'Review submitted' })
  create(@Body() dto: CreateReviewDto, @Request() req: any) {
    let userId: string | undefined;
    let userEmail: string | undefined;
    if (req.user) {
      userId = req.user.sub;
      userEmail = req.user.email;
    }
    return this.reviewsService.create(dto, userId, userEmail);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Get approved reviews and rating breakdown for a product' })
  @ApiParam({ name: 'productId', description: 'Product ID or Slug' })
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all reviews across the catalogue for moderation (Admin only)' })
  findAll() {
    return this.reviewsService.findAll();
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Moderate review status (Pending, Approved, Rejected)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateReviewStatusDto) {
    return this.reviewsService.updateStatus(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete review (Admin only)' })
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(id);
  }
}
