//Layout.tsx is the main parent file

import type { Metadata } from "next";
import './globals.css';

export const metadata: Metadata = {
  title: "Administrative",
  description: "Powered by NextJS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="Administrative" >
        {children}
      </body>
    </html>
  );
}
