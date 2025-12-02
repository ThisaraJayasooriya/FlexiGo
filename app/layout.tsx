// app/layout.tsx
import "./globals.css";
export const metadata = {
  title: "FlexiGo",
  description: "Flexible part-time job marketplace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#124E66" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
      </head>
      <body className="bg-[#F8F9FA] text-[#124E66]">{children}</body>
    </html>
  );
}
