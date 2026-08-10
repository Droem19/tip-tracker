import { type ReactNode, useEffect, useId, useRef } from 'react';

type AppModalProps = {
    title: string;
    description?: string;
    children: ReactNode;
    onClose: () => void;
};

export function AppModal({ title, description, children, onClose }: AppModalProps) {
    const titleId = useId();
    const descriptionId = useId();
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;

        document.body.style.overflow = 'hidden';
        closeButtonRef.current?.focus();

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = previousOverflow;
            document.removeEventListener('keydown', handleKeyDown);
            previousActiveElement?.focus();
        };
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/45 p-4 backdrop-blur-sm"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                className="flex max-h-[calc(100svh-2rem)] w-full max-w-lg flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-2xl"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                aria-describedby={description ? descriptionId : undefined}
            >
                <div className="flex items-start justify-between gap-4 border-b border-zinc-200 px-6 py-5">
                    <div>
                        <h2 className="text-xl font-semibold text-zinc-950" id={titleId}>
                            {title}
                        </h2>
                        {description ? (
                            <p className="mt-1 text-sm leading-6 text-zinc-600" id={descriptionId}>
                                {description}
                            </p>
                        ) : null}
                    </div>
                    <button
                        className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-sm font-semibold text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-950 focus:outline-none focus:ring-4 focus:ring-teal-700/10"
                        type="button"
                        aria-label="Close modal"
                        ref={closeButtonRef}
                        onClick={onClose}
                    >
                        X
                    </button>
                </div>

                <div className="overflow-y-auto px-6 py-5">{children}</div>
            </section>
        </div>
    );
}
