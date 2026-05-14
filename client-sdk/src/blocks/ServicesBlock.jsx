import React from 'react'

export function ServicesBlock({ content, className = '' }) {
  const { heading, subheading, items = [] } = content ?? {}
  return (
    <section className={`cms-services ${className}`}>
      <div className="cms-services__header">
        {heading    && <h2 className="cms-services__heading">{heading}</h2>}
        {subheading && <p  className="cms-services__subheading">{subheading}</p>}
      </div>
      <ul className="cms-services__list">
        {items.map((item, i) => (
          <li key={item.id ?? i} className="cms-services__item">
            {item.icon && <span className="cms-services__icon" aria-hidden="true">{item.icon}</span>}
            <h3 className="cms-services__item-title">{item.title}</h3>
            {item.description && <p className="cms-services__item-desc">{item.description}</p>}
          </li>
        ))}
      </ul>
    </section>
  )
}
