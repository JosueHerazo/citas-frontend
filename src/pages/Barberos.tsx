// src/pages/Barberos.tsx  (o donde lo tengas)

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { 
  faArrowLeft, faPlus, faTrash, faSpinner, 
  faTimes, faEdit 
} from "@fortawesome/free-solid-svg-icons"

import { 
  getBarberosDB, 
  addBarbero, 
  updateBarbero, 
  deleteBarbero 
} from "../services/ServiceDates"  // ← tu servicio de dates

type Barber = { 
  id: number | string; 
  nombre: string; 
  foto?: string | null 
}

const ADMIN_PASS = "latinos2024"  // ← cámbialo

export default function Barberos() {
    const [barbers, setBarbers] = useState<Barber[]>([])
    const [loading, setLoading] = useState(true)
    const [showAdmin, setShowAdmin] = useState(false)
    const [authed, setAuthed] = useState(false)
    const [pass, setPass] = useState("")
    const [passError, setPassError] = useState(false)

    const [newName, setNewName] = useState("")
    const [editingId, setEditingId] = useState<number | string | null>(null)
    const [saving, setSaving] = useState(false)

    const fileInputRef = useRef<HTMLInputElement>(null)

    // Cargar barberos
    useEffect(() => {
        cargarBarberos()
    }, [])

    async function cargarBarberos() {
        setLoading(true)
        const list = await getBarberosDB()
        const filtered = list
            .filter((b: any) => (b.nombre || b.name || "").toLowerCase() !== "vato")
            .map((b: any) => ({
                id: b.id,
                nombre: b.nombre || b.name || "?",
                foto: b.foto || b.photo || null,
            }))
        setBarbers(filtered)
        setLoading(false)
    }

    // Auth admin
    const handlePass = () => {
        if (pass === ADMIN_PASS) {
            setAuthed(true)
            setPassError(false)
            setShowAdmin(true)
        } else {
            setPassError(true)
        }
    }

    // Cambiar foto (desde móvil también funciona)
    const handleChangePhoto = async (id: number | string, file: File) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
            const base64 = e.target?.result as string
            setSaving(true)

            // Actualizar UI inmediatamente
            setBarbers(prev => prev.map(b => 
                b.id === id ? { ...b, foto: base64 } : b
            ))

            try {
                await updateBarbero(id, { foto: base64 })
                // Recargar para confirmar persistencia
                await cargarBarberos()
            } catch (err) {
                console.error("Error guardando foto:", err)
                alert("Error al guardar la foto. Inténtalo de nuevo.")
            } finally {
                setSaving(false)
                setEditingId(null)
            }
        }
        reader.readAsDataURL(file)
    }

    // Agregar nuevo barbero
    const handleAddBarber = async () => {
        const nombre = newName.trim()
        if (!nombre) return
        if (barbers.some(b => b.nombre.toLowerCase() === nombre.toLowerCase())) {
            alert("Ese barbero ya existe")
            return
        }

        setSaving(true)
        const created = await addBarbero(nombre)
        if (created) {
            setBarbers(prev => [...prev, {
                id: created.id,
                nombre: created.nombre,
                foto: created.foto || null
            }])
            setNewName("")
        } else {
            alert("Error al agregar barbero")
        }
        setSaving(false)
    }

    // Borrar barbero (solo admin)
    const handleDelete = async (id: number | string) => {
        if (!confirm(`¿Eliminar a ${barbers.find(b => b.id === id)?.nombre}?`)) return
        const success = await deleteBarbero(id)
        if (success) {
            setBarbers(prev => prev.filter(b => b.id !== id))
        } else {
            alert("No se pudo eliminar")
        }
    }

    return (
        <div className="bg-zinc-950 min-h-screen text-white pb-20">
            {/* Header estilo Trabajos */}
            <section className="pt-16 pb-8 px-6 text-center bg-gradient-to-b from-amber-500/10 to-transparent">
                <Link to="/" className="inline-flex items-center gap-2 text-amber-500 font-bold mb-6 hover:translate-x-[-5px] transition-transform">
                    <FontAwesomeIcon icon={faArrowLeft} /> Volver
                </Link>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter">
                    Nuestros <span className="text-amber-500">Barberos</span>
                </h1>
                <p className="text-zinc-500 mt-4 max-w-xl mx-auto font-medium lowercase italic">
                    El equipo que hace magia en Torrejón de Ardoz
                </p>

                {/* Botón admin discreto */}
                <button
                    onClick={() => setShowAdmin(true)}
                    className="mt-6 text-amber-400 hover:text-amber-300 text-sm font-bold transition-colors border border-amber-400/30 px-3 py-1 rounded-full"
                >
                    ⚙️ Gestionar Barberos
                </button>
            </section>

            {/* Modal contraseña */}
            <AnimatePresence>
                {showAdmin && !authed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
                        onClick={e => e.target === e.currentTarget && setShowAdmin(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm"
                        >
                            <h3 className="text-amber-400 font-black text-lg mb-6 text-center">🔐 Acceso Admin</h3>
                            <input
                                type="password"
                                value={pass}
                                onChange={e => setPass(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handlePass()}
                                placeholder="Contraseña"
                                className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-4 text-white outline-none focus:border-amber-400 mb-3"
                            />
                            {passError && <p className="text-red-400 text-xs text-center">Contraseña incorrecta</p>}
                            <button onClick={handlePass} className="w-full bg-amber-400 text-black font-black py-3 rounded-2xl">
                                Entrar
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal gestión (solo si autenticado) */}
            <AnimatePresence>
                {showAdmin && authed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
                        onClick={e => e.target === e.currentTarget && setShowAdmin(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-amber-400 font-black text-lg">Gestionar Barberos</h3>
                                <button onClick={() => setShowAdmin(false)} className="text-zinc-500 hover:text-white">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            {/* Lista de barberos en admin */}
                            <div className="space-y-4 mb-8">
                                {barbers.map(b => (
                                    <div key={b.id} className="flex items-center gap-4 bg-zinc-900 border border-zinc-800 rounded-2xl p-4">
                                        <div 
                                            className="relative w-16 h-16 rounded-full overflow-hidden cursor-pointer border-2 border-zinc-700"
                                            onClick={() => { setEditingId(b.id); fileInputRef.current?.click() }}
                                        >
                                            {b.foto ? (
                                                <img src={b.foto} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-3xl font-black text-amber-500">
                                                    {b.nombre[0]?.toUpperCase()}
                                                </div>
                                            )}
                                            <div className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                ✏️
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-lg">{b.nombre}</p>
                                        </div>
                                        <button 
                                            onClick={() => handleDelete(b.id)}
                                            className="text-red-500 hover:text-red-400 p-2"
                                        >
                                            <FontAwesomeIcon icon={faTrash} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Agregar nuevo */}
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="Nombre del nuevo barbero"
                                    className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white outline-none focus:border-amber-400"
                                    onKeyDown={e => e.key === "Enter" && handleAddBarber()}
                                />
                                <button 
                                    onClick={handleAddBarber}
                                    disabled={!newName.trim() || saving}
                                    className="bg-amber-400 disabled:bg-zinc-700 text-black font-black px-6 rounded-xl"
                                >
                                    {saving ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPlus} />}
                                </button>
                            </div>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={e => {
                                    const file = e.target.files?.[0]
                                    if (file && editingId !== null) handleChangePhoto(editingId, file)
                                    e.target.value = ""
                                }}
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Galería de barberos (pública) */}
            {loading ? (
                <div className="flex justify-center py-32">
                    <FontAwesomeIcon icon={faSpinner} className="text-amber-400 text-4xl animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 pt-10">
                    <AnimatePresence mode="popLayout">
                        {barbers.map(barber => (
                            <motion.div
                                key={barber.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-zinc-900/70 border border-zinc-800 rounded-3xl overflow-hidden group"
                            >
                                <div className="relative h-80 overflow-hidden">
                                    {barber.foto ? (
                                        <img 
                                            src={barber.foto} 
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" 
                                            alt={barber.nombre}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-[120px] font-black text-amber-500/30">
                                            {barber.nombre[0]?.toUpperCase()}
                                        </div>
                                    )}
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent h-32" />
                                </div>

                                <div className="p-6">
                                    <h3 className="text-3xl font-black text-amber-400">{barber.nombre}</h3>
                                    <p className="text-zinc-500 text-sm mt-1">Barbero profesional</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {/* FAB para admin */}
            {authed && (
                <button
                    onClick={() => setShowAdmin(true)}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-amber-400 text-black rounded-full shadow-2xl flex items-center justify-center text-3xl hover:bg-amber-500 transition-all active:scale-95 z-40"
                >
                    <FontAwesomeIcon icon={faEdit} />
                </button>
            )}
        </div>
    )
}