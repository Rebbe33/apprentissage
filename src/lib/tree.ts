import type { TreeNode, GroupNode, StepNode } from '../types'

export const makeId = () => Math.random().toString(36).slice(2, 9)

// ── Traversal ─────────────────────────────────────────────────────

export function allSteps(nodes: TreeNode[]): StepNode[] {
  return nodes.flatMap(n =>
    n.type === 'step' ? [n] : allSteps((n as GroupNode).children)
  )
}

export function countDone(nodes: TreeNode[]): { done: number; total: number } {
  const steps = allSteps(nodes)
  return { done: steps.filter(s => s.done).length, total: steps.length }
}

export function findNode(nodes: TreeNode[], id: string): TreeNode | null {
  for (const n of nodes) {
    if (n.id === id) return n
    if (n.type === 'group') {
      const found = findNode(n.children, id)
      if (found) return found
    }
  }
  return null
}

export function getBreadcrumb(nodes: TreeNode[], id: string, path: string[] = []): string[] | null {
  for (const n of nodes) {
    if (n.id === id) return [...path, n.name]
    if (n.type === 'group') {
      const r = getBreadcrumb(n.children, id, [...path, n.name])
      if (r) return r
    }
  }
  return null
}

// ── Mutation (immutable) ──────────────────────────────────────────

export function updateNode(nodes: TreeNode[], id: string, updater: (n: TreeNode) => TreeNode): TreeNode[] {
  return nodes.map(n => {
    if (n.id === id) return updater(n)
    if (n.type === 'group') return { ...n, children: updateNode(n.children, id, updater) }
    return n
  })
}

export function deleteNode(nodes: TreeNode[], id: string): TreeNode[] {
  return nodes
    .filter(n => n.id !== id)
    .map(n => n.type === 'group' ? { ...n, children: deleteNode(n.children, id) } : n)
}

export function addNodeUnder(nodes: TreeNode[], parentId: string | null, newNode: TreeNode): TreeNode[] {
  if (parentId === null) return [...nodes, newNode]
  return nodes.map(n => {
    if (n.id === parentId && n.type === 'group') return { ...n, children: [...n.children, newNode] }
    if (n.type === 'group') return { ...n, children: addNodeUnder(n.children, parentId, newNode) }
    return n
  })
}

// ── Session helpers ───────────────────────────────────────────────

export interface StepWithPath extends StepNode {
  path: string[]
  locked: boolean
}

export function getStepsForSession(nodes: TreeNode[], parentMode = 'sequential', path: string[] = []): StepWithPath[] {
  let out: StepWithPath[] = []
  let hitLocked = false

  for (const n of nodes) {
    if (n.type === 'step') {
      const locked = parentMode === 'sequential' && hitLocked
      out.push({ ...n, path, locked })
      if (!n.done && parentMode === 'sequential') hitLocked = true
    } else {
      const mode = n.mode ?? parentMode
      out = out.concat(getStepsForSession(n.children, mode, [...path, n.name]))
    }
  }
  return out
}

export function getStepsFlat(nodes: TreeNode[], parentMode = 'sequential', path: string[] = []): StepWithPath[] {
  return getStepsForSession(nodes, parentMode, path)
}
