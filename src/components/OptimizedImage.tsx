import { useState, useCallback } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    loading?: 'lazy' | 'eager';
    fallbackSrc?: string;
}

/**
 * Optimized image component with:
 * - Native lazy loading
 * - Blur-up placeholder while loading
 * - Error fallback to placeholder
 * - CLS prevention via width/height
 */
export default function OptimizedImage({
    src,
    alt,
    className = '',
    width,
    height,
    loading = 'lazy',
    fallbackSrc = '/placeholder.svg',
}: OptimizedImageProps) {
    const [hasError, setHasError] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    const handleError = useCallback(() => {
        setHasError(true);
    }, []);

    const handleLoad = useCallback(() => {
        setIsLoaded(true);
    }, []);

    const imgSrc = hasError ? fallbackSrc : src;

    return (
        <div
            className={`relative overflow-hidden bg-gray-100 dark:bg-[#1f1f1f] ${className}`}
            style={width && height ? { aspectRatio: `${width}/${height}` } : undefined}
        >
            {/* Blur placeholder shown until image loads */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-muted/20 animate-pulse" aria-hidden="true" />
            )}

            <img
                src={imgSrc}
                alt={alt}
                width={width}
                height={height}
                loading={loading}
                onLoad={handleLoad}
                onError={handleError}
                className={`w-full h-full object-contain transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
            />
        </div>
    );
}
