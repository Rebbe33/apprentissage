import { useState, useMemo } from 'react'
import { Btn, ModeBadge, ProgressBar, CheckIcon } from '../ui'
import { findNode, getBreadcrumb, countDone, getStepsForSession } from '../../lib/tree'
import type { Domain, GroupNode, StepNode } from '../../types'

// ── Step Card ──────────────────────────────────────────────────────

function StepCard({
  step, locked, onToggle, onNote,
}: {
  step: StepNode
  locked: boolean
  onToggle: (id: string) => void
  onNote: (id: string, note: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [noteVal, setNoteVal] = useState(step.note)

  const saveNote = () => {
    onNote(step.id, noteVal)
    setEditing(false)
  }

  return (
    <div
      className="rounded-md p-3.5 flex gap-3 transition-all"
      style={{
        background: 'var(--surface)',
        border: `1px solid ${step.done ? 'rgba(61,220,151,.2)' : 'var(--border)'}`,
        opacity: locked ? 0.4 : 1,
      }}
    >
      {/* Checkbox */}
      <button
        className="w-[22px] h-[22px] rounded flex items-center justify-center flex-shrink-0 transition-all mt-0.5"
        style={{
          border: `2px solid ${step.done ? 'var(--green)' : 'var(--border2)'}`,
          background: step.done ? 'var(--green)' : 'transparent',
          color: '#0d0d0f',
          cursor: locked ? 'not-allowed' : 'pointer',
        }}
        onClick={() => !locked && onToggle(step.id)}
      >
        {step.done && <CheckIcon/>}
      </button>

      {/* Body */}
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium" style={{ color: locked ? 'var(--text3)' : 'var(--text)' }}>
          {step.name}
        </div>

        {step.note && !editing && (
          <div
            className="mt-2 text-[11px] leading-relaxed px-2.5 py-2 rounded"
            style={{
              background: 'var(--surface2)',
              borderLeft: '2px solid var(--border2)',
              color: 'var(--text2)',
            }}
          >
            {step.note}
          </div>
        )}

        {editing && (
          <textarea
            className="w-full mt-2 px-2.5 py-2 rounded text-[11px] outline-none resize-none"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border2)',
              color: 'var(--text)',
              fontFamily: 'JetBrains Mono, monospace',
              minHeight: 60,
            }}
            value={noteVal}
            onChange={e => setNoteVal(e.target.value)}
            placeholder="Ajouter une note, astuce, conseil..."
            autoFocus
          />
        )}

        <div className="flex items-center gap-2 mt-1.5">
          {locked && (
            <span className="text-[10px]" style={{ color: 'var(--text3)' }}>🔒 Étape précédente requise</span>
          )}
          {!locked && !editing && (
            <button
              className="text-[10px] px-1.5 py-0.5 rounded transition-colors"
              style={{ border: '1px solid var(--border)', color: 'var(--text3)' }}
              onClick={() => { setNoteVal(step.note); setEditing(true) }}
            >
              📝 {step.note ? 'Modifier' : 'Note'}
            </button>
          )}
          {editing && (
            <>
              <button className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'var(--accent)', color: '#fff' }} onClick={saveNote}>Sauvegarder</button>
              <button className="text-[10px] px-1.5 py-0.5 rounded" style={{ border: '1px solid var(--border)', color: 'var(--text3)' }} onClick={() => setEditing(false)}>Annuler</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Component ─────────────────────────────────────────────────

interface Props {
  domain: Domain
  nodeId: string
  onToggleStep: (stepId: string) => void
  onNoteStep: (stepId: string, note: string) => void
  onAddStep: (parentId: string, name: string) => void
  onStartSession: (nodeId: string) => void
}

export function NodeDetail({ domain, nodeId, onToggleStep, onNoteStep, onAddStep, onStartSession }: Props) {
  const [newStepName, setNewStepName] = useState('')
  const node = useMemo(() => findNode(domain.tree, nodeId), [domain.tree, nodeId])

  if (!node) return (
    <div className="flex-1 flex items-center justify-center" style={{ color: 'var(--text3)' }}>
      Sélectionne un nœud dans l'arborescence
    </div>
  )

  const breadcrumb = getBreadcrumb(domain.tree, nodeId) ?? []

  if (node.type === 'step') {
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="px-7 py-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-2 text-[11px] mb-2 flex-wrap" style={{ color: 'var(--text3)' }}>
            {breadcrumb.slice(0, -1).map((b, i) => (
              <span key={i}>{b} {i < breadcrumb.length - 2 ? '›' : ''}</span>
            ))}
          </div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800 }}>{node.name}</h1>
        </div>
        <div className="px-7 py-5">
          <StepCard step={node} locked={false} onToggle={onToggleStep} onNote={onNoteStep}/>
        </div>
      </div>
    )
  }

  // Group node
  const group = node as GroupNode
  const { done, total } = countDone(group.children)
  const pct = total ? Math.round(done / total * 100) : 0
  const stepsFlat = getStepsForSession(group.children, group.mode)

  const addStep = () => {
    if (!newStepName.trim()) return
    onAddStep(nodeId, newStepName.trim())
    setNewStepName('')
  }

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="px-7 py-6 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex gap-1.5 text-[11px] mb-2 flex-wrap items-center" style={{ color: 'var(--text3)' }}>
          {breadcrumb.slice(0, -1).map((b, i) => (
            <span key={i}>{b} {i < breadcrumb.length - 2 ? '›' : ''}</span>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800 }}>{node.name}</h1>
          <ModeBadge mode={group.mode}/>
        </div>
        <div className="flex gap-6 mt-4">
          {[
            { val: done, label: 'Validées', color: domain.color },
            { val: total, label: 'Total', color: 'var(--text)' },
            { val: `${pct}%`, label: 'Progression', color: 'var(--text)' },
          ].map(s => (
            <div key={s.label}>
              <div className="text-[20px] font-bold" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[10px] tracking-widest uppercase mt-0.5" style={{ color: 'var(--text3)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-7 pt-4">
        <ProgressBar pct={pct} color={domain.color}/>
      </div>

      {/* Steps */}
      <div className="px-7 py-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[11px] font-medium tracking-widest uppercase" style={{ color: 'var(--text3)' }}>
            Étapes
          </span>
          <Btn variant="primary" size="sm" onClick={() => onStartSession(nodeId)}>
            ▶ Séance d'entraînement
          </Btn>
        </div>
        <div className="flex flex-col gap-2">
          {stepsFlat.map(step => (
            <StepCard
              key={step.id}
              step={step}
              locked={step.locked}
              onToggle={onToggleStep}
              onNote={onNoteStep}
            />
          ))}
        </div>
        {/* Add step */}
        <div className="flex gap-2 mt-3">
          <input
            className="flex-1 rounded px-3 py-2 text-[13px] outline-none"
            style={{
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              fontFamily: 'JetBrains Mono, monospace',
            }}
            placeholder="Nouvelle étape..."
            value={newStepName}
            onChange={e => setNewStepName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addStep()}
          />
          <Btn size="sm" onClick={addStep}>+ Ajouter</Btn>
        </div>
      </div>
    </div>
  )
}
