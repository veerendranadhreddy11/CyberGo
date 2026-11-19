import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "CyberNex — Learn. Practice. Progress.",
  description: "Two practical cybersecurity learning paths. Plan daily missions, collect evidence, and track progress."
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
