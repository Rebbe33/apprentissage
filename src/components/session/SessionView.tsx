import { useState, useMemo } from 'react'
import { Btn, ProgressBar, CheckIcon, ModeBadge } from '../ui'
import { findNode, getStepsForSession } from '../../lib/tree'
import type { Domain, GroupNode } from '../../types'
import type { StepWithPath } from '../../lib/tree'

interface SessionItem extends StepWithPath { sessionDone: boolean }

interface Props {
  domain: Domain; nodeId: string
  onClose: () => void
  onToggleStep: (id: string) => void; onNoteStep: (id: string, note: string) => void
}

export function SessionView({ domain, nodeId, onClose, onToggleStep, onNoteStep }: Props) {
  const node = useMemo(() => findNode(domain.tree, nodeId), [domain.tree, nodeId])
  const group = node as GroupNode

  const [items, setItems] = useState<SessionItem[]>(() => {
    if (!group) return []
    let steps = getStepsForSession(group.children, group.mode, [group.name])
    if (group.mode === 'random') steps = [...steps].sort(() => Math.random() - .5)
    return steps.map(s => ({ ...s, sessionDone: s.done }))
  })
  const [noteTarget, setNoteTarget] = useState<string | null>(null)
  const [noteVal, setNoteVal] = useState('')

  const done  = items.filter(s => s.sessionDone).length
  const total = items.length
  const pct   = total ? Math.round(done / total * 100) : 0

  const toggle = (id: string) => {
    setItems(prev => prev.map(s => s.id === id ? { ...s, sessionDone: !s.sessionDone } : s))
    onToggleStep(id)
  }
  const saveNote = (id: string) => {
    onNoteStep(id, noteVal)
    setItems(prev => prev.map(s => s.id === id ? { ...s, note: noteVal } : s))
    setNoteTarget(null)
  }

  if (!group) return null

  return (
    <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
          <Btn size="sm" onClick={onClose}>← Retour</Btn>
          <h1 style={{ fontFamily: 'Lora, serif', fontSize: 18, fontWeight: 600, color: 'var(--text)', flex: 1 }}>
            Séance — {group.name}
          </h1>
          <ModeBadge mode={group.mode}/>
        </div>
        <div style={{ display: 'flex', gap: 20, marginBottom: 12 }}>
          {[
            { val: done,      label: 'Faites',      color: domain.color },
            { val: total,     label: 'Total',        color: 'var(--text)' },
            { val: `${pct}%`, label: 'Progression',  color: 'var(--text)' },
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
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--surface)' }}>
          {items.map((item, i) => (
            <div key={item.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px',
              borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
              opacity: item.sessionDone ? 0.5 : 1, transition: 'opacity .2s',
            }}>
              {/* Number */}
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0, marginTop: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                ...(item.sessionDone
                  ? { background: 'var(--green-light)', border: '1px solid #b8d8c4', color: 'var(--green)' }
                  : { background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text3)' })
              }}>
                {item.sessionDone ? <CheckIcon size={10}/> : i + 1}
              </div>

              {/* Body */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text)' }}>{item.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text3)', marginTop: 1 }}>{item.path.join(' › ')}</div>

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
                  ...(item.sessionDone
                    ? { background: 'var(--green)', border: '2px solid var(--green)', color: '#fff' }
                    : { background: 'transparent', border: '2px solid var(--border2)', color: 'var(--text3)' })
                }}>
                {item.sessionDone ? <CheckIcon size={12}/> : '○'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
