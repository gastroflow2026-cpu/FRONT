import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BadgeDollarSign, LogIn, Mail, MapPin, Phone } from 'lucide-react';
import Logo from '../assets/logo gastro f.webp';

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-16 pb-8 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div className="space-y-6">
            <Image src={Logo} alt="GastroFlow" width={180} height={60} className="h-12 w-auto" />
            <p className="text-gray-400 leading-relaxed">
              Transformando la manera en que descubres y reservas en los mejores restaurantes de la ciudad.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="p-2 bg-gray-900 rounded-full hover:bg-linear-to-tr hover:from-gastro-coral hover:to-gastro-magenta transition-all duration-300">
                <span className="flex h-5 w-5 items-center justify-center text-xs font-bold">IG</span>
              </a>
              <a href="#" className="p-2 bg-gray-900 rounded-full hover:bg-linear-to-tr hover:from-gastro-coral hover:to-gastro-magenta transition-all duration-300">
                <span className="flex h-5 w-5 items-center justify-center text-xs font-bold">FB</span>
              </a>
              <a href="#" className="p-2 bg-gray-900 rounded-full hover:bg-linear-to-tr hover:from-gastro-coral hover:to-gastro-magenta transition-all duration-300">
                <span className="flex h-5 w-5 items-center justify-center text-xs font-bold">X</span>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 bg-clip-text text-transparent bg-linear-to-r from-gastro-coral to-gastro-magenta">
              Explorar
            </h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Inicio</Link></li>
              <li><Link href="/restaurantes" className="hover:text-white transition-colors">Restaurantes</Link></li>
              <li><Link href="/promociones" className="hover:text-white transition-colors">Promociones</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog Gastronómico</Link></li>
              <li>
                <Link href="/join#planes" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <BadgeDollarSign size={16} />
                  <span>Planes para restaurantes</span>
                </Link>
              </li>
              <li>
                <Link href="/owner/login" className="inline-flex items-center gap-2 hover:text-white transition-colors">
                  <LogIn size={16} />
                  <span>Inicio de sesión restaurantes</span>
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 bg-clip-text text-transparent bg-linear-to-r from-gastro-coral to-gastro-magenta">
              Soporte
            </h3>
            <ul className="space-y-4 text-gray-400">
              <li><Link href="/ayuda" className="hover:text-white transition-colors">Centro de Ayuda</Link></li>
              <li><Link href="/terminos" className="hover:text-white transition-colors">Términos de Servicio</Link></li>
              <li><Link href="/privacidad" className="hover:text-white transition-colors">Privacidad</Link></li>
              <li><Link href="/contacto" className="hover:text-white transition-colors">Contacto para Locales</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 bg-clip-text text-transparent bg-linear-to-r from-gastro-coral to-gastro-magenta">
              Contacto
            </h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center gap-3">
                <MapPin size={18} className="text-gastro-coral" />
                <span>La Plata, Buenos Aires</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-gastro-coral" />
                <span>+54 351 561143</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-gastro-coral" />
                <span>gastroflow@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-gray-900 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} GastroFlow. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
