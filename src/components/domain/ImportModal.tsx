import { useState, useRef } from 'react'
import { Modal, ModalTitle, FormGroup, Btn } from '../ui'
import { parseXlsxToTree, generateXlsxTemplate } from '../../lib/importXlsx'
import type { TreeNode } from '../../types'

interface Props {
  domainName: string
  onClose: () => void
  onImport: (tree: TreeNode[]) => void
}

export function ImportModal({ domainName, onClose, onImport }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<TreeNode[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [mergeMode, setMergeMode] = useState<'replace' | 'merge'>('merge')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (f: File) => {
    setFile(f)
    setError(null)
    setPreview(null)
    setLoading(true)
    try {
      const tree = await parseXlsxToTree(f)
      setPreview(tree)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const countNodes = (nodes: TreeNode[]): { groups: number; steps: number } => {
    let groups = 0, steps = 0
    for (const n of nodes) {
      if (n.type === 'step') steps++
      else { groups++; const c = countNodes(n.children); groups += c.groups; steps += c.steps }
    }
    return { groups, steps }
  }

  const confirm = () => {
    if (!preview) return
    onImport(preview)
    onClose()
  }

  return (
    <Modal onClose={onClose} wide>
      <ModalTitle>Importer une arborescence — {domainName}</ModalTitle>

      {/* Format explanation */}
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10,
        padding: '12px 14px', marginBottom: 18, fontSize: 12, lineHeight: 1.7, color: 'var(--text2)'
      }}>
        <strong style={{ color: 'var(--text)', display: 'block', marginBottom: 4 }}>Format du fichier XLSX attendu :</strong>
        <code style={{ fontSize: 11, color: 'var(--accent)' }}>
          level_1 | level_2 | level_3 | level_4 | level_5 | mode | step_name
        </code>
        <br/>
        Les colonnes <code>level_1</code> à <code>level_5</code> définissent l'arborescence (laisser vide si inutilisé).
        La colonne <code>mode</code> accepte <code>sequential</code> ou <code>random</code>.
        <code>step_name</code> est le nom de l'étape.
        <br/>
        <button
          onClick={generateXlsxTemplate}
          style={{ marginTop: 8, fontSize: 11, color: 'var(--accent)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}
        >
          ↓ Télécharger un fichier exemple
        </button>
      </div>

      {/* Drop zone */}
      <FormGroup label="Fichier XLSX">
        <div
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${file ? 'var(--accent)' : 'var(--border2)'}`,
            borderRadius: 10, padding: '24px 16px', textAlign: 'center', cursor: 'pointer',
            background: file ? 'var(--accent-light)' : 'var(--bg2)',
            transition: 'all .15s',
          }}
        >
          <input ref={inputRef} type="file" accept=".xlsx,.xls" style={{ display: 'none' }}
            onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}/>
          {file
            ? <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 500 }}>📄 {file.name}</span>
            : <span style={{ fontSize: 13, color: 'var(--text3)' }}>Glisse un fichier ici ou clique pour sélectionner</span>
          }
        </div>
      </FormGroup>

      {/* Error */}
      {error && (
        <div style={{ background: 'var(--red-light)', border: '1px solid #f0c0bb', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--red)', marginBottom: 14 }}>
          ⚠ {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 13, color: 'var(--text3)' }}>
          Analyse en cours...
        </div>
      )}

      {/* Preview */}
      {preview && !loading && (() => {
        const { groups, steps } = countNodes(preview)
        return (
          <div style={{ background: 'var(--accent2-light)', border: '1px solid #b8d8c4', borderRadius: 8, padding: '12px 14px', marginBottom: 14, fontSize: 13 }}>
            <strong style={{ color: 'var(--accent2)' }}>✓ Aperçu :</strong>
            <span style={{ color: 'var(--text2)', marginLeft: 8 }}>
              {groups} groupe{groups > 1 ? 's' : ''} · {steps} étape{steps > 1 ? 's' : ''}
            </span>
            <div style={{ marginTop: 8 }}>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="radio" checked={mergeMode === 'merge'} onChange={() => setMergeMode('merge')}/>
                Fusionner avec l'arborescence existante
              </label>
              <label style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, cursor: 'pointer' }}>
                <input type="radio" checked={mergeMode === 'replace'} onChange={() => setMergeMode('replace')}/>
                Remplacer l'arborescence existante
              </label>
            </div>
          </div>
        )
      })()}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" onClick={confirm} disabled={!preview || loading}>
          Importer
        </Btn>
      </div>
    </Modal>
  )
}
