import { Inter } from "next/font/google";
import "./globals.css";
import "./styles/user.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { AuthProvider } from "./contexts/AuthContext";
import MouseAnimation from "./components/MouseAnimation";

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
        <script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js"
          integrity="sha384-C6RzsynM9kWDrMNeT87bh95OGNyZPhcTNXj1NW7RuBCsyN/o0jlpcV8Qyq46cDfL"
          crossOrigin="anonymous"
        ></script>
        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
        ></script>
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <MouseAnimation />
      </body>
    </html>
  );
}
