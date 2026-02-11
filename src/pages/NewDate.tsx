import { Form, type ActionFunctionArgs, redirect, useSubmit } from "react-router-dom"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
// Eliminados imports no usados: Link, ErrorMessaje, useActionData
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
    // NUEVO SERVICIO AÑADIDO
    { service: "Rizos semipermanente", price: 0, duration: 2 }, 
    { service: "Otros", price: 0, duration: 0 },
];

export default function ListDate() {
    const submit = useSubmit();
    const [template] = useState(
        "Hola {cliente}, tu cita en LatinosVip ha sido confirmada para el día {fecha} a las {hora}. ¡Te esperamos! reserva tu próxima cita https://cita-corte.netlify.app/" 
    );
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [price, setPrice] = useState<number | string>(""); 
    const [barber, setBarber] = useState("");
    const [busySlots, setBusySlots] = useState<any[]>([]);
    const [currentDuration, setCurrentDuration] = useState(30);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    
    const [clientInfo] = useState({
        name: localStorage.getItem("cliente_nombre") || "",
        phone: localStorage.getItem("cliente_telefono") || ""
    });

   useEffect(() => {
        let isMounted = true;
        if (barber) {
            setIsLoadingAvailability(true);
            getBarberAvailability(barber).then(res => {
                if (!isMounted) return;

                // Como TS dice que 'res' es un array (any[]), lo usamos directamente
                // Si 'res' es el array de citas, lo mapeamos. Si no es array, ponemos []
                const slots = Array.isArray(res) 
                    ? res.map((item: any) => item.dateList || item) 
                    : [];

                setBusySlots(slots);
                setIsLoadingAvailability(false);
            }).catch(() => {
                if (isMounted) setIsLoadingAvailability(false);
            });
        }
        return () => { isMounted = false; };
    }, [barber]);

    const getLocalISOString = (date: Date) => {
        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const serviceName = e.target.value;
        const info = SERVICIOS_DATA.find(s => s.service === serviceName);
        if (info) {
            setPrice(info.price);
            setCurrentDuration(info.duration);
        }
    };

    const generateMessage = (data: any) => {
        const dateObj = new Date(data.dateList);
        const day = dateObj.getDate().toString().padStart(2, '0');
        const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
        const hours = dateObj.getHours().toString().padStart(2, '0');
        const minutes = dateObj.getMinutes().toString().padStart(2, '0');
        const dateStr = `${day}/${month}/${dateObj.getFullYear()}`;
        const timeStr = `${hours}:${minutes}`;

        return template.replace("{cliente}", data.client)
                       .replace("{fecha}", dateStr)
                       .replace("{hora}", timeStr);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData);

        // VALIDACIÓN: No permite enviar ni abrir WhatsApp si faltan campos
        if (!data.barber || !data.service || !data.dateList || !data.client || !data.phone) {
            alert("⚠️ Por favor, rellena todos los campos antes de confirmar.");
            return;
        }

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
            <header className="text-center mb-8">
                <h2 className="text-3xl font-black text-white">Reserva tu <span className="text-amber-400">Cita</span></h2>
            </header>

            <Form method="POST" onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Especialista */}
                <div className="space-y-3">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Especialista</label>
                    <div className="flex gap-4">
                        {BARBEROS_DATA.map((b) => (
                            <div
                                key={b.id}
                                onClick={() => setBarber(b.barber)}
                                className={`flex-1 cursor-pointer p-4 rounded-3xl border-2 transition-all duration-300 ${
                                    barber === b.barber 
                                    ? "border-amber-400 bg-amber-400/10 scale-105" 
                                    : "border-zinc-800 bg-zinc-900/50 grayscale hover:grayscale-0"
                                }`}
                            >
                                <img src={b.foto} className="rounded-full w-full aspect-square object-cover" alt={b.barber} />
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
                        <div className="w-full font-black text-amber-400 rounded-2xl p-4 bg-zinc-900 border-2 border-zinc-800 text-2xl flex items-center justify-center h-[60px]">
                            {price !== "" ? `${price}€` : "--"}
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
                    <input name="client" defaultValue={clientInfo.name} placeholder="Tu Nombre" className="w-full p-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white outline-none focus:border-amber-400" />
                    <input name="phone" defaultValue={clientInfo.phone} placeholder="Teléfono" className="w-full p-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white outline-none focus:border-amber-400" />
                </div>

                <motion.button 
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="py-5 mt-4 rounded-2xl font-black text-xl uppercase tracking-widest bg-amber-400 text-black shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:bg-amber-500 transition-colors"
                >
                    Confirmar Cita
                </motion.button>
            </Form>
        </motion.div>
    );
}