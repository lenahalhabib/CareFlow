import type { Metadata } from "next";
import "./globals.css";
import { TreatmentProvider } from "@/shared/context/TreatmentContext";

export const metadata: Metadata = {
  title: "CareFlow",
  description: "Treatment plan analysis and hospital comparison",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <TreatmentProvider>{children}</TreatmentProvider>
      </body>
    </html>
  );
}