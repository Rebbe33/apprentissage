import { createClient } from '@supabase/supabase-js'
import type { DomainRow } from '../types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── Domain CRUD ───────────────────────────────────────────────────

export async function fetchDomains(): Promise<DomainRow[]> {
  const { data, error } = await supabase
    .from('domains')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function createDomain(domain: Omit<DomainRow, 'created_at' | 'updated_at'>): Promise<DomainRow> {
  const { data, error } = await supabase
    .from('domains')
    .insert({ ...domain, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateDomain(id: string, patch: Partial<DomainRow>): Promise<void> {
  const { error } = await supabase
    .from('domains')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

export async function deleteDomain(id: string): Promise<void> {
  const { error } = await supabase.from('domains').delete().eq('id', id)
  if (error) throw error
}
