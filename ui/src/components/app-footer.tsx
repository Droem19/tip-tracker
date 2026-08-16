const currentYear = new Date().getFullYear();

export function AppFooter() {
    return (
        <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
            <div className="mx-auto flex min-h-14 w-full max-w-6xl items-center px-4 text-sm font-medium text-[var(--color-text-soft)] sm:px-6">
                <p>&copy; {currentYear} Tip Tracker</p>
            </div>
        </footer>
    );
}
