import { Link, Form, type ActionFunctionArgs, redirect, useActionData, useSubmit } from "react-router-dom"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import ErrorMessaje from "../components/ErrorMessage"
import { addProduct, getBarberAvailability } from "../services/ServiceDates"
import DatePicker from "../components/CustomDatePicker"
import josuePerfil from "../assets/josuePerfil.jpeg"
import vatoPerfil from "../assets/vatoPerfil.jpeg"

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
    { id: "Josue", barber: "Josue", foto: josuePerfil },
    { id: "Vato", barber: "Vato", foto: vatoPerfil }
];

const SERVICIOS_DATA = [
    { service: "Corte", price: 13, duration: 30 },
    { service: "Corte con cejas", price: 15, duration: 40 },
    { service: "Corte con barba", price: 18, duration: 50 },
    { service: "Corte Vip", price: 25, duration: 70 },
    { service: "Barba", price: 8, duration: 15 },
    { service: "Barba VIP", price: 11, duration: 25 },
    { service: "Cejas", price: 5, duration: 10},
    { service: "Mechas", price: 30, duration: 60 },
    { service: "Tinte", price: 30, duration: 60 },
    { service: "Trenzas", price: 20, duration: 45 },
    { service: "Mask Carbon", price: 3, duration: 10 },
    { service: "Limpieza Facial", price: 15, duration: 25 },
    { service: "Diseño", price: 3, duration: 10 },
    { service: "Lavado de Cabello", price: 2, duration: 10},
    { service: "Otros", price: 0, duration: 0 },
];

