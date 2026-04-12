// src/pages/Trabajos.tsx

import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faStar } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"

type Trabajo = {
  id: number
  titulo: string
  descripcion?: string
  categoria: string
  url: string          // URL de la imagen o video
  tipo: 'image' | 'video'
  barbero?: string
}

const CATEGORIAS = ["Todos", "Cortes", "Químicos", "Estilo", "Estética"]

// ─── EDITA AQUÍ TUS TRABAJOS ─────────────────────────────────────
const TRABAJOS: Trabajo[] = [
  {
    id: 1,
    titulo: "Fade con diseño",
    descripcion: "Corte fade con línea y diseño geométrico",
    categoria: "Cortes",
    url: "https://i.imgur.com/TU_TRABAJO1.jpg",
    tipo: "image",
    barbero: "Josue"
  },
  {
    id: 2,
    titulo: "Barba completa VIP",
    descripcion: "Barba perfilada con aceite premium",
    categoria: "Estilo",
    url: "https://i.imgur.com/TU_TRABAJO2.jpg",
    tipo: "image",
    barbero: "Jankel"
  },
  {
    id: 3,
    titulo: "Corte con mechas",
    descripcion: "Técnica de mechas con balayage moderno",
    categoria: "Químicos",
    url: "https://i.imgur.com/TU_TRABAJO3.jpg",
    tipo: "image",
    barbero: "Stiven"
  },
  // Agrega más trabajos aquí
]

export default function Trabajos() {
  const [filtro, setFiltro] = useState("Todos")   // ← Necesitamos useState

  const filtrados = filtro === "Todos"
    ? TRABAJOS
    : TRABAJOS.filter(t => t.categoria === filtro)

  return (
    <div className="bg-zinc-950 min-h-screen text-white pb-20">

      {/* Header */}
      <section className="pt-16 pb-8 px-6 text-center bg-gradient-to-b from-amber-500/10 to-transparent">
        <Link to="/" className="inline-flex items-center gap-2 text-amber-500 font-bold mb-6 hover:translate-x-[-5px] transition-transform">
          <FontAwesomeIcon icon={faArrowLeft} /> Volver al Inicio
        </Link>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
          Nuestros <span className="text-amber-500">Trabajos</span>
        </h1>
        <p className="text-zinc-500 mt-4 max-w-xl mx-auto font-medium lowercase italic">
          Excelencia y estilo en Torrejón de Ardoz
        </p>
      </section>

      {/* Filtros */}
      <nav className="flex justify-center gap-3 mt-8 flex-wrap px-4">
        {CATEGORIAS.map(cat => (
          <button
            key={cat}
            onClick={() => setFiltro(cat)}
            className={`px-5 py-2 rounded-full font-bold uppercase text-sm tracking-widest transition-colors ${
              filtro === cat
                ? "bg-amber-400 text-zinc-900"
                : "bg-zinc-800 text-zinc-400 hover:bg-amber-400 hover:text-zinc-900"
            }`}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Galería */}
      <motion.section className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 pb-16">
        {filtrados.length === 0 ? (
          <div className="col-span-full text-center py-32 text-zinc-600">
            <p className="text-5xl mb-4">✂️</p>
            <p className="font-bold">Sin trabajos en esta categoría aún</p>
          </div>
        ) : (
          filtrados.map((trabajo, index) => (
            <motion.div
              key={trabajo.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="relative h-64 overflow-hidden">
                {trabajo.tipo === 'video' ? (
                  <video
                    src={trabajo.url}
                    className="w-full h-full object-cover"
                    muted loop playsInline
                  />
                ) : (
                  <img
                    src={trabajo.url}
                    alt={trabajo.titulo}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                  />
                )}

                <div className="absolute top-4 left-4 bg-amber-400 text-zinc-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                  {trabajo.categoria}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-black mb-2">{trabajo.titulo}</h3>
                {trabajo.descripcion && (
                  <p className="text-zinc-400 flex-1 mb-4">{trabajo.descripcion}</p>
                )}
                {trabajo.barbero && (
                  <p className="text-amber-500 text-xs font-bold uppercase">✂️ {trabajo.barbero}</p>
                )}

                <div className="mt-auto flex items-center gap-1">
                  {[1,2,3,4,5].map(s => (
                    <FontAwesomeIcon key={s} icon={faStar} className="text-amber-400 text-sm" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </motion.section>
    </div>
  )
}