import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Matt Digel",
  description: "i build things on the internet for my W9 & for fun",
  openGraph: {
    title: "Matt Digel",
    description: "i build things on the internet for my W9 & for fun",
    images: ['/opengraph-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Matt Digel",
    description: "i build things on the internet for my W9 & for fun",
    images: ['/opengraph-image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
