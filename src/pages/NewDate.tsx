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

// ✅ Barberos base — la foto se puede cambiar desde el frontend
const BARBEROS_BASE = [
    { id: "Josue", nombre: "Josue", fotoDefault: josuePerfil },
    { id: "Vato", nombre: "Vato", fotoDefault: vatoPerfil },
]

const SERVICIOS_DATA = [
    { service: "Corte", price: 13, duration: 30 },
    { service: "Corte con cejas", price: 15, duration: 40 },
    { service: "Corte con barba", price: 18, duration: 50 },
    { service: "Corte Vip", price: 25, duration: 70 },
    { service: "Barba", price: 8, duration: 15 },
    { service: "Barba VIP", price: 11, duration: 25 },
    { service: "Cejas", price: 5, duration: 10 },
    { service: "Mechas", price: 30, duration: 60 },
    { service: "Tinte", price: 30, duration: 60 },
    { service: "Trenzas", price: 20, duration: 45 },
    { service: "Mask Carbon", price: 3, duration: 10 },
    { service: "Limpieza Facial", price: 15, duration: 25 },
    { service: "Diseño", price: 3, duration: 10 },
    { service: "Lavado de Cabello", price: 2, duration: 10 },
    { service: "Rizos semipermanente", price: 0, duration: 2 },
    { service: "Otros", price: 0, duration: 0 },
]

