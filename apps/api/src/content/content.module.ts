import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import type { AdminSummary } from '@harmonize/shared';
import { AdminGuard } from '../auth/auth.guard';
import { DbService } from '../db/db.service';
import { BannersController, BannersService } from './banners';
import { EventsController, EventsService } from './events';
import { PagesController, PagesService } from './pages';
import { SettingsController, SettingsService } from './settings';

/** Numbers for the panel's home screen. */
@Controller('admin/summary')
@UseGuards(AdminGuard)
class SummaryController {
  constructor(private readonly db: DbService) {}

  @Get()
  async summary(): Promise<AdminSummary> {
    const counts = await this.db.one<{ total: number; published: number }>(
      'SELECT COUNT(*) AS total, COALESCE(SUM(published), 0) AS published FROM events',
    );
    const upcoming = await this.db.all<{ id: number; slug: string; title: string; date: string; category: AdminSummary['upcoming'][number]['category'] }>(
      'SELECT id, slug, title, date, category FROM events WHERE date >= UTC_DATE() ORDER BY date LIMIT 5',
    );
    const unread = await this.db.one<{ n: number }>('SELECT COUNT(*) AS n FROM messages WHERE read_at IS NULL');
    const media = await this.db.one<{ n: number }>('SELECT COUNT(*) AS n FROM media');
    const total = Number(counts?.total ?? 0);
    const published = Number(counts?.published ?? 0);
    return {
      events: { total, published, drafts: total - published },
      upcoming: upcoming.map((e) => ({ ...e, id: String(e.id) })),
      unreadMessages: Number(unread?.n ?? 0),
      media: Number(media?.n ?? 0),
    };
  }
}

@Module({
  controllers: [SettingsController, PagesController, BannersController, EventsController, SummaryController],
  providers: [SettingsService, PagesService, BannersService, EventsService],
})
export class ContentModule {}
