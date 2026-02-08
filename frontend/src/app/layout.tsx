import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/components/auth/AuthProvider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "mypaws - Find Your Perfect Pet | Adopt Dogs & Cats in India",
    template: "%s | mypaws",
  },
  description:
    "India's trusted platform for pet adoption and finding responsible breeders. Adopt dogs, cats, and find verified breeders near you.",
  keywords: [
    "pet adoption India",
    "adopt dog India",
    "adopt cat India",
    "dog breeders India",
    "buy dogs online",
    "pet marketplace",
  ],
  authors: [{ name: "mypaws" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://mypaws.in",
    siteName: "mypaws",
    title: "mypaws - Find Your Perfect Pet",
    description: "India's trusted platform for pet adoption and finding responsible breeders.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "mypaws - Pet Adoption Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "mypaws - Find Your Perfect Pet",
    description: "India's trusted platform for pet adoption and finding responsible breeders.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50 text-gray-900">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
