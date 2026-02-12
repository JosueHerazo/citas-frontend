import { useState } from "react";
import { useLoaderData, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faStar } from "@fortawesome/free-solid-svg-icons";

const CATEGORIAS = ["Todos", "Cortes", "Químicos", "Estilo", "Estética"];

export default function Trabajos() {
  // 1. Extraemos los datos de forma segura
  const response = useLoaderData() as any;
  const posts = response?.data || response || []; 

  const [filtro, setFiltro] = useState("Todos");

  // 2. Si posts no es un array (por error de carga), evitamos el crash
  const filtrados = Array.isArray(posts) 
    ? (filtro === "Todos" ? posts : posts.filter((p: any) => p.category === filtro))
    : [];

  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      
      {/* Header */}
      <section className="pt-16 pb-8 px-6 text-center bg-gradient-to-b from-amber-500/10 to-transparent">
        <Link to="/" className="inline-flex items-center gap-2 text-amber-500 font-bold mb-6 hover:translate-x-[-5px] transition-transform">
          <FontAwesomeIcon icon={faArrowLeft} /> Volver al Inicio
        </Link>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
          Nuestros <span className="text-amber-500">Trabajos</span>
        </h1>
        <p className="text-zinc-500 mt-4 max-w-xl mx-auto font-medium italic">
          Galería real actualizada desde la barbería
        </p>
      </section>

      {/* Nav de Filtros */}
      <nav className="flex justify-center gap-4 mt-8 flex-wrap px-4">
        {CATEGORIAS.map(cat => (
          <button     
            key={cat}
            onClick={() => setFiltro(cat)}
            className={`px-4 py-2 rounded-full font-bold uppercase text-sm tracking-widest transition-colors ${ 
              filtro === cat    
                ? "bg-amber-400 text-zinc-900"
                : "bg-zinc-800 text-zinc-400"
            }`}     
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Galería Dinámica */}
      <motion.section className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 pb-16">
        <AnimatePresence mode="popLayout">
          {filtrados.length > 0 ? (
            filtrados.map((trabajo: any) => (
              <motion.div 
                key={trabajo.id}   
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden flex flex-col"    
              >
                <div className="relative w-full h-80 overflow-hidden">
                  {trabajo.type === 'video' ? (
                      <video src={trabajo.url} className="w-full h-full object-cover" muted loop onMouseEnter={e => e.currentTarget.play()} onMouseLeave={e => e.currentTarget.pause()}/>
                  ) : (
                      <img src={trabajo.url} alt={trabajo.description} className="w-full h-full object-cover" />
                  )}
                  <div className="absolute top-4 left-4 bg-amber-400 text-zinc-900 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {trabajo.category || 'General'}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">@{trabajo.clientName}</h3>
                  <p className="text-zinc-400 text-sm">{trabajo.description}</p>
                  <div className="mt-4 flex items-center gap-1">      
                    {[1,2,3,4,5].map(s => <FontAwesomeIcon key={s} icon={faStar} className="text-amber-400 text-[10px]" />)}
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-zinc-700 font-bold uppercase">
              No hay trabajos publicados en esta categoría
            </div>
          )}
        </AnimatePresence>
      </motion.section>
    </div>
  );
}