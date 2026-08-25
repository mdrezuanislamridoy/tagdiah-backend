import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateContactMessageDto {
  @ApiProperty({ example: 'Nusrat Jahan' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'nusrat@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ example: '+880 1712 345678' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'A question about a product' })
  @IsString()
  @IsNotEmpty()
  topic: string;

  @ApiProperty({ example: 'Do you offer custom sizing for the Aranya Door Porda?' })
  @IsString()
  @IsNotEmpty()
  message: string;
}

export class SubscribeNewsletterDto {
  @ApiProperty({ example: 'customer@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}

export class UpdateMessageStatusDto {
  @ApiProperty({ example: 'Read', enum: ['Unread', 'Read', 'Replied', 'Archived'] })
  @IsString()
  @IsNotEmpty()
  status: string;
}
