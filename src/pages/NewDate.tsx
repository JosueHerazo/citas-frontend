import { useState, useEffect } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

const NewDate = () => {
    const navigate = useNavigate()

    // Barberos de base que SIEMPRE deben existir
    const barberosBase = ["Will", "Stiven"]

    // Estados
    const [barberos, setBarberos] = useState<string[]>(barberosBase)
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
            
            let nombresDesdeBackend: string[] = []
            
            if (data.data && Array.isArray(data.data)) {
                // Mapear si vienen como objetos {nombre: '...'} o strings directos
                nombresDesdeBackend = data.data.map((b: any) => b.nombre || b)
            }

            // Unir barberos de base con los del backend y eliminar duplicados
            const listaUnica = Array.from(new Set([...barberosBase, ...nombresDesdeBackend]))
            setBarberos(listaUnica)

        } catch (error) {
            console.error("Error al cargar barberos:", error)
            // Si hay error, al menos dejamos los de base
            setBarberos(barberosBase)
        } finally {
            setLoadingBarberos(false)
        }
    }

    useEffect(() => {
        fetchBarberos()
    }, [])

    // ==================== AGREGAR NUEVO BARBERO ====================
    // const handleAddBarbero = async () => {
    //     const nombreLimpio = nuevoBarbero.trim()
    //     if (!nombreLimpio) return
        
    //     const existe = barberos.some(b => b.toLowerCase() === nombreLimpio.toLowerCase())
    //     if (existe) {
    //         alert("Ese barbero ya existe en la lista")
    //         return
    //     }

    //     const newBarberosArray = [...barberos, nombreLimpio]

    //     try {
    //         // Enviamos la lista actualizada al backend
    //         await axios.post(`${import.meta.env.VITE_API_URL}/api/date/barberos`, {
    //             barberos: newBarberosArray
    //         })

    //         setBarberos(newBarberosArray)
    //         setNuevoBarbero("")
    //         alert("✅ Barbero agregado correctamente")
    //     } catch (error: any) {
    //         console.error(error)
    //         alert("Error al guardar: " + (error.response?.data?.error || error.message))
    //     }
    // }
    const handleAddBarbero = async () => {
    const nombreLimpio = nuevoBarbero.trim();
    if (!nombreLimpio) return;

    try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/date/barberos`, {
            nombre: nombreLimpio
        });

        fetchBarberos();           // recarga la lista
        setNuevoBarbero("");
        alert("✅ Barbero agregado");
    } catch (error: any) {
        alert("Error: " + (error.response?.data?.error || error.message));
    }
};

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        })
    }

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
            alert("Error al crear la cita. Asegúrate que el servidor esté actualizado.")
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-100">
            <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Nueva Cita</h1>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* SECCIÓN BARBERO */}
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Asignar Barbero</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <select
                            name="barber"
                            value={formData.barber}
                            onChange={handleChange}
                            className="flex-1 p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            disabled={loadingBarberos}
                            required
                        >
                            <option value="">Selecciona...</option>
                            {barberos.map((barber, i) => (
                                <option key={i} value={barber}>{barber}</option>
                            ))}
                        </select>

                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={nuevoBarbero}
                                onChange={(e) => setNuevoBarbero(e.target.value)}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                        <input
                            type="text"
                            name="service"
                            placeholder="Ej: Corte de Cabello"
                            value={formData.service}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-xl"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                        <input
                            type="number"
                            name="price"
                            placeholder="0.00"
                            value={formData.price}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-xl"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha y Hora</label>
                        <input
                            type="datetime-local"
                            name="dateList"
                            value={formData.dateList}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-xl"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
                        <input
                            type="number"
                            name="duration"
                            placeholder="30"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full p-3 border border-gray-300 rounded-xl"
                            required
                        />
                    </div>
                </div>

                <hr className="my-2 border-gray-100" />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Cliente</label>
                    <input
                        type="text"
                        name="client"
                        value={formData.client}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-xl"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Teléfono</label>
                    <input
                        type="tel"
                        name="phone"
                        placeholder="Ej: 3001234567"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-xl"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98] mt-4"
                >
                    Confirmar y Guardar Cita
                </button>
            </form>
        </div>
    )
}

export default NewDate