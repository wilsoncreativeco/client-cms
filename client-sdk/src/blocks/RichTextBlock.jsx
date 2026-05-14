import React from 'react'

export function RichTextBlock({ content, className = '' }) {
  const { content: html } = content ?? {}
  if (!html) return null
  return (
    <section className={`cms-richtext ${className}`}>
      <div className="cms-richtext__content" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  )
}
