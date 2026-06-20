import type { MetadataRoute } from "next";

export const dynamic = "force-static";

const basePath = process.env.GITHUB_ACTIONS === "true" ? "/Cheat_Calculator" : "";
const withBasePath = (path: string) => `${basePath}${path}`;

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Калькулятор ТВМ / МС",
    short_name: "Калькулятор",
    description:
      "Научный калькулятор и ответы по теории вероятностей и математической статистике.",
    id: `${basePath}/`,
    start_url: `${basePath}/`,
    scope: `${basePath}/`,
    display: "standalone",
    orientation: "portrait",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: withBasePath("/calculator-icon-192.png"),
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: withBasePath("/calculator-icon-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
