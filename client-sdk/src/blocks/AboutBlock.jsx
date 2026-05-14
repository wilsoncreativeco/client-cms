import React from 'react'

export function AboutBlock({ content, className = '' }) {
  const { heading, body, image } = content ?? {}
  return (
    <section className={`cms-about ${className}`}>
      <div className="cms-about__inner">
        {image && (
          <div className="cms-about__image-wrap">
            <img src={image} alt={heading ?? 'About'} className="cms-about__image" loading="lazy" />
          </div>
        )}
        <div className="cms-about__content">
          {heading && <h2 className="cms-about__heading">{heading}</h2>}
          {body    && <div className="cms-about__body" dangerouslySetInnerHTML={{ __html: body }} />}
        </div>
      </div>
    </section>
  )
}
