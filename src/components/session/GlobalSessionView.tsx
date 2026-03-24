import { useState } from 'react'
import { Btn, ProgressBar, CheckIcon } from '../ui'
import { buildGlobalSession } from '../../lib/sessionBuilder'
import type { Domain } from '../../types'
import type { SessionStep } from '../../lib/sessionBuilder'

const COUNT_OPTIONS = [3, 5, 7, 10]

interface Props {
  domain: Domain
  onClose: () => void
  onToggleStep: (id: string) => void
  onNoteStep: (id: string, note: string) => void
}

type Phase = 'config' | 'session'

export function GlobalSessionView({ domain, onClose, onToggleStep, onNoteStep }: Props) {
  const [phase, setPhase]       = useState<Phase>('config')
  const [count, setCount]       = useState(5)
  const [items, setItems]       = useState<SessionStep[]>([])
  const [noteTarget, setNoteTarget] = useState<string | null>(null)
  const [noteVal, setNoteVal]   = useState('')

  const start = () => {
    const session = buildGlobalSession(domain.tree, count)
    setItems(session)
    setPhase('session')
  }

  const toggle = (id: string) => {
    setItems(prev => prev.map(s => s.id === id ? { ...s, done: !s.done } : s))
    onToggleStep(id)
  }

  const saveNote = (id: string) => {
    onNoteStep(id, noteVal)
    setItems(prev => prev.map(s => s.id === id ? { ...s, note: noteVal } : s))
    setNoteTarget(null)
  }

  const done  = items.filter(s => s.done).length
  const total = items.length
  const pct   = total ? Math.round(done / total * 100) : 0

  // ── Config screen ──────────────────────────────────────────────
  if (phase === 'config') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <button onClick={onClose}
            style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 4 }}>
            ← Retour
          </button>

          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text3)' }}>
              Séance globale
            </span>
          </div>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: 26, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
            {domain.icon} {domain.name}
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 32 }}>
            Une séance qui pioche dans <strong>toute l'arborescence</strong>, en rotation équilibrée entre les branches — en respectant l'ordre séquentiel ou aléatoire de chacune.
          </p>

          {/* Count selector */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 12 }}>
              Nombre de points
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              {COUNT_OPTIONS.map(n => (
                <button key={n} onClick={() => setCount(n)}
                  style={{
                    width: 52, height: 52, borderRadius: 12, fontSize: 16, fontWeight: 600,
                    cursor: 'pointer', transition: 'all .15s', fontFamily: 'Lora, serif',
                    background: count === n ? domain.color : 'var(--surface)',
                    border: `2px solid ${count === n ? domain.color : 'var(--border)'}`,
                    color: count === n ? '#fff' : 'var(--text2)',
                  }}>
                  {n}
                </button>
              ))}
              {/* Custom input */}
              <input
                type="number" min={1} max={30}
                value={COUNT_OPTIONS.includes(count) ? '' : count}
                placeholder="…"
                onChange={e => { const v = parseInt(e.target.value); if (v > 0 && v <= 30) setCount(v) }}
                style={{
                  width: 52, height: 52, borderRadius: 12, fontSize: 15, fontWeight: 600,
                  textAlign: 'center', outline: 'none', fontFamily: 'Lora, serif',
                  background: !COUNT_OPTIONS.includes(count) ? domain.color : 'var(--surface)',
                  border: `2px solid ${!COUNT_OPTIONS.includes(count) ? domain.color : 'var(--border)'}`,
                  color: !COUNT_OPTIONS.includes(count) ? '#fff' : 'var(--text3)',
                }}
              />
            </div>
          </div>

          <button onClick={start}
            style={{
              width: '100%', padding: '14px 0', borderRadius: 12, fontSize: 15, fontWeight: 600,
              background: domain.color, color: '#fff', border: 'none', cursor: 'pointer',
              fontFamily: 'DM Sans', transition: 'opacity .15s', letterSpacing: '.01em',
            }}>
            ▶ Générer la séance ({count} points)
          </button>
        </div>
      </div>
    )
  }

  // ── Session screen ─────────────────────────────────────────────
  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <Btn size="sm" onClick={() => setPhase('config')}>← Configurer</Btn>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 600, color: 'var(--text)', flex: 1 }}>
            Séance globale — {domain.name}
          </h1>
          <button onClick={start}
            style={{ fontSize: 11, padding: '5px 10px', borderRadius: 8, background: 'var(--accent-light)', border: '1px solid var(--border)', color: 'var(--accent)', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 500 }}>
            ↻ Regénérer
          </button>
        </div>

        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
          {[
            { val: done,      label: 'Faites',     color: domain.color },
            { val: total,     label: 'Total',       color: 'var(--text)' },
            { val: `${pct}%`, label: 'Progression', color: 'var(--text)' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: 'Lora, serif' }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <ProgressBar pct={pct} color={domain.color}/>
      </div>

      {/* Items */}
      <div style={{ padding: '16px 24px 40px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)', fontSize: 13 }}>
            Aucune étape disponible — toutes les étapes sont peut-être déjà validées.
          </div>
        ) : (
          <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)' }}>
            {items.map((item, i) => (
              <div key={item.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
                borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
                opacity: item.done ? 0.5 : 1, transition: 'opacity .2s',
              }}>
                {/* Number */}
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                  ...(item.done
                    ? { background: 'var(--green-light)', border: '1px solid #b8d8c4', color: 'var(--green)' }
                    : { background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text3)' })
                }}>
                  {item.done ? <CheckIcon size={10}/> : i + 1}
                </div>

                {/* Body */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.name}</div>
                  {/* Branch path with mode hint */}
                  <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5, flexWrap: 'wrap' }}>
                    {item.path.join(' › ')}
                  </div>

                  {item.note && noteTarget !== item.id && (
                    <div style={{ marginTop: 6, fontSize: 11, lineHeight: 1.6, padding: '6px 10px', borderRadius: 6, background: 'var(--bg2)', borderLeft: '2px solid var(--border2)', color: 'var(--text2)' }}>
                      {item.note}
                    </div>
                  )}
                  {noteTarget === item.id && (
                    <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                      <textarea value={noteVal} onChange={e => setNoteVal(e.target.value)}
                        placeholder="Ajouter une note..." autoFocus
                        style={{ flex: 1, padding: '7px 10px', borderRadius: 6, fontSize: 11, background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif', resize: 'vertical', minHeight: 52, outline: 'none' }}/>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <Btn size="sm" variant="primary" onClick={() => saveNote(item.id)}>OK</Btn>
                        <Btn size="sm" onClick={() => setNoteTarget(null)}>✕</Btn>
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop: 5 }}>
                    <button onClick={() => { setNoteTarget(item.id); setNoteVal(item.note || '') }}
                      style={{ fontSize: 11, color: 'var(--text3)', padding: '2px 7px', borderRadius: 5, border: '1px solid var(--border)', cursor: 'pointer', background: 'none', fontFamily: 'DM Sans, sans-serif' }}>
                      📝 Note
                    </button>
                  </div>
                </div>

                {/* Check button */}
                <button onClick={() => toggle(item.id)}
                  style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0, cursor: 'pointer', transition: 'all .2s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    ...(item.done
                      ? { background: 'var(--green)', border: '2px solid var(--green)', color: '#fff' }
                      : { background: 'transparent', border: '2px solid var(--border2)', color: 'var(--text3)' })
                  }}>
                  {item.done ? <CheckIcon size={12}/> : '○'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
