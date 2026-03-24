import { useState } from 'react'
import { ChevronIcon, Btn, ImportIcon } from '../ui'
import { countDone } from '../../lib/tree'
import type { TreeNode, GroupNode, Domain } from '../../types'

interface TreeNodeProps {
  node: TreeNode
  depth: number
  selectedId: string | null
  domainColor: string
  onSelect: (id: string) => void
  onAdd: (parentId: string) => void
  onDelete: (id: string) => void
  onToggleMode: (id: string) => void
}

function TreeNodeComp({ node, depth, selectedId, domainColor, onSelect, onAdd, onDelete, onToggleMode }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(depth < 2)
  const [hovered, setHovered]   = useState(false)
  const isGroup    = node.type === 'group'
  const isSelected = selectedId === node.id
  const { done, total } = isGroup ? countDone((node as GroupNode).children) : { done: 0, total: 0 }

  return (
    <div>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => { onSelect(node.id); if (isGroup) setExpanded(e => !e) }}
        style={{
          display: 'flex', alignItems: 'center', gap: 0,
          padding: '5px 8px', borderRadius: 8, cursor: 'pointer',
          background: isSelected ? 'var(--accent-light)' : hovered ? 'var(--surface3)' : 'transparent',
          transition: 'background .1s',
          margin: '1px 0',
        }}
      >
        {/* Arrow */}
        <div style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text3)', visibility: isGroup ? 'visible' : 'hidden' }}>
          <ChevronIcon expanded={expanded}/>
        </div>

        {/* Label */}
        <div style={{
          flex: 1, fontSize: 13, padding: '0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          color: isSelected ? domainColor : node.type === 'step' ? 'var(--text3)' : 'var(--text2)',
          fontWeight: isSelected ? 500 : 400,
        }}>
          {node.type === 'step' && (
            <span style={{ marginRight: 6, fontSize: 11, color: node.done ? 'var(--green)' : 'var(--border2)' }}>
              {node.done ? '✓' : '○'}
            </span>
          )}
          {node.name}
        </div>

        {/* Progress */}
        {isGroup && (
          <span style={{ fontSize: 10, color: 'var(--text3)', marginRight: 4, flexShrink: 0 }}>
            {done}/{total}
          </span>
        )}

        {/* Actions */}
        {hovered && (
          <div style={{ display: 'flex', gap: 2, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            {isGroup && (
              <>
                <button onClick={() => onAdd(node.id)} title="Ajouter un enfant"
                  style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, fontSize: 14, color: 'var(--text3)', cursor: 'pointer', background: 'none', border: 'none', transition: 'color .1s' }}>+</button>
                <button onClick={() => onToggleMode(node.id)} title={`Mode: ${(node as GroupNode).mode}`}
                  style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, fontSize: 11, cursor: 'pointer', background: 'none', border: 'none',
                    color: (node as GroupNode).mode === 'sequential' ? 'var(--sequential)' : 'var(--random)' }}>
                  {(node as GroupNode).mode === 'sequential' ? '↓' : '⚡'}
                </button>
              </>
            )}
            <button onClick={() => onDelete(node.id)} title="Supprimer"
              style={{ width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4, fontSize: 13, color: 'var(--red)', cursor: 'pointer', background: 'none', border: 'none' }}>×</button>
          </div>
        )}
      </div>

      {isGroup && expanded && (
        <div style={{ paddingLeft: 18 }}>
          {(node as GroupNode).children.map(child => (
            <TreeNodeComp key={child.id} node={child} depth={depth + 1}
              selectedId={selectedId} domainColor={domainColor}
              onSelect={onSelect} onAdd={onAdd} onDelete={onDelete} onToggleMode={onToggleMode}/>
          ))}
        </div>
      )}
    </div>
  )
}

interface SidebarProps {
  domain: Domain
  selectedId: string | null
  isOpen: boolean
  onClose: () => void
  onSelect: (id: string) => void
  onAddRoot: () => void
  onAddChild: (parentId: string) => void
  onDelete: (id: string) => void
  onToggleMode: (id: string) => void
  onImport: () => void
}

export function TreeSidebar({ domain, selectedId, isOpen, onClose, onSelect, onAddRoot, onAddChild, onDelete, onToggleMode, onImport }: SidebarProps) {
  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 md:hidden"
          style={{ background: 'rgba(44,40,32,0.35)' }}
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <div
        className="fixed md:relative inset-y-0 left-0 z-30 md:z-auto flex flex-col overflow-hidden"
        style={{
          width: 280,
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform .25s cubic-bezier(.4,0,.2,1)',
          // On md+, always visible
        }}
      >
        {/* Header */}
        <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>{domain.icon}</span> {domain.name}
            </span>
            <button className="md:hidden" onClick={onClose}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 18, lineHeight: 1 }}>
              ×
            </button>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Btn size="sm" style={{ flex: 1, justifyContent: 'center' }} onClick={onAddRoot}>+ Racine</Btn>
            <Btn size="sm" variant="soft" style={{ flex: 1, justifyContent: 'center', gap: 4 }} onClick={onImport}>
              <ImportIcon/> Importer
            </Btn>
          </div>
        </div>

        {/* Tree */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '8px 6px' }}>
          {domain.tree.length === 0 && (
            <div style={{ padding: '20px 10px', color: 'var(--text3)', fontSize: 12, textAlign: 'center', lineHeight: 1.7 }}>
              Arborescence vide.<br/>Clique "+ Racine" ou importe un fichier XLSX.
            </div>
          )}
          {domain.tree.map(node => (
            <TreeNodeComp key={node.id} node={node} depth={0}
              selectedId={selectedId} domainColor={domain.color}
              onSelect={id => { onSelect(id); onClose() }}
              onAdd={onAddChild} onDelete={onDelete} onToggleMode={onToggleMode}/>
          ))}
        </div>
      </div>
    </>
  )
}
