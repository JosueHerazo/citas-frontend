import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const NewDate = () => {
    const navigate = useNavigate()

    // Estados
    const [barberos, setBarberos] = useState<string[]>([])
    const [nuevoBarbero, setNuevoBarbero] = useState("")
    const [loadingBarberos, setLoadingBarberos] = useState(true)

    const [formData, setFormData] = useState({
        service: "",
        price: "",
        barber: "",
        dateList: "",
        client: "",
        phone: "",
        duration: ""
    })

    // ==================== CARGAR BARBEROS ====================
    const fetchBarberos = async () => {
        try {
            setLoadingBarberos(true)
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/date/barberos`)
            
            // Si el backend devuelve un array de objetos
            if (data.data && data.data.length > 0) {
                const nombres = data.data.map((b: any) => b.nombre || b)
                setBarberos(nombres)
            } else {
                // Si el backend está vacío, cargamos los de base
                setBarberos(["Will", "Stiven"])
            }
        } catch (error) {
            console.error("Error al cargar barberos:", error)
            // Fallback con tus barberos base
            setBarberos(["Will", "Stiven", "Vato", "Josue"])
        } finally {
            setLoadingBarberos(false)
        }
    }

    useEffect(() => {
        fetchBarberos()
    }, [])

    // ==================== AGREGAR NUEVO BARBERO ====================
    const handleAddBarbero = async () => {
        const nombreLimpio = nuevoBarbero.trim()
        if (!nombreLimpio) return
        
        // Evitar duplicados
        const existe = barberos.some(b => b.toLowerCase() === nombreLimpio.toLowerCase())
        if (existe) {
            alert("Ese barbero ya existe en la lista")
            return
        }

        const newBarberosArray = [...barberos, nombreLimpio]

        try {
            // Mandamos el array completo al backend según tu ruta configurada
            await axios.post(`${import.meta.env.VITE_API_URL}/api/date/barberos`, {
                barberos: newBarberosArray
            })

            setBarberos(newBarberosArray)
            setNuevoBarbero("")
            alert("✅ Barbero agregado correctamente")
        } catch (error: any) {
            console.error(error)
            alert("Error al guardar el barbero: " + (error.response?.data?.error || error.message))
        }
    }

    // ==================== MANEJAR FORMULARIO ====================
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

    // ==================== CREAR CITA ====================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!formData.barber) {
            alert("Por favor selecciona un barbero")
            return
        }

        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/date`, formData)
            alert("🎉 Cita creada correctamente")
            navigate("/dates") 
        } catch (error: any) {
            console.error(error)
            alert("Error al crear la cita: revisa si llenaste todos los campos. " + (error.response?.data?.error || error.message))
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
            <h1 className="text-3xl font-bold mb-8 text-center">Nueva Cita</h1>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* BARBERO */}
                <div>
                    <label className="block text-sm font-medium mb-2">Barbero</label>
                    <div className="flex gap-3">
                        <select
                            name="barber"
                            value={formData.barber}
                            onChange={handleChange}
                            className="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500"
                            disabled={loadingBarberos}
                            required
                        >
                            <option value="">Selecciona un barbero</option>
                            {barberos.map((barber, i) => (
                                <option key={i} value={barber}>{barber}</option>
                            ))}
                        </select>

                        {/* Agregar nuevo barbero */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={nuevoBarbero}
                                onChange={(e) => setNuevoBarbero(e.target.value)}
                                placeholder="Nuevo barbero"
                                className="p-3 border border-gray-300 rounded-xl w-52 focus:outline-none focus:border-green-500"
                            />
                            <button
                                type="button"
                                onClick={handleAddBarbero}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 rounded-xl font-medium transition"
                            >
                                +
                            </button>
                        </div>
                    </div>
                </div>

                {/* SERVICIO */}
                <div>
                    <label className="block text-sm font-medium mb-1">Servicio</label>
                    <input
                        type="text"
                        name="service"
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-xl"
                        required
                    />
                </div>

                {/* PRECIO */}
                <div>
                    <label className="block text-sm font-medium mb-1">Precio</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-xl"
                        required
                    />
                </div>

                {/* FECHA Y HORA */}
                <div>
                    <label className="block text-sm font-medium mb-1">Fecha y Hora</label>
                    <input
                        type="datetime-local"
                        name="dateList"
                        value={formData.dateList}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-xl"
                        required
                    />
                </div>

                {/* CLIENTE */}
                <div>
                    <label className="block text-sm font-medium mb-1">Nombre del Cliente</label>
                    <input
                        type="text"
                        name="client"
                        value={formData.client}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-xl"
                        required
                    />
                </div>

                {/* TELÉFONO */}
                <div>
                    <label className="block text-sm font-medium mb-1">Teléfono</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-xl"
                        required
                    />
                </div>

                {/* DURACIÓN */}
                <div>
                    <label className="block text-sm font-medium mb-1">Duración (minutos)</label>
                    <input
                        type="number"
                        name="duration"
                        value={formData.duration}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-xl"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-semibold text-lg transition mt-6"
                >
                    Guardar Cita
                </button>
            </form>
        </div>
    )
}

export default NewDate