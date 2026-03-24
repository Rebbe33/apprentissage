import React from 'react'

// ── Icons ─────────────────────────────────────────────────────────

export function CheckIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
      style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: '.15s', flexShrink: 0 }}>
      <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function CloseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function ImportIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 1v8M4 6l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M2 11h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// ── Button ────────────────────────────────────────────────────────

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger' | 'soft'
  size?: 'sm' | 'md'
}

export function Btn({ variant = 'ghost', size = 'md', className = '', style, ...props }: BtnProps) {
  const base: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    borderRadius: 8, fontFamily: 'DM Sans, sans-serif',
    fontWeight: 500, cursor: 'pointer', transition: 'all .15s',
    border: '1px solid transparent',
    ...(size === 'sm' ? { padding: '5px 10px', fontSize: 12 } : { padding: '8px 16px', fontSize: 13 }),
  }
  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent)', color: '#fff', border: '1px solid var(--accent)' },
    ghost:   { background: 'transparent', border: '1px solid var(--border2)', color: 'var(--text2)' },
    danger:  { background: 'transparent', border: '1px solid var(--border2)', color: 'var(--red)' },
    soft:    { background: 'var(--accent-light)', border: '1px solid var(--border)', color: 'var(--accent)' },
  }
  return (
    <button style={{ ...base, ...variants[variant], ...style }} className={className} {...props}/>
  )
}

// ── Modal ─────────────────────────────────────────────────────────

export function Modal({ onClose, children, wide = false }: { onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(44,40,32,0.45)', backdropFilter: 'blur(3px)' }}
      onClick={onClose}
    >
      <div
        className="w-full sm:w-auto rounded-t-2xl sm:rounded-2xl overflow-y-auto"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          padding: '28px 24px',
          maxHeight: '85dvh',
          width: wide ? 560 : 420,
          maxWidth: '100%',
          boxShadow: '0 8px 32px rgba(44,40,32,0.15)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{ fontFamily: 'Lora, serif', fontSize: 20, fontWeight: 600, marginBottom: 20, color: 'var(--text)' }}>
      {children}
    </h2>
  )
}

export function FormGroup({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--text3)', marginBottom: 6 }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: 'var(--text3)', marginTop: 5, lineHeight: 1.5 }}>{hint}</p>}
    </div>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width: '100%', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none',
        background: 'var(--bg2)', border: '1px solid var(--border)', color: 'var(--text)',
        fontFamily: 'DM Sans, sans-serif', transition: 'border-color .15s',
      }}
    />
  )
}

// ── Mode Badge ────────────────────────────────────────────────────

export function ModeBadge({ mode }: { mode: 'sequential' | 'random' }) {
  return (
    <span style={{
      fontSize: 10, padding: '3px 8px', borderRadius: 20, fontWeight: 600, letterSpacing: '.04em',
      ...(mode === 'sequential'
        ? { background: 'var(--sequential-light)', color: 'var(--sequential)', border: '1px solid #c5cfe0' }
        : { background: 'var(--random-light)',     color: 'var(--random)',     border: '1px solid #e0c5bb' })
    }}>
      {mode === 'sequential' ? '↓ Séquentiel' : '⚡ Aléatoire'}
    </span>
  )
}

// ── Progress Bar ──────────────────────────────────────────────────

export function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ height: 4, borderRadius: 4, background: 'var(--surface3)', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width .4s' }}/>
    </div>
  )
}

// ── Color & Icon pickers ──────────────────────────────────────────

export const DOMAIN_COLORS = ['#8b6f47','#5c8a6e','#6b7fa3','#a0705a','#7a6b8a','#4a8a7a','#8a7a4a','#6a8a5a']
export const DOMAIN_ICONS  = ['🎸','✏️','🪡','🎨','🪄','🎭','📷','🎹','🏋️','🧘','🌱','📚','💻','🎤','🪵','🧶','🎯','🪴']

export function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {DOMAIN_COLORS.map(c => (
        <button key={c} onClick={() => onChange(c)} style={{
          width: 26, height: 26, borderRadius: '50%', background: c, cursor: 'pointer',
          border: `2px solid ${value === c ? 'var(--text)' : 'transparent'}`,
          transform: value === c ? 'scale(1.15)' : 'scale(1)', transition: 'all .15s',
        }}/>
      ))}
    </div>
  )
}

export function IconPicker({ value, onChange }: { value: string; onChange: (i: string) => void }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {DOMAIN_ICONS.map(ic => (
        <button key={ic} onClick={() => onChange(ic)} style={{
          fontSize: 20, padding: '5px 7px', borderRadius: 8, cursor: 'pointer',
          background: value === ic ? 'var(--surface3)' : 'transparent',
          border: `1px solid ${value === ic ? 'var(--border2)' : 'transparent'}`,
          transition: 'all .1s',
        }}>{ic}</button>
      ))}
    </div>
  )
}
