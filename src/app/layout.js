import { Plus_Jakarta_Sans, Sora } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// Body font and heading font
const jakarta = Plus_Jakarta_Sans({ variable: "--font-jakarta", subsets: ["latin"] });
const sora = Sora({ variable: "--font-sora", subsets: ["latin"] });

export const metadata = {
  title: "Hos-Tell",
  description: "Rent, meals, leave and maintenance for PGs and hostels.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${sora.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}