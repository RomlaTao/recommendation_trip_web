type LoadingShellProps = {
  title?: string
}

export function LoadingShell({ title = 'Loading...' }: LoadingShellProps) {
  return (
    <section className="panel" aria-busy="true" aria-live="polite">
      <h2>{title}</h2>
      <p>Please wait while we prepare the page.</p>
    </section>
  )
}
