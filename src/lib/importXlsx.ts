import * as XLSX from 'xlsx'
import { makeId } from './tree'
import type { TreeNode, GroupNode, NodeMode } from '../types'

export interface XlsxRow {
  level_1?: string
  level_2?: string
  level_3?: string
  level_4?: string
  level_5?: string
  mode?: string
  step_name?: string
}

export function parseXlsxToTree(file: File): Promise<TreeNode[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheet = workbook.Sheets[workbook.SheetNames[0]]
        const rows: XlsxRow[] = XLSX.utils.sheet_to_json(sheet, { defval: '' })
        const tree = buildTree(rows)
        resolve(tree)
      } catch (err) {
        reject(new Error('Fichier XLSX invalide ou mal formaté'))
      }
    }
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'))
    reader.readAsArrayBuffer(file)
  })
}

function buildTree(rows: XlsxRow[]): TreeNode[] {
  // Root array
  const root: TreeNode[] = []

  // Map path string → GroupNode reference for deduplication
  const groupMap = new Map<string, GroupNode>()

  for (const row of rows) {
    const stepName = row.step_name?.toString().trim()
    if (!stepName) continue

    const levels = [
      row.level_1?.toString().trim(),
      row.level_2?.toString().trim(),
      row.level_3?.toString().trim(),
      row.level_4?.toString().trim(),
      row.level_5?.toString().trim(),
    ].filter(Boolean) as string[]

    const mode: NodeMode = row.mode?.toString().toLowerCase() === 'random' ? 'random' : 'sequential'

    const step: TreeNode = {
      id: makeId(),
      type: 'step',
      name: stepName,
      done: false,
      note: '',
    }

    if (levels.length === 0) {
      // No group — add directly to root
      root.push(step)
      continue
    }

    // Walk / create groups along the path
    let currentChildren: TreeNode[] = root
    let pathSoFar = ''

    for (let i = 0; i < levels.length; i++) {
      pathSoFar = pathSoFar ? `${pathSoFar}::${levels[i]}` : levels[i]
      const isLeafGroup = i === levels.length - 1

      if (!groupMap.has(pathSoFar)) {
        const newGroup: GroupNode = {
          id: makeId(),
          type: 'group',
          name: levels[i],
          mode: isLeafGroup ? mode : 'sequential',
          children: [],
        }
        groupMap.set(pathSoFar, newGroup)
        currentChildren.push(newGroup)
      }

      const group = groupMap.get(pathSoFar)!
      // Update mode if leaf group (last row with this path wins)
      if (isLeafGroup) group.mode = mode
      currentChildren = group.children
    }

    currentChildren.push(step)
  }

  return root
}

export function generateXlsxTemplate(): void {
  const rows = [
    { level_1: 'Bases', level_2: 'Accords ouverts', level_3: '', level_4: '', level_5: '', mode: 'sequential', step_name: 'Accord Do (C)' },
    { level_1: 'Bases', level_2: 'Accords ouverts', level_3: '', level_4: '', level_5: '', mode: 'sequential', step_name: 'Accord Ré (D)' },
    { level_1: 'Bases', level_2: 'Accords ouverts', level_3: '', level_4: '', level_5: '', mode: 'sequential', step_name: 'Accord Mi (Em)' },
    { level_1: 'Bases', level_2: 'Rythme',          level_3: '', level_4: '', level_5: '', mode: 'sequential', step_name: 'Downstroke régulier' },
    { level_1: 'Bases', level_2: 'Rythme',          level_3: '', level_4: '', level_5: '', mode: 'sequential', step_name: 'Downstroke + upstroke' },
    { level_1: 'Techniques', level_2: '',            level_3: '', level_4: '', level_5: '', mode: 'random',     step_name: 'Hammer-on' },
    { level_1: 'Techniques', level_2: '',            level_3: '', level_4: '', level_5: '', mode: 'random',     step_name: 'Pull-off' },
    { level_1: 'Techniques', level_2: '',            level_3: '', level_4: '', level_5: '', mode: 'random',     step_name: 'Vibrato' },
  ]
  const ws = XLSX.utils.json_to_sheet(rows)
  // Column widths
  ws['!cols'] = [14,18,12,12,12,12,30].map(w => ({ wch: w }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Arborescence')
  XLSX.writeFile(wb, 'skillforge-template.xlsx')
}
