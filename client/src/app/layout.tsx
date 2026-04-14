import "./globals.css";
import { UsersProvider } from '../context/UsersContext';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning> 
        <UsersProvider>
          {children}
        </UsersProvider>
      </body>
    </html>
  );
}