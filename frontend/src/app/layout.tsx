import type { Metadata } from "next";
import { Figtree, Fredoka } from "next/font/google";
import { ICON_NAMES } from "@/components/ui/Icon";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

// Google Fonts serves only the listed icons (names must be sorted), which keeps the icon font small.
const iconsHref =
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,400..600,0..1,0" +
  `&icon_names=${[...ICON_NAMES].sort().join(",")}&display=block`;

export const metadata: Metadata = {
  title: "Nido · tu coach de bienestar",
  description: "Muévete, come rico y descansa. A tu ritmo, sin culpa. Coach con NVIDIA Nemotron en Nebius Token Factory.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${figtree.variable} ${fredoka.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        {/* Applies the saved theme before first paint, so dark mode never flashes light. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="stylesheet" href={iconsHref} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
