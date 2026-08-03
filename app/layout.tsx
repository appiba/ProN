import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProN | ERP Dashboard",
  description: "Sistema ERP en espanol para negocios, proyectos y eventos.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
  openGraph: {
    title: "ProN",
    description: "ERP Dashboard para negocios, proyectos y eventos.",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProN",
    description: "ERP Dashboard para negocios, proyectos y eventos.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
