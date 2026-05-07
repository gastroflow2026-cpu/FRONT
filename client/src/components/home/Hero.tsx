"use client";
import Image from "next/image";
import BannerImg from "../assets/imagen de fondo de restaurant 4.png";
import { UsersContext } from "@/context/UsersContext";
import { useContext } from "react";
import { useRouter } from "next/navigation";

const Hero = () => {
  const { isLogged } = useContext(UsersContext);
  const router = useRouter();
  return (
    <section className="relative flex min-h-[70svh] w-full items-center justify-center overflow-hidden px-4 py-24 sm:min-h-[80vh] sm:px-6 sm:py-28">
      <div className="absolute inset-0 z-0">
        <Image
          src={BannerImg}
          alt="Restaurante Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-linear-to-b from-black/70 via-black/55 to-black/70"></div>{" "}
        {/* Oscurece la imagen para que se lea el texto */}
      </div>

      {/* Contenido */}
      <div className="relative z-10 mx-auto max-w-4xl text-center text-white">
        <h1 className="mb-4 text-4xl font-extrabold text-white sm:text-5xl md:text-6xl lg:text-7xl">
          Tu experiencia GastroFlow <br /> comienza aquí
        </h1>
        <p className="mx-auto mb-8 max-w-2xl text-base text-white/90 sm:text-lg md:text-xl">
          Reserva en los mejores restaurantes y gestiona tus pedidos en tiempo
          real.
        </p>
        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <button
            onClick={() => {
              if (isLogged) {
                document
                  .getElementById("restaurantes-destacados")
                  ?.scrollIntoView({ behavior: "smooth" });
              } else {
                router.push("/login");
              }
            }}
            className="w-full rounded-full bg-linear-to-r from-[#FF7A45] to-[#FF3F7E] px-8 py-4 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 sm:w-auto"
          >
            Reservar Ahora
          </button>
          <button
            onClick={() => router.push("/owner")}
            className="w-full rounded-full border border-white/45 bg-black/25 px-8 py-4 font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,0.2)] backdrop-blur-md transition-all duration-300 hover:bg-white/18 focus:outline-none focus:ring-2 focus:ring-white/35 sm:w-auto"
          >
            Registra tu negocio
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
