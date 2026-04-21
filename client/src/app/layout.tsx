import "./globals.css";
import { UsersProvider } from '../context/UsersContext';
import ReservationsProvider from '../context/ReservationsContext';
import TablesProvider from "../context/TablesContext";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning> 
        <UsersProvider>
          <ReservationsProvider>
            <TablesProvider>
              {children}
            </TablesProvider>
          </ReservationsProvider>
        </UsersProvider>
      </body>
    </html>
  );
}