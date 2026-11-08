import { BadRequestException } from '@nestjs/common';

const MAX_TEXT = 5000;
const MAX_ITEMS = 60;
const MAX_DEPTH = 6;

/** Image or link targets the site may render: site paths, https, WhatsApp, mail and phone. */
export function isSafeHref(value: string): boolean {
  return /^(\/(?!\/)|https:\/\/|mailto:|tel:)/i.test(value.trim());
}

const isPlainObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

const isMediaShape = (v: unknown): v is { url: unknown; alt: unknown } => isPlainObject(v) && 'url' in v && 'alt' in v;

function fail(path: string, message: string): never {
  throw new BadRequestException(`Conteúdo inválido em "${path}": ${message}`);
}

function media(value: unknown, path: string) {
  if (!isPlainObject(value) || typeof value.url !== 'string' || typeof value.alt !== 'string') fail(path, 'imagem inválida');
  if (!isSafeHref(value.url)) fail(path, 'endereço de imagem não permitido');
  const out: Record<string, string> = { url: value.url.slice(0, 600), alt: value.alt.slice(0, 300) };
  if (typeof value.thumbUrl === 'string' && isSafeHref(value.thumbUrl)) out.thumbUrl = value.thumbUrl.slice(0, 600);
  if (typeof value.focus === 'string' && /^\d{1,3}% \d{1,3}%$/.test(value.focus)) out.focus = value.focus;
  return out;
}

/** For slots with no template (empty arrays, null fields): plain JSON, bounded. */
function loose(value: unknown, path: string, depth: number): unknown {
  if (depth > MAX_DEPTH) fail(path, 'estrutura profunda demais');
  if (value === null || typeof value === 'boolean' || typeof value === 'number') return value;
  if (typeof value === 'string') return value.slice(0, MAX_TEXT);
  if (Array.isArray(value)) return value.slice(0, MAX_ITEMS).map((v, i) => loose(v, `${path}[${i}]`, depth + 1));
  if (isMediaShape(value)) return media(value, path);
  if (isPlainObject(value)) {
    return Object.fromEntries(Object.entries(value).slice(0, 40).map(([k, v]) => [k.slice(0, 60), loose(v, `${path}.${k}`, depth + 1)]));
  }
  fail(path, 'tipo não suportado');
}

/**
 * Checks `value` against the page currently stored (`template`): same keys, same kinds of values.
 * The panel can change any text, image or list item, but can't add fields the site doesn't render
 * or remove ones it needs. Unknown keys are dropped.
 */
export function conform(template: unknown, value: unknown, path = 'página', depth = 0): unknown {
  if (depth > MAX_DEPTH) fail(path, 'estrutura profunda demais');
  if (template === null || template === undefined) return loose(value, path, depth);

  if (typeof template === 'string') {
    if (typeof value !== 'string') fail(path, 'esperava um texto');
    return value.slice(0, MAX_TEXT);
  }
  if (typeof template === 'number' || typeof template === 'boolean') {
    if (typeof value !== typeof template) fail(path, `esperava ${typeof template}`);
    return value;
  }
  if (Array.isArray(template)) {
    if (!Array.isArray(value)) fail(path, 'esperava uma lista');
    if (value.length > MAX_ITEMS) fail(path, 'itens demais');
    const itemTemplate = template[0];
    return value.map((v, i) => (itemTemplate === undefined ? loose(v, `${path}[${i}]`, depth + 1) : conform(itemTemplate, v, `${path}[${i}]`, depth + 1)));
  }
  if (isMediaShape(template)) return value === null ? null : media(value, path);
  if (isPlainObject(template)) {
    // Optional blocks (a portrait, the testimonial) may be switched off with null.
    if (value === null) return null;
    if (!isPlainObject(value)) fail(path, 'esperava um bloco');
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(template)) {
      if (!(key in value)) fail(`${path}.${key}`, 'campo obrigatório ausente');
      out[key] = conform(template[key], value[key], `${path}.${key}`, depth + 1);
    }
    return out;
  }
  fail(path, 'tipo não suportado');
}
