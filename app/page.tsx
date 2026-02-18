export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="sticky top-0 border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold tracking-tight">TodoTXT</div>
          <div className="text-xs text-neutral-500">v0.1 scaffold</div>
        </div>
      </header>

      <section className="flex flex-1 flex-col gap-3 px-4 py-4">
        <p className="text-sm leading-6 text-neutral-800">
          App scaffold is live. Next steps: parser, IndexedDB storage, and the
          todo list UI.
        </p>

        <div className="rounded-lg border border-neutral-200 p-3">
          <div className="text-xs font-medium text-neutral-600">
            Deployment check
          </div>
          <div className="mt-1 text-sm text-neutral-900">
            If you can see this page, Vercel is building correctly.
          </div>
        </div>
      </section>
    </main>
  );
}

