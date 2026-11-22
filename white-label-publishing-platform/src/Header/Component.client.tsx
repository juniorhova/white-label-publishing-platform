'use client'
import { useHeaderTheme } from '@/providers/HeaderTheme'
import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useState } from 'react'

import type { Header } from '@/payload-types'

import { HeaderNav } from './Nav'
import styles from './wordmark.module.css'

interface HeaderClientProps {
  data: Header
}

export const HeaderClient: React.FC<HeaderClientProps> = ({ data }) => {
  /* Storing the value in a useState to avoid hydration errors */
  const [theme, setTheme] = useState<string | null>(null)
  const { headerTheme, setHeaderTheme } = useHeaderTheme()
  const pathname = usePathname()

  useEffect(() => {
    setHeaderTheme(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname])

  useEffect(() => {
    if (headerTheme && headerTheme !== theme) setTheme(headerTheme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [headerTheme])

  return (
    <header
      className="site-header container relative z-20"
      {...(theme ? { 'data-theme': theme } : {})}
    >
      <div className="py-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <Link href="/" aria-label="juniorhova. — Início" className="shrink-0">
          <span className={styles.wordmark} data-wordmark>
            junior<span className={styles.accent}>hova.</span>
          </span>
        </Link>
        <div className="shrink-0 md:order-last">
          <ThemeSelector />
        </div>
        <HeaderNav data={data} />
      </div>
    </header>
  )
}
