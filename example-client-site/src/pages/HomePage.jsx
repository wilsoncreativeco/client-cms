import React from 'react'
import { usePageContent, BlockRenderer } from '../../../client-sdk/src/index.js'
import '../../../client-sdk/src/cms-blocks.css'
import './HomePage.css'

// ─── Your client slug is set in Agency CMS admin ──────────────────────────
const CLIENT_SLUG = import.meta.env.VITE_CMS_CLIENT_SLUG

export default function HomePage() {
  const { page, blocks, loading, error } = usePageContent(CLIENT_SLUG, 'home')

  if (loading) {
    return (
      <div className="site-loading">
        <div className="site-loading__spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="site-error">
        <p>Failed to load content. Please try again.</p>
      </div>
    )
  }

  return (
    <>
      <SiteHeader />

      <main>
        {/*
          BlockRenderer maps each block.block_type to the correct component.
          The default components use semantic HTML + CSS classes from cms-blocks.css.

          Override any block with your own component:
          <BlockRenderer
            blocks={blocks}
            renderers={{
              hero: MyCustomHero,
              services: MyCustomServices,
            }}
          />

          Or render blocks manually for full control:
          {blocks.map(block => {
            if (block.block_type === 'hero') return <MyHero key={block.id} content={block.content_json} />
            ...
          })}
        */}
        <BlockRenderer
          blocks={blocks}
          renderers={{
            // Example: override the contact block to hook up your own form handler
            contact: (props) => (
              <ContactBlockWithHandler {...props} />
            ),
          }}
        />
      </main>

      <SiteFooter />
    </>
  )
}

function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <a href="/" className="site-header__logo">Your Business</a>
        <nav className="site-header__nav">
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
      </div>
    </header>
  )
}

function SiteFooter() {
  return (
    <footer className="site-footer">
      <p>© {new Date().getFullYear()} Your Business. All rights reserved.</p>
    </footer>
  )
}

// Example: ContactBlock with real form submission
import { ContactBlock } from '../../../client-sdk/src/index.js'

function ContactBlockWithHandler(props) {
  const handleSubmit = async (formData) => {
    // Hook up to your email service (Resend, Formspree, EmailJS, etc.)
    console.log('Form submitted:', formData)
    // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) })
  }
  return <ContactBlock {...props} onSubmit={handleSubmit} />
}
