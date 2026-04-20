"use client";

import PublicRestaurantsGrid from "./PublicRestaurantsGrid";

const FeaturedRestaurants = () => {
  return (
    <PublicRestaurantsGrid
      sectionId="restaurantes-destacados"
      className="bg-transparent py-20"
      title="Restaurantes Destacados"
      subtitle="Las mejores mesas seleccionadas especialmente para vos."
      limit={3}
      showViewAllLink={true}
    />
  );
};

export default FeaturedRestaurants;
