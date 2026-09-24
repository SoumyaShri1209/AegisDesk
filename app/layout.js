import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "AegisDesk — Internal Service Agent",
  description:
    "A multi-tenant helpdesk agent that resolves requests using your company's own policies.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}