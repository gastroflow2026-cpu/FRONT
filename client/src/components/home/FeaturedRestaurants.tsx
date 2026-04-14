import React from 'react';
import RestaurantCard from './RestaurantCard';

const MOCK_RESTAURANTS = [
  {
    id: "1",
    name: "La Bella Vita",
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop",
    category: "Italiana",
    rating: 4.8,
    location: "Palermo, CABA",
    comingSoon: true
  },
  {
    id: "2",
    name: "Sushi Master",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop",
    category: "Japonesa",
    rating: 4.5,
    location: "Recoleta, CABA",
    comingSoon: true
  },
  {
    id: "3",
    name: "La Parrilla del Sol",
    image: "https://images.unsplash.com/photo-1544148103-0773bf10d330?q=80&w=800&auto=format&fit=crop",
    category: "Parrilla",
    rating: 4.7,
    location: "Belgrano, CABA",
    comingSoon: true
  }
];

const FeaturedRestaurants = () => {
  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-black mb-2">
              Restaurantes Destacados
            </h2>
            <p className="text-black">
              Las mejores mesas seleccionadas especialmente para vos.
            </p>
          </div>
          <button className="hidden md:block text-orange-600 font-bold hover:text-pink-600 transition-colors">
            Ver todos los restaurantes →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOCK_RESTAURANTS.map((resto) => (
            <RestaurantCard key={resto.id} {...resto} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedRestaurants;