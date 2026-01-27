import { Link, Form, type ActionFunctionArgs, redirect, useActionData } from "react-router-dom"
import { useState } from "react"
import { motion } from "framer-motion"
import ErrorMessaje from "../components/ErrorMessage"
import { addProduct, getBarberAvailability } from "../services/ServiceDates"
import DatePicker from "../components/DatePicker"

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)
    
    if (Object.values(data).includes("")) {
        return "Todos los campos son obligatorios"
    }

    try {
        await addProduct(data)
        return redirect("/nuevo/inicio")
    } catch (error) {
        return "Error al guardar la cita"
    }
}

const BARBEROS_DATA = [
    { id: "Josue", nombre: "Josue", foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Josue" },
    { id: "Vato", nombre: "Vato", foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vato" }
];

export default function ListDate() {
    const [clienteInfo] = useState({
        nombre: localStorage.getItem("cliente_nombre") || "",
        telefono: localStorage.getItem("cliente_telefono") || ""
    });
   

    const error = useActionData() as string
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [precio, setPrecio] = useState<number | string>("");
    const [barber, setBarber] = useState("");
    const [busySlots, setBusySlots] = useState([])
    const [currentDuration, setCurrentDuration] = useState(30);

    const SERVICIOS_DATA = [
        { nombre: "Corte", precio: 13, duracion: 30 },
        { nombre: "Corte con cejas", precio: 15, duracion: 40 },
        { nombre: "Corte con barba", precio: 18, duracion: 50 },
        { nombre: "Corte Vip", precio: 25, duracion: 70 },
        { nombre: "Barba", precio: 8, duracion: 15 },
        { nombre: "Barba VIP", precio: 11, duracion: 25 },
        { nombre: "Cejas", precio: 5, duracion: 10},
        { nombre: "Mechas", precio: 30, duracion: 60 },
        { nombre: "Tinte", precio: 30, duracion: 60 },
        { nombre: "Trenzas", precio: 20, duracion: 45 },
        { nombre: "Mask Carbon", precio: 3, duracion: 10 },
        { nombre: "Limpieza Facial", precio: 15, duracion: 25 },
        { nombre: "Diseño", precio: 3, duracion: 10 },
        { nombre: "Lavado de Cabello", precio: 2, duracion: 10},
        { nombre: "Otros", precio: 0, duracion: 0 },
    ];

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const serviceName = e.target.value;
        const info = SERVICIOS_DATA.find(s => s.nombre === serviceName);
        if (info) {
            setPrecio(info.precio);
            setCurrentDuration(info.duracion);
        }
    };

    const handleBarberSelect = async (name: string) => {
        setBarber(name);
        if (name) {
            const occupied = await getBarberAvailability(name);
            setBusySlots(occupied);
        }
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-10 max-w-lg mx-auto p-8 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl"
        >
            <header className="text-center mb-8">
                <h2 className="text-3xl font-black text-white tracking-tight">
                    Reserva tu <span className="text-amber-400">Experiencia</span>
                </h2>
                <p className="text-zinc-500 text-sm mt-2 font-medium">Luce tu mejor versión</p>
            </header>
            
            {error && <ErrorMessaje>{error}</ErrorMessaje>}

            <Form method="POST" className="flex flex-col gap-6">
                
                {/* BARBEROS */}
                <div className="space-y-3">
                    <label className="text-zinc-400 text-xs font-bold uppercase tracking-widest ml-1">Especialista</label>
                    <div className="flex gap-4">
                        {BARBEROS_DATA.map((b) => (
                            <motion.div
                                key={b.id}
                                whileHover={{ y: -5 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleBarberSelect(b.nombre)}
                                className={`flex-1 cursor-pointer p-4 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-3 ${
                                    barber === b.nombre 
                                    ? "border-amber-400 bg-amber-400/5 ring-1 ring-amber-400/50" 
                                    : "border-zinc-800 bg-zinc-900/50 grayscale hover:grayscale-0"
                                }`}
                            >
                                <img src={b.foto} alt={b.nombre} className="w-14 h-14 rounded-full bg-zinc-800 shadow-inner" />
                                <span className={`text-sm font-bold ${barber === b.nombre ? "text-amber-400" : "text-zinc-500"}`}>
                                    {b.nombre}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                    <input type="hidden" name="barber" value={barber} />
                </div>

                {/* SERVICIO */}
                <div className="space-y-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1" htmlFor="service">Servicio</label>
                    <select 
                        id="service" name="service"
                        className="w-full font-bold text-white rounded-2xl p-4 bg-zinc-900 border-2 border-zinc-800 focus:border-amber-400 focus:outline-none transition-all cursor-pointer appearance-none"
                        onChange={handleServiceChange}
                    >
                        <option value="">¿Qué te haremos hoy?</option>
                        {SERVICIOS_DATA.map((s) => (
                            <option key={s.nombre} value={s.nombre}>{s.nombre} — {s.duracion} min</option>
                        ))}
                    </select>
                </div>

                {/* PRECIO Y FECHA */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Inversión</label>
                        <input 
                            name="price" type="number" value={precio} readOnly
                            className="w-full font-black text-white rounded-2xl p-4 bg-zinc-900 border-2 border-zinc-800"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Horario</label>
                        <DatePicker 
                            selectedDate={selectedDate} 
                            onChange={(date) => setSelectedDate(date)} 
                            busySlots={busySlots}
                        /> 
                        <input 
                            type="hidden" 
                            name="dateList" 
                            value={selectedDate ? selectedDate.toISOString() : ""} 
                        />
                        <input type="hidden" name="duration" value={currentDuration} />
                    </div>
                </div>
                
             {/* DATOS CLIENTE REFORZADOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Tu Nombre</label>
                    <input 
                        name="client" 
                        type="text" 
                        defaultValue={clienteInfo.nombre}
                        className="w-full p-4 rounded-2xl font-bold text-white bg-zinc-900 border-2 border-zinc-800 focus:border-amber-400 outline-none" 
                        placeholder="Nombre completo" 
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Teléfono de Contacto</label>
                    <input 
                        name="phone" 
                        type="tel" 
                        defaultValue={clienteInfo.telefono}
                        className="w-full p-4 rounded-2xl font-bold text-white bg-zinc-900 border-2 border-zinc-800 focus:border-amber-400 outline-none" 
                        placeholder="600 000 000"
                    />
                </div>
            </div>

                <motion.button 
                    whileHover={{ scale: 1.02, backgroundColor: "#fbbf24" }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="mt-2 bg-amber-400 py-5 text-black font-black text-xl cursor-pointer rounded-2xl shadow-xl uppercase tracking-widest"
                >
                    Confirmar Cita
                </motion.button>
            </Form>

            <footer className="mt-8 text-center">
                <Link className="text-zinc-600 text-sm font-bold hover:text-amber-400 transition-colors" to="/">
                    ← VOLVER AL INICIO
                </Link>
            </footer>
        </motion.div>
    )
}