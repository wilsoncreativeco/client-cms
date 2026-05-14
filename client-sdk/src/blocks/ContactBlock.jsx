import React, { useState } from 'react'

export function ContactBlock({ content, className = '', onSubmit }) {
  const { heading, email, phone, address, show_form = true } = content ?? {}
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (onSubmit) {
      await onSubmit(form)
    }
    setSent(true)
  }

  return (
    <section className={`cms-contact ${className}`}>
      <div className="cms-contact__inner">
        <div className="cms-contact__info">
          {heading && <h2 className="cms-contact__heading">{heading}</h2>}
          {email   && <p className="cms-contact__detail"><a href={`mailto:${email}`}>{email}</a></p>}
          {phone   && <p className="cms-contact__detail"><a href={`tel:${phone}`}>{phone}</a></p>}
          {address && <address className="cms-contact__address">{address}</address>}
        </div>

        {show_form && (
          <div className="cms-contact__form-wrap">
            {sent ? (
              <p className="cms-contact__success">Thanks! We'll be in touch soon.</p>
            ) : (
              <form onSubmit={handleSubmit} className="cms-contact__form">
                <label className="cms-contact__label">
                  Name
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    required
                    className="cms-contact__input"
                  />
                </label>
                <label className="cms-contact__label">
                  Email
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                    className="cms-contact__input"
                  />
                </label>
                <label className="cms-contact__label">
                  Message
                  <textarea
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    required
                    rows={4}
                    className="cms-contact__textarea"
                  />
                </label>
                <button type="submit" className="cms-contact__submit">Send message</button>
              </form>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
