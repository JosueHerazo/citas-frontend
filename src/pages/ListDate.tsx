import { Link, Form, type ActionFunctionArgs, redirect, useActionData, useSubmit } from "react-router-dom"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import ErrorMessaje from "../components/ErrorMessage"
import { addProduct, getBarberAvailability } from "../services/ServiceDates"
import DatePicker from "../components/DatePicker"
import josuePerfil from "../assets/josuePerfil.jpeg"

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
    { id: "Josue", nombre: "Josue", foto: josuePerfil },
    { id: "Vato", nombre: "Vato", foto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vato" }
];

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

export default function ListDate() {
    // ELIMINADA: const [ocupados, setOcupados] = useState([]); <--- Esto causaba el error
    const submit = useSubmit();
    const error = useActionData() as string;
    const [template, setTemplate] = useState(
        "Hola {cliente}, tu cita en LatinosVip ha sido confirmada para el día {fecha} a las {hora}. Recuerda que las citas se reservan con 3h de antelación. ¡Te esperamos!"
    );
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [precio, setPrecio] = useState<number | string>("");
    const [barber, setBarber] = useState("");
    const [busySlots, setBusySlots] = useState<any[]>([]);    const [currentDuration, setCurrentDuration] = useState(30);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    const [clienteInfo] = useState({
        nombre: localStorage.getItem("cliente_nombre") || "",
        telefono: localStorage.getItem("cliente_telefono") || ""
    });

  useEffect(() => {
    if (barber) { // 'barber' es el estado que actualizas en handleBarberSelectç
        setIsLoadingAvailability(true);
        getBarberAvailability(barber).then(data => {
            // El backend devuelve { data: [ {dateList: "..."} ] }
            const safeData = Array.isArray(data) ? data : [];
            const dates = safeData.map((item: any) => item.dateList|| item);
            setBusySlots(dates); // Asegúrate de actualizar busySlots que va al DatePicker
        });
    }
}, [barber]);

    const getLocalISOString = (date: Date) => {
        const offset = date.getTimezoneOffset() * 60000;
        return new Date(date.getTime() - offset).toISOString();
    };

    const isTimeValid = (date: Date | null) => {
        if (!date) return false;
        const now = new Date();
        const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        return date >= threeHoursFromNow;
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const serviceName = e.target.value;
        const info = SERVICIOS_DATA.find(s => s.nombre === serviceName);
        if (info) {
            setPrecio(info.precio);
            setCurrentDuration(info.duracion);
        }
    };

    const handleBarberSelect = async (barberId: string) => {
        setBarber(barberId);
        setIsLoadingAvailability(true);
        try {
            const occupied = await getBarberAvailability(barberId);
            setBusySlots(occupied || []);
        } catch (err) {
            console.error("Error cargando disponibilidad", err);
            setBusySlots([]); // Limpiar si hay error
        } finally {
            setIsLoadingAvailability(false);
        }
    };

    const generarMensaje = (datos: any) => {
        const fechaObj = new Date(datos.dateList);
        const fecha = fechaObj.toLocaleDateString();
        const hora = fechaObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return template.replace("{cliente}", datos.client).replace("{fecha}", fecha).replace("{hora}", hora);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);
        // Limpiamos espacios para el link de WhatsApp
        const cleanPhone = data.phone.toString().replace(/\s+/g, '');
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(generarMensaje(data))}`; 
        submit(e.currentTarget); submit(e.currentTarget); // Esto dispara la 'action' que llama a addProduct
        window.open(whatsappUrl, '_blank');
    };

    
    return (
        <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="mt-10 max-w-lg mx-auto p-8 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl"
        >
            <header className="text-center mb-6">
                <h2 className="text-3xl font-black text-white">Reserva tu <span className="text-amber-400">Cita</span></h2>
            </header>

            <div className="mb-6 p-4 bg-amber-400/10 border border-amber-400/20 rounded-2xl text-center">
                <p className="text-amber-400 text-xs font-medium leading-relaxed italic">
                    ⚠️ Mínimo 3 horas de antelación para reservar.
                </p>
            </div>

            {error && <ErrorMessaje>{error}</ErrorMessaje>}

            <Form method="POST" onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div className="space-y-3">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Especialista</label>
                    <div className="flex gap-4">
                        {BARBEROS_DATA.map((b) => (
                            <div
                                key={b.id}
                                onClick={() => handleBarberSelect(b.nombre)}
                                className={`flex-1 cursor-pointer p-4 rounded-3xl border-2 transition-all duration-300 ${
                                    barber === b.nombre 
                                    ? "border-amber-400 bg-amber-400/10 scale-105" 
                                    : "border-zinc-800 bg-zinc-900/50 grayscale hover:grayscale-0"
                                }`}
                            >
                                <img src={b.foto} className="rounded-full w-full aspect-square object-cover" alt={b.nombre} />
                            </div>
                        ))}
                    </div>
                    <input type="hidden" name="barber" value={barber} />
                </div>

                <div className="space-y-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Servicio</label>
                    <select 
                        name="service" 
                        onChange={handleServiceChange} 
                        className="w-full font-bold text-white rounded-2xl p-4 bg-zinc-900 border-2 border-zinc-800 focus:border-amber-400 outline-none transition-colors"
                    >
                        <option value="">Selecciona un servicio</option>
                        {SERVICIOS_DATA.map(s => (
                            <option key={s.nombre} value={s.nombre}>
                                {s.nombre} — {s.duracion} min ({s.precio}€)
                            </option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Precio</label>
                        <div className="w-full font-black text-amber-400 rounded-2xl p-4 bg-zinc-900 border-2 border-zinc-800 text-2xl flex items-center justify-center">
                            {precio ? `${precio}€` : "--"}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between items-center px-1">
                            <label className="text-zinc-400 text-xs font-bold uppercase">Horario</label>
                            {isLoadingAvailability && (
                                <span className="flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                </span>
                            )}
                        </div>

                        <div className={`transition-all duration-500 ${(!barber || isLoadingAvailability) ? "opacity-20 pointer-events-none scale-95" : "opacity-100 scale-100"}`}>
                            <DatePicker 
                                key={barber} 
                                selectedDate={selectedDate} 
                                onChange={(date) => setSelectedDate(date)} 
                                busySlots={busySlots}
                            />
                        </div>
                        <input type="hidden" name="dateList" value={selectedDate ? getLocalISOString(selectedDate) : ""} />
                        <input type="hidden" name="duration" value={currentDuration} />
                    </div>
                </div>

                {selectedDate && !isTimeValid(selectedDate) && (
                    <p className="text-red-500 text-[10px] font-bold uppercase text-center">* Elige una hora con 3h de margen</p>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <input name="client" defaultValue={clienteInfo.nombre} placeholder="Tu Nombre" className="w-full p-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white focus:border-amber-400 outline-none" />
                    <input name="phone" defaultValue={clienteInfo.telefono} placeholder="Teléfono" className="w-full p-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white focus:border-amber-400 outline-none" />
                </div>

                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    disabled={!isTimeValid(selectedDate) || !barber || isLoadingAvailability}
                    type="submit"
                    className={`py-5 rounded-2xl font-black text-xl uppercase tracking-widest transition-all ${
                        isTimeValid(selectedDate) && barber ? "bg-amber-400 text-black shadow-lg" : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    }`}
                >
                    Confirmar Cita
                </motion.button>
            </Form>

            <div className="mt-8 p-4 bg-zinc-900/50 rounded-3xl border border-zinc-800">
                <textarea 
                    className="w-full bg-transparent text-zinc-400 text-xs p-2 outline-none resize-none"
                    rows={3}
                    value={template}
                    onChange={(e) => setTemplate(e.target.value)}
                />
            </div>

            <footer className="mt-8 text-center">
                <Link className="text-zinc-600 text-sm font-bold hover:text-amber-400" to="/">← INICIO</Link>
            </footer>
        </motion.div>
    );
}