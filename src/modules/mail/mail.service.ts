import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private from: string;
  private logger = new Logger('MailService');

  constructor(private configService: ConfigService) {
    this.from = this.configService.get<string>('SMTP_FROM', 'Tagdiah <noreply@tagdiah.com>');

    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: this.configService.get<number>('SMTP_PORT', 587),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });
  }

  /** Send email verification OTP */
  async sendVerificationCode(email: string, name: string, code: string): Promise<void> {
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #2B2724;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; font-weight: 300; letter-spacing: 2px; color: #2B2724; margin: 0;">Tagdiah</h1>
          <p style="font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #C4A265; margin-top: 4px;">Home Decor &amp; Arts</p>
        </div>
        <h2 style="font-size: 20px; font-weight: 400; margin-bottom: 8px;">Verify your email</h2>
        <p style="font-size: 14px; color: #6B5E54; line-height: 1.6;">
          Hello <strong>${name}</strong>, welcome to Tagdiah! Use the code below to verify your email address.
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: #FAF6F0; border: 1px solid #E8E0D4; padding: 16px 40px; letter-spacing: 8px; font-size: 32px; font-weight: 600; color: #2B2724;">
            ${code}
          </div>
        </div>
        <p style="font-size: 13px; color: #8C7E72; text-align: center;">
          This code expires in <strong>15 minutes</strong>. If you didn't create an account, you can ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #E8E0D4; margin: 32px 0;" />
        <p style="font-size: 11px; color: #A99E94; text-align: center;">
          © ${new Date().getFullYear()} Tagdiah Home Decor &amp; Arts. All rights reserved.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: `${code} — Verify your Tagdiah account`,
        html,
      });
      this.logger.log(`Verification email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${email}`, error);
      // Don't throw — registration should still succeed even if email fails
    }
  }

  /** Send password reset OTP */
  async sendPasswordResetCode(email: string, name: string, code: string): Promise<void> {
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #2B2724;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; font-weight: 300; letter-spacing: 2px; color: #2B2724; margin: 0;">Tagdiah</h1>
          <p style="font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #C4A265; margin-top: 4px;">Home Decor &amp; Arts</p>
        </div>
        <h2 style="font-size: 20px; font-weight: 400; margin-bottom: 8px;">Reset your password</h2>
        <p style="font-size: 14px; color: #6B5E54; line-height: 1.6;">
          Hello <strong>${name}</strong>, we received a request to reset your password. Use the code below:
        </p>
        <div style="text-align: center; margin: 28px 0;">
          <div style="display: inline-block; background: #FAF6F0; border: 1px solid #E8E0D4; padding: 16px 40px; letter-spacing: 8px; font-size: 32px; font-weight: 600; color: #2B2724;">
            ${code}
          </div>
        </div>
        <p style="font-size: 13px; color: #8C7E72; text-align: center;">
          This code expires in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #E8E0D4; margin: 32px 0;" />
        <p style="font-size: 11px; color: #A99E94; text-align: center;">
          © ${new Date().getFullYear()} Tagdiah Home Decor &amp; Arts. All rights reserved.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: `${code} — Reset your Tagdiah password`,
        html,
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}`, error);
    }
  }

  /** Send welcome credentials when admin creates a customer account */
  async sendWelcomeCredentials(email: string, name: string, password: string): Promise<void> {
    const html = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 520px; margin: 0 auto; padding: 40px 24px; color: #2B2724;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="font-size: 28px; font-weight: 300; letter-spacing: 2px; color: #2B2724; margin: 0;">Tagdiah</h1>
          <p style="font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #C4A265; margin-top: 4px;">Home Decor &amp; Arts</p>
        </div>
        <h2 style="font-size: 20px; font-weight: 400; margin-bottom: 8px;">Welcome to Tagdiah!</h2>
        <p style="font-size: 14px; color: #6B5E54; line-height: 1.6;">
          Hello <strong>${name}</strong>, an account has been created for you at Tagdiah. Here are your login credentials:
        </p>
        <div style="background: #FAF6F0; border: 1px solid #E8E0D4; padding: 20px 24px; margin: 24px 0;">
          <table style="width: 100%; font-size: 14px;">
            <tr>
              <td style="color: #8C7E72; padding: 4px 0;">Email:</td>
              <td style="color: #2B2724; font-weight: 500;">${email}</td>
            </tr>
            <tr>
              <td style="color: #8C7E72; padding: 4px 0;">Password:</td>
              <td style="color: #2B2724; font-weight: 500;">${password}</td>
            </tr>
          </table>
        </div>
        <p style="font-size: 13px; color: #C17C3E; margin-top: 16px;">
          ⚠️ For security, we recommend changing your password after your first login.
        </p>
        <hr style="border: none; border-top: 1px solid #E8E0D4; margin: 32px 0;" />
        <p style="font-size: 11px; color: #A99E94; text-align: center;">
          © ${new Date().getFullYear()} Tagdiah Home Decor &amp; Arts. All rights reserved.
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: this.from,
        to: email,
        subject: 'Your Tagdiah account has been created',
        html,
      });
      this.logger.log(`Welcome credentials email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}`, error);
    }
  }
}
