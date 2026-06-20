import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ClerkProvider } from "@clerk/nextjs";

const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    template: "GlucoCare | %s",
    default: "GlucoCare | Diabetic Diagnose & Telemedicine",
  },
  description: "Web based platform for diabetic diagnose and telemedicine scheduling",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", montserrat.variable)}
    >
      <ClerkProvider afterSignOutUrl="/">
        <body className={cn(montserrat.className, "min-h-full flex flex-col bg-background text-foreground")}>
          <TooltipProvider>{children}</TooltipProvider>
        </body>
      </ClerkProvider>
    </html>
  );
}
