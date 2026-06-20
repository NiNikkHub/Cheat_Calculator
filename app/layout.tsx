import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Калькулятор ТВО / МС",
  description: "Научный калькулятор и ответы на экзаменационные билеты по теории вероятностей и математической статистике.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
