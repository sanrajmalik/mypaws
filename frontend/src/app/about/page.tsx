
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Shield, Users, PawPrint } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="bg-white">
            {/* Hero Section */}
            <div className="relative isolate overflow-hidden bg-gradient-to-b from-orange-50 to-white pt-14 pb-10 sm:pt-24 sm:pb-20">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                            Connecting <span className="text-orange-500">Hearts</span>, <br />
                            One Paw at a Time.
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-gray-600">
                            We are not a pet shop. We are a community dedicated to finding loving homes for every pet.
                            Whether you're looking to adopt a rescue or connect with a responsible breeder, mypaws is your trusted companion in this journey.
                        </p>
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-24">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="relative h-64 sm:h-96 w-full rounded-2xl overflow-hidden shadow-xl">
                        <Image
                            src="https://images.unsplash.com/photo-1560807707-8cc77767d783?q=80&w=1000&auto=format&fit=crop"
                            alt="Happy dog with owner"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
                            Our Mission
                        </h2>
                        <p className="text-lg text-gray-600 mb-6">
                            At <span className="font-semibold text-orange-500">mypaws</span>, we believe that every pet deserves a loving home and every human deserves the unconditional love of a pet.
                        </p>
                        <p className="text-lg text-gray-600 mb-6">
                            We exist to bridge the gap. We are a platform that connects verified adopters with shelters, rescuers, and responsible breeders.
                            <span className="block mt-4 font-medium text-gray-900 border-l-4 border-orange-500 pl-4">
                                We do not sell pets directly, nor do we promote the commercialization of animals. Our goal is ethical, transparent, and loving connections.
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="bg-orange-50 py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center mb-16">
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why Choose Us?</h2>
                        <p className="mt-4 text-lg text-gray-600">Built on trust, driven by love.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Value 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                                <Heart className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Love First</h3>
                            <p className="text-gray-600">
                                We prioritize the well-being of the animal above all else. Every feature on our platform is designed to ensure safe and happy rehoming.
                            </p>
                        </div>

                        {/* Value 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                                <Shield className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Verified & Safe</h3>
                            <p className="text-gray-600">
                                We strictly vet our listings. We work hard to keep puppy mills and unethical sellers off our platform, creating a safe space for genuine pet lovers.
                            </p>
                        </div>

                        {/* Value 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow">
                            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
                                <Users className="w-6 h-6 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Community</h3>
                            <p className="text-gray-600">
                                We are more than a website; we are a community of rescuers, foster parents, ethical breeders, and families coming together.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="relative isolate overflow-hidden bg-gray-900 py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                            Ready to find your new best friend?
                        </h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-gray-300">
                            Thousands of tails are wagging, waiting for a home like yours. Start your journey today.
                        </p>
                        <div className="mt-10 flex items-center justify-center gap-x-6">
                            <Link
                                href="/adopt-a-pet"
                                className="rounded-full bg-orange-500 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-500 transition-all hover:scale-105"
                            >
                                Browse Pets
                            </Link>
                            <Link href="/contact" className="text-sm font-semibold leading-6 text-white hover:text-orange-300 transition-colors">
                                Contact Us <span aria-hidden="true">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
