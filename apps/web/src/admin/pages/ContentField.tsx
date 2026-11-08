import type { Media } from '@harmonize/shared'
import Icon from '../../components/Icon'
import ImageField from '../media/ImageField'
import { ICONS, ITEM_LABELS, LABELS, LONG_TEXT, MEDIA_KEYS, OPTIONAL_BLOCKS } from './fieldLabels'

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

const isObject = (v: unknown): v is Record<string, Json> => typeof v === 'object' && v !== null && !Array.isArray(v)
const isMedia = (v: unknown): v is Media => isObject(v) && typeof v.url === 'string' && typeof v.alt === 'string'
const label = (key: string) => LABELS[key] ?? key

/** An empty copy of a list item, used by "Adicionar": texts blank, icons keep a default. */
function blank(template: Json, key = ''): Json {
  if (typeof template === 'string') return key === 'icon' ? template : ''
  if (typeof template === 'number') return 0
  if (typeof template === 'boolean') return false
  if (template === null || isMedia(template)) return null
  if (Array.isArray(template)) return []
  return Object.fromEntries(Object.entries(template).map(([k, v]) => [k, blank(v, k)]))
}

type Props = { name: string; value: Json; onChange: (value: Json) => void; depth?: number }

/** Renders any page field: text, icon, image, list or block. The page JSON drives the form. */
export default function ContentField({ name, value, onChange, depth = 0 }: Props) {
  if (MEDIA_KEYS.has(name) || isMedia(value)) {
    return <ImageField label={label(name)} value={isMedia(value) ? value : null} onChange={(m) => onChange(m as Json)} />
  }

  if (name in OPTIONAL_BLOCKS && value === null) {
    return (
      <div className="ad-optional">
        <span>{label(name)}: escondido no site.</span>
        <button type="button" className="ad-link" onClick={() => onChange(OPTIONAL_BLOCKS[name] as Json)}>
          Mostrar
        </button>
      </div>
    )
  }

  if (typeof value === 'string') {
    if (name === 'icon') {
      return (
        <label className="field">
          <span>{label(name)}</span>
          <select value={value} onChange={(e) => onChange(e.target.value)}>
            {ICONS.map((i) => (
              <option key={i.value} value={i.value}>
                {i.label}
              </option>
            ))}
          </select>
        </label>
      )
    }
    const long = LONG_TEXT.has(name) || value.length > 90
    return (
      <label className="field">
        <span>{label(name)}</span>
        {long ? (
          <textarea value={value} rows={Math.min(8, Math.max(3, Math.ceil(value.length / 70)))} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <input value={value} onChange={(e) => onChange(e.target.value)} />
        )}
      </label>
    )
  }

  if (Array.isArray(value)) {
    const itemLabel = ITEM_LABELS[name] ?? 'Item'
    const move = (index: number, delta: number) => {
      const list = [...value]
      const target = index + delta
      if (target < 0 || target >= list.length) return
      ;[list[index], list[target]] = [list[target], list[index]]
      onChange(list)
    }
    return (
      <fieldset className="ad-list-field">
        <legend>{label(name)}</legend>
        {value.map((item, i) => (
          <div key={i} className="ad-list-field__item">
            <div className="ad-list-field__head">
              <b>
                {itemLabel} {i + 1}
              </b>
              <span>
                <button type="button" className="ad-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Subir">
                  <Icon name="up" size={18} />
                </button>
                <button type="button" className="ad-icon-btn" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Descer">
                  <Icon name="down" size={18} />
                </button>
                <button
                  type="button"
                  className="ad-icon-btn ad-icon-btn--danger"
                  onClick={() => onChange(value.filter((_, j) => j !== i))}
                  disabled={value.length <= 1}
                  aria-label={`Remover ${itemLabel.toLowerCase()} ${i + 1}`}
                >
                  <Icon name="trash" size={18} />
                </button>
              </span>
            </div>
            <ContentField
              name={typeof item === 'string' ? name : `${name}-item`}
              value={item}
              depth={depth + 1}
              onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))}
            />
          </div>
        ))}
        {value.length > 0 && value.length < 20 && (
          <button type="button" className="btn btn--outline" onClick={() => onChange([...value, blank(value[0])])}>
            <Icon name="plus" size={18} /> Adicionar {itemLabel.toLowerCase()}
          </button>
        )}
      </fieldset>
    )
  }

  if (isObject(value)) {
    const fields = Object.entries(value).map(([key, v]) => (
      <ContentField key={key} name={key} value={v} depth={depth + 1} onChange={(nv) => onChange({ ...value, [key]: nv })} />
    ))
    const removable = name in OPTIONAL_BLOCKS
    // Array items render without an extra frame; their header already says "Item n".
    if (name.endsWith('-item')) return <div className="ad-fields">{fields}</div>
    return (
      <div className="ad-fields">
        {fields}
        {removable && (
          <button type="button" className="ad-link-danger" onClick={() => onChange(null)}>
            Esconder {label(name).toLowerCase()} do site
          </button>
        )}
      </div>
    )
  }

  return null
}

export type { Json }
