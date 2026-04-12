import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { getBarberosDB } from "../services/ServiceDates"
import { getTrabajos, type Trabajo } from "../services/ServiceTrabajos"

type Barbero = { id: string | number; nombre: string; foto?: string | null }

const CATEGORIAS = ["Todos", "Cortes", "Químicos", "Estilo", "Estética"]

export default function Barberos() {
    const [barberos,  setBarberos]  = useState<Barbero[]>([])
    const [trabajos,  setTrabajos]  = useState<Trabajo[]>([])
    const [selected,  setSelected]  = useState<string | null>(null)
    const [filtro,    setFiltro]    = useState("Todos")
    const [loading,   setLoading]   = useState(true)

    useEffect(() => {
        Promise.all([getBarberosDB(), getTrabajos()]).then(([b, t]) => {
            setBarberos(b)
            setTrabajos(t)
            setLoading(false)
        })
    }, [])

    const trabajosFiltrados = trabajos.filter(t => {
        const porCategoria = filtro === "Todos" || t.categoria === filtro
        const porBarbero   = !selected || t.barbero?.toLowerCase() === selected.toLowerCase()
        return porCategoria && porBarbero
    })

    return (
        <div className="min-h-screen bg-zinc-950 text-white pb-20">
            <section className="pt-16 pb-8 px-6 text-center bg-gradient-to-b from-amber-500/10 to-transparent">
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
                    Nuestros <span className="text-amber-500">Barberos</span>
                </h1>
                <p className="text-zinc-500 mt-4 font-medium lowercase italic">
                    Elige tu especialista favorito
                </p>
            </section>

            {/* Barberos */}
            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-amber-400 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : (
                <div className="flex gap-6 justify-center flex-wrap px-6 mt-4">
                    <div
                        onClick={() => setSelected(null)}
                        className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${!selected ? "scale-110" : "opacity-50"}`}
                    >
                        <div className={`w-16 h-16 rounded-full bg-zinc-800 border-2 flex items-center justify-center text-2xl font-black text-amber-500 ${!selected ? "border-amber-500" : "border-zinc-700"}`}>
                            ✂️
                        </div>
                        <span className={`text-[10px] font-black ${!selected ? "text-amber-500" : "text-zinc-500"}`}>Todos</span>
                    </div>

                    {barberos.map(b => (
                        <motion.div key={b.id}
                            onClick={() => setSelected(selected === b.nombre ? null : b.nombre)}
                            whileTap={{ scale: 0.95 }}
                            className={`flex flex-col items-center gap-2 cursor-pointer transition-all ${selected === b.nombre ? "scale-110" : "opacity-50 hover:opacity-80"}`}
                        >
                            <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${selected === b.nombre ? "border-amber-500" : "border-zinc-700"}`}>
                                {b.foto
                                    ? <img src={b.foto} className="w-full h-full object-cover" />
                                    : <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-2xl font-black text-amber-500">
                                        {b.nombre[0]?.toUpperCase()}
                                      </div>
                                }
                            </div>
                            <span className={`text-[10px] font-black ${selected === b.nombre ? "text-amber-500" : "text-zinc-500"}`}>{b.nombre}</span>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Filtro categorías */}
            <nav className="flex justify-center gap-3 mt-8 flex-wrap px-4">
                {CATEGORIAS.map(cat => (
                    <button key={cat} onClick={() => setFiltro(cat)}
                        className={`px-4 py-2 rounded-full font-bold uppercase text-sm tracking-widest transition-colors ${
                            filtro === cat ? "bg-amber-400 text-zinc-900" : "bg-zinc-800 text-zinc-400 hover:bg-amber-400 hover:text-zinc-900"
                        }`}>{cat}</button>
                ))}
            </nav>

            {/* Galería trabajos */}
            {trabajosFiltrados.length === 0 ? (
                <div className="text-center py-20 text-zinc-600">
                    <p className="text-5xl mb-4">✂️</p>
                    <p className="font-bold">Sin trabajos aún</p>
                </div>
            ) : (
                <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-6">
                    {trabajosFiltrados.map(t => (
                        <motion.div key={t.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                            className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden shadow-xl">
                            <div className="relative w-full h-64 overflow-hidden">
                                {t.tipo === 'video'
                                    ? <video src={t.url} className="w-full h-full object-cover" muted loop playsInline
                                        onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                                        onMouseLeave={e => (e.target as HTMLVideoElement).pause()} />
                                    : <img src={t.url} alt={t.titulo} className="w-full h-full object-cover hover:scale-110 transition-transform duration-700" />
                                }
                                <div className="absolute top-4 left-4 bg-amber-400 text-zinc-900 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                    {t.categoria}
                                </div>
                            </div>
                            <div className="p-5">
                                <h3 className="text-xl font-black mb-1">{t.titulo}</h3>
                                {t.descripcion && <p className="text-zinc-400 text-sm">{t.descripcion}</p>}
                                {t.barbero && <p className="text-zinc-600 text-xs mt-2 font-bold uppercase">✂️ {t.barbero}</p>}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    )
}