import type { Metadata } from "next";
import Link from "next/link";
import {
  BUSINESS_NAME,
  BUSINESS_PHONE,
  BUSINESS_ADDRESS,
  BUSINESS_HOURS,
} from "@/config/constants";

export const metadata: Metadata = {
  title: "Mochi y Bubble Tea en Norte Madrid — Zona Norte",
  description:
    "Visita nuestra tienda de mochi artesanal, bubble tea y cafe de especialidad en la zona norte de Madrid. Calle de Orense 32, cerca de AZCA y Cuatro Torres. Abiertos de lunes a domingo.",
  alternates: {
    canonical: "/norte-madrid",
  },
};

export default function NorteMadridPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-lg font-bold text-gray-900"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-600 text-white text-xs font-bold">
              LA
            </span>
            LearnAnything
          </Link>
          <Link
            href="/"
            className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
          >
            &larr; Volver al Inicio
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-12 sm:py-20">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-8">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li>
              <Link href="/" className="hover:text-green-600 transition-colors">
                Inicio
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="text-gray-900 font-medium">Norte Madrid</li>
          </ol>
        </nav>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
          Mochi, Bubble Tea y Cafe de Especialidad en Norte Madrid
        </h1>

        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          Bienvenido a <strong>{BUSINESS_NAME}</strong>, tu destino para mochi
          artesanal, bubble tea fresco, cafe de especialidad y anko tradicional
          en la <strong>zona norte de Madrid</strong>. Nos encontramos en{" "}
          <strong>{BUSINESS_ADDRESS.streetAddress}</strong>, a pocos minutos del
          distrito financiero de AZCA y las Cuatro Torres.
        </p>

        {/* Product sections */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Nuestros Productos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Link
              href="/productos/mochi"
              className="rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-green-200 transition-all"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Mochi Artesanal
              </h3>
              <p className="text-gray-600">
                Mochi fresco hecho a mano cada dia con ingredientes de primera
                calidad. Sabores clasicos y de temporada.
              </p>
            </Link>
            <Link
              href="/productos/bubble-tea"
              className="rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-green-200 transition-all"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bubble Tea
              </h3>
              <p className="text-gray-600">
                Bubble tea con perlas de tapioca frescas. Te con leche, te de
                frutas y creaciones exclusivas.
              </p>
            </Link>
            <Link
              href="/productos/cafe"
              className="rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-green-200 transition-all"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cafe de Especialidad
              </h3>
              <p className="text-gray-600">
                Granos de origen unico tostados artesanalmente. Espresso,
                pour-over, cold brew y mas.
              </p>
            </Link>
            <Link
              href="/productos/anko"
              className="rounded-2xl border border-gray-100 p-6 hover:shadow-md hover:border-green-200 transition-all"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Anko y Dulces Japoneses
              </h3>
              <p className="text-gray-600">
                Pasta de judias rojas (anko) artesanal y una seleccion de dulces
                tradicionales japoneses.
              </p>
            </Link>
          </div>
        </section>

        {/* Location info */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Como Llegar — Zona Norte Madrid
          </h2>
          <div className="rounded-2xl bg-green-50 border border-green-100 p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Direccion</h3>
                <p className="text-gray-700">
                  {BUSINESS_ADDRESS.streetAddress}
                  <br />
                  {BUSINESS_ADDRESS.postalCode} {BUSINESS_ADDRESS.addressLocality}
                </p>
                <p className="mt-2 text-gray-700">
                  <strong>Telefono:</strong>{" "}
                  <a
                    href={`tel:${BUSINESS_PHONE}`}
                    className="text-green-600 hover:text-green-700"
                  >
                    {BUSINESS_PHONE}
                  </a>
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Horario</h3>
                <ul className="text-gray-700 space-y-1">
                  {BUSINESS_HOURS.map((hours) => (
                    <li key={hours}>{hours}</li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Transporte Publico
              </h3>
              <p className="text-gray-700">
                Metro: Santiago Bernabeu (L10), Nuevos Ministerios (L6, L8, L10).
                Cercanias: Nuevos Ministerios. Autobus: lineas 5, 14, 27, 40,
                147, 150.
              </p>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Norte de Madrid: Nuestro Barrio
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            La zona norte de Madrid es uno de los distritos mas dinamicos de la
            capital. Con el distrito financiero de AZCA, las Cuatro Torres
            Business Area y el Santiago Bernabeu a pocos pasos, nuestra tienda
            es el lugar perfecto para disfrutar de un mochi artesanal o un
            bubble tea fresco durante tu pausa del trabajo o antes de un partido.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Ya sea que vivas en Tetuan, Chamartin, Fuencarral-El Pardo o
            trabajes en la zona de AZCA, te invitamos a descubrir sabores
            japoneses autenticos en el corazon del norte de Madrid.
          </p>
        </section>
      </main>
    </div>
  );
}
