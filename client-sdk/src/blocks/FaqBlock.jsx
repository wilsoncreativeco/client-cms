import React, { useState } from 'react'

export function FaqBlock({ content, className = '' }) {
  const { heading, items = [] } = content ?? {}
  const [open, setOpen] = useState(null)

  return (
    <section className={`cms-faq ${className}`}>
      {heading && <h2 className="cms-faq__heading">{heading}</h2>}
      <dl className="cms-faq__list">
        {items.map((item, i) => {
          const isOpen = open === (item.id ?? i)
          return (
            <div key={item.id ?? i} className={`cms-faq__item${isOpen ? ' cms-faq__item--open' : ''}`}>
              <dt className="cms-faq__question">
                <button
                  onClick={() => setOpen(isOpen ? null : (item.id ?? i))}
                  aria-expanded={isOpen}
                  className="cms-faq__toggle"
                >
                  {item.question}
                  <span className="cms-faq__icon" aria-hidden="true">{isOpen ? '−' : '+'}</span>
                </button>
              </dt>
              {isOpen && (
                <dd className="cms-faq__answer">
                  <p>{item.answer}</p>
                </dd>
              )}
            </div>
          )
        })}
      </dl>
    </section>
  )
}
