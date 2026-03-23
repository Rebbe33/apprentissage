import { useState, useEffect } from 'react'
import { useStore } from './store'
import { TreeSidebar } from './components/tree/TreeSidebar'
import { NodeDetail } from './components/tree/NodeDetail'
import { SessionView } from './components/session/SessionView'
import { AddDomainModal, DeleteDomainModal } from './components/domain/DomainModals'
import { AddNodeModal } from './components/tree/AddNodeModal'
import { Btn, ProgressBar } from './components/ui'
import { countDone } from './lib/tree'
import type { TreeNode } from './types'

export default function App() {
  const {
    domains, activeDomainId, loading, error,
    loadDomains, addDomain, removeDomain, setActiveDomain,
    toggleStep, setNote, addNode, removeNode, toggleMode, addStep,
  } = useStore()

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [sessionNodeId, setSessionNodeId] = useState<string | null>(null)
  const [showAddDomain, setShowAddDomain] = useState(false)
  const [deleteDomainId, setDeleteDomainId] = useState<string | null>(null)
  const [addNodeParent, setAddNodeParent] = useState<string | null | undefined>(undefined)

  useEffect(() => { loadDomains() }, [])

  const domain = domains.find(d => d.id === activeDomainId)
  const { done: totalDone, total: totalSteps } = domain ? countDone(domain.tree) : { done: 0, total: 0 }
  const totalPct = totalSteps ? Math.round(totalDone / totalSteps * 100) : 0

  const handleAddNode = async (node: TreeNode) => {
    if (!activeDomainId) return
    await addNode(activeDomainId, addNodeParent ?? null, node)
    setAddNodeParent(undefined)
  }

  const handleTabChange = (id: string) => {
    setActiveDomain(id)
    setSelectedNodeId(null)
    setSessionNodeId(null)
  }

  if (loading) return (
    <div className="flex-1 flex items-center justify-center flex-col gap-4" style={{ color: 'var(--text3)' }}>
      <div className="text-2xl animate-spin">⚙</div>
      <span className="text-[13px]">Chargement...</span>
    </div>
  )

  return (
    <>
      <div className="flex items-center gap-4 px-5 h-[52px] flex-shrink-0"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>
          Skill<span style={{ color: 'var(--accent)' }}>Forge</span>
        </div>
        {domain && (
          <div className="flex items-center gap-2.5 ml-4">
            <div className="w-2 h-2 rounded-full" style={{ background: domain.color }}/>
            <span className="text-[12px]" style={{ color: 'var(--text2)' }}>{totalDone}/{totalSteps} étapes</span>
            <div className="w-20"><ProgressBar pct={totalPct} color={domain.color}/></div>
          </div>
        )}
        {error && (
          <div className="ml-4 text-[11px] px-2 py-1 rounded" style={{ background: 'rgba(255,71,87,.15)', color: '#ff4757' }}>
            ⚠ {error}
          </div>
        )}
        <div className="ml-auto flex gap-2">
          <Btn size="sm" onClick={() => {
            const a = Object.assign(document.createElement('a'), {
              href: URL.createObjectURL(new Blob([JSON.stringify({ domains }, null, 2)], { type: 'application/json' })),
              download: 'skillforge-backup.json',
            })
            a.click()
          }}>↓ Exporter</Btn>
        </div>
      </div>

      <div className="flex items-center gap-0.5 px-5 h-[44px] flex-shrink-0 overflow-x-auto"
        style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
        {domains.map(d => {
          const { done, total } = countDone(d.tree)
          const pct = total ? Math.round(done / total * 100) : 0
          const isActive = d.id === activeDomainId
          return (
            <button key={d.id}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded text-[12px] font-medium transition-all whitespace-nowrap flex-shrink-0"
              style={{
                background: isActive ? 'var(--surface2)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--border)' : 'transparent'}`,
                color: isActive ? 'var(--text)' : 'var(--text2)',
                fontFamily: 'JetBrains Mono, monospace', cursor: 'pointer',
              }}
              onClick={() => handleTabChange(d.id)}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }}/>
              {d.icon} {d.name}
              {total > 0 && <span className="text-[10px]" style={{ color: 'var(--text3)' }}>{pct}%</span>}
              <button className="ml-1 opacity-40 hover:opacity-100 text-[14px] leading-none px-0.5 transition-opacity"
                style={{ color: '#ff4757', cursor: 'pointer', background: 'none', border: 'none' }}
                onClick={e => { e.stopPropagation(); setDeleteDomainId(d.id) }}>×</button>
            </button>
          )
        })}
        <button className="px-2 py-1 rounded text-[18px] transition-colors"
          style={{ color: 'var(--text3)', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'monospace' }}
          onClick={() => setShowAddDomain(true)}>＋</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {!domain ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ color: 'var(--text3)' }}>
            <div className="text-5xl">🎯</div>
            <h2 style={{ fontFamily: 'Syne', fontSize: 22, color: 'var(--text2)' }}>Aucun domaine</h2>
            <p className="text-[12px] text-center leading-relaxed max-w-[260px]">
              Crée ton premier domaine d'apprentissage avec le bouton ＋
            </p>
            <Btn variant="primary" onClick={() => setShowAddDomain(true)}>＋ Nouveau domaine</Btn>
          </div>
        ) : (
          <>
            <TreeSidebar
              domain={domain}
              selectedId={selectedNodeId}
              onSelect={id => { setSelectedNodeId(id); setSessionNodeId(null) }}
              onAddRoot={() => setAddNodeParent(null)}
              onAddChild={parentId => setAddNodeParent(parentId)}
              onDelete={nodeId => {
                removeNode(activeDomainId!, nodeId)
                if (selectedNodeId === nodeId) setSelectedNodeId(null)
              }}
              onToggleMode={nodeId => toggleMode(activeDomainId!, nodeId)}
            />
            <div className="flex-1 overflow-hidden flex flex-col">
              {sessionNodeId ? (
                <SessionView
                  domain={domain} nodeId={sessionNodeId}
                  onClose={() => setSessionNodeId(null)}
                  onToggleStep={id => toggleStep(activeDomainId!, id)}
                  onNoteStep={(id, note) => setNote(activeDomainId!, id, note)}
                />
              ) : selectedNodeId ? (
                <NodeDetail
                  domain={domain} nodeId={selectedNodeId}
                  onToggleStep={id => toggleStep(activeDomainId!, id)}
                  onNoteStep={(id, note) => setNote(activeDomainId!, id, note)}
                  onAddStep={(parentId, name) => addStep(activeDomainId!, parentId, name)}
                  onStartSession={id => setSessionNodeId(id)}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ color: 'var(--text3)' }}>
                  <div className="text-5xl">{domain.icon}</div>
                  <h3 style={{ fontFamily: 'Syne', fontSize: 20, color: 'var(--text2)' }}>{domain.name}</h3>
                  <p className="text-[12px] text-center leading-relaxed max-w-[260px]">
                    Sélectionne un nœud dans l'arborescence pour voir ses étapes ou lancer une séance.
                  </p>
                  {domain.tree.length === 0 && (
                    <Btn variant="primary" onClick={() => setAddNodeParent(null)}>+ Créer l'arborescence</Btn>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showAddDomain && <AddDomainModal onClose={() => setShowAddDomain(false)} onAdd={d => addDomain(d)}/>}
      {addNodeParent !== undefined && <AddNodeModal onClose={() => setAddNodeParent(undefined)} onAdd={handleAddNode}/>}
      {deleteDomainId && (
        <DeleteDomainModal
          domainName={domains.find(d => d.id === deleteDomainId)?.name ?? ''}
          onClose={() => setDeleteDomainId(null)}
          onConfirm={() => removeDomain(deleteDomainId!)}
        />
      )}
    </>
  )
}
