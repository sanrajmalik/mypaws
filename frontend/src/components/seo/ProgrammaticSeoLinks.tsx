import Link from 'next/link';
import { ArrowLongRightIcon } from '@heroicons/react/24/outline';

interface SeoLinksProps {
    petType: 'dogs' | 'cats';
    items: { id: string; name: string; slug: string }[];
    type: 'breed' | 'city';
}

export default function ProgrammaticSeoLinks({ petType, items, type }: SeoLinksProps) {
    if (!items || items.length === 0) return null;

    const title = type === 'breed'
        ? `Browse ${petType === 'dogs' ? 'Dog' : 'Cat'} Breeds`
        : `Find ${petType === 'dogs' ? 'Puppies' : 'Kittens'} by City`;

    const baseUrl = petType === 'dogs' ? '/buy-dogs' : '/buy-cats';
    const queryKey = type === 'breed' ? 'breed' : 'city';

    return (
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mt-12">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                {title}
                <ArrowLongRightIcon className="w-5 h-5 ml-2 text-gray-400" />
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {items.map((item) => (
                    <Link
                        key={item.id}
                        href={`${baseUrl}?${queryKey}=${item.slug}`}
                        className="text-sm text-gray-600 hover:text-primary-600 hover:bg-primary-50 px-3 py-2 rounded-md transition-colors truncate"
                    >
                        {type === 'breed' ? item.name : `${petType === 'dogs' ? 'Puppies' : 'Kittens'} in ${item.name}`}
                    </Link>
                ))}
            </div>
        </section>
    );
}
