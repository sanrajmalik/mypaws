'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from './PetImageGallery.module.css';

interface PetImage {
    originalUrl?: string; // Backwards compatibility
    largeUrl?: string;
    thumbUrl?: string;
    altText?: string;
}

interface PetImageGalleryProps {
    images: PetImage[];
    petName: string;
}

export default function PetImageGallery({ images, petName }: PetImageGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className={styles.placeholder}>
                <span className="text-6xl">🐾</span>
                <p>No photos available</p>
            </div>
        );
    }

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const currentImage = images[currentIndex];
    // Fallback logic for URL
    const mainSrc = currentImage.largeUrl || currentImage.originalUrl || '';

    return (
        <div className={styles.gallery}>
            {/* Main Image Stage */}
            <div className={styles.stage}>
                <div className={styles.imageWrapper}>
                    <Image
                        src={mainSrc}
                        alt={currentImage.altText || `${petName} - Photo ${currentIndex + 1}`}
                        fill
                        className={styles.mainImage}
                        priority={currentIndex === 0}
                    />
                </div>

                {/* Navigation Buttons */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className={`${styles.navBtn} ${styles.prevBtn}`}
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>
                        <button
                            onClick={nextImage}
                            className={`${styles.navBtn} ${styles.nextBtn}`}
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                    </>
                )}

                {/* Image Counter */}
                <div className={styles.counter}>
                    {currentIndex + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
                <div className={styles.thumbnails}>
                    {images.map((img, idx) => {
                        const thumbSrc = img.thumbUrl || img.largeUrl || img.originalUrl || '';
                        return (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`${styles.thumbnail} ${idx === currentIndex ? styles.active : ''}`}
                                aria-label={`View photo ${idx + 1}`}
                            >
                                <Image
                                    src={thumbSrc}
                                    alt={`${petName} thumbnail ${idx + 1}`}
                                    fill
                                    className={styles.thumbImage}
                                />
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