export default function ListDate() {
    const submit = useSubmit();
    const error = useActionData() as string;
    const [template] = useState(
        "Hola {cliente}, tu cita en LatinosVip ha sido confirmada para el día {fecha} a las {hora}. Recuerda reservar con antelacion. ¡Te esperamos!  reserva tu próxima cita https://cita-corte.netlify.app/" 
    );
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [price, setPrice] = useState<number | string>(""); // Corregido: setPrice
    const [barber, setBarber] = useState("");
    const [busySlots, setBusySlots] = useState<any[]>([]);
    const [currentDuration, setCurrentDuration] = useState(30);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    
    // Corregido: 'name' en lugar de 'service' para evitar confusión con el servicio de barbería
    const [clientInfo] = useState({
        name: localStorage.getItem("cliente_nombre") || "",
        phone: localStorage.getItem("cliente_telefono") || ""
    });

    useEffect(() => {
        if (barber) {
            setIsLoadingAvailability(true);
            getBarberAvailability(barber).then(data => {
                const safeData = Array.isArray(data) ? data : [];
                const dates = safeData.map((item: any) => item.dateList || item);
                setBusySlots(dates);
                setIsLoadingAvailability(false);
            });
        }
    }, [barber]);

  useEffect(() => {
    let isMounted = true; // Control para evitar actualizaciones si el componente cambia

    if (barber) {
        setIsLoadingAvailability(true);
        getBarberAvailability(barber).then(data => {
            if (!isMounted) return; // Si el barbero cambió antes de que terminara la petición, ignoramos el resultado

            const safeData = Array.isArray(data) ? data : [];
            const dates = safeData.map((item: any) => item.dateList || item);
            setBusySlots(dates);
            setIsLoadingAvailability(false);
        }).catch(() => {
            if (isMounted) setIsLoadingAvailability(false);
        });
    }

    return () => {
        isMounted = false; // Limpieza al desmontar o cambiar el barbero
    };
}, [barber]);

    const getLocalISOString = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    // Esto genera: 2024-05-20T15:30:00 (Sin la 'Z' al final para que no sea UTC)
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

    const isTimeValid = (date: Date | null) => {
        if (!date) return false;
        const now = new Date();
        const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        return date >= threeHoursFromNow;
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const serviceName = e.target.value;
        const info = SERVICIOS_DATA.find(s => s.service === serviceName);
        if (info) {
            setPrice(info.price);
            setCurrentDuration(info.duration);
        }
    };

    const handleBarberSelect = (barberId: string) => {
        setBarber(barberId);
    };

    const generateMessage = (data: any) => {
    // Importante: Si dateList viene del input hidden que usa getLocalISOString
    const dateObj = new Date(data.dateList);
    
    // Usamos el formato local del navegador sin forzar timeZone 
    // para que coincida con lo que el usuario seleccionó visualmente
    const dateStr = dateObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
    
    const timeStr = dateObj.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
    });

    return template.replace("{cliente}", data.client)
                   .replace("{fecha}", dateStr)
                   .replace("{hora}", timeStr);
};
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);
        const cleanPhone = data.phone.toString().replace(/\s+/g, '');
        const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(generateMessage(data))}`; 
        submit(e.currentTarget); 
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
                {/* Especialista */}
                <div className="space-y-3">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Especialista</label>
                    <div className="flex gap-4">
                        {BARBEROS_DATA.map((b) => (
                            <div
                                key={b.id}
                                onClick={() => handleBarberSelect(b.barber)}
                                className={`flex-1 cursor-pointer p-4 rounded-3xl border-2 transition-all duration-300 ${
                                    barber === b.barber 
                                    ? "border-amber-400 bg-amber-400/10 scale-105" 
                                    : "border-zinc-800 bg-zinc-900/50 grayscale hover:grayscale-0"
                                }`}
                            >
                                <img src={b.foto} className="rounded-full w-full aspect-square object-cover" alt={b.barber} />
                                {barber === b.barber && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 text-center">
                                        <Link to={`/barberos/disponibles/${barber}`} className="text-amber-500 text-[10px] font-black uppercase tracking-widest">
                                            Ver disponibilidad
                                        </Link>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>
                    <input type="hidden" name="barber" value={barber} />
                </div>

                {/* Servicio */}
                <div className="space-y-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Servicio</label>
                    <select name="service" onChange={handleServiceChange} className="w-full font-bold text-white rounded-2xl p-4 bg-zinc-900 border-2 border-zinc-800 focus:border-amber-400 outline-none">
                        <option value="">Selecciona un servicio</option>
                        {SERVICIOS_DATA.map(s => (
                            <option key={s.service} value={s.service}>{s.service} — {s.duration} min ({s.price}€)</option>
                        ))}
                    </select>
                </div>

                {/* Precio y Horario */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Precio</label>
                        <div className="w-full font-black text-amber-400 rounded-2xl p-4 bg-zinc-900 border-2 border-zinc-800 text-2xl flex items-center justify-center">
                            {price ? `${price}€` : "--"}
                        </div>
                        <input type="hidden" name="price" value={price} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Horario</label>
                        <div className={`${(!barber || isLoadingAvailability) ? "opacity-20 pointer-events-none" : "opacity-100"}`}>
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

                {/* Datos Cliente */}
                <div className="grid grid-cols-2 gap-4">
                    <input name="client" defaultValue={clientInfo.name} placeholder="Tu Nombre" className="w-full p-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white" />
                    <input name="phone" defaultValue={clientInfo.phone} placeholder="Teléfono" className="w-full p-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white" />
                </div>

                <motion.button 
                    whileTap={{ scale: 0.98 }}
                    disabled={!isTimeValid(selectedDate) || !barber}
                    type="submit"
                    className={`py-5 rounded-2xl font-black text-xl uppercase tracking-widest ${
                        isTimeValid(selectedDate) && barber ? "bg-amber-400 text-black shadow-lg" : "bg-zinc-800 text-zinc-500"
                    }`}
                >
                    Confirmar Cita
                </motion.button>
            </Form>

            <footer className="mt-8 text-center">
                <Link className="text-zinc-600 text-sm font-bold hover:text-amber-400" to="/">← INICIO</Link>
            </footer>
        </motion.div>
    );
}