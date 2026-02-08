'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex min-h-screen flex-col items-center justify-center p-4">
                    <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                    <p className="text-gray-600 mb-6">{error.message}</p>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
