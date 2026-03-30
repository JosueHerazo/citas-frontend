import { useNavigate, useActionData, useNavigation, ActionFunctionArgs, redirect } from "react-router-dom"
import { useState, useEffect } from "react"
import { addProduct, getBarberosDB, saveBarberosDB } from "../services/ServiceDates"
import CustomDatePicker from "../components/CustomDatePicker"
import axios from "axios"

// ─── ACTION (React Router) ────────────────────────────────────────────────────
export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)

    // Validación básica
    if (!data.barber || String(data.barber).trim() === "") {
        return { error: "Por favor selecciona un barbero" }
    }
    if (!data.dateList || String(data.dateList).trim() === "") {
        return { error: "Por favor selecciona fecha y hora" }
    }

    try {
        await addProduct(data)
        return redirect("/dates")
    } catch (error: any) {
        return { error: error.message || "Error al crear la cita" }
    }
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
const NewDate = () => {
    const navigate = useNavigate()
    const actionData = useActionData() as { error?: string } | undefined
    const navigation = useNavigation()
    const isSubmitting = navigation.state === "submitting"

    const barberosBase = ["Will", "Stiven"]

    const [barberos, setBarberos] = useState<{ nombre: string; foto?: string }[]>(
        barberosBase.map(n => ({ nombre: n }))
    )
    const [nuevoBarbero, setNuevoBarbero] = useState("")
    const [loadingBarberos, setLoadingBarberos] = useState(true)

    // Barbero y fecha seleccionados (controlados localmente para el DatePicker)
    const [selectedBarber, setSelectedBarber] = useState("")
    const [selectedDate, setSelectedDate] = useState<Date | null>(null)
    const [busySlots, setBusySlots] = useState<any[]>([])
    const [loadingSlots, setLoadingSlots] = useState(false)

    // ── Cargar barberos ───────────────────────────────────────────────────────
    useEffect(() => {
        const fetchBarberos = async () => {
            try {
                setLoadingBarberos(true)
                const fromDB = await getBarberosDB()
                if (fromDB && fromDB.length > 0) {
                    // fromDB puede ser array de objetos {nombre, foto} o strings
                    const normalized = fromDB.map((b: any) =>
                        typeof b === "string" ? { nombre: b } : b
                    )
                    // Unir con base, sin duplicados
                    const nombres = normalized.map((b: any) => b.nombre.toLowerCase())
                    const extras = barberosBase
                        .filter(n => !nombres.includes(n.toLowerCase()))
                        .map(n => ({ nombre: n }))
                    setBarberos([...extras, ...normalized])
                }
            } catch (e) {
                console.error("Error cargando barberos:", e)
            } finally {
                setLoadingBarberos(false)
            }
        }
        fetchBarberos()
    }, [])

    // ── Cargar slots ocupados cuando cambia barbero ───────────────────────────
    useEffect(() => {
        if (!selectedBarber) {
            setBusySlots([])
            return
        }
        const fetchSlots = async () => {
            setLoadingSlots(true)
            try {
                const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, "")
                const { data } = await axios.get(
                    `${baseUrl}/api/date/availability/${encodeURIComponent(selectedBarber.trim())}`
                )
                setBusySlots(data.data || data || [])
            } catch {
                setBusySlots([])
            } finally {
                setLoadingSlots(false)
            }
        }
        fetchSlots()
    }, [selectedBarber])

    // ── Agregar barbero ───────────────────────────────────────────────────────
    const handleAddBarbero = async () => {
        const nombreLimpio = nuevoBarbero.trim()
        if (!nombreLimpio) return

        const existe = barberos.some(
            b => b.nombre.toLowerCase() === nombreLimpio.toLowerCase()
        )
        if (existe) {
            alert("Ese barbero ya existe en la lista")
            return
        }

        const newList = [...barberos, { nombre: nombreLimpio }]

        try {
            await saveBarberosDB(newList)
            setBarberos(newList)
            setNuevoBarbero("")
            alert("✅ Barbero agregado correctamente")
        } catch (error: any) {
            alert("Error al guardar: " + (error.message || "Error desconocido"))
        }
    }

    // ── Formatear fecha para el hidden input ─────────────────────────────────
    const dateListValue = selectedDate
        ? (() => {
              const pad = (n: number) => String(n).padStart(2, "0")
              const y = selectedDate.getFullYear()
              const mo = pad(selectedDate.getMonth() + 1)
              const d = pad(selectedDate.getDate())
              const h = pad(selectedDate.getHours())
              const mi = pad(selectedDate.getMinutes())
              return `${y}-${mo}-${d}T${h}:${mi}`
          })()
        : ""

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Nueva Cita</h1>

            {/* Error del action */}
            {actionData?.error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-medium text-sm">
                    ⚠️ {actionData.error}
                </div>
            )}

            <form method="post" className="space-y-5">

                {/* SECCIÓN BARBERO */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Asignar Barbero
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select
                            name="barber"
                            value={selectedBarber}
                            onChange={e => {
                                setSelectedBarber(e.target.value)
                                setSelectedDate(null)
                            }}
                            className="flex-1 p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={loadingBarberos}
                            required
                        >
                            <option value="">
                                {loadingBarberos ? "Cargando..." : "Selecciona..."}
                            </option>
                            {barberos.map((b, i) => (
                                <option key={i} value={b.nombre}>
                                    {b.nombre}
                                </option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={nuevoBarbero}
                                onChange={e => setNuevoBarbero(e.target.value)}
                                placeholder="Nombre nuevo"
                                className="flex-1 sm:w-40 p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                            />
                            <button
                                type="button"
                                onClick={handleAddBarbero}
                                className="bg-green-600 hover:bg-green-700 text-white px-5 rounded-xl font-bold transition-colors"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* DATE PICKER — solo se muestra si hay barbero seleccionado */}
                {selectedBarber ? (
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-700">
                            Fecha y Hora
                            {loadingSlots && (
                                <span className="ml-2 text-xs font-normal text-gray-400">
                                    Cargando disponibilidad...
                                </span>
                            )}
                        </label>
                        <CustomDatePicker
                            selectedDate={selectedDate}
                            onChange={setSelectedDate}
                            busySlots={busySlots}
                        />
                        {selectedDate && (
                            <p className="text-xs text-emerald-600 font-medium pl-1">
                                ✅ Seleccionado:{" "}
                                {selectedDate.toLocaleString("es-ES", {
                                    weekday: "long",
                                    day: "numeric",
                                    month: "long",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-6 text-center text-gray-400 text-sm">
                        Selecciona un barbero para ver el calendario de disponibilidad
                    </div>
                )}

                {/* Hidden input con la fecha formateada para el action */}
                <input type="hidden" name="dateList" value={dateListValue} />

                {/* SERVICIO + PRECIO */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Servicio
                        </label>
                        <input
                            type="text"
                            name="service"
                            placeholder="Ej: Corte de Cabello"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio (€)
                        </label>
                        <input
                            type="number"
                            name="price"
                            placeholder="0.00"
                            min="0"
                            step="0.01"
                            className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            required
                        />
                    </div>
                </div>

                {/* DURACIÓN */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duración (min)
                    </label>
                    <input
                        type="number"
                        name="duration"
                        placeholder="30"
                        defaultValue="30"
                        min="15"
                        step="15"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>

                <hr className="my-2 border-gray-100" />

                {/* CLIENTE */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Cliente
                    </label>
                    <input
                        type="text"
                        name="client"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>

                {/* TELÉFONO */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        WhatsApp / Teléfono
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Ej: 3001234567"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                        required
                    />
                </div>

                {/* BOTONES */}
                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="flex-1 py-4 rounded-2xl font-bold text-gray-600 border-2 border-gray-200 hover:border-gray-300 transition-all"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !selectedDate}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98]"
                    >
                        {isSubmitting ? "Guardando..." : "Confirmar y Guardar Cita"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default NewDate