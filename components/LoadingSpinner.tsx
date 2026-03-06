export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-2 border-cyan-300/40 border-r-cyan-300" />
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <LoadingSpinner />
    </div>
  )
}
