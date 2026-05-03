import "./globals.css";
import { UsersProvider } from '../context/UsersContext';
import ReservationsProvider from '../context/ReservationsContext';
import TablesProvider from "../context/TablesContext";
import SubscriptionsProvider from '../context/SubscriptionsContext';
import { SocketProvider } from "../context/SocketContext";
import ReservationsPaymentProdiver from "@/context/ReservationsPayments";


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body suppressHydrationWarning> 
        <UsersProvider>
          <SocketProvider>
          <ReservationsProvider>
            <ReservationsPaymentProdiver>
              <TablesProvider>
              <SubscriptionsProvider>
                {children}
              </SubscriptionsProvider>
             </TablesProvider>
            </ReservationsPaymentProdiver>
          </ReservationsProvider>
         </SocketProvider>
        </UsersProvider>
      </body>
    </html>
  );
}