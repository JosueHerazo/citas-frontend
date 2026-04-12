// src/pages/Barberos.tsx

import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"

type Barber = {
  id: string
  nombre: string
  foto: string          // URL de la foto (puedes usar imgur, cloudinary, etc.)
  descripcion?: string
}

// ─── BARBEROS HARDCODEADOS (edita aquí) ─────────────────────────────────────
const BARBEROS: Barber[] = [
  {
    id: "josue",
    nombre: "Josue",
    foto: "https://i.imgur.com/TU_FOTO_JOSUE.jpg",   // ← Cambia por tu enlace
    descripcion: "Especialista en cortes modernos y fade"
  },
  {
    id: "jankel",
    nombre: "Jankel",
    foto: "https://i.imgur.com/TU_FOTO_JANKEL.jpg",
    descripcion: "Maestro en barba y estilo clásico"
  },
  {
    id: "stiven",
    nombre: "Stiven",
    foto: "https://i.imgur.com/TU_FOTO_STIVEN.jpg",
    descripcion: "Experto en diseños y cortes creativos"
  },
  // Agrega más barberos aquí fácilmente
]

export default function Barberos() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white pb-20">
      
      {/* Header */}
      <section className="pt-16 pb-10 px-6 text-center bg-gradient-to-b from-amber-500/10 to-transparent">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-amber-500 font-bold mb-6 hover:translate-x-[-5px] transition-transform"
        >
          <FontAwesomeIcon icon={faArrowLeft} /> Volver al Inicio
        </Link>

        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
          Nuestros <span className="text-amber-500">Barberos</span>
        </h1>
        <p className="text-zinc-500 mt-4 max-w-xl mx-auto font-medium lowercase italic">
          El equipo que hace magia en Torrejón de Ardoz
        </p>
      </section>

      {/* Galería de Barberos */}
      <div className="px-6 pt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {BARBEROS.map((barber, index) => (
            <motion.div
              key={barber.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-zinc-900/70 border border-zinc-800 rounded-3xl overflow-hidden group"
            >
              <div className="relative h-80 overflow-hidden">
                <img 
                  src={barber.foto} 
                  alt={barber.nombre}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent h-40" />
              </div>

              <div className="p-6">
                <h3 className="text-3xl font-black text-amber-400 mb-1">
                  {barber.nombre}
                </h3>
                {barber.descripcion && (
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    {barber.descripcion}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mensaje si no hay barberos (por si borras todos) */}
      {BARBEROS.length === 0 && (
        <div className="text-center py-32 text-zinc-500">
          <p className="text-6xl mb-4">✂️</p>
          <p className="font-bold text-xl">No hay barberos configurados aún</p>
        </div>
      )}
    </div>
  )
}