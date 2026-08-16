export function NotFoundPage() {
    return (
        <main className="grid min-h-svh place-items-center bg-[var(--color-app-bg)] px-6 text-center text-[var(--color-text)]">
            <div className="space-y-4">
                <p className="text-sm font-medium text-[var(--color-text-soft)]">404</p>
                <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">Page not found</h1>
                <a
                    className="inline-flex text-sm font-medium text-[var(--color-text-muted)] underline underline-offset-4"
                    href="/"
                >
                    Go home
                </a>
            </div>
        </main>
    );
}
