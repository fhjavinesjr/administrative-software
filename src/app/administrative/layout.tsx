//Layout.tsx is the main parent file

import type { Metadata } from "next";
import './globals.css';
import PageAuthentication from "./PageAuthentication";

export const metadata: Metadata = {
  title: "Administrative",
  description: "Powered by NextJS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="Administrative" >

        <PageAuthentication>
          {children}
        </PageAuthentication>

      </body>
    </html>
  );
}
