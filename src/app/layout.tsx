import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from "next-themes";
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="vi" suppressHydrationWarning>
        <body className="antialiased">
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}