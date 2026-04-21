import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function about() {
  return (
    <div>
      <Navbar />

      <section className="min-h-screen bg-linears-to-b from-white via-orange-50 to-pink-50 px-6 pt-28 pb-16">
        <div className="mx-auto max-w-6xl">
          {/* ENCABEZADO */}
          <div className="mb-14 text-center">
            <span className="inline-block rounded-full bg-orange-100 px-4 py-1 text-sm font-semibold text-orange-600">
              Sobre Nosotros
            </span>

            <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
              Conectamos personas con experiencias gastronómicas inolvidables
            </h1>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-gray-600">
              Reinventamos la forma en que los comensales descubren restaurantes
              y ayudamos a los dueños a mostrar su propuesta al público ideal.
            </p>
          </div>

          {/* BLOQUE PRINCIPAL */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* NUESTRA PROPUESTA */}
            <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-gray-100">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                🚀 Nuestra propuesta
              </h2>

              <p className="text-base leading-8 text-gray-600">
                En nuestra plataforma reinventamos la forma en que las personas
                descubren restaurantes. Sabemos que elegir dónde comer no
                debería ser complicado. Por eso, desarrollamos una aplicación
                inteligente que conecta a cada comensal con experiencias
                gastronómicas hechas a su medida.
              </p>

              <p className="mt-4 text-base leading-8 text-gray-600">
                A través de un sistema basado en preferencias, intereses
                culinarios y tendencias, ayudamos a los usuarios a encontrar
                exactamente lo que están buscando, incluso antes de que lo
                sepan. ¿Te gusta la comida italiana? ¿Buscás opciones veganas?
                ¿Querés probar algo nuevo?
              </p>
            </div>

            {/* USUARIOS */}
            <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-gray-100">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                🍽️ Para los usuarios
              </h2>

              <p className="text-base leading-8 text-gray-600">
                Descubrí, explorá y elegí sin perder tiempo. Nuestra plataforma
                transforma una simple búsqueda en una experiencia personalizada,
                rápida y efectiva.
              </p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-orange-50 p-4">
                  <h3 className="font-semibold text-gray-900">
                    Recomendaciones inteligentes
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Sugerencias basadas en gustos, intereses y preferencias
                    reales.
                  </p>
                </div>

                <div className="rounded-2xl bg-pink-50 p-4">
                  <h3 className="font-semibold text-gray-900">
                    Ahorro de tiempo
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-gray-600">
                    Encontrá opciones ideales sin perder horas buscando.
                  </p>
                </div>
              </div>
            </div>

            {/* RESTAURANTES */}
            <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-gray-100">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                📈 Para los restaurantes
              </h2>

              <p className="text-base leading-8 text-gray-600">
                Impulsamos tu crecimiento. Los dueños de restaurantes pueden
                registrar su negocio en nuestra plataforma y acceder a una
                vidriera digital donde miles de potenciales clientes están
                buscando exactamente lo que vos ofrecés.
              </p>

              <p className="mt-4 text-base leading-8 text-gray-600">
                Aumentá tu visibilidad, destacá tu propuesta gastronómica y
                conectá con el público ideal dentro de un entorno digital
                moderno y competitivo.
              </p>
            </div>

            {/* PROPÓSITO */}
            <div className="rounded-3xl bg-white p-8 shadow-lg ring-1 ring-gray-100">
              <h2 className="mb-4 text-2xl font-bold text-gray-900">
                🌐 Nuestro propósito
              </h2>

              <p className="text-base leading-8 text-gray-600">
                Creamos un ecosistema donde todos ganan: los usuarios encuentran
                mejores experiencias, y los restaurantes llegan a más personas.
              </p>

              <p className="mt-4 text-base leading-8 text-gray-600">
                No somos solo una app. Somos el punto de encuentro entre el
                hambre y la mejor decisión.
              </p>
            </div>
          </div>

          {/* BLOQUE FINAL */}
          <div className="mt-14 rounded-3xl bg-linear-to-r from-[#FF7A45] to-[#FF3F7E] p-10 text-center shadow-xl">
            <h2 className="text-3xl font-extrabold text-white">
              La gastronomía perfecta, más cerca que nunca
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-base leading-7 text-white/90">
              Conectamos comensales con restaurantes que realmente coinciden con
              sus gustos, mientras ayudamos a los negocios a crecer y llegar a
              su público ideal.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
