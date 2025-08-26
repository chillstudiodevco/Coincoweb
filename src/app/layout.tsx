import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Constructora COINCO S.A.S | Ingeniería y Construcción en Colombia",
  description: "Empresa dedicada al desarrollo de proyectos de ingeniería y construcción con un firme compromiso hacia la responsabilidad social, la calidad y la mejora continua.",
  keywords: "construcción, ingeniería, obras civiles, Colombia, COINCO, reforzamiento estructural",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className={`${poppins.variable} bg-gray-50 text-coinco-dark font-sans`}>
        {children}
      </body>
    </html>
  );
}
