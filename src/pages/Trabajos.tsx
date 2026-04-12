// src/pages/Trabajos.tsx
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faStar } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"

type Trabajo = {
  id: number
  titulo: string
  descripcion?: string
  categoria: string
  url: string
  tipo: 'image' | 'video'
  barbero?: string
}

const CATEGORIAS = ["Todos", "Cortes", "Químicos", "Estilo", "Estética"]

const TRABAJOS: Trabajo[] = [
  {
    id: 1,
    titulo: "Fade con diseño",
    descripcion: "Corte fade con línea y diseño geométrico",
    categoria: "Cortes",
    url: "https://i.imgur.com/TU_IMAGEN1.jpg",
    tipo: "image",
    barbero: "Josue"
  },
  {
    id: 2,
    titulo: "Barba VIP completa",
    descripcion: "Barba perfilada con aceite premium",
    categoria: "Estilo",
    url: "https://i.imgur.com/TU_IMAGEN2.jpg",
    tipo: "image",
    barbero: "Jankel"
  },
  {
    id: 3,
    titulo: "Corte con mechas",
    descripcion: "Técnica de mechas con balayage moderno",
    categoria: "Químicos",
    url: "https://i.imgur.com/TU_IMAGEN3.jpg",
    tipo: "image",
    barbero: "Stiven"
  },
]

export default function Trabajos() {
  const [filtro, setFiltro] = useState("Todos")
  const filtrados = filtro === "Todos" ? TRABAJOS : TRABAJOS.filter(t => t.categoria === filtro)

  return (
    <div className="bg-zinc-950 min-h-screen text-white pb-24">
      <section className="pt-16 pb-8 px-6 text-center bg-gradient-to-b from-amber-500/10 to-transparent">
        <Link to="/" className="inline-flex items-center gap-2 text-amber-500 text-sm font-bold mb-8 hover:-translate-x-1 transition-transform">
          <FontAwesomeIcon icon={faArrowLeft} /> Volver al Inicio
        </Link>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
          Nuestros <span className="text-amber-500">Trabajos</span>
        </h1>
        <p className="text-zinc-500 mt-4 max-w-xl mx-auto text-sm lowercase italic">
          Excelencia y estilo en Torrejón de Ardoz
        </p>
        <a href="https://instagram.com/latinosvip1" target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 mt-6 text-[10px] font-black uppercase text-zinc-500 hover:text-amber-400 transition-colors border border-zinc-800 hover:border-amber-400/40 px-4 py-2 rounded-full tracking-widest">
          Ver más en @latinosvip1
        </a>
      </section>

      <nav className="flex justify-center gap-2 mt-4 flex-wrap px-4">
        {CATEGORIAS.map(cat => (
          <button key={cat} onClick={() => setFiltro(cat)}
            className={`px-5 py-2 rounded-full font-bold uppercase text-xs tracking-widest transition-colors ${
              filtro === cat ? "bg-amber-400 text-zinc-900" : "bg-zinc-900 text-zinc-400 border border-zinc-800 hover:border-amber-400/40 hover:text-amber-400"
            }`}>{cat}</button>
        ))}
      </nav>

      <div className="mt-10 px-4 md:px-8 max-w-6xl mx-auto">
        {filtrados.length === 0 ? (
          <div className="text-center py-32 text-zinc-600">
            <p className="text-5xl mb-4">✂️</p>
            <p className="font-bold">Sin trabajos en esta categoría aún</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filtrados.map((trabajo, index) => (
                <motion.div key={trabajo.id} layout
                  initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }} transition={{ delay: index * 0.04 }}
                  className="group bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
                  <div className="relative h-64 overflow-hidden bg-zinc-800">
                    {trabajo.tipo === 'video' ? (
                      <video src={trabajo.url} className="w-full h-full object-cover" muted loop playsInline
                        onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                        onMouseLeave={e => (e.target as HTMLVideoElement).pause()} />
                    ) : (
                      <img src={trabajo.url} alt={trabajo.titulo}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    )}
                    <div className="absolute top-4 left-4 bg-amber-400/90 text-zinc-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                      {trabajo.categoria}
                    </div>
                    {trabajo.tipo === 'video' && (
                      <div className="absolute top-4 right-4 bg-zinc-900/80 text-white px-2 py-1 rounded-full text-[10px] font-bold">▶ Video</div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="text-xl font-black mb-1">{trabajo.titulo}</h3>
                    {trabajo.descripcion && <p className="text-zinc-400 text-sm mb-3">{trabajo.descripcion}</p>}
                    <div className="flex items-center justify-between">
                      {trabajo.barbero && <span className="text-zinc-600 text-[10px] font-black uppercase">✂️ {trabajo.barbero}</span>}
                      <div className="flex items-center gap-0.5 ml-auto">
                        {[1,2,3,4,5].map(s => <FontAwesomeIcon key={s} icon={faStar} className="text-amber-400 text-xs" />)}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}