import Link from 'next/link';
import { PawPrint, Facebook, Instagram, Twitter, Mail } from 'lucide-react';

const footerLinks = {
    adopt: [
        { href: '/adopt-a-dog', label: 'Adopt a Dog' },
        { href: '/adopt-a-cat', label: 'Adopt a Cat' },
        { href: '/adopt-a-pet', label: 'All Pets' },
    ],
    buy: [
        { href: '/buy-dogs', label: 'Buy Dogs' },
        { href: '/buy-cats', label: 'Buy Cats' },
        { href: '/breeders', label: 'Find Breeders' },
    ],
    breeds: [
        { href: '/breeds/dogs/labrador-retriever', label: 'Labrador Retriever' },
        { href: '/breeds/dogs/german-shepherd', label: 'German Shepherd' },
        { href: '/breeds/dogs/golden-retriever', label: 'Golden Retriever' },
        { href: '/breeds/cats/persian', label: 'Persian Cat' },
    ],
    company: [
        { href: '/about', label: 'About Us' },
        { href: '/contact', label: 'Contact' },
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
    ],
};

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    {/* Brand */}
                    <div className="col-span-2 md:col-span-1">
                        <Link href="/" className="flex items-center gap-2 mb-4">
                            <PawPrint className="h-8 w-8 text-orange-500" />
                            <span className="text-2xl font-bold text-white">mypaws</span>
                        </Link>
                        <p className="text-sm text-gray-400 mb-4">
                            India's trusted platform for pet adoption and finding responsible breeders.
                        </p>
                        <div className="flex gap-3">
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <Facebook className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <Instagram className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <Twitter className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                                <Mail className="h-5 w-5" />
                            </a>
                        </div>
                    </div>

                    {/* Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-4">Adopt</h3>
                        <ul className="space-y-2">
                            {footerLinks.adopt.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm hover:text-orange-500 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Buy</h3>
                        <ul className="space-y-2">
                            {footerLinks.buy.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm hover:text-orange-500 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Popular Breeds</h3>
                        <ul className="space-y-2">
                            {footerLinks.breeds.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm hover:text-orange-500 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold mb-4">Company</h3>
                        <ul className="space-y-2">
                            {footerLinks.company.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href} className="text-sm hover:text-orange-500 transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-gray-400">
                        © {new Date().getFullYear()} mypaws. All rights reserved.
                    </p>
                    <p className="text-sm text-gray-500">
                        Made with ❤️ for pets in India
                    </p>
                </div>
            </div>
        </footer>
    );
}
