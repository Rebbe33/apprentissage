import { useState } from 'react'
import { Modal, ModalTitle, FormGroup, TextInput, Btn, ColorPicker, IconPicker, DOMAIN_COLORS, DOMAIN_ICONS } from '../ui'
import type { Domain } from '../../types'

interface AddDomainModalProps {
  onClose: () => void
  onAdd: (d: Omit<Domain, 'id'>) => void
}

export function AddDomainModal({ onClose, onAdd }: AddDomainModalProps) {
  const [name, setName]   = useState('')
  const [icon, setIcon]   = useState(DOMAIN_ICONS[0])
  const [color, setColor] = useState(DOMAIN_COLORS[0])

  const submit = () => {
    if (!name.trim()) return
    onAdd({ name: name.trim(), icon, color, tree: [] })
    onClose()
  }

  return (
    <Modal onClose={onClose}>
      <ModalTitle>Nouveau domaine</ModalTitle>
      <FormGroup label="Nom">
        <TextInput value={name} onChange={e => setName(e.target.value)}
          placeholder="Ex: Tatouage, Couture..." autoFocus
          onKeyDown={e => e.key === 'Enter' && submit()}/>
      </FormGroup>
      <FormGroup label="Icône">
        <IconPicker value={icon} onChange={setIcon}/>
      </FormGroup>
      <FormGroup label="Couleur">
        <ColorPicker value={color} onChange={setColor}/>
      </FormGroup>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" onClick={submit}>Créer</Btn>
      </div>
    </Modal>
  )
}

export function DeleteDomainModal({ domainName, onClose, onConfirm }: {
  domainName: string; onClose: () => void; onConfirm: () => void
}) {
  return (
    <Modal onClose={onClose}>
      <ModalTitle>Supprimer "{domainName}" ?</ModalTitle>
      <p style={{ fontSize: 13, lineHeight: 1.7, color: 'var(--text2)', marginBottom: 20 }}>
        Toutes les compétences, étapes et notes seront supprimées définitivement.
      </p>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn variant="danger" onClick={() => { onConfirm(); onClose() }}>Supprimer</Btn>
      </div>
    </Modal>
  )
}
