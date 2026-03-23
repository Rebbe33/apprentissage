export type NodeMode = 'sequential' | 'random'

export interface StepNode {
  id: string
  type: 'step'
  name: string
  done: boolean
  note: string
}

export interface GroupNode {
  id: string
  type: 'group'
  name: string
  mode: NodeMode
  children: TreeNode[]
}

export type TreeNode = StepNode | GroupNode

export interface Domain {
  id: string
  name: string
  icon: string
  color: string
  tree: TreeNode[]
  created_at?: string
}

export interface AppState {
  domains: Domain[]
  activeDomainId: string | null
}

// Supabase DB row types
export interface DomainRow {
  id: string
  name: string
  icon: string
  color: string
  tree: TreeNode[]
  user_id?: string
  created_at: string
  updated_at: string
}
