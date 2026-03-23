import { useState, useMemo } from 'react'
import { Btn, ProgressBar, CheckIcon, ModeBadge } from '../ui'
import { findNode, getStepsForSession } from '../../lib/tree'
import type { Domain, GroupNode } from '../../types'
import type { StepWithPath } from '../../lib/tree'

interface SessionItem extends StepWithPath {
  sessionDone: boolean
}

interface Props {
  domain: Domain
  nodeId: string
  onClose: () => void
  onToggleStep: (id: string) => void
  onNoteStep: (id: string, note: string) => void
}

export function SessionView({ domain, nodeId, onClose, onToggleStep, onNoteStep }: Props) {
  const node = useMemo(() => findNode(domain.tree, nodeId), [domain.tree, nodeId])
  const group = node as GroupNode

  const initialItems = useMemo(() => {
    if (!group) return []
    let steps = getStepsForSession(group.children, group.mode, [group.name])
    if (group.mode === 'random') steps = [...steps].sort(() => Math.random() - 0.5)
    return steps.map(s => ({ ...s, sessionDone: s.done }))
  }, [])

  const [items, setItems] = useState<SessionItem[]>(initialItems)
  const [noteTarget, setNoteTarget] = useState<string | null>(null)
  const [noteVal, setNoteVal] = useState('')

  const done = items.filter(s => s.sessionDone).length
  const total = items.length
  const pct = total ? Math.round(done / total * 100) : 0

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
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="px-7 py-6 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <Btn size="sm" onClick={onClose}>← Retour</Btn>
          <h1 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 700 }}>
            Séance — {group.name}
          </h1>
          <ModeBadge mode={group.mode}/>
        </div>
        <div className="flex gap-6 mb-4">
          {[
            { val: done, label: 'Faites', color: domain.color },
            { val: total, label: 'Total', color: 'var(--text)' },
            { val: `${pct}%`, label: 'Session', color: 'var(--text)' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-[20px] font-bold" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: 'var(--text3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <ProgressBar pct={pct} color={domain.color}/>
      </div>

      {/* Items */}
      <div className="px-7 py-5">
        <div
          className="rounded-lg overflow-hidden"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          {items.map((item, i) => (
            <div
              key={item.id}
              className="flex items-start gap-3.5 p-4 transition-colors"
              style={{
                borderBottom: i < items.length - 1 ? '1px solid var(--border)' : 'none',
                opacity: item.sessionDone ? 0.55 : 1,
              }}
            >
              {/* Number */}
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] flex-shrink-0 mt-0.5"
                style={item.sessionDone
                  ? { background: 'rgba(61,220,151,.15)', border: '1px solid var(--green)', color: 'var(--green)' }
                  : { background: 'var(--surface2)', border: '1px solid var(--border)', color: 'var(--text3)' }
                }
              >
                {item.sessionDone ? <CheckIcon size={10}/> : i + 1}
              </div>

              {/* Body */}
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium" style={{ color: 'var(--text)' }}>{item.name}</div>
                <div className="text-[10px] mt-0.5" style={{ color: 'var(--text3)' }}>
                  {item.path.join(' › ')}
                </div>
                {item.note && noteTarget !== item.id && (
                  <div
                    className="mt-2 text-[11px] leading-relaxed px-2.5 py-2 rounded"
                    style={{ background: 'var(--surface2)', borderLeft: '2px solid var(--border2)', color: 'var(--text2)' }}
                  >
                    {item.note}
                  </div>
                )}
                {noteTarget === item.id && (
                  <div className="flex gap-2 mt-2">
                    <textarea
                      className="flex-1 rounded px-2.5 py-2 text-[11px] outline-none resize-none"
                      style={{
                        background: 'var(--surface2)',
                        border: '1px solid var(--border2)',
                        color: 'var(--text)',
                        fontFamily: 'JetBrains Mono, monospace',
                        minHeight: 56,
                      }}
                      value={noteVal}
                      onChange={e => setNoteVal(e.target.value)}
                      placeholder="Ajouter une note..."
                      autoFocus
                    />
                    <div className="flex flex-col gap-1.5">
                      <Btn size="sm" variant="primary" onClick={() => saveNote(item.id)}>OK</Btn>
                      <Btn size="sm" onClick={() => setNoteTarget(null)}>✕</Btn>
                    </div>
                  </div>
                )}
                <div className="mt-1.5">
                  <button
                    className="text-[10px] px-1.5 py-0.5 rounded transition-colors"
                    style={{ border: '1px solid var(--border)', color: 'var(--text3)' }}
                    onClick={() => { setNoteTarget(item.id); setNoteVal(item.note || '') }}
                  >
                    📝 Note
                  </button>
                </div>
              </div>

              {/* Check button */}
              <button
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
                style={item.sessionDone
                  ? { background: 'var(--green)', border: '2px solid var(--green)', color: '#0d0d0f' }
                  : { border: '2px solid var(--border2)', color: 'var(--text3)' }
                }
                onClick={() => toggle(item.id)}
              >
                {item.sessionDone ? <CheckIcon size={12}/> : '○'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
