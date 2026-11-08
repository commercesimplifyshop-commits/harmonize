import type { MessageRecord } from '@harmonize/shared'
import { useEffect, useState } from 'react'
import Icon from '../../components/Icon'
import { adminApi } from '../api'
import { useToast } from '../toastContext'
import { Empty, PageHeader, Spinner } from '../ui'

const when = (iso: string) => new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageRecord[] | null>(null)
  const [open, setOpen] = useState<number | null>(null)
  const toast = useToast()

  useEffect(() => {
    adminApi.messages().then(setMessages, toast.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const expand = async (m: MessageRecord) => {
    setOpen(open === m.id ? null : m.id)
    if (!m.readAt) {
      setMessages((all) => (all ?? []).map((x) => (x.id === m.id ? { ...x, readAt: new Date().toISOString() } : x)))
      adminApi.markMessage(m.id, true).catch(toast.error)
    }
  }

  const remove = async (m: MessageRecord) => {
    if (!window.confirm(`Apagar a mensagem de ${m.name}?`)) return
    try {
      await adminApi.deleteMessage(m.id)
      setMessages((all) => (all ?? []).filter((x) => x.id !== m.id))
    } catch (err) {
      toast.error(err)
    }
  }

  return (
    <>
      <PageHeader
        title="Mensagens"
        subtitle="O que chega pelo formulário de contato e uma cópia de cada pedido de orçamento enviado ao WhatsApp."
      />
      {!messages ? (
        <Spinner />
      ) : messages.length === 0 ? (
        <Empty>Nenhuma mensagem ainda.</Empty>
      ) : (
        <ul className="ad-messages">
          {messages.map((m) => (
            <li key={m.id} className={m.readAt ? undefined : 'is-unread'}>
              <button type="button" className="ad-messages__head" onClick={() => expand(m)} aria-expanded={open === m.id}>
                <span className={`ad-badge${m.type === 'orcamento' ? ' ad-badge--bronze' : ''}`}>{m.type === 'orcamento' ? 'Orçamento' : 'Contato'}</span>
                <span className="ad-messages__who">
                  <b>{m.name}</b>
                  <small>{m.subject}</small>
                </span>
                <time dateTime={m.createdAt}>{when(m.createdAt)}</time>
              </button>
              {open === m.id && (
                <div className="ad-messages__body">
                  <p className="ad-pre">{m.body}</p>
                  <div className="ad-row">
                    {m.email && (
                      <a className="btn btn--green" href={`mailto:${m.email}?subject=${encodeURIComponent(`Re: ${m.subject ?? 'Contato'}`)}`}>
                        <Icon name="mail" size={18} /> Responder por e-mail
                      </a>
                    )}
                    {m.phone && (
                      <a className="btn btn--outline" href={`https://wa.me/55${m.phone.replace(/\D/g, '').replace(/^55/, '')}`} target="_blank" rel="noreferrer">
                        <Icon name="whatsapp" size={18} /> WhatsApp
                      </a>
                    )}
                    <button type="button" className="ad-link-danger" onClick={() => remove(m)}>
                      Apagar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
