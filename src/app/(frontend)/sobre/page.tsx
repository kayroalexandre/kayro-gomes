import type { Metadata } from 'next/types'

import React from 'react'

export const dynamic = 'force-static'
export const revalidate = 600

export default async function Page() {
  return (
    <div className="pt-24 pb-24">
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Sobre mim</h1>
          <p className="text-muted-foreground">
            Quem está por trás deste site, como eu trabalho, e o que me move.
          </p>
        </div>
      </div>

      <div className="container prose dark:prose-invert max-w-none">
        {/* Bio principal */}
        <h2>Quem sou</h2>
        <p>
          Meu nome é Kayro, sou brasileiro e trabalho com desenvolvimento de software desde 2018.
          Comecei com PHP e WordPress, fui pro Node, depois React, e desde 2022 mergulhei fundo no
          ecossistema Next.js. Hoje trabalho principalmente como full-stack — escrevo o front, o
          back, o schema do banco, e às vezes configuro o CI.
        </p>
        <p>
          Amo o trabalho de "do papel ao deploy" — pegar uma ideia solta e transformar em software
          que roda em produção, com monitoramento, testes e tudo que tem direito. Mas também curto
          sentar com o time pra desenhar a arquitetura antes da primeira linha de código existir.
        </p>

        {/* O que eu faço */}
        <h2>O que eu faço</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 not-prose">
          <div>
            <h3 className="text-lg font-semibold mb-2">Aplicações web</h3>
            <p className="text-muted-foreground">
              SaaS, MVPs, dashboards. Foco em performance, SEO e experiência de edição. Stack
              típica: Next.js + TypeScript + Postgres.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Sites e portais</h3>
            <p className="text-muted-foreground">
              Sites institucionais, blogs, portfólios com CMS headless. Integração com Payload,
              Sanity ou Contentful. SEO técnico incluído.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Consultoria e mentoria</h3>
            <p className="text-muted-foreground">
              Code review, escolha de stack, setup de CI/CD, migração de monolito para Next.js.
              Sessões de 1h ou acompanhamento semanal.
            </p>
          </div>
        </div>

        {/* Princípios */}
        <h2 className="mt-16">Princípios que sigo</h2>
        <p>
          Não é checklist moral — é o que funciona melhor pra mim e pros times com que trabalhei.
          Tudo é negociável se o contexto pedir outra coisa.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 not-prose mt-8">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Premature optimization é o root of all evil
            </h3>
            <p className="text-muted-foreground">
              Escrevo código simples e direto. Otimizo quando o profiling mostra que precisa. Não
              antes.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Boring tech, when possible</h3>
            <p className="text-muted-foreground">
              Prefiro Postgres + Next.js + Vercel a montar uma stack exótica. Funciona, tem
              documentação, tem gente pra contratar.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Documentação é código</h3>
            <p className="text-muted-foreground">
              README vale tanto quanto teste. Decisões de arquitetura vão pro docs/, não pra cabeça
              do dev sênior que vai sair do projeto em 6 meses.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Feedback cedo é melhor que feedback tarde
            </h3>
            <p className="text-muted-foreground">
              Subo PRs pequenos, peço review cedo, prefiro a vergonha de um bug em staging ao
              silêncio de um bug em produção por 3 meses.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 bg-muted rounded-lg not-prose">
          <h2 className="text-2xl font-semibold mb-2">Vamos colocar isso em prática?</h2>
          <p className="text-muted-foreground mb-4">
            Se você chegou até aqui, está claro que a gente pode se dar bem. Me conta o que você
            precisa.
          </p>
          <a
            href="/contato"
            className="inline-block px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition"
          >
            Mandar mensagem
          </a>
        </div>
      </div>
    </div>
  )
}

export function generateMetadata(): Metadata {
  return {
    title: `Sobre — Kayro Gomes`,
    description:
      'Sobre Kayro Gomes — desenvolvedor full-stack brasileiro. Bio, princípios de trabalho, e como contratar.',
  }
}
