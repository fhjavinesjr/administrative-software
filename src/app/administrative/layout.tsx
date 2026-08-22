//Layout.tsx is the main parent file

import type { Metadata } from "next";
import Script from "next/script";
import './globals.css';
import PageAuthentication from "./PageAuthentication";
import LayoutClientWrapper from "./layoutClientWrapper";

export const metadata: Metadata = {
  title: "Administrative",
  description: "Powered by NextJS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script src="/runtime-config.js" strategy="beforeInteractive" />
      </head>
      <body className="Administrative" >

        <PageAuthentication>
          <LayoutClientWrapper>
          {children}
          </LayoutClientWrapper>
        </PageAuthentication>

      </body>
    </html>
  );
}
