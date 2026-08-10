type StatCardProps = {
    title: string;
    value: string;
};

export function StatCard({ title, value }: StatCardProps) {
    return (
        <article className="group overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-teal-700/30 hover:shadow-md">
            <div className="h-1 bg-gradient-to-r from-teal-700 via-emerald-500 to-lime-400" />
            <div className="border-b border-zinc-200 bg-zinc-50 px-5 py-3">
                <h2 className="text-center text-base font-semibold text-zinc-700">{title}</h2>
            </div>
            <div className="bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.10),_transparent_58%)] px-5 py-6 text-center">
                <p className="text-3xl font-semibold tracking-tight text-teal-700 transition group-hover:text-teal-800">
                    {value}
                </p>
            </div>
        </article>
    );
}
