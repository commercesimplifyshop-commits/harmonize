const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY

type Grecaptcha = { ready: (cb: () => void) => void; execute: (key: string, opts: { action: string }) => Promise<string> }
declare global {
  interface Window {
    grecaptcha?: Grecaptcha
  }
}

let loading: Promise<Grecaptcha> | null = null

function load(): Promise<Grecaptcha> {
  loading ??= new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.onload = () => window.grecaptcha!.ready(() => resolve(window.grecaptcha!))
    script.onerror = () => {
      loading = null
      reject(new Error('Não foi possível carregar a verificação de segurança.'))
    }
    document.head.appendChild(script)
  })
  return loading
}

/** reCAPTCHA v3 token for `action`, or undefined while no site key is configured. */
export async function captchaToken(action: string): Promise<string | undefined> {
  if (!siteKey) return undefined
  const g = await load()
  return g.execute(siteKey, { action })
}
