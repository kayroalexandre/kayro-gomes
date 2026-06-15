import React from 'react'

import type { Project } from '@/payload-types'

import { Media } from '@/components/Media'
import { ExternalLink } from 'lucide-react'

export const ProjectHero: React.FC<{
  project: Project
}> = ({ project }) => {
  const { title, summary, tech, liveUrl, repoUrl, coverImage } = project

  const techList = Array.isArray(tech)
    ? (tech.map((t) => (typeof t === 'object' ? t?.name : t)).filter(Boolean) as string[])
    : []

  return (
    <header className="relative min-h-[80vh] flex items-end text-white">
      <div className="container z-10 relative lg:grid lg:grid-cols-[1fr_48rem_1fr] pb-8 mt-[var(--header-h)]">
        <div className="col-start-1 col-span-1 md:col-start-2 md:col-span-2">
          <h1 className="mb-6 text-3xl md:text-5xl lg:text-6xl">{title}</h1>
          {summary && <p className="text-lg max-w-2xl text-white/80 mb-6">{summary}</p>}

          {techList.length > 0 && (
            <ul aria-label="Stack" className="flex flex-wrap gap-2 mb-8">
              {techList.map((t) => (
                <li
                  key={t}
                  className="text-xs px-2 py-1 rounded bg-white/10 border border-white/20"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}

          {(liveUrl || repoUrl) && (
            <div className="flex flex-wrap gap-3">
              {liveUrl && (
                <a
                  href={liveUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-md bg-white text-black px-4 py-2 text-sm font-medium hover:bg-white/90"
                >
                  Ver projeto <ExternalLink className="size-4" aria-hidden />
                </a>
              )}
              {repoUrl && (
                <a
                  href={repoUrl}
                  rel="noopener noreferrer"
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-md border border-white/30 px-4 py-2 text-sm font-medium hover:bg-white/10"
                >
                  <svg aria-hidden className="size-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.55v-1.93c-3.2.7-3.88-1.54-3.88-1.54-.52-1.32-1.27-1.68-1.27-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.96.1-.75.4-1.26.72-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.83 1.18 3.09 0 4.43-2.7 5.4-5.27 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.66.8.55C20.21 21.38 23.5 17.07 23.5 12 23.5 5.65 18.35.5 12 .5z" />
                  </svg>
                  Repositório
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="absolute inset-0 select-none z-0">
        {coverImage && typeof coverImage !== 'string' && (
          <Media fill priority imgClassName="object-cover" resource={coverImage} />
        )}
        <div className="absolute pointer-events-none inset-0 bg-black/40" />
        <div className="absolute pointer-events-none left-0 bottom-0 w-full h-1/2 bg-linear-to-t from-background to-transparent" />
      </div>
    </header>
  )
}
