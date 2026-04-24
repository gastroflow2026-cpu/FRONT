"use client";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PublicRestaurantsGrid from "@/components/home/PublicRestaurantsGrid";

export default function RestaurantsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="grow pt-24">
        <PublicRestaurantsGrid
          className="pb-12"
          title="Los mejores restaurantes para vos"
          subtitle="Descubri los mejores sabores y gestiona tus reservas en tiempo real."
        />
      </main>
      <Footer />
    </div>
  );
}
