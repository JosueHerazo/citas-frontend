import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft, faStar, faPlus, faTrash, faSpinner, faTimes, faUpload } from "@fortawesome/free-solid-svg-icons"
import { getTrabajos, deleteTrabajo, type Trabajo } from "../services/ServiceTrabajos"
import axios from "axios"

const CATEGORIAS  = ["Todos", "Cortes", "Químicos", "Estilo", "Estética"]
const ADMIN_PASS  = "latinos2024"   // ← cambia esto

export default function Trabajos() {
    const [filtro,      setFiltro]      = useState("Todos")
    const [trabajos,    setTrabajos]    = useState<Trabajo[]>([])
    const [loading,     setLoading]     = useState(true)
    const [showAdmin,   setShowAdmin]   = useState(false)
    const [pass,        setPass]        = useState("")
    const [passError,   setPassError]   = useState(false)
    const [authed,      setAuthed]      = useState(false)
    
    const [uploading,   setUploading]   = useState(false)
    const [preview,     setPreview]     = useState<string | null>(null)
    const [fileType,    setFileType]    = useState<'image' | 'video'>('image')
    const fileRef = useRef<HTMLInputElement>(null)

    const [form, setForm] = useState({
        titulo:      "",
        descripcion: "",
        categoria:   "Cortes",
        barbero:     "",
        archivo:     null as File | null
    })

    useEffect(() => {
        cargarTrabajos()
    }, [])

    async function cargarTrabajos() {
        setLoading(true)
        const data = await getTrabajos()
        setTrabajos(data)
        setLoading(false)
    }

    const filtrados = filtro === "Todos"
        ? trabajos
        : trabajos.filter(t => t.categoria === filtro)

    // ── Admin auth ────────────────────────────────────────────
    const handlePass = () => {
        if (pass === ADMIN_PASS) { setAuthed(true); setPassError(false); setShowAdmin(true) }
        else { setPassError(true) }
    }

    // ── File picker ───────────────────────────────────────────
    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        setForm(f => ({ ...f, archivo: file }))
        setFileType(file.type.startsWith('video') ? 'video' : 'image')
        const url = URL.createObjectURL(file)
        setPreview(url)
    }

    // ── Subir trabajo ─────────────────────────────────────────
    const handleSubir = async () => {
    if (!form.archivo || !form.titulo) return
    setUploading(true)
    try {
        const reader = new FileReader()
        reader.onload = async (e) => {
            const base64 = e.target?.result as string
            await axios.post(
                `${import.meta.env.VITE_API_URL}/api/date/trabajos`,
                {
                    titulo:      form.titulo,
                    descripcion: form.descripcion,
                    categoria:   form.categoria,
                    barbero:     form.barbero,
                    imagen:      base64
                }
            )
            await cargarTrabajos()
            setForm({ titulo: '', descripcion: '', categoria: 'Cortes', barbero: '', archivo: null })
            setPreview(null)
        }
        reader.readAsDataURL(form.archivo)
    } catch (e) {
        console.error(e)
    } finally {
        setUploading(false)
    }
}

    // ── Borrar trabajo ────────────────────────────────────────
    const handleBorrar = async (id: number) => {
        if (!confirm('¿Eliminar este trabajo?')) return
        await deleteTrabajo(id)
        setTrabajos(prev => prev.filter(t => t.id !== id))
    }

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
                <p className="text-zinc-500 mt-4 max-w-xl mx-auto font-medium lowercase italic">
                    Excelencia y estilo en Torrejón de Ardoz
                </p>
                {/* Botón admin discreto */}
                <button
                    onClick={() => authed ? setShowAdmin(true) : setShowAdmin(true)}
                    className="mt-6 text-amber-400 hover:text-amber-300 text-sm font-bold transition-colors border border-amber-400/30 px-3 py-1 rounded-full"
                >
                    ⚙️ admin
                </button>
            </section>

            {/* Modal contraseña admin */}
            <AnimatePresence>
                {showAdmin && !authed && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
                        onClick={e => { if (e.target === e.currentTarget) setShowAdmin(false) }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 w-full max-w-sm"
                        >
                            <h3 className="text-amber-400 font-black text-lg mb-6 text-center">🔐 Acceso Admin</h3>
                            <input
                                type="password"
                                value={pass}
                                onChange={e => setPass(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handlePass()}
                                placeholder="Contraseña"
                                className="w-full bg-zinc-900 border-2 border-zinc-800 rounded-2xl p-4 text-white outline-none focus:border-amber-400 transition-colors mb-3"
                            />
                            {passError && <p className="text-red-400 text-xs mb-3 text-center">Contraseña incorrecta</p>}
                            <button
                                onClick={handlePass}
                                className="w-full bg-amber-400 text-black font-black py-3 rounded-2xl"
                            >Entrar</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Panel admin (autenticado) */}
            <AnimatePresence>
                {showAdmin && authed && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4"
                        onClick={e => { if (e.target === e.currentTarget) setShowAdmin(false) }}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-amber-400 font-black text-lg">📸 Subir Trabajo</h3>
                                <button onClick={() => setShowAdmin(false)} className="text-zinc-500 hover:text-white w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center">
                                    <FontAwesomeIcon icon={faTimes} />
                                </button>
                            </div>

                            {/* Zona de archivo */}
                            <div
                                onClick={() => fileRef.current?.click()}
                                className="border-2 border-dashed border-zinc-700 hover:border-amber-400 rounded-2xl p-6 text-center cursor-pointer transition-colors mb-4"
                            >
                                {preview ? (
                                    fileType === 'image'
                                        ? <img src={preview} className="w-full h-48 object-cover rounded-xl" />
                                        : <video src={preview} className="w-full h-48 object-cover rounded-xl" controls />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-zinc-500">
                                        <FontAwesomeIcon icon={faUpload} className="text-3xl text-amber-400" />
                                        <p className="text-sm font-bold">Toca para seleccionar foto o video</p>
                                        <p className="text-xs">JPG, PNG, MP4, MOV · máx 100MB</p>
                                    </div>
                                )}
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*,video/*"
                                    capture="environment"
                                    className="hidden"
                                    onChange={handleFile}
                                />
                            </div>

                            {/* Campos del formulario */}
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Título *"
                                    value={form.titulo}
                                    onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-400"
                                />
                                <input
                                    type="text"
                                    placeholder="Descripción (opcional)"
                                    value={form.descripcion}
                                    onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-400"
                                />
                                <select
                                    value={form.categoria}
                                    onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-400"
                                >
                                    {["Cortes", "Químicos", "Estilo", "Estética"].map(c => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Barbero (opcional)"
                                    value={form.barbero}
                                    onChange={e => setForm(f => ({ ...f, barbero: e.target.value }))}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white text-sm outline-none focus:border-amber-400"
                                />
                            </div>

                            <button
                                onClick={handleSubir}
                                disabled={uploading || !form.archivo || !form.titulo}
                                className="w-full mt-5 bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors"
                            >
                                {uploading
                                    ? <><FontAwesomeIcon icon={faSpinner} className="animate-spin" /> Subiendo...</>
                                    : <><FontAwesomeIcon icon={faUpload} /> Publicar Trabajo</>
                                }
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Categorías */}
            <nav className="flex justify-center gap-3 mt-8 flex-wrap px-4">
                {CATEGORIAS.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFiltro(cat)}
                        className={`px-4 py-2 rounded-full font-bold uppercase text-sm tracking-widest transition-colors ${
                            filtro === cat
                                ? "bg-amber-400 text-zinc-900"
                                : "bg-zinc-800 text-zinc-400 hover:bg-amber-400 hover:text-zinc-900"
                        }`}
                    >{cat}</button>
                ))}
            </nav>

            {/* Galería */}
            {loading ? (
                <div className="flex justify-center items-center py-32">
                    <FontAwesomeIcon icon={faSpinner} className="text-amber-400 text-4xl animate-spin" />
                </div>
            ) : filtrados.length === 0 ? (
                <div className="text-center py-32 text-zinc-600">
                    <p className="text-5xl mb-4">✂️</p>
                    <p className="font-bold">Sin trabajos en esta categoría aún</p>
                </div>
            ) : (
                <motion.section className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 pb-16">
                    <AnimatePresence mode="popLayout">
                        {filtrados.map(trabajo => (
                            <motion.div
                                key={trabajo.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                layout
                                className="bg-zinc-900/50 rounded-3xl border border-zinc-800 overflow-hidden shadow-2xl flex flex-col relative"
                            >
                                {/* Botón borrar (solo si autenticado) */}
                                {authed && (
                                    <button
                                        onClick={() => handleBorrar(trabajo.id)}
                                        className="absolute top-3 right-3 z-10 w-8 h-8 bg-red-500/80 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
                                    >
                                        <FontAwesomeIcon icon={faTrash} className="text-white text-xs" />
                                    </button>
                                )}

                                <div className="relative w-full h-64 overflow-hidden">
                                    {trabajo.tipo === 'video' ? (
                                        <video
                                            src={trabajo.url}
                                            className="w-full h-full object-cover"
                                            muted loop playsInline
                                            onMouseEnter={e => (e.target as HTMLVideoElement).play()}
                                            onMouseLeave={e => (e.target as HTMLVideoElement).pause()}
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
                                    {trabajo.tipo === 'video' && (
                                        <div className="absolute top-4 right-12 bg-zinc-900/80 text-white px-2 py-1 rounded-full text-xs font-bold">
                                            ▶ Video
                                        </div>
                                    )}
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-2xl font-black mb-2">{trabajo.titulo}</h3>
                                    {trabajo.descripcion && (
                                        <p className="text-zinc-400 flex-1">{trabajo.descripcion}</p>
                                    )}
                                    {trabajo.barbero && (
                                        <p className="text-zinc-600 text-xs mt-2 font-bold uppercase">✂️ {trabajo.barbero}</p>
                                    )}
                                    <div className="mt-4 flex items-center gap-1">
                                        {[1,2,3,4,5].map(s => (
                                            <FontAwesomeIcon key={s} icon={faStar} className="text-amber-400 text-sm" />
                                        ))}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.section>
            )}

            {/* FAB para subir (solo admin autenticado) */}
            {authed && (
                <button
                    onClick={() => setShowAdmin(true)}
                    className="fixed bottom-8 right-8 w-16 h-16 bg-amber-400 text-black rounded-full shadow-2xl flex items-center justify-center text-2xl hover:bg-amber-500 transition-colors z-40"
                >
                    <FontAwesomeIcon icon={faPlus} />
                </button>
            )}
        </div>
    )
}