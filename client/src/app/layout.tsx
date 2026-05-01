import "./globals.css";
import { UsersProvider } from '../context/UsersContext';
import ReservationsProvider from '../context/ReservationsContext';
import TablesProvider from "../context/TablesContext";
import SubscriptionsProvider from '../context/SubscriptionsContext';


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning> 
        <UsersProvider>
          <ReservationsProvider>
            <TablesProvider>
              <SubscriptionsProvider>
                {children}
              </SubscriptionsProvider>
            </TablesProvider>
          </ReservationsProvider>
        </UsersProvider>
      </body>
    </html>
  );
}