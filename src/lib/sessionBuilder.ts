import type { TreeNode, GroupNode } from '../types'

export interface SessionStep {
  id: string
  name: string
  note: string
  done: boolean
  path: string[]       // breadcrumb ex: ["Bases", "Accords ouverts"]
  branchIndex: number  // which top-level branch it came from
}

// ── Collect "leaf groups" = groupes qui contiennent directement des étapes ──
// On travaille au niveau des groupes feuilles pour respecter sequential/random

interface LeafGroup {
  path: string[]
  mode: 'sequential' | 'random'
  steps: Array<{ id: string; name: string; note: string; done: boolean }>
  branchIndex: number  // index de la branche racine
}

function collectLeafGroups(
  nodes: TreeNode[],
  path: string[] = [],
  branchIndex: number = 0,
  rootIndex: number = 0
): LeafGroup[] {
  const result: LeafGroup[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const bi = path.length === 0 ? i : branchIndex // track root branch index

    if (node.type === 'step') continue

    const group = node as GroupNode
    const currentPath = [...path, group.name]

    // Check if this group has direct step children
    const directSteps = group.children.filter(c => c.type === 'step')
    const subGroups   = group.children.filter(c => c.type === 'group')

    if (directSteps.length > 0) {
      result.push({
        path: currentPath,
        mode: group.mode,
        branchIndex: bi,
        steps: directSteps.map(s => ({
          id: s.id,
          name: s.name,
          note: (s as any).note ?? '',
          done: (s as any).done ?? false,
        })),
      })
    }

    // Recurse into sub-groups
    if (subGroups.length > 0) {
      result.push(...collectLeafGroups(subGroups, currentPath, bi, rootIndex))
    }
  }

  return result
}

// ── Pick next undone step from a leaf group, respecting its mode ──

function pickFromLeafGroup(
  group: LeafGroup,
  alreadyPickedIds: Set<string>
): { id: string; name: string; note: string; path: string[]; branchIndex: number } | null {
  const undone = group.steps.filter(s => !s.done && !alreadyPickedIds.has(s.id))
  if (undone.length === 0) return null

  let chosen
  if (group.mode === 'sequential') {
    // First undone step in order
    chosen = undone[0]
  } else {
    // Random undone step
    chosen = undone[Math.floor(Math.random() * undone.length)]
  }

  return {
    id: chosen.id,
    name: chosen.name,
    note: chosen.note,
    path: group.path,
    branchIndex: group.branchIndex,
  }
}

// ── Main builder ──────────────────────────────────────────────────

export function buildGlobalSession(tree: TreeNode[], count: number): SessionStep[] {
  const leafGroups = collectLeafGroups(tree)

  if (leafGroups.length === 0) return []

  const picked: SessionStep[] = []
  const pickedIds = new Set<string>()

  // Round-robin over leaf groups, skip exhausted ones
  let attempts = 0
  let groupIndex = 0
  const maxAttempts = count * leafGroups.length * 2 // safety

  while (picked.length < count && attempts < maxAttempts) {
    attempts++

    // Cycle through groups in rotation
    const group = leafGroups[groupIndex % leafGroups.length]
    groupIndex++

    const step = pickFromLeafGroup(group, pickedIds)
    if (step) {
      pickedIds.add(step.id)
      picked.push({
        id: step.id,
        name: step.name,
        note: step.note,
        done: false,
        path: step.path,
        branchIndex: step.branchIndex,
      })
    }

    // If we've cycled through all groups without finding enough, stop
    if (groupIndex > 0 && groupIndex % leafGroups.length === 0) {
      const totalAvailable = leafGroups.reduce((acc, g) =>
        acc + g.steps.filter(s => !s.done && !pickedIds.has(s.id)).length, 0
      )
      if (totalAvailable === 0) break
    }
  }

  return picked
}
