import type { Metadata, Viewport } from "next";
import "./globals.css";

const appName = "Калькулятор ТВМ / МС";
const basePath = process.env.GITHUB_ACTIONS === "true" ? "/Cheat_Calculator" : "";
const withBasePath = (path: string) => `${basePath}${path}`;

export const metadata: Metadata = {
  title: appName,
  applicationName: appName,
  description:
    "Научный калькулятор и ответы на экзаменационные билеты по теории вероятностей и математической статистике.",
  manifest: withBasePath("/manifest.webmanifest"),
  icons: {
    icon: [
      {
        url: withBasePath("/calculator-icon-32.png"),
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: withBasePath("/calculator-icon-192.png"),
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: withBasePath("/calculator-icon-512.png"),
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: withBasePath("/calculator-icon-180.png"),
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    title: appName,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
