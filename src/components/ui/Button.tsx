import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantStyle: Record<Variant, React.CSSProperties> = {
  primary: {
    background: 'var(--color-accent)',
    color: '#fff',
    border: '1px solid var(--color-accent)',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text)',
    border: 'none',
  },
}

export function Button({ variant = 'primary', style, ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      style={{
        padding: '10px 16px',
        borderRadius: 8,
        cursor: 'pointer',
        fontWeight: 600,
        ...variantStyle[variant],
        ...style,
      }}
    />
  )
}
