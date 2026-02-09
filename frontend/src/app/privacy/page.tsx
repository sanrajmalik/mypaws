
export default function PrivacyPage() {
    return (
        <div className="bg-white py-16 sm:py-24">
            <div className="mx-auto max-w-3xl px-6 lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-8">Privacy Policy</h1>

                <div className="prose prose-orange max-w-none text-gray-600">
                    <p className="text-sm text-gray-500 mb-8">Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

                    <h2>1. Information We Collect</h2>
                    <p>
                        We collect information to provide you with the best experience in finding your new pet. This includes:
                    </p>
                    <ul>
                        <li><strong>Personal Information:</strong> Name, email address, phone number, and location when you register or create a profile.</li>
                        <li><strong>Usage Data:</strong> Information about how you use our website, including pages visited and pets viewed.</li>
                        <li><strong>Communications:</strong> Messages sent between users through our platform.</li>
                    </ul>

                    <h2>2. How We Use Your Information</h2>
                    <p>
                        We use your data to:
                    </p>
                    <ul>
                        <li>Connect adopters with breeders and shelters.</li>
                        <li>Verify user identities to maintain community safety.</li>
                        <li>Send important notifications about your account or listings.</li>
                        <li>Improve our platform and services.</li>
                    </ul>

                    <h2>3. Information Sharing</h2>
                    <p>
                        We do not sell your personal data to third parties. We may share your information with:
                    </p>
                    <ul>
                        <li><strong>Other Users:</strong> Only when you initiate contact regarding a pet listing (e.g., sharing your phone number with a breeder).</li>
                        <li><strong>Service Providers:</strong> Third-party services that help us operate (e.g., payment processing, hosting).</li>
                        <li><strong>Legal Authorities:</strong> If required by law or to protect user safety.</li>
                    </ul>

                    <h2>4. Data Security</h2>
                    <p>
                        We implement strict security measures to protect your data. However, no method of transmission over the internet is 100% secure.
                        We encourage you to use strong passwords and protect your account information.
                    </p>

                    <h2>5. Your Rights</h2>
                    <p>
                        You have the right to access, update, or delete your personal information. You can manage your profile settings directly via your dashboard
                        or contact us for assistance.
                    </p>

                    <h2>6. Cookies</h2>
                    <p>
                        We use cookies to enhance your browsing experience and remember your preferences. You can control cookie settings through your browser.
                    </p>

                    <div className="bg-gray-50 p-6 rounded-xl mt-8">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy Concerns?</h3>
                        <p className="mb-0">
                            If you have questions about our data practices, please reach out to our privacy officer at <a href="mailto:privacy@mypaws.in" className="text-orange-600 hover:text-orange-500">privacy@mypaws.in</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
