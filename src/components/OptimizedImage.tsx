import { useState, useCallback } from 'react';

interface OptimizedImageProps {
    src: string;
    alt: string;
    className?: string;
    width?: number;
    height?: number;
    loading?: 'lazy' | 'eager';
    fallbackSrc?: string;
    /** Renders a blurred copy of the image behind the sharp one to fill empty bars */
    blurBackground?: boolean;
}

/**
 * Optimized image component with:
 * - Native lazy loading
 * - Blur-up placeholder while loading
 * - Error fallback to placeholder
 * - CLS prevention via width/height
 * - Optional blurred background fill (no ugly blank bars with object-contain)
 */
export default function OptimizedImage({
    src,
    alt,
    className = '',
    width,
    height,
    loading = 'lazy',
    fallbackSrc = '/placeholder.svg',
    blurBackground = true,
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
    const showBlur = blurBackground && isLoaded && !hasError;

    return (
        <div
            className={`relative overflow-hidden bg-gray-100 dark:bg-[#1f1f1f] ${className}`}
            style={width && height ? { aspectRatio: `${width}/${height}` } : undefined}
        >
            {/* Blur placeholder shown until image loads */}
            {!isLoaded && !hasError && (
                <div className="absolute inset-0 bg-muted/20 animate-pulse" aria-hidden="true" />
            )}

            {/* Blurred background fill — eliminates blank bars with object-contain */}
            {showBlur && (
                <img
                    src={imgSrc}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl opacity-60"
                    loading={loading}
                />
            )}

            {/* Sharp foreground image — object-contain, fully visible */}
            <img
                src={imgSrc}
                alt={alt}
                width={width}
                height={height}
                loading={loading}
                onLoad={handleLoad}
                onError={handleError}
                className={`relative z-10 w-full h-full object-contain transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'
                    }`}
            />
        </div>
    );
}
