import { Body, Controller, Get, Injectable, NotFoundException, Put, UseGuards } from '@nestjs/common';
import type { SiteSettings } from '@harmonize/shared';
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator';
import { AdminGuard } from '../auth/auth.guard';
import { DbService, json } from '../db/db.service';

export class SettingsDto implements SiteSettings {
  @IsString() @MinLength(1) @MaxLength(60) brandName: string;
  @IsString() @MaxLength(60) brandSuffix: string;
  @IsString() @MaxLength(200) tagline: string;
  @IsString() @MinLength(1) @MaxLength(120) ownerName: string;
  @Matches(/^\d{12,13}$/, { message: 'WhatsApp: use só números com DDI e DDD, ex.: 5575991979918.' }) whatsapp: string;
  @IsString() @MaxLength(40) phoneDisplay: string;
  @IsEmail({}, { message: 'E-mail inválido.' }) @MaxLength(190) email: string;
  @Matches(/^[A-Za-z0-9._]{1,30}$/, { message: 'Instagram: só o usuário, sem @.' }) instagram: string;
  @IsString() @MaxLength(80) city: string;
  @IsString() @MaxLength(120) serviceArea: string;
}

@Injectable()
export class SettingsService {
  constructor(private readonly db: DbService) {}

  async get(): Promise<SiteSettings> {
    const row = await this.db.one<{ data: unknown }>('SELECT data FROM settings WHERE id = 1');
    if (!row) throw new NotFoundException('Configurações ainda não foram criadas (rode o seed).');
    return json<SiteSettings>(row.data);
  }

  async save(settings: SiteSettings): Promise<SiteSettings> {
    const data: SiteSettings = {
      brandName: settings.brandName,
      brandSuffix: settings.brandSuffix,
      tagline: settings.tagline,
      ownerName: settings.ownerName,
      whatsapp: settings.whatsapp,
      phoneDisplay: settings.phoneDisplay,
      email: settings.email,
      instagram: settings.instagram,
      city: settings.city,
      serviceArea: settings.serviceArea,
    };
    await this.db.run('INSERT INTO settings (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)', [JSON.stringify(data)]);
    return data;
  }
}

@Controller()
export class SettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('settings')
  get() {
    return this.settings.get();
  }

  @Put('admin/settings')
  @UseGuards(AdminGuard)
  save(@Body() dto: SettingsDto) {
    return this.settings.save(dto);
  }
}
