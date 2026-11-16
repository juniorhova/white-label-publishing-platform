import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { Roadmap } from '@/components/HomeInteractive/Roadmap'
import type { ContentBlock } from '@/payload-types'

const props: ContentBlock = {
  blockType: 'content',
  appearance: 'roadmap',
  id: 'test-map',
  columns: [
    {
      id: 'linux',
      stageGroup: 'Fundamentos',
      week: 1,
      weeklyGoal: 'Entender o terminal',
      practice: 'Criar um laboratório local',
      topics: [
        {
          id: 'shell',
          label: 'Terminal',
          description: 'Pratique navegação e caminhos.',
          resourceTitle: 'Terminal Knowledge · DevOps Roadmap',
          resourceURL: 'https://roadmap.sh/devops/terminal-knowledge@wjJPzrFJBNYOD3SJLzW2M',
        },
        { id: 'process', label: 'Processos', resourceURL: 'javascript:alert(1)' },
      ],
    },
  ],
}
beforeEach(() => {
  const items = new Map<string, string>()
  vi.stubGlobal('localStorage', {
    getItem: vi.fn((key: string) => items.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      items.set(key, value)
    }),
    clear: vi.fn(() => items.clear()),
  })
})
afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

describe('Interactive roadmap', () => {
  it('restores saved progress, computes partial completion, and can finish and undo a stage', async () => {
    localStorage.setItem(
      'juniorhova:roadmap:test-map:v1',
      JSON.stringify(['linux:shell', 'deleted-topic']),
    )
    render(React.createElement(Roadmap, props))
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('1 de 2'))
    const stage = screen.getByRole('checkbox', { name: /Concluir etapa/ }) as HTMLInputElement
    expect(stage.indeterminate).toBe(true)
    fireEvent.click(stage)
    expect(screen.getByRole('status').textContent).toContain('2 de 2')
    fireEvent.click(stage)
    expect(screen.getByRole('status').textContent).toContain('0 de 2')
    expect(JSON.parse(localStorage.getItem('juniorhova:roadmap:test-map:v1')!)).not.toContain(
      'linux:shell',
    )
  })
  it('expands topics and keeps progress after remount without reopening panels', async () => {
    const { unmount } = render(React.createElement(Roadmap, props))
    fireEvent.click(screen.getByRole('button', { name: 'Expandir tudo' }))
    fireEvent.click(screen.getByRole('checkbox', { name: 'Terminal' }))
    unmount()
    render(React.createElement(Roadmap, props))
    await waitFor(() => expect(screen.getByRole('status').textContent).toContain('1 de 2'))
    expect(screen.queryByRole('checkbox', { name: 'Terminal' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Expandir tudo' }))
    expect((screen.getByRole('checkbox', { name: 'Terminal' }) as HTMLInputElement).checked).toBe(
      true,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Recolher tudo' }))
    expect(screen.queryByRole('checkbox', { name: 'Terminal' })).toBeNull()
  })
  it('continues working when browser storage is blocked', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('denied')
    })
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('denied')
    })
    render(React.createElement(Roadmap, props))
    fireEvent.click(screen.getByRole('checkbox', { name: /Concluir etapa/ }))
    expect(screen.getByRole('status').textContent).toContain('2 de 2')
    expect(screen.getByText(/O navegador não permitiu salvar/)).toBeTruthy()
  })
  it('opens a fallback dialog without fullscreen support and closes with Escape', async () => {
    render(React.createElement(Roadmap, props))
    fireEvent.click(screen.getByRole('button', { name: 'Abrir em tela cheia' }))
    expect(await screen.findByRole('dialog')).toBeTruthy()
    expect(document.body.style.overflow).toBe('hidden')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.body.style.overflow).toBe('')
  })
})

describe('Weekly learning details', () => {
  it('opens an introduction and the official topic link, navigates, and restores focus on close', () => {
    render(React.createElement(Roadmap, props))
    fireEvent.click(screen.getByRole('button', { name: 'Expandir tudo' }))
    const trigger = screen.getByRole('button', { name: 'Terminal' })
    fireEvent.click(trigger)
    expect(screen.getByRole('dialog', { name: 'Detalhes: Terminal' })).toBeTruthy()
    expect(screen.queryByText('Entender o terminal')).toBeNull()
    expect(screen.queryByText('Criar um laboratório local')).toBeNull()
    expect(screen.getByRole('link', { name: /Continuar no roadmap.sh/ }).getAttribute('href')).toBe(
      'https://roadmap.sh/devops/terminal-knowledge@wjJPzrFJBNYOD3SJLzW2M',
    )
    expect((screen.getByRole('button', { name: 'Anterior' }) as HTMLButtonElement).disabled).toBe(
      true,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }))
    expect(screen.getByRole('dialog', { name: 'Detalhes: Processos' })).toBeTruthy()
    expect((screen.getByRole('button', { name: 'Próximo' }) as HTMLButtonElement).disabled).toBe(
      true,
    )
    expect(document.querySelector('a[href^="javascript:"]')).toBeNull()
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' })
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(trigger)
  })
  it('closes topic details with Escape while retaining the expanded roadmap', () => {
    render(React.createElement(Roadmap, props))
    fireEvent.click(screen.getByRole('button', { name: 'Abrir em tela cheia' }))
    fireEvent.click(screen.getByRole('button', { name: 'Expandir tudo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Terminal' }))
    fireEvent.keyDown(screen.getByRole('dialog', { name: 'Detalhes: Terminal' }), { key: 'Escape' })
    expect(screen.getByRole('dialog', { name: 'Mapa de estudos DevOps' })).toBeTruthy()
  })
})
