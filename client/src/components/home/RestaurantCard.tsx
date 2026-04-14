import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, MapPin, Utensils } from 'lucide-react';


interface RestaurantCardProps {
  id: string;
  name: string;
  image: string;
  category: string;
  rating: number;
  location: string;
}

const RestaurantCard = ({ id, name, image, category, rating, location }: RestaurantCardProps) => {
  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 group cursor-pointer border border-gray-100">
      {/* Contenedor de Imagen */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={image} 
          alt={name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Badge de Categoría */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
          <Utensils size={12} className="text-orange-500" />
          {category}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-500 transition-colors">
            {name}
          </h3>
          <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
            <Star size={14} className="text-orange-500 fill-orange-500" />
            <span className="text-sm font-bold text-orange-700">{rating}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 text-gray-500 text-sm mb-4">
          <MapPin size={14} />
          {location}
        </div>

        <Link href={`/restaurant/${id}`}>
          <button className="w-full py-3 bg-gray-50 text-gray-900 font-semibold rounded-xl group-hover:bg-gradient-to-r group-hover:from-gastro-coral group-hover:to-gastro-magenta group-hover:text-white transition-all duration-300 cursor-pointer">
            Ver Detalles
          </button>
        </Link>
      </div>
    </div>
  );
};

export default RestaurantCard;