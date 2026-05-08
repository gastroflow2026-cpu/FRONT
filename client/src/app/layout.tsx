import type { Metadata } from "next";
import "./globals.css";
import { UsersProvider } from "../context/UsersContext";
import ReservationsProvider from "../context/ReservationsContext";
import TablesProvider from "../context/TablesContext";
import SubscriptionsProvider from "../context/SubscriptionsContext";
import { SocketProvider } from "../context/SocketContext";
import ReservationsPaymentProdiver from "@/context/ReservationsPayments";

export const metadata: Metadata = {
  title: {
    default: "GastroFlow – Reservas y gestión de restaurantes",
    template: "%s | GastroFlow",
  },
  description:
    "Descubrí y reservá en los mejores restaurantes. Gestioná pedidos, mesas y pagos en tiempo real con GastroFlow.",
  keywords: ["restaurantes", "reservas", "gastronomía", "La Plata", "GastroFlow"],
  authors: [{ name: "GastroFlow" }],
  metadataBase: new URL("https://gastroflow.vercel.app"),
  icons:{
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "GastroFlow – Reservas y gestión de restaurantes",
    description:
      "Descubrí y reservá en los mejores restaurantes. Gestioná pedidos, mesas y pagos en tiempo real.",
    siteName: "GastroFlow",
    locale: "es_AR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
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
