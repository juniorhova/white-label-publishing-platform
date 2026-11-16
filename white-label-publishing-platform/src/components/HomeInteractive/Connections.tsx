'use client'
import { useEffect, useRef, useState } from 'react'
import styles from './home-interactive.module.css'

export function Connections() {
  const svg = useRef<SVGSVGElement>(null)
  const [paths, setPaths] = useState<string[]>([])
  useEffect(() => {
    const group = svg.current?.parentElement
    if (!group || typeof ResizeObserver === 'undefined') return
    const center = group.querySelector<HTMLElement>('[data-group-node]')
    const stages = Array.from(group.querySelectorAll<HTMLElement>('[data-stage-node]'))
    if (!center) return
    function measure() {
      const base = group!.getBoundingClientRect()
      const target = center!.getBoundingClientRect()
      setPaths(
        stages.map((stage) => {
          const box = stage.getBoundingClientRect()
          const left = box.left < target.left
          const sx = (left ? box.right : box.left) - base.left
          const sy = box.top + Math.min(42, box.height / 2) - base.top
          const ex = (left ? target.left : target.right) - base.left
          const ey = target.top + target.height / 2 - base.top
          const mid = (sx + ex) / 2
          return `M ${sx} ${sy} C ${mid} ${sy}, ${mid} ${ey}, ${ex} ${ey}`
        }),
      )
    }
    const observer = new ResizeObserver(measure)
    observer.observe(group)
    observer.observe(center)
    stages.forEach((stage) => observer.observe(stage))
    return () => observer.disconnect()
  }, [])
  return (
    <svg
      ref={svg}
      className={styles.connections}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
      aria-hidden="true"
      focusable="false"
    >
      {paths.map((path, index) => (
        <path key={index} d={path} fill="none" stroke="currentColor" strokeWidth="1.5" />
      ))}
    </svg>
  )
}
