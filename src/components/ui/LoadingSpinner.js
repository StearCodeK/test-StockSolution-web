'use client';

export default function LoadingSpinner({
    fullPage = false,
    message = "Cargando...",
    variant = "modern" // "modern", "pulse", "dots", "bars"
}) {
    const containerClasses = `flex flex-col items-center justify-center ${fullPage ? 'fixed inset-0 bg-white/80 backdrop-blur-sm z-50' : 'p-8'
        }`;

    const renderSpinner = () => {
        switch (variant) {
            case 'pulse':
                return (
                    <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                );

            case 'dots':
                return (
                    <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                    </div>
                );

            case 'bars':
                return (
                    <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                            <div
                                key={i}
                                className="w-1 bg-blue-500 animate-pulse"
                                style={{
                                    height: `${Math.random() * 20 + 10}px`,
                                    animationDelay: `${i * 0.1}s`,
                                    animationDuration: '1s'
                                }}
                            ></div>
                        ))}
                    </div>
                );

            default: // modern
                return (
                    <div className="relative">
                        {/* Spinner principal */}
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200">
                            <div className="absolute top-0 left-0 h-16 w-16 border-4 border-transparent border-t-blue-500 rounded-full animate-spin"></div>
                        </div>

                        {/* Círculo interno pulsante */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                        </div>

                        {/* Anillo exterior decorativo */}
                        <div className="absolute -inset-4 border border-blue-100 rounded-full animate-ping opacity-20"></div>
                    </div>
                );
        }
    };

    return (
        <div className={containerClasses}>
            <div className="flex flex-col items-center space-y-4">
                {renderSpinner()}

                {message && (
                    <div className="text-center">
                        <p className="text-gray-600 font-medium animate-pulse">
                            {message}
                        </p>
                        <div className="mt-2 w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                )}
            </div>

            {/* Overlay suave para fullPage */}
            {fullPage && (
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30 -z-10"></div>
            )}
        </div>
    );
}