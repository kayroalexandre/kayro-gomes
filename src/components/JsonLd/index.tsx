import { getServerSideURL } from '@/utilities/getURL'

type JsonLdProps = {
  data: Record<string, unknown> | Record<string, unknown>[]
}

/**
 * Renderiza um `<script type="application/ld+json">` com dados estruturados
 * para SEO (Google rich results). Use em conjunto com `generateMetadata`.
 *
 * Coloque no body (não head) para evitar hydration mismatch — o Next
 * também injeta metadata no head via Metadata API.
 */
export const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      // O conteúdo é serializado uma vez no server. Escapa `</` para evitar
      // fechamento prematuro de tag em HTML parsers.
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, '\\u003c'),
      }}
    />
  )
}

/**
 * Schema.org `Person` para a home do portfólio. Usado para Knowledge Graph
 * do Google (painel lateral com info do autor).
 */
export const buildPersonJsonLd = () => {
  const url = getServerSideURL()
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Kayro Gomes',
    url,
    jobTitle: 'Desenvolvedor Full-Stack',
    description:
      'Desenvolvedor full-stack brasileiro focado em Next.js, Payload CMS e infraestrutura na Vercel.',
    sameAs: [
      'https://github.com/kayroalexandre',
      'https://linkedin.com/in/kayroalexandre',
    ],
  }
}

/**
 * Schema.org `WebSite` com `SearchAction` para a home, habilita o
 * sitelinks searchbox do Google.
 */
export const buildWebSiteJsonLd = () => {
  const url = getServerSideURL()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Kayro Gomes',
    url,
    inLanguage: 'pt-BR',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${url}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}
