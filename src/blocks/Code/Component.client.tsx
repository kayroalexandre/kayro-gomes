'use client'
import { Highlight, themes } from 'prism-react-renderer'
import React from 'react'
import { CopyButton } from './CopyButton'

type Props = {
  code: string
  language?: string
}

export const Code: React.FC<Props> = ({ code, language = '' }) => {
  if (!code) return null

  // O bloco de código usa o tema escuro do prism (vsDark); a superfície é
  // sempre escura, sem token de superfície absoluta que sirva. O text-xs do
  // código também é intencional (fonte mono pequena).
  const preClassName =
    'bg-black p-4 border text-xs border-border rounded overflow-x-auto' // design-lint-disable-line bg-black: superfície de código sempre escura (prism vsDark)

  return (
    <Highlight code={code} language={language} theme={themes.vsDark}>
      {({ getLineProps, getTokenProps, tokens }) => (
        <pre className={preClassName}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ className: 'table-row', line })}>
              <span className="table-cell select-none text-right text-on-dark/25">{i + 1}</span>
              <span className="table-cell pl-4">
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </span>
            </div>
          ))}
          <CopyButton code={code} />
        </pre>
      )}
    </Highlight>
  )
}
