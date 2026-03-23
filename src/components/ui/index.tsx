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
      style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: '.15s' }}>
      <path d="M3 2l4 3-4 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Button ────────────────────────────────────────────────────────

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
}

export function Btn({ variant = 'ghost', size = 'md', className = '', ...props }: BtnProps) {
  const base = 'inline-flex items-center gap-1.5 rounded font-mono transition-all cursor-pointer border'
  const variants: Record<string, string> = {
    primary: 'bg-[#ff6b35] border-[#ff6b35] text-white hover:bg-[#ff7d4d]',
    ghost: 'bg-transparent border-[var(--border)] text-[var(--text2)] hover:border-[var(--border2)] hover:text-[var(--text)]',
    danger: 'bg-transparent border-[var(--border)] text-[#ff4757] hover:bg-[rgba(255,71,87,0.1)]',
  }
  const sizes: Record<string, string> = {
    sm: 'px-2.5 py-1 text-[11px]',
    md: 'px-3.5 py-1.5 text-[12px]',
  }
  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}/>
  )
}

// ── Modal ─────────────────────────────────────────────────────────

export function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="rounded-xl p-7 w-[440px] max-w-[95vw] max-h-[85vh] overflow-y-auto"
        style={{ background: 'var(--surface)', border: '1px solid var(--border2)' }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  )
}

export function ModalTitle({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>{children}</h2>
}

export function FormGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[11px] tracking-widest uppercase mb-1.5" style={{ color: 'var(--text3)' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full rounded px-3 py-2 text-[13px] outline-none transition-colors"
      style={{
        background: 'var(--surface2)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
        fontFamily: 'JetBrains Mono, monospace',
      }}
    />
  )
}

// ── Mode Badge ────────────────────────────────────────────────────

export function ModeBadge({ mode }: { mode: 'sequential' | 'random' }) {
  return (
    <span
      className="text-[10px] px-2 py-0.5 rounded-full font-medium tracking-wide"
      style={mode === 'sequential'
        ? { background: 'rgba(78,205,196,.15)', color: '#4ecdc4', border: '1px solid rgba(78,205,196,.3)' }
        : { background: 'rgba(255,107,53,.15)', color: '#ff6b35', border: '1px solid rgba(255,107,53,.3)' }
      }
    >
      {mode === 'sequential' ? '↓ Séquentiel' : '⚡ Aléatoire'}
    </span>
  )
}

// ── Progress Bar ──────────────────────────────────────────────────

export function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface3)' }}>
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  )
}

// ── Color Swatches ────────────────────────────────────────────────

export const DOMAIN_COLORS = ['#ff6b35','#4ecdc4','#ffe66d','#a8dadc','#c77dff','#f72585','#3ddc97','#4cc9f0']
export const DOMAIN_ICONS = ['🎸','✏️','🪡','🎨','🪄','🎭','📷','🎹','🏋️','🧘','🌱','📚','💻','🎤','🪵','🧶']

export function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {DOMAIN_COLORS.map(c => (
        <button
          key={c}
          onClick={() => onChange(c)}
          className="w-6 h-6 rounded-full transition-all"
          style={{
            background: c,
            border: `2px solid ${value === c ? 'var(--text)' : 'transparent'}`,
            transform: value === c ? 'scale(1.15)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  )
}

export function IconPicker({ value, onChange }: { value: string; onChange: (i: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {DOMAIN_ICONS.map(ic => (
        <button
          key={ic}
          onClick={() => onChange(ic)}
          className="text-xl px-2 py-1 rounded transition-all"
          style={{
            background: value === ic ? 'var(--surface3)' : 'transparent',
            border: `1px solid ${value === ic ? 'var(--border2)' : 'transparent'}`,
          }}
        >
          {ic}
        </button>
      ))}
    </div>
  )
}
