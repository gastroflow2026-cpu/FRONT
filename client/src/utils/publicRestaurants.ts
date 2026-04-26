const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim();

export interface PublicRestaurantResponse {
  id?: string;
  name?: string | null;
  slug?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  logo_url?: string | null;
  image_url?: string | null;
  description?: string | null;
  category?: string | null;
  is_active?: boolean;
}

export interface PublicRestaurantCardItem {
  id: string;
  name: string;
  category: string;
  location: string;
  rating: string;
  image: string | null;
  comingSoon: boolean;
}

const buildLocation = (restaurant: PublicRestaurantResponse) => {
  const cityCountry = [restaurant.city, restaurant.country]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(", ");

  if (cityCountry) {
    return cityCountry;
  }

  return restaurant.address?.trim() || "-";
};

export const normalizePublicRestaurant = (
  restaurant: PublicRestaurantResponse,
): PublicRestaurantCardItem => ({
  id:
    restaurant.id?.trim() ||
    restaurant.slug?.trim() ||
    restaurant.name?.trim().toLowerCase().replace(/\s+/g, "-") ||
    "restaurant",
  name: restaurant.name?.trim() || "-",
  category: restaurant.category?.trim() || restaurant.description?.trim() || "-",
  location: buildLocation(restaurant),
  rating: "-",
  image: restaurant.image_url?.trim() || restaurant.logo_url?.trim() || null,
  comingSoon: !restaurant.is_active,
});

export const fetchAllPublicRestaurants = async () => {
  if (!API_URL) {
    return [];
  }

  try {
    const response = await fetch(`${API_URL}/restaurant/public/all`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return [];
    }

    const restaurants = (await response.json()) as PublicRestaurantResponse[];

    if (!Array.isArray(restaurants) || restaurants.length === 0) {
      return [];
    }

    return restaurants.map(normalizePublicRestaurant);
  } catch {
    return [];
  }
};
