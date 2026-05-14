import React from 'react'

export function GalleryBlock({ content, className = '' }) {
  const { heading, images = [] } = content ?? {}
  return (
    <section className={`cms-gallery ${className}`}>
      {heading && <h2 className="cms-gallery__heading">{heading}</h2>}
      <div className="cms-gallery__grid">
        {images.map((img, i) => (
          <figure key={img.id ?? i} className="cms-gallery__item">
            <img src={img.url} alt={img.alt ?? ''} className="cms-gallery__img" loading="lazy" />
          </figure>
        ))}
      </div>
    </section>
  )
}
