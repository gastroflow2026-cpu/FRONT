"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import RestaurantCard from "./RestaurantCard";
import {
  fetchAllPublicRestaurants,
  PublicRestaurantCardItem,
} from "@/utils/publicRestaurants";

interface PublicRestaurantsGridProps {
  title: string;
  subtitle: string;
  limit?: number;
  showViewAllLink?: boolean;
  sectionId?: string;
  className?: string;
}

const PublicRestaurantsGrid = ({
  title,
  subtitle,
  limit,
  showViewAllLink = false,
  sectionId,
  className = "bg-transparent py-20",
}: PublicRestaurantsGridProps) => {
  const [restaurants, setRestaurants] = useState<PublicRestaurantCardItem[]>([]);

  useEffect(() => {
    const loadRestaurants = async () => {
      const publicRestaurants = await fetchAllPublicRestaurants();
      setRestaurants(publicRestaurants);
    };

    loadRestaurants();
  }, []);

  const visibleRestaurants = useMemo(() => {
    const sortedRestaurants = [...restaurants].sort(
      (a, b) => Number(a.comingSoon) - Number(b.comingSoon),
    );

    if (typeof limit === "number") {
      return sortedRestaurants.slice(0, limit);
    }

    return sortedRestaurants;
  }, [limit, restaurants]);

  return (
    <section id={sectionId} className={className}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-black md:text-4xl">{title}</h2>
            <p className="text-black">{subtitle}</p>
          </div>

          {showViewAllLink && (
            <Link
              href="/restaurants"
              className="hidden font-bold text-orange-600 transition-colors hover:text-pink-600 md:block"
            >
              Ver todos los restaurantes →
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {visibleRestaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id} {...restaurant} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PublicRestaurantsGrid;
