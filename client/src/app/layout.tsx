import "./globals.css";
import { UsersProvider } from '../context/UsersContext';
import ReservationsProvider from '../context/ReservationsContext';



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning> 
        <UsersProvider>
          <ReservationsProvider>
            {children}
          </ReservationsProvider>
        </UsersProvider>
      </body>
    </html>
  );
}