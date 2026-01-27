import { motion } from "framer-motion";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { faStar, faMapMarkerAlt, faClock, faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import latinosvip from "../assets/latinosvip.jpg";

export default function Inicio() {
  
  // Configuración del movimiento infinito
  const imagenesCarrusel = [latinosvip, latinosvip, latinosvip, latinosvip, latinosvip, latinosvip];

  return (
    <div className="bg-zinc-950 text-white min-h-screen overflow-x-hidden">
      
      {/* SECCIÓN HERO */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative pt-16 pb-10 text-center"
      >
        <div className="px-6">
            <motion.span 
              initial={{ y: 20 }} animate={{ y: 0 }}
              className="text-amber-500 font-bold tracking-[0.3em] uppercase text-xs"
            >
                The Ultimate Barber Experience
            </motion.span>
            <h1 className="text-6xl md:text-8xl font-black mt-4 leading-none tracking-tighter">
                LATINOS<span className="text-amber-500">VIP</span>
            </h1>
            <p className="text-zinc-500 mt-4 text-sm uppercase tracking-widest font-bold">
                Madrid - Torrejón de Ardoz
            </p>
        </div>

        {/* CARRUSEL INFINITO DE IMÁGENES */}
        <div className="relative mt-12 flex overflow-hidden border-y border-zinc-900 py-8 bg-zinc-900/20">
          <motion.div 
            className="flex gap-4 flex-nowrap"
            animate={{ x: [0, -1000] }} // Ajusta el -1000 según el ancho total de tus fotos
            transition={{ 
              x: { repeat: Infinity, repeatType: "loop", duration: 20, ease: "linear" } 
            }}
          >
            {/* Duplicamos las imágenes para que el loop sea perfecto */}
            {[...imagenesCarrusel, ...imagenesCarrusel].map((img, index) => (
              <div key={index} className="flex-shrink-0 w-64 h-80 md:w-80 md:h-[450px] overflow-hidden rounded-2xl border border-zinc-800 shadow-2xl">
                <img 
                  src={img} 
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" 
                  alt="Latinos VIP Work" 
                />
              </div>
            ))}
          </motion.div>
          
          {/* Degradado para desvanecer las orillas del carrusel */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-zinc-950 to-transparent z-10"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-zinc-950 to-transparent z-10"></div>
        </div>

        <motion.div className="mt-12 px-6">
            <Link 
              to="/" 
              className="bg-amber-500 hover:bg-amber-400 text-black font-black py-6 px-12 rounded-2xl text-xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.3)] inline-block uppercase"
            >
                Reserva tu Cita
            </Link>
        </motion.div>
      </motion.section>

      {/* INFO CARDS (BOOKSY STYLE) */}
      <section className="py-16 px-6 max-w-6xl mx-auto grid md:grid-cols-3 gap-6">
          <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-800">
              <div className="flex text-amber-500 mb-4">
                  {[1,2,3,4,5].map(s => <FontAwesomeIcon key={s} icon={faStar} className="text-xs" />)}
              </div>
              <h3 className="text-xl font-bold mb-2">Excelente Servicio</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">
                  Cortes con precisión extraordinaria y cambios de imagen que te harán sentir 100% identificado.
              </p>
          </div>

          <div className="bg-zinc-900/50 p-8 rounded-[2.5rem] border border-zinc-800 flex flex-col justify-between">
              <p className="text-zinc-300 italic">"Nuestros cortes no solo son obras de arte, son tu identidad."</p>
              <Link to="/nuestros/trabajos" className="mt-6 text-amber-500 font-bold text-xs uppercase tracking-widest hover:underline">
                  Ver Galería →
              </Link>
          </div>

          <a href="https://wa.me/34722335405" target="_blank" rel="noreferrer" 
             className="bg-amber-500 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-black group transition-all">
              <FontAwesomeIcon icon={faWhatsapp} className="text-5xl mb-4 group-hover:scale-110 transition-transform" />
              <span className="font-black text-2xl tracking-tighter">722 33 54 05</span>
              <span className="text-sm font-bold uppercase mt-1">Contáctanos</span>
          </a>
      </section>

      {/* FOOTER / UBICACIÓN */}
      <footer className="bg-zinc-900/20 py-16 border-t border-zinc-900">
        <div className="max-w-4xl mx-auto px-6 grid md:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex gap-4">
              <FontAwesomeIcon icon={faClock} className="text-amber-500 mt-1" />
              <div>
                <h4 className="font-bold uppercase text-xs tracking-widest text-zinc-400">Horarios VIP</h4>
                <p className="text-sm mt-2 text-zinc-300">Lun - Mié: 10:00 a 20:00</p>
                <p className="text-sm text-zinc-300">Jue - Sáb: 10:00 a 21:00</p>
                <p className="text-sm text-zinc-300 font-bold text-amber-500">Dom: 11:00 a 17:00</p>
              </div>
            </div>
            <div className="flex gap-4">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-amber-500 mt-1" />
              <div>
                <h4 className="font-bold uppercase text-xs tracking-widest text-zinc-400">Dirección</h4>
                <p className="text-sm mt-2 text-zinc-300">Calle Virgen del Pilar 11, Torrejón de Ardoz</p>
              </div>
            </div>
          </div>

          <div className="bg-black/40 p-8 rounded-[2rem] border border-zinc-800 text-center">
            <h4 className="font-black text-xl mb-4">¿Dudas o Consultas?</h4>
            <a href="tel:722335405" className="inline-block bg-white text-black font-black px-8 py-4 rounded-xl hover:bg-zinc-200 transition-colors uppercase text-sm">
                Llamar Ahora <FontAwesomeIcon icon={faPhone} className="ml-2" />
            </a>
          </div>    
        </div>
      </footer>
    </div>
  )
}