import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import {
  CreateContactMessageDto,
  SubscribeNewsletterDto,
  UpdateMessageStatusDto,
} from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  /* ── 1. Submit Contact Inquiry ── */
  async submitContact(dto: CreateContactMessageDto) {
    const record = await this.prisma.contactMessage.create({
      data: {
        name: dto.name,
        email: dto.email,
        phone: dto.phone || null,
        topic: dto.topic,
        message: dto.message,
        status: 'Unread',
      },
    });

    // Send receipt email to sender (non-blocking)
    this.mailService.sendContactReceipt(dto.email, dto.name, dto.topic);

    return record;
  }

  /* ── 2. Get All Contact Messages (Admin) ── */
  async findAllMessages() {
    return this.prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  /* ── 3. Update Message Status (Admin) ── */
  async updateMessageStatus(id: string, dto: UpdateMessageStatusDto) {
    const msg = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!msg) throw new NotFoundException(`Message ${id} not found.`);

    return this.prisma.contactMessage.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  /* ── 4. Subscribe Newsletter ── */
  async subscribeNewsletter(dto: SubscribeNewsletterDto) {
    const email = dto.email.trim().toLowerCase();

    // Upsert subscriber
    const subscriber = await this.prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { status: 'Subscribed' },
      create: { email, status: 'Subscribed' },
    });

    // Send welcome discount gift code
    this.mailService.sendNewsletterWelcome(email, 'TAGDIAH10');

    return {
      success: true,
      message: 'Subscribed successfully. Check your email for your welcome discount code.',
      promoCode: 'TAGDIAH10',
    };
  }

  /* ── 5. Get All Subscribers (Admin) ── */
  async findAllSubscribers() {
    return this.prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
}
