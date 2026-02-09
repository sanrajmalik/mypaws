
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="bg-white py-16 sm:py-24">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">Terms of Service</h1>

                <div className="prose prose-orange max-w-none text-gray-600">
                    <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                    <h2>1. Introduction</h2>
                    <p>
                        Welcome to mypaws. By accessing or using our website and services, you agree to be bound by these Terms of Service.
                        Please read them carefully.
                    </p>

                    <h2>2. Our Role</h2>
                    <p>
                        mypaws serves as a platform to connect prospective pet adopters and buyers with shelters, rescues, and verified breeders.
                        <strong>We do not sell pets directly.</strong> We act as an intermediary to facilitate connections. Any transaction, adoption agreement,
                        or sale is strictly between the user and the lister (breeder/shelter).
                    </p>

                    <h2>3. User Responsibilities</h2>
                    <p>
                        You verify that you are at least 18 years of age. You agree to provide accurate and truthful information when creating an account or listing.
                        We prohibit the use of our platform for:
                    </p>
                    <ul>
                        <li>Selling illegal or banned breeds.</li>
                        <li>Promoting puppy mills or unethical breeding practices.</li>
                        <li>Harassing other users.</li>
                        <li>Fraudulent activities.</li>
                    </ul>

                    <h2>4. Listings and Verification</h2>
                    <p>
                        While we strive to verify our breeders and listings, mypaws cannot guarantee the health, temperament, or pedigree of any pet listed.
                        We strongly encourage all users to:
                    </p>
                    <ul>
                        <li>Visit the pet in person before making any commitment.</li>
                        <li>Ask for health records and vaccination history.</li>
                        <li>Never send money without verifying the legitimacy of the lister.</li>
                    </ul>

                    <h2>5. Limitation of Liability</h2>
                    <p>
                        mypaws is not liable for any damages, disputes, or losses arising from interactions or transactions between users. We are not responsible
                        of the conduct of any user, breeder, or shelter on our platform.
                    </p>

                    <h2>6. Privacy</h2>
                    <p>
                        Your use of our platform is also governed by our <Link href="/privacy" className="text-orange-600 hover:text-orange-500">Privacy Policy</Link>.
                    </p>

                    <h2>7. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. Continued use of the platform constitutes acceptance of the updated terms.
                    </p>

                    <div className="bg-gray-50 p-6 rounded-xl mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Us</h3>
                        <p className="mb-0">
                            If you have any questions about these Terms, please contact us at <a href="mailto:support@mypaws.in" className="text-orange-600 hover:text-orange-500">support@mypaws.in</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
