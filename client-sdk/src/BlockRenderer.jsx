import React from 'react'
import { HeroBlock }         from './blocks/HeroBlock.jsx'
import { AboutBlock }        from './blocks/AboutBlock.jsx'
import { ServicesBlock }     from './blocks/ServicesBlock.jsx'
import { GalleryBlock }      from './blocks/GalleryBlock.jsx'
import { TestimonialsBlock } from './blocks/TestimonialsBlock.jsx'
import { FaqBlock }          from './blocks/FaqBlock.jsx'
import { CtaBlock }          from './blocks/CtaBlock.jsx'
import { ContactBlock }      from './blocks/ContactBlock.jsx'
import { RichTextBlock }     from './blocks/RichTextBlock.jsx'

const RENDERERS = {
  hero:         HeroBlock,
  about:        AboutBlock,
  services:     ServicesBlock,
  gallery:      GalleryBlock,
  testimonials: TestimonialsBlock,
  faq:          FaqBlock,
  cta:          CtaBlock,
  contact:      ContactBlock,
  richtext:     RichTextBlock,
}

/**
 * Renders a list of content blocks returned by usePageContent().
 *
 * Each block renderer accepts:
 *   - content  — the block's content_json object
 *   - className — optional extra CSS class for your own styles
 *
 * Usage:
 *   <BlockRenderer blocks={blocks} />
 *
 * Custom renderers:
 *   <BlockRenderer blocks={blocks} renderers={{ hero: MyHeroComponent }} />
 */
export function BlockRenderer({ blocks = [], renderers = {}, blockProps = {} }) {
  const merged = { ...RENDERERS, ...renderers }

  return (
    <>
      {blocks.map(block => {
        const Component = merged[block.block_type]
        if (!Component) return null
        return (
          <Component
            key={block.id}
            content={block.content_json}
            className={`cms-block cms-block--${block.block_type}`}
            {...(blockProps[block.block_type] ?? {})}
          />
        )
      })}
    </>
  )
}
