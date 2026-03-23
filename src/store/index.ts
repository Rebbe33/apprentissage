import { create } from 'zustand'
import type { Domain, TreeNode } from '../types'
import { updateNode, deleteNode, addNodeUnder, makeId } from '../lib/tree'
import { fetchDomains, createDomain, updateDomain, deleteDomain } from '../lib/supabase'

// Fallback local store (no Supabase needed for dev)
const STORAGE_KEY = 'skillforge_data'



interface Store {
  domains: Domain[]
  activeDomainId: string | null
  loading: boolean
  error: string | null

  loadDomains: () => Promise<void>
  addDomain: (d: Omit<Domain, 'id'>) => Promise<void>
  removeDomain: (id: string) => Promise<void>
  setActiveDomain: (id: string) => void
  toggleStep: (domainId: string, stepId: string) => Promise<void>
  setNote: (domainId: string, stepId: string, note: string) => Promise<void>
  addNode: (domainId: string, parentId: string | null, node: TreeNode) => Promise<void>
  removeNode: (domainId: string, nodeId: string) => Promise<void>
  toggleMode: (domainId: string, nodeId: string) => Promise<void>
  addStep: (domainId: string, parentId: string, name: string) => Promise<void>
}


// SUPPRIMER syncToSupabase entièrement, et remplacer mutate par :

async function mutate(
  get: () => Store,
  set: (s: Partial<Store>) => void,
  domainId: string,
  treeMutator: (tree: TreeNode[]) => TreeNode[]
) {
  const domain = get().domains.find(d => d.id === domainId)
  if (!domain) return
  const newTree = treeMutator(domain.tree)
  // Optimistic update UI
  set({ domains: get().domains.map(d => d.id === domainId ? { ...d, tree: newTree } : d) })
  // Sync Supabase
  await updateDomain(domainId, { tree: newTree })
}

export const useStore = create<Store>((set, get) => ({
  domains: [],
  activeDomainId: null,
  loading: false,
  error: null,

  loadDomains: async () => {
  set({ loading: true, error: null })
  try {
    const rows = await fetchDomains()
    const domains: Domain[] = rows.map(r => ({
      id: r.id, name: r.name, icon: r.icon, color: r.color, tree: r.tree ?? [],
    }))
    set({ domains, activeDomainId: domains[0]?.id ?? null, loading: false })
  } catch (e: any) {
    set({ error: e.message, loading: false })
  }
},

addDomain: async (d) => {
  const full: Domain = { ...d, id: makeId() }
  set(s => ({ domains: [...s.domains, full], activeDomainId: full.id }))
  try {
    await createDomain({ id: full.id, name: full.name, icon: full.icon, color: full.color, tree: full.tree })
  } catch (e: any) {
    set(s => ({ domains: s.domains.filter(x => x.id !== full.id), error: e.message }))
  }
},

removeDomain: async (id) => {
  const prev = get().domains
  const next = prev.filter(d => d.id !== id)
  set({ domains: next, activeDomainId: get().activeDomainId === id ? (next[0]?.id ?? null) : get().activeDomainId })
  try {
    await deleteDomain(id)
  } catch (e: any) {
    set({ domains: prev, error: e.message })
  }
},
  setActiveDomain: (id) => set({ activeDomainId: id }),

  toggleStep: async (domainId, stepId) => {
    mutate(get, set, domainId, tree =>
      updateNode(tree, stepId, n => n.type === 'step' ? { ...n, done: !n.done } : n)
    )
  },

  setNote: async (domainId, stepId, note) => {
    mutate(get, set, domainId, tree =>
      updateNode(tree, stepId, n => n.type === 'step' ? { ...n, note } : n)
    )
  },

  addNode: async (domainId, parentId, node) => {
    mutate(get, set, domainId, tree => addNodeUnder(tree, parentId, node))
  },

  removeNode: async (domainId, nodeId) => {
    mutate(get, set, domainId, tree => deleteNode(tree, nodeId))
  },

  toggleMode: async (domainId, nodeId) => {
    mutate(get, set, domainId, tree =>
      updateNode(tree, nodeId, n =>
        n.type === 'group' ? { ...n, mode: n.mode === 'sequential' ? 'random' : 'sequential' } : n
      )
    )
  },

  addStep: async (domainId, parentId, name) => {
    const step: TreeNode = { id: makeId(), type: 'step', name, done: false, note: '' }
    mutate(get, set, domainId, tree => addNodeUnder(tree, parentId, step))
  },
}))
