import { useState } from 'react'
import { ChevronIcon, Btn } from '../ui'
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
  const [hovered, setHovered] = useState(false)
  const isGroup = node.type === 'group'
  const isSelected = selectedId === node.id
  const { done, total } = isGroup ? countDone((node as GroupNode).children) : { done: 0, total: 0 }

  return (
    <div>
      <div
        className="flex items-center gap-0 px-1.5 py-1 rounded cursor-pointer group relative"
        style={{
          background: isSelected ? 'var(--surface3)' : hovered ? 'var(--surface2)' : 'transparent',
          transition: '.1s',
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => { onSelect(node.id); if (isGroup) setExpanded(e => !e) }}
      >
        {/* Toggle arrow */}
        <div className="w-[18px] h-[18px] flex items-center justify-center flex-shrink-0"
          style={{ color: 'var(--text3)', visibility: isGroup ? 'visible' : 'hidden' }}>
          <ChevronIcon expanded={expanded}/>
        </div>

        {/* Label */}
        <div className="flex-1 text-[12px] px-1 truncate"
          style={{ color: isSelected ? domainColor : node.type === 'step' ? 'var(--text3)' : 'var(--text2)' }}>
          {node.type === 'step' && (
            <span className="mr-1.5" style={{ color: node.done ? 'var(--green)' : 'var(--text3)', fontSize: 10 }}>
              {node.done ? '✓' : '○'}
            </span>
          )}
          {node.name}
        </div>

        {/* Progress */}
        {isGroup && (
          <span className="text-[10px] mx-1 flex-shrink-0" style={{ color: 'var(--text3)' }}>
            {done}/{total}
          </span>
        )}

        {/* Actions on hover */}
        {hovered && (
          <div className="flex gap-0.5 flex-shrink-0" onClick={e => e.stopPropagation()}>
            {isGroup && (
              <>
                <button
                  className="w-5 h-5 flex items-center justify-center rounded text-[11px] transition-colors"
                  style={{ color: 'var(--text3)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'var(--text)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'var(--text3)')}
                  title="Ajouter un enfant"
                  onClick={() => onAdd(node.id)}
                >+</button>
                <button
                  className="w-5 h-5 flex items-center justify-center rounded text-[10px] transition-colors"
                  title={`Mode: ${(node as GroupNode).mode}`}
                  style={{ color: (node as GroupNode).mode === 'sequential' ? '#4ecdc4' : '#ff6b35' }}
                  onClick={() => onToggleMode(node.id)}
                >
                  {(node as GroupNode).mode === 'sequential' ? '↓' : '⚡'}
                </button>
              </>
            )}
            <button
              className="w-5 h-5 flex items-center justify-center rounded text-[12px]"
              style={{ color: '#ff4757' }}
              title="Supprimer"
              onClick={() => onDelete(node.id)}
            >×</button>
          </div>
        )}
      </div>

      {/* Children */}
      {isGroup && expanded && (
        <div style={{ paddingLeft: 18 }}>
          {(node as GroupNode).children.map(child => (
            <TreeNodeComp
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              domainColor={domainColor}
              onSelect={onSelect}
              onAdd={onAdd}
              onDelete={onDelete}
              onToggleMode={onToggleMode}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface SidebarProps {
  domain: Domain
  selectedId: string | null
  onSelect: (id: string) => void
  onAddRoot: () => void
  onAddChild: (parentId: string) => void
  onDelete: (id: string) => void
  onToggleMode: (id: string) => void
}

export function TreeSidebar({
  domain, selectedId, onSelect, onAddRoot, onAddChild, onDelete, onToggleMode
}: SidebarProps) {
  return (
    <div
      className="w-[290px] flex-shrink-0 flex flex-col overflow-hidden"
      style={{ background: 'var(--surface)', borderRight: '1px solid var(--border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <span className="text-[11px] font-medium tracking-widest uppercase" style={{ color: 'var(--text3)' }}>
          {domain.icon} {domain.name}
        </span>
        <Btn size="sm" onClick={onAddRoot}>+ Racine</Btn>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto p-2">
        {domain.tree.length === 0 && (
          <div className="px-3 py-5 text-center text-[12px] leading-relaxed" style={{ color: 'var(--text3)' }}>
            Arborescence vide.<br/>
            Clique "+ Racine" pour commencer.
          </div>
        )}
        {domain.tree.map(node => (
          <TreeNodeComp
            key={node.id}
            node={node}
            depth={0}
            selectedId={selectedId}
            domainColor={domain.color}
            onSelect={onSelect}
            onAdd={onAddChild}
            onDelete={onDelete}
            onToggleMode={onToggleMode}
          />
        ))}
      </div>
    </div>
  )
}
