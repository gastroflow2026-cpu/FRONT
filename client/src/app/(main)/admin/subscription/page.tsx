import SubscriptionPage from "@/views/SubscriptionPage";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function Page() {
  return (
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1 pt-20">
            <SubscriptionPage />
          </main>
          <Footer />
        </div>
  )
}