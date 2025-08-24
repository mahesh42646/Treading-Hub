import { Inter } from "next/font/google";
import "./globals.css";
import "./styles/user.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AuthProvider } from "./contexts/AuthContext";
import MouseAnimation from "./components/MouseAnimation";
import BootstrapProvider from "./components/BootstrapProvider";

import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Treading Hub - Funded Trading Programs",
  description: "Join thousands of successful traders with our funded trading programs. Get funded up to $200,000 and keep up to 90% of your profits.",
  keywords: "funded trading, trading programs, forex trading, stock trading, trading education",
  authors: [{ name: "Treading Hub" }],
  openGraph: {
    title: "Treading Hub - Funded Trading Programs",
    description: "Join thousands of successful traders with our funded trading programs.",
    url: "https://treadinghub.com",
    siteName: "Treading Hub",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Treading Hub - Funded Trading Programs",
    description: "Join thousands of successful traders with our funded trading programs.",
    images: ["/og-image.jpg"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </head>
      <body className={inter.className}>
        <BootstrapProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <MouseAnimation />

        </BootstrapProvider>
      </body>
    </html>
  );
}
