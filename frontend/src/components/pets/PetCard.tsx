import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin } from 'lucide-react';
import type { AdoptionListingCard } from '@/lib/public-api';

interface PetCardProps {
    listing: AdoptionListingCard;
    onFavorite?: (id: string) => void;
    isFavorite?: boolean;
}

export default function PetCard({ listing, onFavorite, isFavorite = false }: PetCardProps) {
    const { pet, city, slug, adoptionFee, isFeatured } = listing;

    return (
        <article className="pet-card group relative">
            {isFeatured && (
                <span className="pet-card__featured">Featured</span>
            )}

            <Link href={`/adopt-a-pet/${slug}`} className="block">
                <div className="pet-card__image-wrapper">
                    {pet.primaryImage ? (
                        <Image
                            src={pet.primaryImage.thumbUrl}
                            alt={pet.primaryImage.altText || `${pet.name} - ${pet.breed?.name || pet.petType.name}`}
                            fill
                            className="pet-card__image"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                    ) : (
                        <div className="pet-card__placeholder">
                            <span className="text-4xl">🐾</span>
                        </div>
                    )}
                </div>

                <div className="pet-card__content">
                    <h3 className="pet-card__name">{pet.name}</h3>

                    <p className="pet-card__breed">
                        {pet.breed?.name || 'Mixed'} • {pet.ageDisplay}
                    </p>

                    <div className="pet-card__location">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{city.name}</span>
                    </div>

                    {adoptionFee !== null && adoptionFee !== undefined && (
                        <p className="pet-card__fee">
                            {adoptionFee === 0 ? 'Free Adoption' : `₹${adoptionFee.toLocaleString()}`}
                        </p>
                    )}
                </div>
            </Link>

            {onFavorite && (
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onFavorite(listing.id);
                    }}
                    className={`pet-card__favorite ${isFavorite ? 'pet-card__favorite--active' : ''}`}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                </button>
            )}

            <style jsx>{`
        .pet-card {
          background: var(--card-bg, #fff);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .pet-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
        }
        
        .pet-card__featured {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 10;
          padding: 4px 10px;
          background: linear-gradient(135deg, #f59e0b, #f97316);
          color: white;
          font-size: 11px;
          font-weight: 600;
          border-radius: 20px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .pet-card__image-wrapper {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
        }
        
        .pet-card__placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }
        
        .pet-card__content {
          padding: 16px;
        }
        
        .pet-card__name {
          font-size: 18px;
          font-weight: 700;
          color: #111827;
          margin-bottom: 4px;
        }
        
        .pet-card__breed {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 8px;
        }
        
        .pet-card__location {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #9ca3af;
          margin-bottom: 8px;
        }
        
        .pet-card__fee {
          font-size: 15px;
          font-weight: 600;
          color: #059669;
        }
        
        .pet-card__favorite {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border-radius: 50%;
          border: none;
          cursor: pointer;
          color: #9ca3af;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: color 0.2s, transform 0.2s;
        }
        
        .pet-card__favorite:hover {
          color: #ef4444;
          transform: scale(1.1);
        }
        
        .pet-card__favorite--active {
          color: #ef4444;
        }
      `}</style>
        </article>
    );
}
