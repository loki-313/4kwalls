import Link from 'next/link';

export default function AuthCodeErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                <div className="space-y-2">
                    <h1 className="text-4xl font-bold text-red-500">
                        Authentication Error
                    </h1>
                    <p className="text-white/60">
                        Something went wrong while signing you in.
                        The authentication code may have expired or is invalid.
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        href="/"
                        className="inline-block px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors duration-200 font-medium"
                    >
                        Go to Home
                    </Link>
                    <p className="text-white/40 text-sm">
                        Please try signing in again
                    </p>
                </div>
            </div>
        </div>
    );
}
