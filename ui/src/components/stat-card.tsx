type StatCardProps = {
    title: string;
    value: string;
};

export function StatCard({ title, value }: StatCardProps) {
    return (
        <article className="group overflow-hidden rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm transition hover:-translate-y-0.5 hover:border-teal-700/30 hover:shadow-md">
            <div className="h-1 bg-gradient-to-r from-teal-700 via-emerald-500 to-lime-400" />
            <div className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] px-5 py-3">
                <h2 className="text-center text-base font-semibold text-[var(--color-text-muted)]">{title}</h2>
            </div>
            <div className="bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.10),_transparent_58%)] px-5 py-6 text-center">
                <p className="text-3xl font-semibold tracking-tight text-[var(--color-accent)] transition group-hover:text-[var(--color-accent-strong)]">
                    {value}
                </p>
            </div>
        </article>
    );
}
