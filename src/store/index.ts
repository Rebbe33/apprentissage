import { create } from 'zustand'
import type { Domain, TreeNode } from '../types'
import { updateNode, deleteNode, addNodeUnder, makeId } from '../lib/tree'

// Fallback local store (no Supabase needed for dev)
const STORAGE_KEY = 'skillforge_data'

function loadLocal(): Domain[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : getDefaultDomains()
  } catch { return getDefaultDomains() }
}

function saveLocal(domains: Domain[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(domains)) } catch {}
}

function getDefaultDomains(): Domain[] {
  return [
    {
      id: 'd1', name: 'Guitare', color: '#ff6b35', icon: '🎸',
      tree: [
        { id:'n1', type:'group', name:'Bases', mode:'sequential', children:[
          { id:'n1a', type:'group', name:'Accords ouverts', mode:'sequential', children:[
            { id:'s1', type:'step', name:'Accord Do (C)', done:true, note:'Bien tenir le pouce derrière le manche' },
            { id:'s2', type:'step', name:'Accord Ré (D)', done:true, note:'' },
            { id:'s3', type:'step', name:'Accord Mi (Em)', done:false, note:'' },
            { id:'s4', type:'step', name:'Accord Sol (G)', done:false, note:'' },
          ]},
          { id:'n1b', type:'group', name:'Rythme', mode:'sequential', children:[
            { id:'s5', type:'step', name:'Downstroke régulier', done:false, note:'' },
            { id:'s6', type:'step', name:'Downstroke + upstroke alterné', done:false, note:'' },
          ]},
        ]},
        { id:'n2', type:'group', name:'Techniques', mode:'random', children:[
          { id:'s7', type:'step', name:'Hammer-on', done:false, note:'' },
          { id:'s8', type:'step', name:'Pull-off', done:false, note:'' },
          { id:'s9', type:'step', name:'Vibrato', done:false, note:'' },
        ]},
      ]
    },
    {
      id: 'd2', name: 'Dessin', color: '#4ecdc4', icon: '✏️',
      tree: [
        { id:'m1', type:'group', name:'Fondamentaux', mode:'sequential', children:[
          { id:'t1', type:'step', name:'Dessiner sans lever le crayon', done:true, note:'' },
          { id:'t2', type:'step', name:'Angles & proportions à l\'œil', done:false, note:'' },
          { id:'t3', type:'step', name:'Espaces négatifs', done:false, note:'' },
        ]},
        { id:'m2', type:'group', name:'Valeurs & Lumière', mode:'sequential', children:[
          { id:'t4', type:'step', name:'Échelle de gris (5 tons)', done:false, note:'' },
          { id:'t5', type:'step', name:'Hachures parallèles', done:false, note:'' },
        ]},
      ]
    }
  ]
}

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

async function syncToSupabase(_domains: Domain[]) {
  const url = import.meta.env.VITE_SUPABASE_URL
  // const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url || url.includes('placeholder')) return // skip if not configured
  // Full sync would happen here via supabase-js
  // For now, local storage is the source of truth until Supabase is configured
}

function mutate(
  get: () => Store,
  set: (s: Partial<Store>) => void,
  domainId: string,
  treeMutator: (tree: TreeNode[]) => TreeNode[]
) {
  const domain = get().domains.find(d => d.id === domainId)
  if (!domain) return
  const newTree = treeMutator(domain.tree)
  const newDomains = get().domains.map(d => d.id === domainId ? { ...d, tree: newTree } : d)
  set({ domains: newDomains })
  saveLocal(newDomains)
  syncToSupabase(newDomains)
}

export const useStore = create<Store>((set, get) => ({
  domains: [],
  activeDomainId: null,
  loading: false,
  error: null,

  loadDomains: async () => {
    set({ loading: true })
    const domains = loadLocal()
    set({ domains, activeDomainId: domains[0]?.id ?? null, loading: false })
  },

  addDomain: async (d) => {
    const full: Domain = { ...d, id: makeId() }
    const next = [...get().domains, full]
    set({ domains: next, activeDomainId: full.id })
    saveLocal(next)
    syncToSupabase(next)
  },

  removeDomain: async (id) => {
    const next = get().domains.filter(d => d.id !== id)
    const newActive = get().activeDomainId === id ? (next[0]?.id ?? null) : get().activeDomainId
    set({ domains: next, activeDomainId: newActive })
    saveLocal(next)
    syncToSupabase(next)
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
