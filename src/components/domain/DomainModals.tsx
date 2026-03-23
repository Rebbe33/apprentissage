import { useState } from 'react'
import { Modal, ModalTitle, FormGroup, TextInput, Btn, ColorPicker, IconPicker, DOMAIN_COLORS, DOMAIN_ICONS } from '../ui'

import type { Domain } from '../../types'

interface AddDomainModalProps {
  onClose: () => void
  onAdd: (d: Omit<Domain, 'id'>) => void
}

export function AddDomainModal({ onClose, onAdd }: AddDomainModalProps) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState(DOMAIN_ICONS[0])
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
        <TextInput
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Ex: Tatouage, Couture..."
          autoFocus
          onKeyDown={e => e.key === 'Enter' && submit()}
        />
      </FormGroup>
      <FormGroup label="Icône">
        <IconPicker value={icon} onChange={setIcon}/>
      </FormGroup>
      <FormGroup label="Couleur">
        <ColorPicker value={color} onChange={setColor}/>
      </FormGroup>
      <div className="flex justify-end gap-2 mt-5">
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn variant="primary" onClick={submit}>Créer</Btn>
      </div>
    </Modal>
  )
}

interface DeleteDomainModalProps {
  domainName: string
  onClose: () => void
  onConfirm: () => void
}

export function DeleteDomainModal({ domainName, onClose, onConfirm }: DeleteDomainModalProps) {
  return (
    <Modal onClose={onClose}>
      <ModalTitle>Supprimer "{domainName}" ?</ModalTitle>
      <p className="text-[13px] leading-relaxed mb-5" style={{ color: 'var(--text2)' }}>
        Toutes les compétences, étapes et notes de ce domaine seront supprimées définitivement.
      </p>
      <div className="flex justify-end gap-2">
        <Btn onClick={onClose}>Annuler</Btn>
        <Btn variant="danger" onClick={() => { onConfirm(); onClose(); }}>Supprimer</Btn>
      </div>
    </Modal>
  )
}
