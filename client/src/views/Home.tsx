import Navbar from "../components/layout/Navbar";
import Hero from "../components/home/Hero";
import Features from "../components/Features";
import FeaturedRestaurants from "../components/home/FeaturedRestaurants";
import Footer from "../components/layout/Footer";

const Home = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* Añadimos pt-20 (padding-top) para que el Hero baje */}
      <main className="pt-20">
        <Hero />
        <Features />
        <FeaturedRestaurants />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
