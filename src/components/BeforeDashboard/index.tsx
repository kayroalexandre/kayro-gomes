import { Banner } from '@payloadcms/ui/elements/Banner'
import React from 'react'

import { SeedButton } from './SeedButton'
import './index.scss'

const baseClass = 'before-dashboard'

const BeforeDashboard: React.FC = () => {
  return (
    <div className={baseClass}>
      <Banner className={`${baseClass}__banner`} type="success">
        <h4>Bem-vindo ao painel!</h4>
      </Banner>
      Próximos passos:
      <ul className={`${baseClass}__instructions`}>
        <li>
          <SeedButton />
          {' para popular o site com páginas, posts e projetos de demonstração e '}
          <a href="/" target="_blank">
            visite o site
          </a>
          {' para conferir o resultado.'}
        </li>
        <li>
          {'Personalize as '}
          <a
            href="https://payloadcms.com/docs/configuration/collections"
            rel="noopener noreferrer"
            target="_blank"
          >
            collections
          </a>
          {' e adicione mais '}
          <a
            href="https://payloadcms.com/docs/fields/overview"
            rel="noopener noreferrer"
            target="_blank"
          >
            fields
          </a>
          {' conforme necessário. Se você é novo no Payload, recomendamos a documentação de '}
          <a
            href="https://payloadcms.com/docs/getting-started/what-is-payload"
            rel="noopener noreferrer"
            target="_blank"
          >
            Getting Started
          </a>
          {'.'}
        </li>
        <li>
          Faça commit e push das alterações para disparar um novo deploy.
        </li>
      </ul>
      {'Dica: este bloco é um '}
      <a
        href="https://payloadcms.com/docs/custom-components/overview"
        rel="noopener noreferrer"
        target="_blank"
      >
        custom component
      </a>
      {', você pode removê-lo a qualquer momento editando seu payload.config.'}
    </div>
  )
}

export default BeforeDashboard
