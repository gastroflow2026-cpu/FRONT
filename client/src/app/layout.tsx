import "@/app/globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-[radial-gradient(circle_at_20%_20%,#141a33_0%,#070b18_70%)] text-slate-100">
        {children}
      </body>
    </html>
  );
}