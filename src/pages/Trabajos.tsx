import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faStar, faScissors, faMagicWandSparkles, faUserTie } from "@fortawesome/free-solid-svg-icons";

const SERVICIOS_GALERIA = [
  { id: 1, titulo: "Corte Tradicional", categoria: "Cortes", imagen: "https://images.unsplash.com/photo-1599351431247-f10b21817021?q=80&w=600", desc: "Precisión y estilo clásico." },
  { id: 2, titulo: "Corte con Barba VIP", categoria: "Cortes", imagen: "https://images.unsplash.com/photo-1621605815841-2dddb39744c8?q=80&w=600", desc: "El paquete completo para el caballero." },
  { id: 3, titulo: "Mechas Platinum", categoria: "Químicos", imagen: "https://images.unsplash.com/photo-1620331311520-246422fd82f9?q=80&w=600", desc: "Tendencia y color de alta gama." },
  { id: 4, titulo: "Trenzas Africanas", categoria: "Estilo", imagen: "https://images.unsplash.com/photo-1646245106401-443b35069f0e?q=80&w=600", desc: "Diseños exclusivos y duraderos." },
  { id: 5, titulo: "Limpieza Facial Profunda", categoria: "Estética", imagen: "https://images.unsplash.com/photo-1556760544-74068565f08c?q=80&w=600", desc: "Cuidado profesional para tu piel." },
  { id: 6, titulo: "Tinte Profesional", categoria: "Químicos", imagen: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?q=80&w=600", desc: "Cobertura total y brillo intenso." },
  { id: 7, titulo: "Diseño Freestyle", categoria: "Cortes", imagen: "https://images.unsplash.com/photo-1593702295094-0498a4bc6061?q=80&w=600", desc: "Arte plasmado en tu cabello." },
  { id: 8, titulo: "Máscara de Carbón", categoria: "Estética", imagen: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?q=80&w=600", desc: "Elimina impurezas al instante." },
  { id: 9, titulo: "Corte Niño", categoria: "Cortes", imagen: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?q=80&w=600", desc: "Para los más pequeños de la casa." },
];

const CATEGORIAS = ["Todos", "Cortes", "Químicos", "Estilo", "Estética"];

export default function Trabajos() {
  const [filtro, setFiltro] = useState("Todos");

  const filtrados = filtro === "Todos" 
    ? SERVICIOS_GALERIA 
    : SERVICIOS_GALERIA.filter(s => s.categoria === filtro);

  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      
      {/* Header Fijo/Relativo */}
      <section className="pt-16 pb-8 px-6 text-center bg-gradient-to-b from-amber-500/10 to-transparent">
        <Link to="/" className="inline-flex items-center gap-2 text-amber-500 font-bold mb-6 hover:translate-x-[-5px] transition-transform">
          <FontAwesomeIcon icon={faArrowLeft} /> Volver al Inicio
        </Link>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">Nuestros <span className="text-amber-500">Servicios</span></h1>
        <p className="text-zinc-500 mt-4 max-w-xl mx-auto font-medium lowercase italic">Transformando tu imagen con la excelencia de Torrejón de Ardoz</p>
      </section>

      {/* Filtros de Categoría */}

      <nav className="flex justify-center gap-4 mt-8 flex-wrap px-4">
        {CATEGORIAS.map(cat => (
          <button     
            key={cat}
            onClick={() => setFiltro(cat)}
            className={`px-4 py-2 rounded-full font-bold uppercase text-sm tracking-widest transition-colors ${ 
              filtro === cat    
                ? "bg-amber-400 text-zinc-900 shadow-lg"
                : "bg-zinc-800 text-zinc-400 hover:bg-amber-400 hover:text-zinc-900"
            }`}     
          >
            {cat}
          </button>
        ))}
      </nav>        
      {/* Galería de Servicios */}  
      <motion.section 
        className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 pb-16"
      >     
        <AnimatePresence>   

          {filtrados.map(servicio => (
            <motion.div 
              key={servicio.id}   
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }}

              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}  
              className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col"    
            >
              <div className="relative w-full h-64 overflow-hidden">
                <img 
                  src={servicio.imagen}
                  alt={servicio.titulo}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 bg-amber-400 text-zinc-900 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest shadow-md">   
                  {servicio.categoria}
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-2xl font-black mb-2">{servicio.titulo}</h3>
                <p className="text-zinc-400 flex-1">{servicio.desc}</p>
                <div className="mt-4 flex items-center gap-3">      
                  {[1,2,3,4,5].map(s => <FontAwesomeIcon key={s} icon={faStar} className="text-amber-400 text-sm" />)}
                </div>
              </div>  
            </motion.div>
          ))}     
        </AnimatePresence>
      </motion.section>
    </div>
  );
} 