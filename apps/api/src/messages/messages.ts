import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Injectable,
  Module,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { ContactMessage, EventCategory, MessageRecord, MessageType, QuoteRequest } from '@harmonize/shared';
import { ArrayMaxSize, IsArray, IsBoolean, IsEmail, IsIn, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import type { Request } from 'express';
import { AdminGuard } from '../auth/auth.guard';
import { clientIp } from '../common/http';
import { RateLimitService } from '../common/rate-limit.service';
import { RecaptchaService } from '../common/recaptcha.service';
import { CATEGORIES } from '../content/events';
import { DbService } from '../db/db.service';
import { MailerService } from './mailer.service';

export class ContactDto implements ContactMessage {
  @IsString() @MinLength(2, { message: 'Informe seu nome.' }) @MaxLength(120) name: string;
  @IsEmail({}, { message: 'Informe um e-mail válido.' }) @MaxLength(190) email: string;
  @IsOptional() @IsString() @MaxLength(40) phone?: string;
  @IsString() @MinLength(3, { message: 'Informe o assunto.' }) @MaxLength(200) subject: string;
  @IsString() @MinLength(10, { message: 'Escreva sua mensagem.' }) @MaxLength(5000) message: string;
  @IsOptional() @IsString() @MaxLength(200) website?: string;
  @IsOptional() @IsString() @MaxLength(4000) captchaToken?: string;
}

export class QuoteDto implements QuoteRequest {
  @IsString() @MinLength(2) @MaxLength(120) name: string;
  @IsIn(CATEGORIES) category: EventCategory;
  @IsOptional() @IsString() @MaxLength(20) date?: string;
  @IsOptional() @IsString() @MaxLength(200) city?: string;
  @IsOptional() @IsString() @MaxLength(20) guests?: string;
  @IsArray() @ArrayMaxSize(10) @IsString({ each: true }) @MaxLength(80, { each: true }) services: string[];
  @IsOptional() @IsString() @MaxLength(5000) message?: string;
}

class MarkReadDto {
  @IsBoolean() read: boolean;
}

type MessageRow = {
  id: number;
  type: MessageType;
  name: string;
  email: string | null;
  phone: string | null;
  subject: string | null;
  body: string;
  read_at: Date | null;
  created_at: Date;
};

const toRecord = (r: MessageRow): MessageRecord => ({
  id: r.id,
  type: r.type,
  name: r.name,
  email: r.email,
  phone: r.phone,
  subject: r.subject,
  body: r.body,
  readAt: r.read_at ? new Date(r.read_at).toISOString() : null,
  createdAt: new Date(r.created_at).toISOString(),
});

@Injectable()
export class MessagesService {
  constructor(
    private readonly db: DbService,
    private readonly limits: RateLimitService,
    private readonly recaptcha: RecaptchaService,
    private readonly mailer: MailerService,
  ) {}

  async contact(dto: ContactDto, ip: string) {
    // Honeypot filled: answer as if it worked so the bot learns nothing.
    if (dto.website) return { ok: true };
    await this.recaptcha.verify(dto.captchaToken, 'contact', ip);
    await this.limits.hit(`contact:ip:${ip}`, 5, 60 * 60, 'Você já enviou várias mensagens. Tente mais tarde ou chame no WhatsApp.');
    await this.db.run(
      `INSERT INTO messages (type, name, email, phone, subject, body, ip) VALUES ('contato', ?, ?, ?, ?, ?, ?)`,
      [dto.name.trim(), dto.email.trim(), dto.phone?.trim() || null, dto.subject.trim(), dto.message.trim(), ip],
    );
    await this.mailer.send({
      subject: `[Site] ${dto.subject.trim()}`,
      replyTo: dto.email.trim(),
      text: `Mensagem enviada pelo site da Harmonize.\n\nNome: ${dto.name}\nE-mail: ${dto.email}\nTelefone: ${dto.phone || '-'}\n\n${dto.message}`,
    });
    return { ok: true };
  }

  /** The quote itself goes to WhatsApp from the browser; this keeps a copy in the panel. */
  async quote(dto: QuoteDto, ip: string) {
    await this.limits.hit(`quote:ip:${ip}`, 10, 60 * 60);
    const body = [
      dto.date && `Data: ${dto.date}`,
      dto.city && `Local: ${dto.city}`,
      dto.guests && `Convidados: ${dto.guests}`,
      dto.services.length > 0 && `Precisa de: ${dto.services.join(', ')}`,
      dto.message?.trim(),
    ]
      .filter(Boolean)
      .join('\n');
    await this.db.run(
      `INSERT INTO messages (type, name, subject, body, payload, ip) VALUES ('orcamento', ?, ?, ?, ?, ?)`,
      [dto.name.trim(), `Orçamento: ${dto.category}`, body || '(sem detalhes)', JSON.stringify(dto), ip],
    );
    return { ok: true };
  }

  async list(): Promise<MessageRecord[]> {
    const rows = await this.db.all<MessageRow>('SELECT * FROM messages ORDER BY created_at DESC, id DESC LIMIT 300');
    return rows.map(toRecord);
  }

  async markRead(id: number, read: boolean) {
    await this.db.run(`UPDATE messages SET read_at = ${read ? 'UTC_TIMESTAMP()' : 'NULL'} WHERE id = ?`, [id]);
  }

  async delete(id: number) {
    await this.db.run('DELETE FROM messages WHERE id = ?', [id]);
  }
}

@Controller()
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Post('contact')
  @HttpCode(200)
  contact(@Body() dto: ContactDto, @Req() req: Request) {
    return this.messages.contact(dto, clientIp(req));
  }

  @Post('quotes')
  @HttpCode(200)
  quote(@Body() dto: QuoteDto, @Req() req: Request) {
    return this.messages.quote(dto, clientIp(req));
  }

  @Get('admin/messages')
  @UseGuards(AdminGuard)
  list() {
    return this.messages.list();
  }

  @Patch('admin/messages/:id')
  @HttpCode(204)
  @UseGuards(AdminGuard)
  markRead(@Param('id', ParseIntPipe) id: number, @Body() dto: MarkReadDto) {
    return this.messages.markRead(id, dto.read);
  }

  @Delete('admin/messages/:id')
  @HttpCode(204)
  @UseGuards(AdminGuard)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.messages.delete(id);
  }
}

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, MailerService],
})
export class MessagesModule {}
