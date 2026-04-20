"use client"
import Image from 'next/image';
import BannerImg from '../assets/imagen de fondo de restaurant 4.png';
import { UsersContext } from '@/context/UsersContext';
import { useContext } from 'react';
import { useRouter } from 'next/navigation';

const Hero = () => {
  const {isLogged} = useContext(UsersContext);
  const router = useRouter();
  return (
    <section className="relative h-[80vh] w-full flex items-center justify-center overflow-hidden">
   
      <div className="absolute inset-0 z-0">
        <Image
          src={BannerImg}
          alt="Restaurante Background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50"></div> {/* Oscurece la imagen para que se lea el texto */}
      </div>

      {/* Contenido */}
      <div className="relative z-10 text-center text-white px-4">
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-200 mb-4">
          Tu experiencia GastroFlow <br /> comienza aquí
        </h1>
        <p className="text-lg md:text-xl mb-8 text-gray-200">
          Reserva en los mejores restaurantes y gestiona tus pedidos en tiempo real.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => {
            if(isLogged){
              document.getElementById('restaurantes-destacados')?.scrollIntoView({ behavior: 'smooth' });
            }else{
              router.push('/login');
            }
          }} className="bg-linear-to-r from-[#FF7A45] to-[#FF3F7E] hover:scale-105 transition-transform text-white px-8 py-4 rounded-full text-lg font-bold shadow-lg">
            Reservar Ahora
          </button>
          <button
            onClick={() => router.push('/join')}
            className="px-8 py-4 rounded-full border border-white/30 bg-white/10 backdrop-blur-md text-white font-bold hover:bg-white/20 transition-all duration-300"
          >
            Registra tu negocio
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;