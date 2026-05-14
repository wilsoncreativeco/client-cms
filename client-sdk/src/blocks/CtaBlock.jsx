import React from 'react'

export function CtaBlock({ content, className = '' }) {
  const { heading, subheading, button_text, button_link } = content ?? {}
  return (
    <section className={`cms-cta ${className}`}>
      <div className="cms-cta__inner">
        {heading    && <h2 className="cms-cta__heading">{heading}</h2>}
        {subheading && <p  className="cms-cta__subheading">{subheading}</p>}
        {button_text && (
          <a href={button_link ?? '#'} className="cms-cta__button">
            {button_text}
          </a>
        )}
      </div>
    </section>
  )
}
