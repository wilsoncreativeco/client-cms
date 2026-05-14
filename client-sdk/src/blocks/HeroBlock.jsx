import React from 'react'

export function HeroBlock({ content, className = '' }) {
  const { heading, subheading, cta_text, cta_link, background_image } = content ?? {}
  return (
    <section
      className={`cms-hero ${className}`}
      style={background_image ? { backgroundImage: `url(${background_image})` } : undefined}
    >
      <div className="cms-hero__inner">
        {heading    && <h1 className="cms-hero__heading">{heading}</h1>}
        {subheading && <p  className="cms-hero__subheading">{subheading}</p>}
        {cta_text   && (
          <a href={cta_link ?? '#'} className="cms-hero__cta">
            {cta_text}
          </a>
        )}
      </div>
    </section>
  )
}
