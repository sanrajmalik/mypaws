import Link from 'next/link';
import { PawPrint, Heart, Shield, Search, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Find Your Match',
    description: 'Browse thousands of pets looking for loving homes across India.',
  },
  {
    icon: Shield,
    title: 'Verified Breeders',
    description: 'Connect with trusted, verified breeders with transparent reviews.',
  },
  {
    icon: Heart,
    title: 'Adopt with Love',
    description: 'Give a pet a second chance at happiness through adoption.',
  },
];

const popularBreeds = [
  { name: 'Labrador Retriever', slug: 'labrador-retriever', type: 'dog', count: 150 },
  { name: 'German Shepherd', slug: 'german-shepherd', type: 'dog', count: 120 },
  { name: 'Golden Retriever', slug: 'golden-retriever', type: 'dog', count: 95 },
  { name: 'Beagle', slug: 'beagle', type: 'dog', count: 80 },
  { name: 'Persian', slug: 'persian', type: 'cat', count: 60 },
  { name: 'Siamese', slug: 'siamese', type: 'cat', count: 45 },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-20 lg:py-28 overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-64 h-64 bg-orange-200 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-amber-200 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Find Your
              <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">
                {' '}Perfect Pet{' '}
              </span>
              in India
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              India's most trusted platform for pet adoption and finding responsible breeders.
              Give a pet a loving home today.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                href="/adopt-a-dog"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all"
              >
                <PawPrint className="h-6 w-6" />
                Adopt a Pet
              </Link>
              <Link
                href="/buy-dogs"
                className="inline-flex items-center gap-2 bg-white text-gray-800 px-8 py-4 rounded-full font-semibold text-lg border-2 border-gray-200 hover:border-orange-500 hover:text-orange-600 transition-all"
              >
                Find a Breeder
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 sm:gap-16">
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-orange-600">5,000+</div>
                <div className="text-gray-600">Pets Adopted</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-orange-600">500+</div>
                <div className="text-gray-600">Verified Breeders</div>
              </div>
              <div className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-orange-600">50+</div>
                <div className="text-gray-600">Cities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose mypaws?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We connect pet lovers with responsible shelters and verified breeders across India.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 text-center hover:shadow-lg transition-shadow"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl text-white mb-6">
                  <feature.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Breeds Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Popular Breeds</h2>
              <p className="text-gray-600">Explore the most loved breeds in India</p>
            </div>
            <Link
              href="/breeds"
              className="hidden sm:inline-flex items-center gap-1 text-orange-600 font-medium hover:underline"
            >
              View all breeds
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {popularBreeds.map((breed) => (
              <Link
                key={breed.slug}
                href={`/breeds/${breed.type}s/${breed.slug}`}
                className="bg-white rounded-xl p-4 text-center hover:shadow-lg hover:scale-105 transition-all border border-gray-100"
              >
                <div className="w-16 h-16 bg-orange-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <PawPrint className="h-8 w-8 text-orange-500" />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">{breed.name}</h3>
                <p className="text-xs text-gray-500">{breed.count} available</p>
              </Link>
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/breeds"
              className="inline-flex items-center gap-1 text-orange-600 font-medium hover:underline"
            >
              View all breeds
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-amber-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Find Your Perfect Companion?
          </h2>
          <p className="text-orange-100 text-lg mb-8">
            Thousands of pets are waiting for their forever home. Start your journey today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/adopt-a-pet"
              className="inline-flex items-center justify-center gap-2 bg-white text-orange-600 px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Heart className="h-6 w-6" />
              Start Browsing
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-full font-semibold text-lg border-2 border-white/30 hover:bg-orange-700 transition-all"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
