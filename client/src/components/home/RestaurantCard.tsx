import React from "react";
import Link from "next/link";
import { MapPin, Utensils, Zap } from "lucide-react";

interface RestaurantCardProps {
  id: string;
  name?: string;
  image?: string | null;
  category?: string;
  rating?: number | string;
  location?: string;
  comingSoon: boolean;
}

const RestaurantCard = ({
  id,
  name,
  image,
  category,
  location,
  comingSoon,
}: RestaurantCardProps) => {
  const displayName = name?.trim() || "-";
  const displayCategory = category?.trim() || "-";
  const displayLocation = location?.trim() || "-";
  
  return (
    <div className="group cursor-pointer overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={displayName}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-5xl font-bold text-white/90 transition-transform duration-700 group-hover:scale-110">
            -
          </div>
        )}

        <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-bold text-gray-900 shadow backdrop-blur-sm">
          <Utensils size={12} className="text-orange-500" />
          {displayCategory}
        </div>

        {/* {comingSoon && (
          <div className="absolute top-4 right-4 flex items-center gap-1 rounded-full bg-orange-500/90 px-3 py-1 text-xs font-bold text-white shadow-sm backdrop-blur-sm">
            <Zap size={12} />
            PROXIMAMENTE
          </div>
        )} */}
      </div>

      <div className="p-6">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold text-gray-950 transition-colors group-hover:text-orange-500">
            {displayName}
          </h3>
        </div>

        <div className="mb-4 flex items-center gap-1 text-sm font-medium text-gray-600">
          <MapPin size={14} />
          {displayLocation}
        </div>

        {!comingSoon ? (
          <Link href={`/restaurant/${id}`}>
            <button className="w-full cursor-pointer rounded-xl bg-gray-100 py-3 font-semibold text-gray-800 ring-1 ring-gray-200 transition-all duration-300 group-hover:bg-linear-to-r group-hover:from-gastro-coral group-hover:to-gastro-magenta group-hover:text-white group-hover:ring-0">
              Ver Detalles
            </button>
          </Link>
        ) : (
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-100 py-3 text-center font-semibold text-gray-500">
            <Zap size={16} />
            Proximamente
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantCard;
