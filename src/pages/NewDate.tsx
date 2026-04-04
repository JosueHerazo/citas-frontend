import {
    useActionData,
    useNavigation,
    type ActionFunctionArgs,
    redirect,
} from "react-router-dom"
import { useState, useEffect, useRef } from "react"
import { addProduct, getBarberosDB, addBarbero, updateBarbero } from "../services/ServiceDates"
import CustomDatePicker from "../components/CustomDatePicker"
import axios from "axios"
import { Form } from "react-router-dom"

// ─── TIPOS ───────────────────────────────────────────────────────────────────
type Barber  = { id: number | string; nombre: string; foto?: string | null }
type Service = { name: string; price: number; duration: number }

// ─── DATOS BASE ───────────────────────────────────────────────────────────────
const BASE_BARBERS: Barber[] = [
    { id: "josue",  nombre: "Josue"  },
    { id: "will",   nombre: "Will"   },
    { id: "stiven", nombre: "Stiven" },
]

const BASE_SERVICES: Service[] = [
    { name: "Corte",                   price: 13, duration: 30 },
    { name: "Corte con cejas",         price: 15, duration: 45 },
    { name: "Corte con barba",         price: 18, duration: 45 },
    { name: "Corte con barba + cejas", price: 20, duration: 55 },
    { name: "Corte Vip",               price: 25, duration: 60 },
    { name: "Barba",                   price: 8,  duration: 20 },
    { name: "Barba VIP",               price: 11, duration: 30 },
    { name: "Cejas",                   price: 5,  duration: 15 },
    { name: "Mechas",                  price: 30, duration: 60 },
    { name: "Tinte",                   price: 30, duration: 60 },
    { name: "Trenzas",                 price: 20, duration: 60 },
    { name: "Mask Carbon",             price: 3,  duration: 15 },
    { name: "Limpieza Facial",         price: 15, duration: 30 },
    { name: "Diseño",                  price: 3,  duration: 15 },
    { name: "Lavado de Cabello",       price: 2,  duration: 15 },
    { name: "Otros",                   price: 0,  duration: 30 },
]

const API = () => (import.meta.env.VITE_API_URL || "").replace(/\/$/, "")

