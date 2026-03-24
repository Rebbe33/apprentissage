import { useState, useEffect } from 'react'
import { useStore } from './store'
import { TreeSidebar } from './components/tree/TreeSidebar'
import { NodeDetail, EmptyContent } from './components/tree/NodeDetail'
import { SessionView } from './components/session/SessionView'
import { GlobalSessionView } from './components/session/GlobalSessionView'
import { AddDomainModal, DeleteDomainModal } from './components/domain/DomainModals'
import { AddNodeModal } from './components/tree/AddNodeModal'
import { ImportModal } from './components/domain/ImportModal'
import { MenuIcon, ProgressBar } from './components/ui'
import { countDone } from './lib/tree'
import type { TreeNode } from './types'

export default function App() {
  const {
    domains, activeDomainId, loading, error,
    loadDomains, addDomain, removeDomain, setActiveDomain,
    toggleStep, setNote, addNode, removeNode, toggleMode, addStep,
  } = useStore()

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [sessionNodeId, setSessionNodeId]   = useState<string | null>(null)
  const [globalSession, setGlobalSession]   = useState(false)
  const [sidebarOpen, setSidebarOpen]       = useState(false)
  const [showAddDomain, setShowAddDomain]   = useState(false)
  const [deleteDomainId, setDeleteDomainId] = useState<string | null>(null)
  const [showImport, setShowImport]         = useState(false)
  const [addNodeParent, setAddNodeParent]   = useState<string | null | undefined>(undefined)

  useEffect(() => { loadDomains() }, [])

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)')
    const handler = (e: MediaQueryListEvent) => { if (e.matches) setSidebarOpen(true) }
    if (mq.matches) setSidebarOpen(true)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const domain = domains.find(d => d.id === activeDomainId)
  const { done: totalDone, total: totalSteps } = domain ? countDone(domain.tree) : { done: 0, total: 0 }
  const totalPct = totalSteps ? Math.round(totalDone / totalSteps * 100) : 0

  const handleTabChange = (id: string) => {
    setActiveDomain(id)
    setSelectedNodeId(null)
    setSessionNodeId(null)
    setGlobalSession(false)
    if (window.innerWidth < 768) setSidebarOpen(false)
  }

  const handleImport = async (tree: TreeNode[]) => {
    if (!activeDomainId) return
    for (const node of tree) {
      await addNode(activeDomainId, null, node)
    }
  }

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: 'var(--text3)' }}>
      <div style={{ fontSize: 28 }}>⏳</div>
      <span style={{ fontSize: 13 }}>Chargement...</span>
    </div>
  )

  return (
    <>
      {/* ── TOPBAR ─────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px',
        height: 52, flexShrink: 0,
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      }}>
        {domain && (
          <button className="md:hidden" onClick={() => setSidebarOpen(o => !o)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text2)', display: 'flex', alignItems: 'center', padding: 4 }}>
            <MenuIcon/>
          </button>
        )}
        <div style={{ fontFamily: 'Lora, serif', fontWeight: 600, fontSize: 17, color: 'var(--text)', letterSpacing: -.3 }}>
          Skill<span style={{ color: 'var(--accent)' }}>Forge</span>
        </div>
        {domain && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8,
            background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 20,
            padding: '4px 12px 4px 8px', flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: domain.color, flexShrink: 0 }}/>
            <span style={{ fontSize: 12, color: 'var(--text2)', whiteSpace: 'nowrap' }}>{totalDone}/{totalSteps}</span>
            <div style={{ width: 48 }}><ProgressBar pct={totalPct} color={domain.color}/></div>
          </div>
        )}
        {/* Global session button */}
        {domain && domain.tree.length > 0 && (
          <button
            onClick={() => { setGlobalSession(true); setSessionNodeId(null); setSelectedNodeId(null) }}
            style={{
              marginLeft: 'auto', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: globalSession ? domain.color : 'var(--accent-light)',
              border: `1px solid ${domain.color}`, color: globalSession ? '#fff' : domain.color,
              cursor: 'pointer', fontFamily: 'DM Sans', transition: 'all .15s', whiteSpace: 'nowrap',
            }}>
            ✦ Séance globale
          </button>
        )}
        {error && (
          <div style={{ fontSize: 11, padding: '4px 10px', borderRadius: 6, background: 'var(--red-light)', color: 'var(--red)', border: '1px solid #f0c0bb' }}>
            ⚠ {error}
          </div>
        )}
      </div>

      {/* ── DOMAIN TABS ────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 2, padding: '0 12px',
        height: 42, flexShrink: 0, overflowX: 'auto',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
      }}>
        {domains.map(d => {
          const { done, total } = countDone(d.tree)
          const pct = total ? Math.round(done / total * 100) : 0
          const isActive = d.id === activeDomainId
          return (
            <button key={d.id} onClick={() => handleTabChange(d.id)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: isActive ? 600 : 400,
                whiteSpace: 'nowrap', flexShrink: 0, cursor: 'pointer', transition: 'all .15s',
                background: isActive ? 'var(--accent-light)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--border)' : 'transparent'}`,
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                fontFamily: 'DM Sans, sans-serif',
              }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: d.color, flexShrink: 0 }}/>
              {d.icon} {d.name}
              {total > 0 && <span style={{ fontSize: 10, color: isActive ? 'var(--accent)' : 'var(--text3)', opacity: .7 }}>{pct}%</span>}
              <button onClick={e => { e.stopPropagation(); setDeleteDomainId(d.id) }}
                style={{ marginLeft: 2, opacity: .35, fontSize: 14, lineHeight: 1, color: 'var(--red)', cursor: 'pointer', background: 'none', border: 'none', transition: 'opacity .1s' }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '.35')}>×</button>
            </button>
          )
        })}
        <button onClick={() => setShowAddDomain(true)}
          style={{ padding: '4px 10px', borderRadius: 8, fontSize: 16, color: 'var(--text3)', cursor: 'pointer', background: 'none', border: 'none', transition: 'color .1s', flexShrink: 0, fontFamily: 'sans-serif' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}>＋</button>
      </div>

      {/* ── MAIN ───────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {!domain ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, color: 'var(--text3)', padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 48 }}>🎯</div>
            <div style={{ fontFamily: 'Lora, serif', fontSize: 22, color: 'var(--text2)', fontWeight: 600 }}>Aucun domaine</div>
            <div style={{ fontSize: 13, lineHeight: 1.7, maxWidth: 260 }}>Crée ton premier domaine d'apprentissage.</div>
            <button onClick={() => setShowAddDomain(true)}
              style={{ padding: '9px 20px', borderRadius: 8, background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', fontSize: 13, fontWeight: 500 }}>
              ＋ Nouveau domaine
            </button>
          </div>
        ) : (
          <>
            <TreeSidebar
              domain={domain} selectedId={selectedNodeId}
              isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}
              onSelect={id => { setSelectedNodeId(id); setSessionNodeId(null); setGlobalSession(false) }}
              onAddRoot={() => setAddNodeParent(null)}
              onAddChild={parentId => setAddNodeParent(parentId)}
              onDelete={nodeId => { removeNode(activeDomainId!, nodeId); if (selectedNodeId === nodeId) setSelectedNodeId(null) }}
              onToggleMode={nodeId => toggleMode(activeDomainId!, nodeId)}
              onImport={() => setShowImport(true)}
            />

            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {globalSession ? (
                <GlobalSessionView
                  domain={domain}
                  onClose={() => setGlobalSession(false)}
                  onToggleStep={id => toggleStep(activeDomainId!, id)}
                  onNoteStep={(id, note) => setNote(activeDomainId!, id, note)}
                />
              ) : sessionNodeId ? (
                <SessionView domain={domain} nodeId={sessionNodeId}
                  onClose={() => setSessionNodeId(null)}
                  onToggleStep={id => toggleStep(activeDomainId!, id)}
                  onNoteStep={(id, note) => setNote(activeDomainId!, id, note)}/>
              ) : selectedNodeId ? (
                <NodeDetail domain={domain} nodeId={selectedNodeId}
                  onToggleStep={id => toggleStep(activeDomainId!, id)}
                  onNoteStep={(id, note) => setNote(activeDomainId!, id, note)}
                  onAddStep={(parentId, name) => addStep(activeDomainId!, parentId, name)}
                  onStartSession={id => setSessionNodeId(id)}
                  onOpenSidebar={() => setSidebarOpen(true)}/>
              ) : (
                <EmptyContent domain={domain} onOpenSidebar={() => setSidebarOpen(true)}/>
              )}
            </div>
          </>
        )}
      </div>

      {/* ── MODALS ─────────────────────────────────────── */}
      {showAddDomain && <AddDomainModal onClose={() => setShowAddDomain(false)} onAdd={d => addDomain(d)}/>}
      {addNodeParent !== undefined && <AddNodeModal onClose={() => setAddNodeParent(undefined)} onAdd={node => { if (activeDomainId) addNode(activeDomainId, addNodeParent ?? null, node); setAddNodeParent(undefined) }}/>}
      {deleteDomainId && <DeleteDomainModal domainName={domains.find(d => d.id === deleteDomainId)?.name ?? ''} onClose={() => setDeleteDomainId(null)} onConfirm={() => removeDomain(deleteDomainId!)}/>}
      {showImport && domain && <ImportModal domainName={domain.name} onClose={() => setShowImport(false)} onImport={handleImport}/>}
    </>
  )
}
