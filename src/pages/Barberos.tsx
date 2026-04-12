// src/pages/Barberos.tsx
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faScissors } from "@fortawesome/free-solid-svg-icons"
import { faInstagram } from "@fortawesome/free-brands-svg-icons"

type Barber = {
  id: string
  nombre: string
  foto: string
  descripcion?: string
  especialidad?: string
  instagram?: string
}

// ─── EDITA AQUÍ TUS BARBEROS ─────────────────────────────────────────────────
// Para fotos: usa links directos de Instagram (clic derecho → "Copiar dirección de imagen")
// O sube a imgur.com y copia el enlace .jpg
const BARBEROS: Barber[] = [
  {
    id: "josue",
    nombre: "Josue",
    foto: "https://i.imgur.com/TU_FOTO.jpg",   // ← pega tu URL aquí
    descripcion: "Especialista en cortes modernos y fade degradado",
    especialidad: "Fade & Diseño",
    instagram: "https://instagram.com/latinosvip1"
  },
  {
    id: "jankel",
    nombre: "Jankel",
    foto: "https://i.imgur.com/TU_FOTO2.jpg",
    descripcion: "Maestro en barba clásica y estilo VIP",
    especialidad: "Barba & Estilo",
    instagram: "https://instagram.com/latinosvip1"
  },
  {
    id: "stiven",
    nombre: "Stiven",
    foto: "https://i.imgur.com/TU_FOTO3.jpg",
    descripcion: "Experto en diseños creativos y mechas",
    especialidad: "Diseños & Color",
    instagram: "https://instagram.com/latinosvip1"
  },
]

export default function Barberos() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white pb-24">

      {/* Header */}
      <section className="pt-16 pb-10 px-6 text-center bg-gradient-to-b from-amber-500/10 to-transparent">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-amber-500 text-sm font-bold mb-8 hover:-translate-x-1 transition-transform"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver al Inicio
        </Link>

        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
          El <span className="text-amber-500">Equipo</span>
        </h1>
        <p className="text-zinc-500 mt-4 max-w-lg mx-auto text-sm lowercase italic">
          Profesionales que hacen magia en Torrejón de Ardoz
        </p>
      </section>

      {/* Grid barberos */}
      <div className="px-4 md:px-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BARBEROS.map((barber, i) => (
            <motion.div
              key={barber.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12 }}
              className="group relative bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden"
            >
              {/* Foto */}
              <div className="relative h-80 overflow-hidden bg-zinc-800">
                <img
                  src={barber.foto}
                  alt={barber.nombre}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback si la imagen no carga
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent" />

                {/* Badge especialidad */}
                {barber.especialidad && (
                  <div className="absolute top-4 left-4 bg-amber-400/90 text-zinc-900 text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
                    {barber.especialidad}
                  </div>
                )}

                {/* Instagram link */}
                {barber.instagram && (
                  <a
                    href={barber.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-4 right-4 w-8 h-8 bg-zinc-900/70 rounded-full flex items-center justify-center text-zinc-400 hover:text-amber-400 transition-colors"
                  >
                    <FontAwesomeIcon icon={faInstagram} className="text-sm" />
                  </a>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="text-2xl font-black text-amber-400 mb-1">{barber.nombre}</h3>
                {barber.descripcion && (
                  <p className="text-zinc-400 text-sm leading-relaxed">{barber.descripcion}</p>
                )}

                <Link
                  to="/"
                  className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase text-zinc-500 hover:text-amber-400 transition-colors tracking-widest"
                >
                  <FontAwesomeIcon icon={faScissors} />
                  Reservar con {barber.nombre}
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}