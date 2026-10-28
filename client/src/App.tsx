import type { JSX } from "react";

function App(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-4 p-4">
      <h1 className="font-display text-3xl font-bold">Circle</h1>
      <p className="text-ink-muted">Where fans talk.</p>
      <div className="rounded-card bg-surface p-4">
        <p className="font-semibold">Design tokens are working</p>
        <p className="text-sm text-ink-muted">Surface card with  the card radius</p>
      </div>
      <button
      type="button"
      className="min-h-11 rounded-full bg-accent px-5 font-semibold text-on-accent"
      >
        join circle
        </button>     
      </main>
    
  )
}

export default App;