import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as http from 'http';
import * as https from 'https';

@Injectable()
export class KeepAliveService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('KeepAliveCron');
  private timer: NodeJS.Timeout | null = null;

  onModuleInit() {
    // 5 minutes in milliseconds (300,000 ms)
    const INTERVAL_MS = 5 * 60 * 1000;

    // Send initial ping 10 seconds after server boot
    setTimeout(() => this.pingSelf(), 10000);

    // Setup recurring cron interval every 5 minutes
    this.timer = setInterval(() => {
      this.pingSelf();
    }, INTERVAL_MS);

    this.logger.log('⏱️ Server Keep-Alive Cron Heartbeat initialized (Every 5 minutes)');
  }

  onModuleDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private pingSelf() {
    const rawUrl =
      process.env.RENDER_EXTERNAL_URL ||
      process.env.SERVER_URL ||
      `http://localhost:${process.env.PORT || 5000}`;

    const baseUrl = rawUrl.replace(/\/$/, '');
    const targetUrl = `${baseUrl}/api/health`;

    try {
      const isHttps = targetUrl.startsWith('https');
      const reqModule = isHttps ? https : http;

      const req = reqModule.get(targetUrl, (res) => {
        this.logger.log(`💓 Server Keep-Alive Heartbeat Ping: ${targetUrl} [Status: ${res.statusCode}]`);
      });

      req.on('error', (err) => {
        this.logger.warn(`⚠️ Keep-Alive Heartbeat Notice: ${err.message}`);
      });

      req.setTimeout(10000, () => {
        req.destroy();
      });
    } catch (err: any) {
      this.logger.warn(`⚠️ Keep-Alive Heartbeat Error: ${err?.message}`);
    }
  }
}