export default function ListDate() {
    const submit = useSubmit()
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [price, setPrice] = useState<number | string>("")
    const [service, setService] = useState("")
    const [barber, setBarber] = useState("")
    const [busySlots, setBusySlots] = useState<any[]>([])
    const [currentDuration, setCurrentDuration] = useState(30)
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false)
    const [clientName, setClientName] = useState(localStorage.getItem("cliente_nombre") || "")
    const [clientPhone, setClientPhone] = useState(localStorage.getItem("cliente_telefono") || "")

    // ✅ Estado barberos — nombre y foto editables desde frontend
    const [barberos, setBarberos] = useState<{ id: string; nombre: string; foto: string }[]>(() => {
        const saved = localStorage.getItem("barberos_citas_v2")
        if (saved) return JSON.parse(saved)
        return BARBEROS_BASE.map(b => ({ id: b.id, nombre: b.id, foto: b.fotoDefault }))
    })
    const [showAdmin, setShowAdmin] = useState(false)
    const [editandoId, setEditandoId] = useState<string | null>(null)

    const guardarBarberos = (nuevos: typeof barberos) => {
        setBarberos(nuevos)
        localStorage.setItem("barberos_citas_v2", JSON.stringify(nuevos))
    }

    const handleRenombrar = (id: string, nuevoNombre: string) => {
        // Si el barbero seleccionado cambió de nombre, actualizarlo
        if (barber === barberos.find(b => b.id === id)?.nombre) {
            setBarber(nuevoNombre)
        }
        guardarBarberos(barberos.map(b => b.id === id ? { ...b, nombre: nuevoNombre } : b))
    }

    const handleCambiarFoto = (id: string, archivo: File) => {
        const reader = new FileReader()
        reader.onload = (e) => {
            const base64 = e.target?.result as string
            guardarBarberos(barberos.map(b => b.id === id ? { ...b, foto: base64 } : b))
        }
        reader.readAsDataURL(archivo)
    }

    // Cargar disponibilidad al elegir barbero
    useEffect(() => {
        let isMounted = true
        if (barber) {
            setIsLoadingAvailability(true)
            getBarberAvailability(barber).then(res => {
                if (!isMounted) return
                setBusySlots(Array.isArray(res) ? res : [])
                setIsLoadingAvailability(false)
            }).catch(() => {
                if (isMounted) setIsLoadingAvailability(false)
            })
        }
        return () => { isMounted = false }
    }, [barber])

    const isFormValid = useMemo(() => (
        barber !== "" && service !== "" && selectedDate !== null &&
        clientName.trim() !== "" && clientPhone.trim() !== ""
    ), [barber, service, selectedDate, clientName, clientPhone])

    const getLocalISOString = (date: Date) => {
        const pad = (n: number) => (n < 10 ? '0' : '') + n
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
    }

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value
        setService(val)
        const info = SERVICIOS_DATA.find(s => s.service === val)
        if (info) { setPrice(info.price); setCurrentDuration(info.duration) }
    }

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!isFormValid) return
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData)
        const dateObj = new Date(data.dateList as string)
        const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const dateStr = dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })
        const message =
            `*¡Hola LatinosVip!* 💈\n\nNueva cita reservada:\n` +
            `👤 *Cliente:* ${data.client}\n✂️ *Servicio:* ${data.service}\n` +
            `📅 *Fecha:* ${dateStr}\n⏰ *Hora:* ${timeStr}\n` +
            `💰 *Precio:* ${data.price}€\n🧔 *Barbero:* ${data.barber}\n\n` +
            `_Enviado desde el sistema de reservas._`
        const cleanPhone = data.phone?.toString().replace(/\D/g, '')
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank')
        submit(e.currentTarget)
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-10 max-w-lg mx-auto p-8 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl">

            <header className="text-center mb-8">
                <h2 className="text-3xl font-black text-white">Reserva tu <span className="text-amber-400">Cita</span></h2>
            </header>

            <Form method="POST" onSubmit={handleSubmit} className="flex flex-col gap-6">

                {/* ✅ ESPECIALISTA con edición de nombre y foto */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Especialista</label>
                        <button type="button" onClick={() => setShowAdmin(!showAdmin)}
                            className="text-[10px] text-zinc-500 hover:text-amber-400 border border-zinc-800 px-2 py-1 rounded-full transition-colors">
                            {showAdmin ? "✕ Cerrar" : "⚙️ Editar"}
                        </button>
                    </div>

                    {/* Panel admin barberos */}
                    <AnimatePresence>
                        {showAdmin && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="p-4 bg-zinc-900/60 rounded-2xl border border-zinc-800 space-y-3 mb-2">
                                    <p className="text-amber-400 text-[10px] font-black uppercase">Gestionar Barberos</p>
                                    {barberos.map((b) => (
                                        <div key={b.id} className="flex items-center gap-3">
                                            {/* Foto clickeable para cambiar */}
                                            <div className="relative cursor-pointer"
                                                onClick={() => { setEditandoId(b.id); fileInputRef.current?.click() }}>
                                                <img src={b.foto} className="w-10 h-10 rounded-full object-cover border-2 border-zinc-700" />
                                                <span className="absolute -bottom-1 -right-1 bg-amber-400 text-black text-[8px] rounded-full w-4 h-4 flex items-center justify-center font-black">✎</span>
                                            </div>
                                            {/* Nombre editable */}
                                            <input
                                                type="text"
                                                defaultValue={b.nombre}
                                                onBlur={(e) => handleRenombrar(b.id, e.target.value)}
                                                className="flex-1 bg-zinc-800 text-white text-xs p-2 rounded-lg border border-zinc-700 focus:border-amber-400 outline-none"
                                                placeholder="Nombre del barbero"
                                            />
                                        </div>
                                    ))}
                                    <p className="text-[10px] text-zinc-600">Toca la foto para cambiarla · Edita el nombre y toca fuera para guardar</p>
                                    {/* Input file oculto */}
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
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tarjetas de barberos */}
                    <div className="flex gap-4">
                        {barberos.map((b) => (
                            <div key={b.id}
                                onClick={() => { setBarber(b.nombre); setSelectedDate(null) }}
                                className={`flex-1 cursor-pointer p-4 rounded-3xl border-2 transition-all duration-300 
                                    ${barber === b.nombre
                                        ? "border-amber-400 bg-amber-400/10 scale-105"
                                        : "border-zinc-800 bg-zinc-900/50 grayscale hover:grayscale-0"}`}>
                                <img src={b.foto} className="rounded-full w-full aspect-square object-cover" alt={b.nombre} />
                                <p className={`text-center mt-2 text-[10px] font-bold ${barber === b.nombre ? "text-amber-400" : "text-zinc-500"}`}>
                                    {b.nombre}
                                </p>
                            </div>
                        ))}
                    </div>
                    <input type="hidden" name="barber" value={barber} />
                </div>

                {/* SERVICIO */}
                <div className="space-y-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Servicio</label>
                    <select name="service" value={service} onChange={handleServiceChange}
                        className="w-full font-bold text-white rounded-2xl p-4 bg-zinc-900 border-2 border-zinc-800 focus:border-amber-400 outline-none transition-colors">
                        <option value="">Selecciona un servicio</option>
                        {SERVICIOS_DATA.map(s => (
                            <option key={s.service} value={s.service}>
                                {s.service} — {s.price}€ ({s.duration} min)
                            </option>
                        ))}
                    </select>
                </div>

                {/* HORARIO */}
                <div className="space-y-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Horario</label>
                    {isLoadingAvailability && (
                        <p className="text-amber-400 text-[10px] font-bold animate-pulse">Cargando disponibilidad...</p>
                    )}
                    <div className={`transition-opacity duration-500 ${(!barber || isLoadingAvailability) ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
                        <DatePicker
                            selectedDate={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            busySlots={busySlots}
                        />
                    </div>
                    <input type="hidden" name="dateList" value={selectedDate ? getLocalISOString(selectedDate) : ""} />
                    <input type="hidden" name="duration" value={currentDuration} />
                    <input type="hidden" name="price" value={price} />
                </div>

                {/* DATOS CLIENTE */}
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

                {/* PRECIO */}
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
    )
}