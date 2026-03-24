import { useState, useMemo } from 'react'
import { Btn, ModeBadge, ProgressBar, CheckIcon } from '../ui'
import { findNode, getBreadcrumb, countDone, getStepsForSession } from '../../lib/tree'
import type { Domain, GroupNode, StepNode } from '../../types'

function StepCard({ step, locked, onToggle, onNote }: {
  step: StepNode; locked: boolean
  onToggle: (id: string) => void; onNote: (id: string, note: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [noteVal, setNoteVal] = useState(step.note)

  return (
    <div style={{
      borderRadius: 10, padding: '13px 15px', display: 'flex', gap: 12, transition: 'all .15s',
      background: 'var(--surface)',
      border: `1px solid ${step.done ? '#b8d8c4' : 'var(--border)'}`,
      opacity: locked ? 0.45 : 1,
    }}>
      {/* Check */}
      <button
        onClick={() => !locked && onToggle(step.id)}
        style={{
          width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
          border: `2px solid ${step.done ? 'var(--green)' : 'var(--border2)'}`,
          background: step.done ? 'var(--green)' : 'transparent',
          color: '#fff', cursor: locked ? 'not-allowed' : 'pointer',
        }}
      >{step.done && <CheckIcon/>}</button>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 500, color: locked ? 'var(--text3)' : 'var(--text)' }}>
          {step.name}
        </div>

        {step.note && !editing && (
          <div style={{
            marginTop: 7, fontSize: 11, lineHeight: 1.6, padding: '7px 10px', borderRadius: 6,
            background: 'var(--bg2)', borderLeft: '2px solid var(--border2)', color: 'var(--text2)',
          }}>{step.note}</div>
        )}

        {editing && (
          <textarea
            value={noteVal} onChange={e => setNoteVal(e.target.value)}
            placeholder="Ajouter une note, astuce, conseil..."
            autoFocus
            style={{
              width: '100%', marginTop: 7, padding: '7px 10px', borderRadius: 6, fontSize: 11,
              background: 'var(--bg2)', border: '1px solid var(--border2)', color: 'var(--text)',
              fontFamily: 'DM Sans, sans-serif', resize: 'vertical', minHeight: 60, outline: 'none',
            }}
          />
        )}

        <div style={{ display: 'flex', gap: 6, marginTop: 6, alignItems: 'center' }}>
          {locked && <span style={{ fontSize: 10, color: 'var(--text3)' }}>🔒 Étape précédente requise</span>}
          {!locked && !editing && (
            <button onClick={() => { setNoteVal(step.note); setEditing(true) }}
              style={{ fontSize: 11, color: 'var(--text3)', padding: '2px 7px', borderRadius: 5, border: '1px solid var(--border)', cursor: 'pointer', background: 'none', fontFamily: 'DM Sans, sans-serif' }}>
              📝 {step.note ? 'Modifier note' : 'Note'}
            </button>
          )}
          {editing && <>
            <button onClick={() => { onNote(step.id, noteVal); setEditing(false) }}
              style={{ fontSize: 11, color: '#fff', padding: '2px 10px', borderRadius: 5, background: 'var(--accent)', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
              Sauvegarder
            </button>
            <button onClick={() => { setEditing(false); setNoteVal(step.note) }}
              style={{ fontSize: 11, color: 'var(--text3)', padding: '2px 7px', borderRadius: 5, border: '1px solid var(--border)', cursor: 'pointer', background: 'none', fontFamily: 'DM Sans, sans-serif' }}>
              Annuler
            </button>
          </>}
        </div>
      </div>
    </div>
  )
}

interface Props {
  domain: Domain; nodeId: string
  onToggleStep: (id: string) => void; onNoteStep: (id: string, note: string) => void
  onAddStep: (parentId: string, name: string) => void; onStartSession: (nodeId: string) => void
  onOpenSidebar: () => void
}

export function NodeDetail({ domain, nodeId, onToggleStep, onNoteStep, onAddStep, onStartSession, onOpenSidebar }: Props) {
  const [newStep, setNewStep] = useState('')
  const node = useMemo(() => findNode(domain.tree, nodeId), [domain.tree, nodeId])

  if (!node) return (
    <EmptyContent domain={domain} onOpenSidebar={onOpenSidebar}/>
  )

  const breadcrumb = getBreadcrumb(domain.tree, nodeId) ?? []

  if (node.type === 'step') {
    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 32px' }}>
        <Breadcrumb items={breadcrumb.slice(0, -1)} onOpenSidebar={onOpenSidebar}/>
        <h1 style={{ fontFamily: 'Lora, serif', fontSize: 22, fontWeight: 600, margin: '8px 0 20px', color: 'var(--text)' }}>{node.name}</h1>
        <StepCard step={node as StepNode} locked={false} onToggle={onToggleStep} onNote={onNoteStep}/>
      </div>
    )
  }

  const group = node as GroupNode
  const { done, total } = countDone(group.children)
  const pct = total ? Math.round(done / total * 100) : 0
  const steps = getStepsForSession(group.children, group.mode)

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 40px', maxWidth: 680, margin: '0 auto', width: '100%' }}>
      <Breadcrumb items={breadcrumb.slice(0, -1)} onOpenSidebar={onOpenSidebar}/>

      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, margin: '8px 0 16px', flexWrap: 'wrap' }}>
        <h1 style={{ fontFamily: 'Lora, serif', fontSize: 24, fontWeight: 600, color: 'var(--text)' }}>{node.name}</h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <ModeBadge mode={group.mode}/>
          <Btn variant="primary" size="sm" onClick={() => onStartSession(nodeId)}>▶ Séance</Btn>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 20, marginBottom: 14 }}>
        {[
          { val: done,    label: 'Validées', color: domain.color },
          { val: total,   label: 'Total',    color: 'var(--text)' },
          { val: `${pct}%`, label: 'Progression', color: 'var(--text)' },
        ].map(s => (
          <div key={s.label}>
            <div style={{ fontSize: 22, fontWeight: 700, color: s.color, fontFamily: 'Lora, serif' }}>{s.val}</div>
            <div style={{ fontSize: 10, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '.06em', marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ marginBottom: 20 }}><ProgressBar pct={pct} color={domain.color}/></div>

      {/* Steps */}
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--text3)', marginBottom: 10 }}>Étapes</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {steps.map(s => (
          <StepCard key={s.id} step={s} locked={s.locked} onToggle={onToggleStep} onNote={onNoteStep}/>
        ))}
      </div>

      {/* Add step */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <input
          value={newStep} onChange={e => setNewStep(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && newStep.trim()) { onAddStep(nodeId, newStep.trim()); setNewStep('') } }}
          placeholder="Nouvelle étape..."
          style={{
            flex: 1, borderRadius: 8, padding: '8px 12px', fontSize: 13, outline: 'none',
            background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)', fontFamily: 'DM Sans, sans-serif',
          }}
        />
        <Btn size="sm" onClick={() => { if (newStep.trim()) { onAddStep(nodeId, newStep.trim()); setNewStep('') } }}>+ Ajouter</Btn>
      </div>
    </div>
  )
}

