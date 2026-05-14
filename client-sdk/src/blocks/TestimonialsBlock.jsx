import React from 'react'

export function TestimonialsBlock({ content, className = '' }) {
  const { heading, items = [] } = content ?? {}
  return (
    <section className={`cms-testimonials ${className}`}>
      {heading && <h2 className="cms-testimonials__heading">{heading}</h2>}
      <div className="cms-testimonials__list">
        {items.map((item, i) => (
          <blockquote key={item.id ?? i} className="cms-testimonials__item">
            {item.text && <p className="cms-testimonials__text">"{item.text}"</p>}
            <footer className="cms-testimonials__author">
              {item.avatar && (
                <img src={item.avatar} alt={item.name} className="cms-testimonials__avatar" loading="lazy" />
              )}
              <div>
                {item.name && <cite className="cms-testimonials__name">{item.name}</cite>}
                {item.role && <span className="cms-testimonials__role">{item.role}</span>}
              </div>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  )
}
