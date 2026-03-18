import { Form, type ActionFunctionArgs, redirect, useSubmit } from "react-router-dom"
import { useEffect, useState, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { addProduct, getBarberAvailability } from "../services/ServiceDates"
import DatePicker from "../components/CustomDatePicker"
import josuePerfil from "../assets/josuePerfil.jpeg"
import vatoPerfil from "../assets/vatoPerfil.jpeg"

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)
    if (Object.values(data).includes("")) return "Todos los campos son obligatorios"
    try {
        await addProduct(data)
        return redirect("/nuevo/inicio")
    } catch (error) {
        return "Error al guardar la cita"
    }
}

const API = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || ""

async function getConfig(clave: string) {
    const res = await fetch(`${API}/api/config`)
    const data = await res.json()
    return data[clave] ?? null
}

async function saveConfig(clave: string, valor: unknown) {
    await fetch(`${API}/api/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clave, valor })
    })
}

const BARBEROS_BASE = [
    { id: "Josue", nombre: "Josue", foto: josuePerfil },
    { id: "Vato",  nombre: "Vato",  foto: vatoPerfil  },
{ id: "Stiven", nombre: "Stiven", foto: stivenPerfil },
    { id: "Will",  nombre: "Will",  foto:  willPerfil },
]
]

const SERVICIOS_DEFAULT = [
    { service: "Corte",                price: 13, duration: 30 },
    { service: "Corte con cejas",      price: 15, duration: 40 },
    { service: "Corte con barba",      price: 18, duration: 50 },
    { service: "Corte Vip",            price: 25, duration: 70 },
    { service: "Barba",                price: 8,  duration: 15 },
    { service: "Barba VIP",            price: 11, duration: 25 },
    { service: "Cejas",                price: 5,  duration: 10 },
    { service: "Mechas",               price: 30, duration: 60 },
    { service: "Tinte",                price: 30, duration: 60 },
    { service: "Trenzas",              price: 20, duration: 45 },
    { service: "Mask Carbon",          price: 3,  duration: 10 },
    { service: "Limpieza Facial",      price: 15, duration: 25 },
    { service: "Diseño",               price: 3,  duration: 10 },
    { service: "Lavado de Cabello",    price: 2,  duration: 10 },
    { service: "Rizos semipermanente", price: 0,  duration: 2  },
    { service: "Otros",                price: 0,  duration: 0  },
]

type Barbero = { id: string; nombre: string; foto: string }

export default function ListDate() {
    const submit       = useSubmit()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [selectedDate,          setSelectedDate]          = useState<Date | null>(null)
    const [price,                 setPrice]                 = useState<number | string>("")
    const [service,               setService]               = useState("")
    const [barber,                setBarber]                = useState("")
    const [busySlots,             setBusySlots]             = useState<any[]>([])
    const [currentDuration,       setCurrentDuration]       = useState(30)
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)
    const [clientName,            setClientName]            = useState(localStorage.getItem("cliente_nombre")    || "")
    const [clientPhone,           setClientPhone]           = useState(localStorage.getItem("cliente_telefono") || "")
    const [barberos,              setBarberos]              = useState<Barbero[]>(BARBEROS_BASE)
    const [servicios,             setServicios]             = useState(SERVICIOS_DEFAULT)
    const [loadingCfg,            setLoadingCfg]            = useState(true)
    const [showModal,             setShowModal]             = useState(false)
    const [editandoId,            setEditandoId]            = useState<string | null>(null)
    const [saving,                setSaving]                = useState(false)
    const [nuevoNombre,           setNuevoNombre]           = useState("")
    const [editNombres,           setEditNombres]           = useState<Record<string, string>>({})

    useEffect(() => {
        async function cargarConfig() {
            try {
                const [barberData, serviceData] = await Promise.all([
                    getConfig("barberos"),
                    getConfig("servicios")
                ])
                if (Array.isArray(barberData)  && barberData.length  > 0) setBarberos(barberData)
                if (Array.isArray(serviceData) && serviceData.length > 0) setServicios(serviceData)
            } catch (e) {
                console.warn("Config no disponible, usando defaults", e)
            } finally {
                setLoadingCfg(false)
            }
        }
        cargarConfig()
    }, [])

    useEffect(() => {
        if (showModal) {
            const mapa: Record<string, string> = {}
            barberos.forEach(b => { mapa[b.id] = b.nombre })
            setEditNombres(mapa)
        }
    }, [showModal])

    const persistirBarberos = async (lista: Barbero[]) => {
        setBarberos(lista)
        setSaving(true)
        try {
            await saveConfig("barberos", lista)
        } catch (e) {
            console.error("Error guardando barberos", e)
        } finally {
            setSaving(false)
        }
    }

    const handleAñadir = async () => {
        if (!nuevoNombre.trim()) return
        const nuevo: Barbero = { id: Date.now().toString(), nombre: nuevoNombre.trim(), foto: "" }
        await persistirBarberos([...barberos, nuevo])
        setNuevoNombre("")
    }

    const handleBorrar = async (id: string) => {
        const lista = barberos.filter(b => b.id !== id)
        if (barber === barberos.find(b => b.id === id)?.nombre) setBarber("")
        await persistirBarberos(lista)
    }

    const handleGuardarNombre = async (id: string) => {
        const nuevo = editNombres[id]?.trim()
        if (!nuevo) return
        const viejo = barberos.find(b => b.id === id)?.nombre
        if (barber === viejo) setBarber(nuevo)
        await persistirBarberos(barberos.map(b => b.id === id ? { ...b, nombre: nuevo } : b))
    }

    const handleCambiarFoto = (id: string, archivo: File) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
            const base64 = e.target?.result as string
            await persistirBarberos(barberos.map(b => b.id === id ? { ...b, foto: base64 } : b))
        }
        reader.readAsDataURL(archivo)
    }

    useEffect(() => {
        let isMounted = true
        if (barber) {
            setIsLoadingAvailability(true)
            getBarberAvailability(barber).then(res => {
                if (!isMounted) return
                setBusySlots(Array.isArray(res) ? res : [])
                setIsLoadingAvailability(false)
            }).catch(() => { if (isMounted) setIsLoadingAvailability(false) })
        }
        return () => { isMounted = false }
    }, [barber])

    const isFormValid = useMemo(() => (
        barber !== "" && service !== "" && selectedDate !== null &&
        clientName.trim() !== "" && clientPhone.trim() !== ""
    ), [barber, service, selectedDate, clientName, clientPhone])

    const getLocalISOString = (date: Date) => {
        const pad = (n: number) => (n < 10 ? "0" : "") + n
        return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val  = e.target.value
        setService(val)
        const info = servicios.find(s => s.service === val)
        if (info) { setPrice(info.price); setCurrentDuration(info.duration) }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!isFormValid) return
        const formData = new FormData(e.currentTarget)
        const data     = Object.fromEntries(formData)
        const dateObj  = new Date(data.dateList as string)
        const timeStr  = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        const dateStr  = dateObj.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" })
        const message  =
            `*¡Hola LatinosVip!* 💈\n\nNueva cita reservada:\n` +
            `👤 *Cliente:* ${data.client}\n✂️ *Servicio:* ${data.service}\n` +
            `📅 *Fecha:* ${dateStr}\n⏰ *Hora:* ${timeStr}\n` +
            `💰 *Precio:* ${data.price}€\n🧔 *Barbero:* ${data.barber}\n\n` +
            `_Enviado desde el sistema de reservas._`
        const cleanPhone = data.phone?.toString().replace(/\D/g, "")
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, "_blank")
        submit(e.currentTarget)
    }

    if (loadingCfg) return (
        <div className="mt-10 max-w-lg mx-auto p-8 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] flex items-center justify-center h-40">
            <p className="text-amber-400 animate-pulse font-bold">Cargando...</p>
        </div>
    )

    return (
        <>
        <AnimatePresence>
            {showModal && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1,   opacity: 1, y: 0  }}
                        exit={{    scale: 0.9, opacity: 0, y: 20 }}
                        className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-amber-400 font-black text-lg">✂️ Gestionar Barberos</h3>
                            <button onClick={() => setShowModal(false)}
                                className="text-zinc-500 hover:text-white w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center transition-colors">✕</button>
                        </div>

                        {saving && (
                            <p className="text-amber-400 text-[10px] font-bold animate-pulse text-center mb-3">Guardando...</p>
                        )}

                        <div className="space-y-3 mb-6">
                            {barberos.map((b) => (
                                <div key={b.id} className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 rounded-2xl p-3">
                                    <div className="relative cursor-pointer flex-shrink-0"
                                        onClick={() => { setEditandoId(b.id); fileInputRef.current?.click() }}>
                                        {b.foto
                                            ? <img src={b.foto} className="w-12 h-12 rounded-full object-cover border-2 border-zinc-700" />
                                            : <div className="w-12 h-12 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-xl">
                                                {b.nombre[0]?.toUpperCase()}
                                              </div>
                                        }
                                        <span className="absolute -bottom-1 -right-1 bg-amber-400 text-black text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-black">✎</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={editNombres[b.id] ?? b.nombre}
                                        onChange={(e) => setEditNombres(prev => ({ ...prev, [b.id]: e.target.value }))}
                                        onBlur={() => handleGuardarNombre(b.id)}
                                        className="flex-1 bg-zinc-800 text-white text-sm p-2 rounded-xl border border-zinc-700 focus:border-amber-400 outline-none"
                                    />
                                    <button onClick={() => handleBorrar(b.id)}
                                        className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-colors text-sm">
                                        🗑
                                    </button>
                                </div>
                            ))}
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file && editandoId) handleCambiarFoto(editandoId, file)
                                e.target.value = ""
                            }}
                        />

                        <div className="border-t border-zinc-800 pt-4">
                            <p className="text-zinc-400 text-xs font-bold uppercase mb-3">Añadir nuevo barbero</p>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={nuevoNombre}
                                    onChange={(e) => setNuevoNombre(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAñadir() } }}
                                    placeholder="Nombre del barbero"
                                    className="flex-1 bg-zinc-900 text-white text-sm p-3 rounded-xl border border-zinc-700 focus:border-amber-400 outline-none"
                                />
                                <button onClick={handleAñadir} disabled={!nuevoNombre.trim()}
                                    className="bg-amber-400 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-black px-4 rounded-xl transition-colors">
                                    +
                                </button>
                            </div>
                            <p className="text-zinc-600 text-[10px] mt-2">
                                Toca la foto para cambiarla · Edita el nombre y toca fuera para guardar
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-10 max-w-lg mx-auto p-8 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl">

            <header className="text-center mb-8">
                <h2 className="text-3xl font-black text-white">Reserva tu <span className="text-amber-400">Cita</span></h2>
            </header>

            <Form method="POST" onSubmit={handleSubmit} className="flex flex-col gap-6">

                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Especialista</label>
                        <button type="button" onClick={() => setShowModal(true)}
                            className="text-[10px] text-zinc-500 hover:text-amber-400 border border-zinc-800 px-2 py-1 rounded-full transition-colors">
                            ⚙️ Gestionar
                        </button>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                        {barberos.map((b) => (
                            <div key={b.id}
                                onClick={() => { setBarber(b.nombre); setSelectedDate(null) }}
                                className={`flex-1 min-w-[80px] cursor-pointer p-4 rounded-3xl border-2 transition-all duration-300 
                                    ${barber === b.nombre
                                        ? "border-amber-400 bg-amber-400/10 scale-105"
                                        : "border-zinc-800 bg-zinc-900/50 grayscale hover:grayscale-0"}`}>
                                {b.foto
                                    ? <img src={b.foto} className="rounded-full w-full aspect-square object-cover" alt={b.nombre} />
                                    : <div className="rounded-full w-full aspect-square bg-zinc-800 flex items-center justify-center text-2xl font-black text-amber-400">
                                        {b.nombre[0]?.toUpperCase()}
                                      </div>
                                }
                                <p className={`text-center mt-2 text-[10px] font-bold ${barber === b.nombre ? "text-amber-400" : "text-zinc-500"}`}>
                                    {b.nombre}
                                </p>
                            </div>
                        ))}
                    </div>
                    <input type="hidden" name="barber" value={barber} />
                </div>

                <div className="space-y-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Servicio</label>
                    <select name="service" value={service} onChange={handleServiceChange}
                        className="w-full font-bold text-white rounded-2xl p-4 bg-zinc-900 border-2 border-zinc-800 focus:border-amber-400 outline-none transition-colors">
                        <option value="">Selecciona un servicio</option>
                        {servicios.map(s => (
                            <option key={s.service} value={s.service}>
                                {s.service} — {s.price}€ ({s.duration} min)
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Horario</label>
                    {isLoadingAvailability && (
                        <p className="text-amber-400 text-[10px] font-bold animate-pulse">Cargando disponibilidad...</p>
                    )}
                    <div className={`transition-opacity duration-500 ${(!barber || isLoadingAvailability) ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
                        <DatePicker selectedDate={selectedDate} onChange={(date) => setSelectedDate(date)} busySlots={busySlots} />
                    </div>
                    <input type="hidden" name="dateList"  value={selectedDate ? getLocalISOString(selectedDate) : ""} />
                    <input type="hidden" name="duration"  value={currentDuration} />
                    <input type="hidden" name="price"     value={price} />
                </div>

                <div className="space-y-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Tus Datos</label>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="client" value={clientName}
                            onChange={(e) => { setClientName(e.target.value); localStorage.setItem("cliente_nombre", e.target.value) }}
                            placeholder="Tu Nombre"
                            className="w-full p-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white outline-none focus:border-amber-400 transition-all" />
                        <input name="phone" value={clientPhone}
                            onChange={(e) => { setClientPhone(e.target.value); localStorage.setItem("cliente_telefono", e.target.value) }}
                            placeholder="WhatsApp"
                            className="w-full p-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white outline-none focus:border-amber-400 transition-all" />
                    </div>
                </div>

                {price !== "" && (
                    <div className="bg-amber-400/5 border border-amber-400/20 rounded-2xl p-4 flex justify-between items-center">
                        <span className="text-zinc-400 text-sm font-bold uppercase">Total a pagar:</span>
                        <span className="text-amber-400 text-2xl font-black">{price}€</span>
                    </div>
                )}

                <motion.button
                    disabled={!isFormValid}
                    whileTap={isFormValid ? { scale: 0.95 } : {}}
                    type="submit"
                    className={`py-5 mt-4 rounded-2xl font-black text-xl uppercase tracking-widest transition-all duration-300 
                        ${isFormValid
                            ? "bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:bg-amber-500"
                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}`}>
                    {isFormValid ? "Confirmar Cita" : "Completa los datos"}
                </motion.button>
            </Form>
        </motion.div>
        </>
    )
}