function Breadcrumb({ items, onOpenSidebar }: { items: string[]; onOpenSidebar: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, flexWrap: 'wrap' }}>
      <button className="md:hidden" onClick={onOpenSidebar}
        style={{ fontSize: 12, color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', padding: '0 0 0 0', marginRight: 4 }}>
        ← Plan
      </button>
      {items.map((b, i) => (
        <span key={i} style={{ fontSize: 11, color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: 6 }}>
          {b}{i < items.length - 1 && <span>›</span>}
        </span>
      ))}
    </div>
  )
}

export function EmptyContent({ domain, onOpenSidebar }: { domain: Domain; onOpenSidebar: () => void }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--text3)', padding: 32, textAlign: 'center' }}>
      <div style={{ fontSize: 48 }}>{domain.icon}</div>
      <div style={{ fontFamily: 'Lora, serif', fontSize: 20, color: 'var(--text2)', fontWeight: 600 }}>{domain.name}</div>
      <div style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 260, color: 'var(--text3)' }}>
        Sélectionne une compétence dans le plan pour voir ses étapes.
      </div>
      <button className="md:hidden" onClick={onOpenSidebar}
        style={{ marginTop: 4, padding: '9px 18px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500 }}>
        Ouvrir le plan
      </button>
    </div>
  )
}
