'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ChevronDown, Maximize2, Minimize2, X } from 'lucide-react'
import type { ContentBlock } from '@/payload-types'
import { CMSLink } from '@/components/Link'
import { columnTitle, getSafeResourceURL } from './content'
import styles from './home-interactive.module.css'
import { Connections } from './Connections'

type Props = ContentBlock
export function Roadmap({ columns, sectionTitle, id }: Props) {
  const root = useRef<HTMLDivElement>(null)
  const fullButton = useRef<HTMLButtonElement>(null)
  const detailClose = useRef<HTMLButtonElement>(null)
  const detailBody = useRef<HTMLDivElement>(null)
  const lastTopicButton = useRef<HTMLButtonElement | null>(null)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const uid = useId()
  const storageKey = `juniorhova:roadmap:${id || 'devops'}:v1`
  const [completed, setCompleted] = useState<string[]>([])
  const [expanded, setExpanded] = useState<string[]>([])
  const [enlarged, setEnlarged] = useState(false)
  const [nativeFull, setNativeFull] = useState(false)
  const [storageAvailable, setStorageAvailable] = useState(true)
  const stages = (columns || []).filter((column) => column.topics?.length)
  const sources = (columns || []).filter((column) => !column.topics?.length && column.enableLink)
  const groups = [...new Set(stages.map((column) => column.stageGroup || 'DevOps'))]
  const stageID = (column: (typeof stages)[number]) => column.id || columnTitle(column, 'Etapa')
  const topicID = (
    column: (typeof stages)[number],
    topic: NonNullable<typeof column.topics>[number],
  ) => `${stageID(column)}:${topic.id || topic.label}`
  const validIDs = stages.flatMap((column) => column.topics!.map((topic) => topicID(column, topic)))
  const entries = stages.flatMap((column) =>
    column.topics!.map((topic) => ({ column, topic, key: topicID(column, topic) })),
  )
  const selectedIndex = entries.findIndex((entry) => entry.key === selectedKey)
  const selected = entries[selectedIndex]
  const weekCount = new Set(stages.map((column) => column.week).filter(Boolean)).size
  function closeDetail() {
    setSelectedKey(null)
    lastTopicButton.current?.focus()
  }
  useEffect(() => {
    if (selectedKey) {
      detailClose.current?.focus()
      if (detailBody.current) detailBody.current.scrollTop = 0
    }
  }, [selectedKey])
  const done = validIDs.filter((key) => completed.includes(key)).length
  const nextTopic = entries.find((entry) => !completed.includes(entry.key))
  const allOpen = stages.length > 0 && stages.every((column) => expanded.includes(stageID(column)))

  useEffect(() => {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(storageKey) || '[]')
      // Restore browser-only persisted state after hydration, keeping the server output deterministic.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCompleted(
        Array.isArray(stored) ? stored.filter((key): key is string => typeof key === 'string') : [],
      )
    } catch {
      setStorageAvailable(false)
    }
  }, [storageKey])

  useEffect(() => {
    const onFull = () => setNativeFull(document.fullscreenElement === root.current)
    document.addEventListener('fullscreenchange', onFull)
    return () => document.removeEventListener('fullscreenchange', onFull)
  }, [])

  useEffect(() => {
    if (!enlarged) return
    const oldOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented) return
      if (event.key === 'Escape') {
        setEnlarged(false)
        fullButton.current?.focus()
      }
      // Keep keyboard focus within the expanded map.
      if (event.key === 'Tab') {
        const items = root.current?.querySelectorAll<HTMLElement>(
          'button, a[href], input, [tabindex="0"]',
        )
        const visible = Array.from(items || []).filter((item) => item.getClientRects().length)
        const first = visible[0],
          last = visible.at(-1)
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    fullButton.current?.focus()
    return () => {
      document.body.style.overflow = oldOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [enlarged])

  function update(keys: string[], checked: boolean) {
    const next = checked
      ? [...new Set([...completed, ...keys])]
      : completed.filter((key) => !keys.includes(key))
    setCompleted(next)
    try {
      localStorage.setItem(storageKey, JSON.stringify(next))
    } catch {
      setStorageAvailable(false)
    }
  }

  async function fullscreen() {
    if (enlarged) {
      setEnlarged(false)
      return
    }
    if (document.fullscreenElement === root.current) {
      await document.exitFullscreen()
      return
    }
    try {
      if (!root.current?.requestFullscreen) throw new Error('Fullscreen unavailable')
      await root.current.requestFullscreen()
    } catch {
      setEnlarged(true)
    }
  }

  return (
    <section className={`container ${styles.section}`} id="roadmap">
      <h2 className={styles.sectionTitle}>{sectionTitle || 'Roadmap DevOps'}</h2>
      <p className={styles.subtitle}>
        Plano prático organizado por semanas, com referência no DevOps Roadmap do roadmap.sh.
      </p>
      <div
        ref={root}
        className={`${styles.roadmap} ${enlarged ? styles.enlarged : ''}`}
        role={enlarged ? 'dialog' : undefined}
        aria-modal={enlarged || undefined}
        aria-label="Mapa de estudos DevOps"
      >
        <div className={styles.toolbar}>
          <div>
            <span className={styles.planLabel}>
              {weekCount ? `${weekCount} semanas · plano de estudos` : 'Plano de estudos'}
            </span>
            <strong>DevOps na prática</strong>
            <a
              className={styles.referenceLink}
              href="https://roadmap.sh/devops"
              target="_blank"
              rel="noopener noreferrer"
            >
              Referência: roadmap.sh/devops ↗
            </a>
            <p role="status">
              {done} de {validIDs.length} tópicos concluídos
            </p>
          </div>
          <div className={styles.tools}>
            {nextTopic && (
              <button
                type="button"
                onClick={(event) => {
                  lastTopicButton.current = event.currentTarget
                  setSelectedKey(nextTopic.key)
                }}
              >
                {done ? 'Continuar estudos' : 'Começar pelo primeiro tópico'}
              </button>
            )}
            <button type="button" onClick={() => setExpanded(allOpen ? [] : stages.map(stageID))}>
              {allOpen ? 'Recolher tudo' : 'Expandir tudo'}
            </button>
            <button
              ref={fullButton}
              type="button"
              onClick={fullscreen}
              aria-label={enlarged || nativeFull ? 'Sair da tela cheia' : 'Abrir em tela cheia'}
            >
              {enlarged || nativeFull ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          </div>
        </div>
        <div className={styles.mapFrame}>
          <div
            className={styles.mapScroll}
            tabIndex={0}
            aria-label="Etapas do roadmap, área com rolagem"
          >
            <div className={styles.map}>
              {groups.map((group) => {
                const members = stages.filter((column) => (column.stageGroup || 'DevOps') === group)
                const ids = members.flatMap((column) =>
                  column.topics!.map((topic) => topicID(column, topic)),
                )
                const count = ids.filter((key) => completed.includes(key)).length
                return (
                  <div className={styles.group} key={group}>
                    <Connections key={members.map(stageID).join(':')} />
                    <div
                      className={styles.groupNode}
                      data-group-node
                      style={{ gridRow: `1 / span ${Math.ceil(members.length / 2)}` }}
                    >
                      <h3>{group}</h3>
                      <span>
                        {count}/{ids.length}
                      </span>
                      <progress
                        aria-label={`Progresso em ${group}`}
                        max={ids.length}
                        value={count}
                      />
                    </div>
                    {members.map((column, index) => {
                      const key = stageID(column)
                      const title = columnTitle(column, `Etapa ${index + 1}`)
                      const ids = column.topics!.map((topic) => topicID(column, topic))
                      const count = ids.filter((key) => completed.includes(key)).length
                      const open = expanded.includes(key)
                      const panel = `${uid}-${key}`
                      return (
                        <div
                          className={`${styles.stage} ${index % 2 ? styles.right : styles.left}`}
                          key={key}
                          data-stage-node
                          style={{ gridRow: Math.floor(index / 2) + 1 }}
                        >
                          <div className={styles.stageTop}>
                            <input
                              type="checkbox"
                              aria-label={`Concluir etapa: ${title}`}
                              checked={count === ids.length}
                              ref={(el) => {
                                if (el) el.indeterminate = count > 0 && count < ids.length
                              }}
                              onChange={(event) => update(ids, event.target.checked)}
                            />
                            <button
                              type="button"
                              aria-expanded={open}
                              aria-controls={panel}
                              onClick={() =>
                                setExpanded(
                                  open
                                    ? expanded.filter((value) => value !== key)
                                    : [...expanded, key],
                                )
                              }
                            >
                              <span>
                                {column.week && (
                                  <span className={styles.weekLabel}>
                                    SEMANA {String(column.week).padStart(2, '0')}
                                  </span>
                                )}
                                {title}
                              </span>
                              <small>
                                {count}/{ids.length}
                              </small>
                              <ChevronDown size={18} className={open ? styles.rotated : ''} />
                            </button>
                          </div>
                          <div id={panel} hidden={!open} className={styles.topics}>
                            {column.topics!.map((topic) => (
                              <div className={styles.topicRow} key={topicID(column, topic)}>
                                <input
                                  type="checkbox"
                                  aria-label={topic.label}
                                  checked={completed.includes(topicID(column, topic))}
                                  onChange={(event) =>
                                    update([topicID(column, topic)], event.target.checked)
                                  }
                                />
                                <button
                                  type="button"
                                  className={
                                    selectedKey === topicID(column, topic) ? styles.activeTopic : ''
                                  }
                                  onClick={(event) => {
                                    lastTopicButton.current = event.currentTarget
                                    setSelectedKey(topicID(column, topic))
                                  }}
                                >
                                  {topic.label}
                                  <span aria-hidden="true">›</span>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
            <div className={styles.sources}>
              {sources.map((column, index) => (
                <CMSLink
                  key={column.id || index}
                  {...column.link}
                  appearance="inline"
                  className={styles.sourceLink}
                />
              ))}
            </div>
          </div>
          {selected && (
            <aside
              className={styles.detailPanel}
              role="dialog"
              aria-label={`Detalhes: ${selected.topic.label}`}
              onKeyDown={(event) => {
                if (event.key === 'Escape') {
                  event.preventDefault()
                  event.stopPropagation()
                  closeDetail()
                }
              }}
            >
              <div className={styles.detailTop}>
                <span>
                  Roadmap › {selected.column.stageGroup} › {columnTitle(selected.column, 'Etapa')}
                </span>
                <button
                  ref={detailClose}
                  type="button"
                  aria-label="Fechar detalhes do tópico"
                  onClick={closeDetail}
                >
                  <X size={20} />
                </button>
              </div>
              <div className={styles.detailContent} ref={detailBody}>
                {selected.column.week && (
                  <span className={styles.weekLabel}>
                    SEMANA {String(selected.column.week).padStart(2, '0')}
                  </span>
                )}
                <h3>{selected.topic.label}</h3>
                {selected.topic.description && <p>{selected.topic.description}</p>}
                {selected.topic.resourceURL && getSafeResourceURL(selected.topic.resourceURL) && (
                  <div className={styles.detailSection}>
                    <h4>Continue o estudo</h4>
                    <a
                      className={styles.material}
                      href={getSafeResourceURL(selected.topic.resourceURL)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>↗</span>
                      <div>
                        <strong>Continuar no roadmap.sh ↗</strong>
                        <small>{selected.topic.resourceTitle || 'DevOps Roadmap'}</small>
                      </div>
                    </a>
                  </div>
                )}
                <label className={styles.detailComplete}>
                  <input
                    type="checkbox"
                    checked={completed.includes(selected.key)}
                    onChange={(event) => update([selected.key], event.target.checked)}
                  />
                  Marcar este tópico como concluído
                </label>
              </div>
              <div className={styles.detailNavigation}>
                <button
                  type="button"
                  disabled={selectedIndex <= 0}
                  onClick={() => setSelectedKey(entries[selectedIndex - 1].key)}
                >
                  <ArrowLeft size={16} /> Anterior
                </button>
                <button
                  type="button"
                  disabled={selectedIndex === entries.length - 1}
                  onClick={() => setSelectedKey(entries[selectedIndex + 1].key)}
                >
                  Próximo <ArrowRight size={16} />
                </button>
              </div>
            </aside>
          )}
        </div>
        <p className={styles.storageNote}>
          {storageAvailable
            ? 'Seu progresso fica salvo somente neste navegador.'
            : 'O navegador não permitiu salvar. Seu progresso permanece nesta sessão.'}{' '}
          Introduções em português e links para os tópicos do DevOps Roadmap.
        </p>
      </div>
    </section>
  )
}
