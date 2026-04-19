import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      {/* RECUADRO */}
      <div className="bg-white p-20 rounded-2xl shadow-2xl text-center max-w-md w-full">
        {/* LOGO */}
        <img
          src="/logo.png"
          alt="Página no encontrada"
          className="w-40 mx-auto mb-6"
        />

        {/* TITULO */}
        <h1 className="text-lg font-semibold text-black mb-2">
          ¡Ups! Página no encontrada
        </h1>

        {/* DESCRIPCION */}
        <p className="text-gray-500 text-sm mb-6">
          Pero tenemos otras opciones deliciosas para ti.
        </p>

        {/* BOTON */}
        <Link href="/">
          <button
            className="
              bg-linear-to-r from-[#FF7A45] to-[#FF3F7E]
              hover:scale-105 transition-transform duration-300
              text-white px-8 py-3
              rounded-full text-sm font-bold
              shadow-md
            "
          >
            INICIO
          </button>
        </Link>
      </div>
    </div>
  );
}
