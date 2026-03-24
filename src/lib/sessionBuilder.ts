import type { TreeNode, GroupNode } from '../types'

export interface SessionStep {
  id: string
  name: string
  note: string
  done: boolean
  path: string[]
  branchIndex: number
}

interface LeafGroup {
  path: string[]
  mode: 'sequential' | 'random'
  steps: Array<{ id: string; name: string; note: string; done: boolean }>
  branchIndex: number
}

function collectLeafGroups(
  nodes: TreeNode[],
  path: string[] = [],
  branchIndex: number = 0,
): LeafGroup[] {
  const result: LeafGroup[] = []

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    const bi = path.length === 0 ? i : branchIndex

    if (node.type === 'step') continue

    const group = node as GroupNode
    const currentPath = [...path, group.name]
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

    if (subGroups.length > 0) {
      result.push(...collectLeafGroups(subGroups, currentPath, bi))
    }
  }

  return result
}

function pickFromLeafGroup(
  group: LeafGroup,
  alreadyPickedIds: Set<string>
): { id: string; name: string; note: string; path: string[]; branchIndex: number } | null {
  const undone = group.steps.filter(s => !s.done && !alreadyPickedIds.has(s.id))
  if (undone.length === 0) return null

  const chosen = group.mode === 'sequential'
    ? undone[0]  // respect order inside the branch
    : undone[Math.floor(Math.random() * undone.length)]

  return { id: chosen.id, name: chosen.name, note: chosen.note, path: group.path, branchIndex: group.branchIndex }
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function buildGlobalSession(tree: TreeNode[], count: number): SessionStep[] {
  const leafGroups = collectLeafGroups(tree)
  if (leafGroups.length === 0) return []

  const picked: SessionStep[] = []
  const pickedIds = new Set<string>()

  // Shuffle the groups order for each session — branches are visited randomly
  // but within each sequential branch, internal order is preserved
  let availableGroups = shuffle(leafGroups)

  let pass = 0
  while (picked.length < count) {
    // Filter groups that still have undone steps
    const stillAvailable = availableGroups.filter(g =>
      g.steps.some(s => !s.done && !pickedIds.has(s.id))
    )
    if (stillAvailable.length === 0) break

    // Re-shuffle each pass for more variety
    const groupsThisPass = shuffle(stillAvailable)

    let pickedThisPass = 0
    for (const group of groupsThisPass) {
      if (picked.length >= count) break
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
        pickedThisPass++
      }
    }

    // Safety: if nothing was picked this pass, stop
    if (pickedThisPass === 0) break
    pass++
    if (pass > 10) break
  }

  return picked
}
