import { useState } from 'react'
import { Modal, ModalTitle, FormGroup, TextInput, Btn } from '../ui'
import { makeId } from '../../lib/tree'
import type { TreeNode, NodeMode } from '../../types'

export function AddNodeModal({ onClose, onAdd }: { onClose: () => void; onAdd: (n: TreeNode) => void }) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'group' | 'step'>('group')
  const [mode, setMode] = useState<NodeMode>('sequential')

  const submit = () => {
    if (!name.trim()) return
    const node: TreeNode = type === 'group'
      ? { id: makeId(), type: 'group', name: name.trim(), mode, children: [] }
      : { id: makeId(), type: 'step', name: name.trim(), done: false, note: '' }
    onAdd(node); onClose()
  }

  return (
    <Modal onClose={onClose}>
      <ModalTitle>Ajouter un nœud</ModalTitle>
      <FormGroup label="Nom">
        <TextInput value={name} onChange={e => setName(e.target.value)} placeholder="Nom du nœud..."
          autoFocus onKeyDown={e => e.key === 'Enter' && submit()}/>
      </FormGroup>
      <FormGroup label="Type">
        <div style={{ display: 'flex', gap: 8 }}>
          {(['group', 'step'] as const).map(t => (
            <Btn key={t} variant={type === t ? 'primary' : 'ghost'} onClick={() => setType(t)}>
              {t === 'group' ? '📁 Groupe' : '✓ Étape'}
            </Btn>
          ))}
        </div>
      </FormGroup>
      {type === 'group' && (
        <FormGroup label="Mode de progression" hint={mode === 'sequential' ? 'Les étapes doivent être validées dans l\'ordre.' : 'Les étapes peuvent être pratiquées dans n\'importe quel ordre.'}>
          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant={mode === 'sequential' ? 'primary' : 'ghost'} onClick={() => setMode('sequential')}>↓ Séquentiel</Btn>
            <Btn variant={mode === 'random' ? 'primary' : 'ghost'} onClick={() => setMode('random')}>⚡ Aléatoire</Btn>
          </div>
        </FormGroup>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" onClick={submit}>Ajouter</Btn>
      </div>
    </Modal>
  )
}
