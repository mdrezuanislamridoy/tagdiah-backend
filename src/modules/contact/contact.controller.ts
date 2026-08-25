import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ContactService } from './contact.service';
import {
  CreateContactMessageDto,
  SubscribeNewsletterDto,
  UpdateMessageStatusDto,
} from './dto/contact.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@ApiTags('Contact & Newsletter')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post()
  @ApiOperation({ summary: 'Submit a contact / inquiry message (Public)' })
  @ApiResponse({ status: 201, description: 'Message received and confirmation dispatched' })
  submitContact(@Body() dto: CreateContactMessageDto) {
    return this.contactService.submitContact(dto);
  }

  @Post('newsletter/subscribe')
  @ApiOperation({ summary: 'Subscribe to newsletter and receive 10% welcome coupon (Public)' })
  @ApiResponse({ status: 200, description: 'Subscribed' })
  subscribeNewsletter(@Body() dto: SubscribeNewsletterDto) {
    return this.contactService.subscribeNewsletter(dto);
  }

  @Get('messages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all received customer messages (Admin only)' })
  findAllMessages() {
    return this.contactService.findAllMessages();
  }

  @Patch('messages/:id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update message status (Admin only)' })
  updateMessageStatus(@Param('id') id: string, @Body() dto: UpdateMessageStatusDto) {
    return this.contactService.updateMessageStatus(id, dto);
  }

  @Get('newsletter/subscribers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Super Admin', 'Store Admin', 'Store Manager')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all newsletter subscribers (Admin only)' })
  findAllSubscribers() {
    return this.contactService.findAllSubscribers();
  }
}
