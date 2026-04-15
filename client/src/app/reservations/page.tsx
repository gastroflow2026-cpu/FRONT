import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export default function ReservationsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="grow flex items-center justify-center pt-24 pb-12 px-4 bg-gray-50/50">
        <div className="max-w-md w-full text-center p-10 bg-white rounded-4xl shadow-xl shadow-gray-200/50 border border-gray-100">
          {/* Icono decorativo con sutil degradado de fondo */}
          <div className="bg-orange-100/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
            <span className="text-5xl">📅</span>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
            Todavía no tenés reservas
          </h1>
          
          <p className="text-lg text-gray-500 mb-10 leading-relaxed">
            Iniciá sesión para ver tu historial de mesas o descubrir nuevos lugares para tu próxima cena.
          </p>

          <div className="flex flex-col gap-4">
            <Link 
              href="/login" 
              className="bg-linear-to-r from-orange-500 to-pink-500 text-white px-6 py-2.5 rounded-full font-medium hover:opacity-90 transition duration-150 w-full shadow-md"
            >
              Iniciar Sesión
            </Link>
            
            <Link 
              href="/restaurants" 
              className="text-gray-400 font-semibold py-2 hover:text-gray-700 transition-colors"
            >
              Explorar restaurantes
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}