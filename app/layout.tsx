import type { Metadata } from "next";
import OfflineBanner from "@/components/OfflineBanner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://carbon-coach.vercel.app"),
  title: {
    default: "Carbon Coach",
    template: "%s | Carbon Coach",
  },
  description:
    "Understand your footprint. Simulate your future. Share your impact. An AI-powered carbon footprint awareness platform.",
  openGraph: {
    title: "Carbon Coach",
    description:
      "Understand your footprint. Simulate your future. Share your impact.",
    type: "website",
    siteName: "Carbon Coach",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Carbon Coach",
    description:
      "Understand your footprint. Simulate your future. Share your impact.",
  },
  icons: {
    icon: "/favicon.svg",
  },
  other: {
    "theme-color": "#0e150e",
  },
};

export default function RootLayout({
  children,
  }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-on-surface antialiased min-h-screen flex flex-col selection:bg-primary selection:text-on-primary font-body-base">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-on-primary"
        >
          Skip to content
        </a>
        <OfflineBanner />
        <div id="main-content" className="flex-grow flex flex-col">{children}</div>
      </body>
    </html>
  );
}
