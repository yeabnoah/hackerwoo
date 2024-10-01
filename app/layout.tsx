import type { Metadata } from "next";
import { Manrope as FontSans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Provider from "@/provider/sessionProvider";
import { ThemeProvider } from 'next-themes';
import { ClerkProvider } from '@clerk/nextjs'
import Navbar from './components/navbar';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

// ******** you can change this metadata information with yours
export const metadata: Metadata = {
  title: "Hackwoo_ai",
  description: "AI-powered assistant for hackathons, helping you ideate, code, and present your projects faster and more efficiently.",

  // ********** you can find the favicons in /public folder
  icons: {
    icon: ["/favicon.ico?v=4"],
    apple: ["/apple-touch-icon.png?v=4"],
    shortcut: ["/apple-touch-icon.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <Provider>
              <Navbar />
              <div className="pt-16"> {/* Add padding-top to account for fixed navbar */}
                {children}
              </div>
            </Provider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}


