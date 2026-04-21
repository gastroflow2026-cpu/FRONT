const API_URL = process.env.NEXT_PUBLIC_API_URL;

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
  description?: string | null;
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

export const MOCK_PUBLIC_RESTAURANTS: PublicRestaurantCardItem[] = [
  {
    id: "1",
    name: "La Bella Vita",
    category: "Italiana",
    location: "Palermo, CABA",
    rating: "4.8",
    image:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop",
    comingSoon: false,
  },
  {
    id: "2",
    name: "Sushi Master",
    category: "Japonesa",
    location: "Recoleta, CABA",
    rating: "4.5",
    image:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop",
    comingSoon: true,
  },
  {
    id: "3",
    name: "La Parrilla del Sol",
    category: "Parrilla",
    location: "Belgrano, CABA",
    rating: "4.7",
    image:
      "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=800&auto=format&fit=crop",
    comingSoon: true,
  },
  {
    id: "4",
    name: "Burger House",
    category: "Hamburguesas",
    location: "Chacarita, CABA",
    rating: "4.6",
    image:
      "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800&auto=format&fit=crop",
    comingSoon: true,
  },
  {
    id: "5",
    name: "Green Eat",
    category: "Saludable",
    location: "San Telmo, CABA",
    rating: "4.4",
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
    comingSoon: true,
  },
  {
    id: "6",
    name: "Tacos El Rey",
    category: "Mexicana",
    location: "Nunez, CABA",
    rating: "4.9",
    image:
      "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop",
    comingSoon: true,
  },
];

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
  category: restaurant.description?.trim() || "-",
  location: buildLocation(restaurant),
  rating: "-",
  image: restaurant.logo_url?.trim() || null,
  comingSoon: true,
});

const mergeWithMocks = (restaurants: PublicRestaurantCardItem[]) => {
  const merged = [...restaurants];

  for (const mockRestaurant of MOCK_PUBLIC_RESTAURANTS) {
    const alreadyExists = merged.some(
      (restaurant) =>
        restaurant.id === mockRestaurant.id ||
        restaurant.name.toLowerCase() === mockRestaurant.name.toLowerCase(),
    );

    if (!alreadyExists) {
      merged.push(mockRestaurant);
    }
  }

  return merged;
};

export const fetchAllPublicRestaurants = async () => {
  if (!API_URL) {
    return MOCK_PUBLIC_RESTAURANTS;
  }

  try {
    const response = await fetch(`${API_URL}/restaurant/public/all`, {
      cache: "no-store",
    });

    if (!response.ok) {
      return MOCK_PUBLIC_RESTAURANTS;
    }

    const restaurants = (await response.json()) as PublicRestaurantResponse[];

    if (!Array.isArray(restaurants) || restaurants.length === 0) {
      return MOCK_PUBLIC_RESTAURANTS;
    }

    return mergeWithMocks(restaurants.map(normalizePublicRestaurant));
  } catch {
    return MOCK_PUBLIC_RESTAURANTS;
  }
};
