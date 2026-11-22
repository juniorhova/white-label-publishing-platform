'use client'

import React from 'react'

import type { Header as HeaderType } from '@/payload-types'

import { CMSLink } from '@/components/Link'
import Link from 'next/link'
import { SearchIcon } from 'lucide-react'

export const HeaderNav: React.FC<{ data: HeaderType }> = ({ data }) => {
  const navItems = (data?.navItems || []).map(({ link }) => ({
    link:
      link.type === 'custom' && link.url === '/#videos' && link.label === 'Vídeos'
        ? { ...link, url: '/posts', label: 'Artigos' }
        : link,
  }))

  return (
    <nav
      aria-label="Navegação principal"
      className="flex flex-1 flex-wrap justify-end gap-x-4 gap-y-1 items-center"
    >
      {navItems.map(({ link }, i) => {
        return (
          <CMSLink
            key={i}
            {...link}
            appearance="inline"
            className="inline-flex min-h-11 items-center py-2 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4"
          />
        )
      })}
      <Link
        href="/search"
        className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        <span className="sr-only">Pesquisar</span>
        <SearchIcon className="w-5 text-primary" />
      </Link>
    </nav>
  )
}
