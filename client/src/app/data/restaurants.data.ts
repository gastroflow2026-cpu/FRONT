export interface Restaurant {
  id: string;
  name: string;
  description: string;
  location: string;
  category: string;
  rating: number;
  image: string;
  about?: string; 
}

export const ALL_RESTAURANTS: Restaurant[] = [
  {
    id: "1",
    name: "La Bella Vita",
    description: "Pastas artesanales y ambiente romano.",
    location: "Palermo, CABA",
    category: "Italiana",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?q=80&w=800&auto=format&fit=crop",
    about: "La Bella Vita ofrece una experiencia italiana auténtica en el corazón de Palermo. Con pastas amasadas a mano y recetas transmitidas por generaciones, cada plato es un viaje a las raíces de Italia."
  },
  {
    id: "2",
    name: "Sushi Master",
    description: "Sabor de Tokyo con toques locales.",
    location: "Recoleta, CABA",
    category: "Japonesa",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=800&auto=format&fit=crop",
    about: "Un rincón zen donde la frescura del pescado se une con la técnica milenaria del sushi, ofreciendo piezas únicas en un ambiente sofisticado."
  },
  {
    id: "3",
    name: "La Parrilla del Sol",
    description: "El auténtico asado criollo.",
    location: "Belgrano, CABA",
    category: "Parrilla",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=800&auto=format&fit=crop",
    about: "Selección de cortes premium cocinados a las brasas, acompañados de los mejores vinos de nuestra cava."
  },
  {
    id: "4",
    name: "Burger House",
    description: "Hamburguesas gourmet y cervezas.",
    location: "Chacarita, CABA",
    category: "Hamburguesas",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?q=80&w=800&auto=format&fit=crop",
    about: "El paraíso de los amantes de la carne entre dos panes. Pan de papa casero y blends de carne madurada."
  },
  {
    id: "5",
    name: "Green Eat",
    description: "Comida consciente y natural.",
    location: "San Telmo, CABA",
    category: "Saludable",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop",
    about: "Propuestas frescas, estacionales y nutritivas para disfrutar de una comida equilibrada sin perder el sabor."
  },
  {
    id: "6",
    name: "Tacos El Rey",
    description: "Explosión de sabores mexicanos.",
    location: "Nuñez, CABA",
    category: "Mexicana",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?q=80&w=800&auto=format&fit=crop",
    about: "Auténtica comida callejera de México: tacos al pastor, cochinita pibil y margaritas artesanales."
  }
];