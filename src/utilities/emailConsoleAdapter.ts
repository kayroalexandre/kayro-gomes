import type { EmailAdapter, SendEmailOptions } from 'payload'

/**
 * Adapter de email para desenvolvimento.
 *
 * Apenas loga o email no console em vez de enviar. Isso silencia o warning
 * "No email adapter provided" do Payload e permite testar fluxos de auth
 * (verificação de email, reset de senha) localmente sem SMTP.
 *
 * Em produção, substitua por um adapter real:
 *   - `@payloadcms/email-nodemailer` para SMTP genérico
 *   - `@payloadcms/email-resend` para Resend
 *
 * Exemplo de uso no payload.config.ts:
 *
 *   email: emailConsoleAdapter,
 *   // ou, condicionalmente:
 *   email: process.env.SMTP_HOST ? nodemailerAdapter(...) : emailConsoleAdapter,
 */
export const emailConsoleAdapter: EmailAdapter = () => ({
  defaultFromAddress: 'noreply@kayrogomes.com',
  defaultFromName: 'Kayro Gomes',
  name: 'console',
  sendEmail: async (message: SendEmailOptions) => {
    console.info(
      [
        '',
        '──────────────────────────────────────────────────────────',
        '📧  EMAIL (console adapter — não foi enviado de verdade)',
        `Para: ${Array.isArray(message.to) ? message.to.join(', ') : message.to}`,
        `Assunto: ${message.subject ?? '(sem assunto)'}`,
        message.text ? `Texto: ${message.text.slice(0, 200)}${message.text.length > 200 ? '…' : ''}` : '',
        '──────────────────────────────────────────────────────────',
        '',
      ]
        .filter(Boolean)
        .join('\n'),
    )
    return { message: 'logged to console' }
  },
})
