import React from "react";
import Link from "next/link";
import { MapPin, Star, Utensils, Zap } from "lucide-react";

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
  rating,
  location,
  comingSoon,
}: RestaurantCardProps) => {
  const displayName = name?.trim() || "-";
  const displayCategory = category?.trim() || "-";
  const displayLocation = location?.trim() || "-";
  const displayRating =
    typeof rating === "number" ? rating.toFixed(1) : rating?.trim() || "-";

  return (
    <div className="group cursor-pointer overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-md transition-all duration-500 hover:shadow-2xl">
      <div className="relative h-56 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={displayName}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 text-5xl font-bold text-white/70 transition-transform duration-700 group-hover:scale-110">
            -
          </div>
        )}

        <div className="absolute top-4 left-4 flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-gray-800 shadow-sm backdrop-blur-sm">
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
          <h3 className="text-xl font-bold text-gray-900 transition-colors group-hover:text-orange-500">
            {displayName}
          </h3>
          <div className="flex items-center gap-1 rounded-lg bg-orange-50 px-2 py-1">
            <Star size={14} className="fill-orange-500 text-orange-500" />
            <span className="text-sm font-bold text-orange-700">
              {displayRating}
            </span>
          </div>
        </div>

        <div className="mb-4 flex items-center gap-1 text-sm text-gray-500">
          <MapPin size={14} />
          {displayLocation}
        </div>

        {!comingSoon ? (
          <Link href={`/restaurant/${id}`}>
            <button className="w-full cursor-pointer rounded-xl bg-gray-50 py-3 font-semibold text-gray-900 transition-all duration-300 group-hover:bg-linear-to-r group-hover:from-gastro-coral group-hover:to-gastro-magenta group-hover:text-white">
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
