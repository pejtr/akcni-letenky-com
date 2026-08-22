import React, { useState } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    fallbackSrc?: string;
}

export default function OptimizedImage({
    src,
    fallbackSrc = "/destinations/paris.jpg",
    className,
    alt,
    ...props
}: OptimizedImageProps) {
    const [imageSrc, setImageSrc] = useState(src || fallbackSrc);
    const [hasError, setHasError] = useState(false);

    // Zpracování změny src ze strany rodiče
    React.useEffect(() => {
        setImageSrc(src || fallbackSrc);
        setHasError(false);
    }, [src, fallbackSrc]);

    return (
        <img
            {...props}
            src={imageSrc}
            alt={alt}
            className={cn("transition-opacity duration-300", className, hasError ? "opacity-95" : "opacity-100")}
            onError={() => {
                if (!hasError) {
                    setImageSrc(fallbackSrc);
                    setHasError(true);
                }
            }}
        />
    );
}
