import { Injectable, Logger } from '@nestjs/common';
import { config } from '../config';

type Mail = { subject: string; text: string; replyTo?: string };

/** Sends through Resend's HTTP API (works on Vercel and HostGator alike). Off while RESEND_API_KEY is empty. */
@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  get enabled() {
    return !!config.resendApiKey && !!config.contactTo;
  }

  /** Never throws: the message is already saved in the panel, the e-mail is a courtesy copy. */
  async send(mail: Mail): Promise<boolean> {
    if (!this.enabled) return false;
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${config.resendApiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: config.contactFrom,
          to: [config.contactTo],
          subject: mail.subject,
          text: mail.text,
          reply_to: mail.replyTo,
        }),
      });
      if (!res.ok) this.logger.error(`Resend ${res.status}: ${await res.text()}`);
      return res.ok;
    } catch (err) {
      this.logger.error(`Resend failed: ${(err as Error).message}`);
      return false;
    }
  }
}
