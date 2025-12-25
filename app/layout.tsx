// app/layout.tsx
import "./globals.css";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";

export const metadata = {
  title: "FlexiGo",
  description: "Flexible part-time job marketplace",
  icons: {
    icon: "/icons/flexigo_logo.jpg",
    apple: "/icons/flexigo_logo.jpg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/icons/flexigo_logo.jpg" />
        <link rel="apple-touch-icon" href="/icons/flexigo_logo.jpg" />
        <meta name="theme-color" content="#124E66" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-[#F8F9FA] text-[#124E66]">
        <ServiceWorkerRegistration />
        {children}
      </body>
    </html>
  );
}