// ─── ACTION ───────────────────────────────────────────────────────────────────
export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)

    if (!data.barber   || String(data.barber).trim()   === "") return { error: "Por favor selecciona un barbero" }
    if (!data.dateList || String(data.dateList).trim() === "") return { error: "Por favor selecciona fecha y hora" }
    if (!data.service  || String(data.service).trim()  === "") return { error: "Por favor selecciona un servicio" }

    try {
        await addProduct(data)
        return redirect("/login/admin")
    } catch (error: any) {
        return { error: error.message || "Error al crear la cita" }
    }
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function NewDate() {
    const actionData   = useActionData() as { error?: string } | undefined
    const navigation   = useNavigation()
    const isSubmitting = navigation.state === "submitting"
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [barbers,        setBarbers]        = useState<Barber[]>(BASE_BARBERS)
    const [loadingBarbers, setLoadingBarbers] = useState(true)
    const [editingId,      setEditingId]      = useState<number | string | null>(null)
    const [newBarberName,  setNewBarberName]  = useState("")
    const [showManage,     setShowManage]     = useState(false)
    const [savingPhoto,    setSavingPhoto]    = useState(false)

    const [services]        = useState<Service[]>(BASE_SERVICES)
    const [selectedService, setSelectedService] = useState("")
    const [price,           setPrice]           = useState<string>("")
    const [duration,        setDuration]        = useState("30")

    const [selectedBarber, setSelectedBarber] = useState("")
    const [selectedDate,   setSelectedDate]   = useState<Date | null>(null)
    const [busySlots,      setBusySlots]      = useState<any[]>([])
    const [loadingSlots,   setLoadingSlots]   = useState(false)

    const [client, setClient] = useState("")
    const [phone,  setPhone]  = useState("")

    // ── Cargar barberos ───────────────────────────────────────────────────
    useEffect(() => {
        getBarberosDB().then((list: any[]) => {
            const filtered = list
                .filter((b: any) => (b.nombre || b.name || "").toLowerCase() !== "vato")
                .map((b: any) => ({
                    id:     b.id,
                    nombre: b.nombre || b.name || "?",
                    foto:   b.foto   || b.photo || null,
                }))
            if (filtered.length) {
                setBarbers(filtered)
            }
            setLoadingBarbers(false)
        })
    }, [])

    // ── Auto-rellenar precio y duración al cambiar servicio ───────────────
    useEffect(() => {
        const s = services.find(s => s.name === selectedService)
        if (s) {
            setPrice(String(s.price))
            setDuration(String(s.duration))
        }
    }, [selectedService, services])

    // ── Slots ocupados al cambiar barbero ─────────────────────────────────
    useEffect(() => {
        if (!selectedBarber) { setBusySlots([]); return }
        setLoadingSlots(true)
        axios.get(`${API()}/api/date/availability/${encodeURIComponent(selectedBarber.trim())}`)
            .then(({ data }) => setBusySlots(data.data || []))
            .catch(() => setBusySlots([]))
            .finally(() => setLoadingSlots(false))
    }, [selectedBarber])

    // ── Cambiar foto ──────────────────────────────────────────────────────
    const handleChangePhoto = (id: number | string, file: File) => {
        const reader = new FileReader()
        reader.onload = async (e) => {
            const base64 = e.target?.result as string
            setBarbers(prev => prev.map(b => b.id === id ? { ...b, foto: base64 } : b))
            setSavingPhoto(true)
            try {
                await updateBarbero(id, { foto: base64 })
            } catch (err) {
                console.error("Error guardando foto:", err)
            } finally {
                setSavingPhoto(false)
            }
        }
        reader.readAsDataURL(file)
    }

    // ── Agregar barbero ───────────────────────────────────────────────────
    const handleAddBarber = async () => {
        const nombre = newBarberName.trim()
        if (!nombre) return
        if (barbers.some(b => b.nombre.toLowerCase() === nombre.toLowerCase())) return

        const created = await addBarbero(nombre)
        if (created) {
            setBarbers(prev => [...prev, {
                id:     created.id,
                nombre: created.nombre,
                foto:   created.foto || null,
            }])
            setNewBarberName("")
        } else {
            alert("Error al agregar barbero. Revisa la conexión.")
        }
    }

    // ── Fecha para hidden input ───────────────────────────────────────────
    const dateListValue = selectedDate ? (() => {
        const pad = (n: number) => String(n).padStart(2, "0")
        return `${selectedDate.getFullYear()}-${pad(selectedDate.getMonth()+1)}-${pad(selectedDate.getDate())}T${pad(selectedDate.getHours())}:${pad(selectedDate.getMinutes())}`
    })() : ""

    return (
        <div className="min-h-screen bg-zinc-950 py-10 px-4">
            <div className="max-w-lg mx-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black text-amber-500 uppercase italic">
                        Nueva <span className="text-white">Cita</span>
                    </h1>
                    <button type="button" onClick={() => setShowManage(!showManage)}
                        className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-3 py-1.5 rounded-full hover:text-amber-500 transition-colors">
                        {showManage ? "Cerrar" : "Gestionar"}
                    </button>
                </div>

                {/* ERROR */}
                {actionData?.error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 font-bold text-sm">
                        ⚠️ {actionData.error}
                    </div>
                )}

                {/* PANEL GESTIONAR */}
                {showManage && (
                    <div className="mb-6 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                            <p className="text-amber-500 text-xs font-black uppercase">Gestionar Barberos</p>
                            {savingPhoto && <span className="text-[10px] text-zinc-500 animate-pulse">Guardando foto...</span>}
                        </div>

                        {barbers.map(b => (
                            <div key={b.id} className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-2xl p-3">
                                <div className="relative cursor-pointer flex-shrink-0"
                                    onClick={() => { setEditingId(b.id); fileInputRef.current?.click() }}
                                    title="Cambiar foto">
                                    {b.foto
                                        ? <img src={b.foto} className="w-10 h-10 rounded-full object-cover border-2 border-zinc-700" />
                                        : <div className="w-10 h-10 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-lg font-black text-amber-500">
                                            {b.nombre[0]?.toUpperCase()}
                                          </div>
                                    }
                                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-black text-[7px] rounded-full w-3.5 h-3.5 flex items-center justify-center font-black">E</span>
                                </div>
                                <span className="flex-1 text-white text-sm font-bold">{b.nombre}</span>
                            </div>
                        ))}

                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                            onChange={e => {
                                const file = e.target.files?.[0]
                                if (file && editingId !== null) handleChangePhoto(editingId, file)
                                e.target.value = ""
                            }} />

                        <div className="flex gap-2 pt-2 border-t border-zinc-800">
                            <input type="text" value={newBarberName}
                                onChange={e => setNewBarberName(e.target.value)}
                                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); handleAddBarber() } }}
                                placeholder="Nuevo barbero..."
                                className="flex-1 bg-zinc-950 text-white text-sm p-3 rounded-xl border border-zinc-700 focus:border-amber-500 outline-none" />
                            <button type="button" onClick={handleAddBarber} disabled={!newBarberName.trim()}
                                className="bg-amber-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-black font-black px-5 rounded-xl text-lg">+</button>
                        </div>
                    </div>
                )}

                <Form method="post" className="space-y-4">

                    {/* BARBEROS */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
                        <label className="text-amber-500 text-[10px] font-black uppercase mb-4 block">Barbero</label>
                        {loadingBarbers ? (
                            <p className="text-zinc-500 text-sm animate-pulse">Cargando barberos...</p>
                        ) : (
                            <div className="flex gap-5 flex-wrap">
                                {barbers.map(b => (
                                    <div key={b.id}
                                        onClick={() => { setSelectedBarber(b.nombre); setSelectedDate(null) }}
                                        className={`flex flex-col items-center gap-1.5 cursor-pointer transition-all duration-200 ${
                                            selectedBarber === b.nombre ? "scale-110" : "opacity-50 hover:opacity-80"
                                        }`}>
                                        <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-colors ${
                                            selectedBarber === b.nombre ? "border-amber-500" : "border-zinc-700"
                                        }`}>
                                            {b.foto
                                                ? <img src={b.foto} className="w-full h-full object-cover" />
                                                : <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-2xl font-black text-amber-500">
                                                    {b.nombre[0]?.toUpperCase()}
                                                  </div>
                                            }
                                        </div>
                                        <span className={`text-[10px] font-black ${
                                            selectedBarber === b.nombre ? "text-amber-500" : "text-zinc-500"
                                        }`}>{b.nombre}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        <input type="hidden" name="barber" value={selectedBarber} />
                    </div>

                    {/* DATE PICKER */}
                    {selectedBarber ? (
                        <div className="space-y-2">
                            <label className="text-amber-500 text-[10px] font-black uppercase ml-1 block">
                                Fecha y Hora
                                {loadingSlots && <span className="ml-2 text-zinc-500 font-normal normal-case text-[9px]">cargando disponibilidad...</span>}
                            </label>
                            <CustomDatePicker
                                selectedDate={selectedDate}
                                onChange={setSelectedDate}
                                busySlots={busySlots}
                            />
                            {selectedDate && (
                                <p className="text-xs text-emerald-500 font-bold pl-1">
                                    ✅ {selectedDate.toLocaleString("es-ES", {
                                        weekday: "long", day: "numeric",
                                        month: "long", hour: "2-digit", minute: "2-digit"
                                    })}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="bg-zinc-900 border border-dashed border-zinc-700 rounded-3xl p-8 text-center text-zinc-600 text-sm">
                            Selecciona un barbero para ver disponibilidad
                        </div>
                    )}
                    <input type="hidden" name="dateList" value={dateListValue} />

                    {/* SERVICIO + PRECIO */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-amber-500 text-[10px] font-black uppercase">Servicio</label>
                                <select name="service" value={selectedService}
                                    onChange={e => setSelectedService(e.target.value)}
                                    className="w-full font-bold text-white rounded-xl p-3 bg-zinc-800 border border-zinc-700 outline-none focus:border-amber-500 appearance-none"
                                    required>
                                    <option value="">Selecciona...</option>
                                    {services.map(s => (
                                        <option key={s.name} value={s.name}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-amber-500 text-[10px] font-black uppercase">Precio (€)</label>
                                <input name="price" type="number" step="0.01" min="0"
                                    value={price} onChange={e => setPrice(e.target.value)}
                                    className="w-full font-bold text-white rounded-xl p-3 bg-zinc-800 border border-zinc-700 outline-none focus:border-amber-500"
                                    required />
                            </div>
                        </div>
                    </div>

                    {/* DURACIÓN — se auto-selecciona con el servicio, editable manualmente */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
                        <label className="text-amber-500 text-[10px] font-black uppercase mb-3 block">
                            Duración
                            {selectedService && (
                                <span className="ml-2 text-zinc-500 font-normal normal-case text-[9px]">
                                    (auto desde servicio, ajustable)
                                </span>
                            )}
                        </label>
                        <div className="flex gap-2">
                            {["15","20","30","45","55","60"].map(d => (
                                <button key={d} type="button" onClick={() => setDuration(d)}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black transition-all border-2 ${
                                        duration === d
                                            ? "bg-amber-500 text-black border-amber-500"
                                            : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"
                                    }`}>
                                    {d}'
                                </button>
                            ))}
                        </div>
                        <input type="hidden" name="duration" value={duration} />
                    </div>

                    {/* CLIENTE */}
                    <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-5 space-y-4">
                        <div className="space-y-1">
                            <label className="text-amber-500 text-[10px] font-black uppercase">Nombre Cliente</label>
                            <input name="client" type="text" value={client}
                                onChange={e => setClient(e.target.value)}
                                className="w-full font-bold text-white rounded-xl p-3 bg-zinc-800 border border-zinc-700 outline-none focus:border-amber-500"
                                required />
                        </div>
                        <div className="space-y-1">
                            <label className="text-amber-500 text-[10px] font-black uppercase">WhatsApp / Teléfono</label>
                            <input name="phone" type="tel" placeholder="Ej: 3001234567"
                                value={phone} onChange={e => setPhone(e.target.value)}
                                className="w-full font-bold text-white rounded-xl p-3 bg-zinc-800 border border-zinc-700 outline-none focus:border-amber-500"
                                required />
                        </div>
                    </div>

                    {/* SUBMIT */}
                    <button type="submit"
                        disabled={isSubmitting || !selectedDate || !selectedBarber}
                        className="w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-black font-black py-4 rounded-2xl text-lg uppercase shadow-lg shadow-amber-900/20 transition-all active:scale-[0.98]">
                        {isSubmitting ? "Guardando..." : "Confirmar y Guardar Cita"}
                    </button>

                </Form>
            </div>
        </div>
    )
}