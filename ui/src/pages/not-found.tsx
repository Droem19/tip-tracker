export function NotFoundPage() {
    return (
        <main className="grid min-h-svh place-items-center px-6 text-center">
            <div className="space-y-4">
                <p className="text-sm font-medium text-zinc-500">404</p>
                <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">Page not found</h1>
                <a className="inline-flex text-sm font-medium text-zinc-700 underline underline-offset-4" href="/">
                    Go home
                </a>
            </div>
        </main>
    );
}
