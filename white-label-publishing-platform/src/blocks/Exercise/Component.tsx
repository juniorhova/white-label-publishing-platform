'use client'
import React, { useState } from 'react'
import type { ExerciseBlock } from '@/payload-types'
export function Exercise({ title, description, mode, items }: ExerciseBlock) {
  const [selected, setSelected] = useState(0)
  const [checked, setChecked] = useState<string[]>([])
  return (
    <section className="editorial-panel" aria-label={title}>
      <h3>{title}</h3>
      <p>{description}</p>
      {mode === 'pipeline' ? (
        <>
          <div className="editorial-filters">
            {items.map((item, index) => (
              <button
                key={index}
                type="button"
                aria-pressed={selected === index}
                onClick={() => setSelected(index)}
              >
                {index + 1}. {item.label}
              </button>
            ))}
          </div>
          <p aria-live="polite">{items[selected]?.explanation}</p>
        </>
      ) : (
        <>
          <p aria-live="polite">
            {checked.length} de {items.length} etapas concluídas nesta visita
          </p>
          {items.map((item, index) => (
            <label className="editorial-check" key={index}>
              <input
                type="checkbox"
                checked={checked.includes(String(index))}
                onChange={(e) =>
                  setChecked(
                    e.target.checked
                      ? [...checked, String(index)]
                      : checked.filter((v) => v !== String(index)),
                  )
                }
              />
              <span>
                <strong>{item.label}</strong>
                <small>{item.explanation}</small>
              </span>
            </label>
          ))}
        </>
      )}
      <button
        type="button"
        onClick={() => {
          setChecked([])
          setSelected(0)
        }}
      >
        Reiniciar atividade
      </button>
    </section>
  )
}
