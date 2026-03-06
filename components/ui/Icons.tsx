import React from 'react'

interface IconProps {
  className?: string
}

function SvgWrapper({
  className = 'h-5 w-5',
  children,
}: React.PropsWithChildren<IconProps>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <SvgWrapper className={className}>
      <path d="M12 3 5 6v6c0 4.2 2.9 7.9 7 9 4.1-1.1 7-4.8 7-9V6l-7-3Z" />
    </SvgWrapper>
  )
}

export function GraphIcon({ className }: IconProps) {
  return (
    <SvgWrapper className={className}>
      <path d="M4 18h16" />
      <path d="m6 14 4-4 3 3 5-6" />
      <circle cx="6" cy="14" r="1.3" />
      <circle cx="10" cy="10" r="1.3" />
      <circle cx="13" cy="13" r="1.3" />
      <circle cx="18" cy="7" r="1.3" />
    </SvgWrapper>
  )
}

export function LinkIcon({ className }: IconProps) {
  return (
    <SvgWrapper className={className}>
      <path d="M10.5 13.5 13.5 10.5" />
      <path d="M7.5 16.5a4 4 0 0 1 0-5.7l2-2a4 4 0 0 1 5.7 0" />
      <path d="M16.5 7.5a4 4 0 0 1 0 5.7l-2 2a4 4 0 0 1-5.7 0" />
    </SvgWrapper>
  )
}

export function AlertIcon({ className }: IconProps) {
  return (
    <SvgWrapper className={className}>
      <path d="m12 3 9 16H3L12 3Z" />
      <path d="M12 9v5" />
      <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
    </SvgWrapper>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <SvgWrapper className={className}>
      <path d="m5 12 4 4 10-10" />
    </SvgWrapper>
  )
}

export function UserIcon({ className }: IconProps) {
  return (
    <SvgWrapper className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M4.5 19a7.5 7.5 0 0 1 15 0" />
    </SvgWrapper>
  )
}

export function LogoutIcon({ className }: IconProps) {
  return (
    <SvgWrapper className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="m16 17 5-5-5-5" />
      <path d="M21 12H9" />
    </SvgWrapper>
  )
}
