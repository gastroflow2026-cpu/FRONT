import RestaurantCard from "@/components/home/RestaurantCard";
import Navbar from "@/components/layout/Navbar"; 
import Footer from "@/components/layout/Footer";

const ALL_RESTAURANTS = [
  {
    id: "1",
    name: "La Bella Vita",
    description: "Italiana",
    location: "Palermo, CABA",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop",
    isActive: true,
  },
  {
    id: "2",
    name: "Sushi Master",
    description: "Japonesa",
    location: "Recoleta, CABA",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop",
    isActive: false,
  },
  {
    id: "3",
    name: "La Parrilla del Sol",
    description: "Parrilla",
    location: "Belgrano, CABA",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=800&auto=format&fit=crop",
    isActive: false,
  },
  {
    id: "4",
    name: "Burger House",
    description: "Hamburguesas",
    location: "Chacarita, CABA",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800&auto=format&fit=crop",
    isActive: false,
  },
  {
    id: "5",
    name: "Green Eat",
    description: "Saludable",
    location: "San Telmo, CABA",
    rating: 4.4,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
    isActive: false,
  },
  {
    id: "6",
    name: "Tacos El Rey",
    description: "Mexicana",
    location: "Nuñez, CABA",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop",
    isActive: false,
  },
];

export default function RestaurantsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      
      <main className="grow container mx-auto pt-24 pb-12 px-4">
        <header className="mb-10 text-center md:text-left">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Los mejores restaurantes para vos</h1>
          <p className="text-lg text-gray-600">
            Descubrí los mejores sabores y gestioná tus reservas en tiempo real.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {ALL_RESTAURANTS.map((restaurant) => (
            <RestaurantCard
              key={restaurant.id}
              id={restaurant.id}
              name={restaurant.name}
              image={restaurant.image}
              category={restaurant.description}
              rating={restaurant.rating}
              location={restaurant.location}
              comingSoon={!restaurant.isActive}
            />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}