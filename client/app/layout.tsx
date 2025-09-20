import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";
import axios from "axios";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Citizen Portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  axios.defaults.baseURL = process.env.SERVER_URL || "http://localhost:3000";
  return (
    <html lang="en">
      <body>
        <QueryProvider>
          {children}
          <Toaster />
        </QueryProvider>
      </body>
    </html>
  );
}
