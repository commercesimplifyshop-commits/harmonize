import { BadRequestException, Body, Controller, Get, Injectable, NotFoundException, Param, Put, UseGuards } from '@nestjs/common';
import type { AuthUser, PageSlug, PageSummary, PagesContent } from '@harmonize/shared';
import { AdminGuard, CurrentUser } from '../auth/auth.guard';
import { DbService, json } from '../db/db.service';
import { conform } from './validate';

export const PAGE_TITLES: Record<PageSlug, string> = {
  home: 'Início',
  sobre: 'Sobre',
  eventos: 'Eventos',
  orcamento: 'Orçamento',
  contato: 'Contato',
};

const isSlug = (slug: string): slug is PageSlug => slug in PAGE_TITLES;

@Injectable()
export class PagesService {
  constructor(private readonly db: DbService) {}

  async get<S extends PageSlug>(slug: string): Promise<PagesContent[S]> {
    if (!isSlug(slug)) throw new NotFoundException('Página não encontrada.');
    const row = await this.db.one<{ content: unknown }>('SELECT content FROM pages WHERE slug = ?', [slug]);
    if (!row) throw new NotFoundException('Página não encontrada.');
    return json<PagesContent[S]>(row.content);
  }

  async list(): Promise<PageSummary[]> {
    const rows = await this.db.all<{ slug: PageSlug; updated_at: Date }>('SELECT slug, updated_at FROM pages');
    const updated = new Map(rows.map((r) => [r.slug, new Date(r.updated_at).toISOString()]));
    return (Object.keys(PAGE_TITLES) as PageSlug[]).map((slug) => ({ slug, title: PAGE_TITLES[slug], updatedAt: updated.get(slug) ?? null }));
  }

  async save(slug: string, content: unknown, userId: number) {
    const current = await this.get(slug);
    if (typeof content !== 'object' || content === null) throw new BadRequestException('Conteúdo inválido.');
    const clean = conform(current, content);
    await this.db.run('UPDATE pages SET content = ?, updated_by = ? WHERE slug = ?', [JSON.stringify(clean), userId, slug]);
    return clean;
  }
}

@Controller()
export class PagesController {
  constructor(private readonly pages: PagesService) {}

  @Get('pages/:slug')
  get(@Param('slug') slug: string) {
    return this.pages.get(slug);
  }

  @Get('admin/pages')
  @UseGuards(AdminGuard)
  list() {
    return this.pages.list();
  }

  @Get('admin/pages/:slug')
  @UseGuards(AdminGuard)
  getForEdit(@Param('slug') slug: string) {
    return this.pages.get(slug);
  }

  @Put('admin/pages/:slug')
  @UseGuards(AdminGuard)
  save(@Param('slug') slug: string, @Body() body: unknown, @CurrentUser() user: AuthUser) {
    return this.pages.save(slug, body, user.id);
  }
}
