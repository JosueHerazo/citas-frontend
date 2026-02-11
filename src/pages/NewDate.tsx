import { Form, type ActionFunctionArgs, redirect, useSubmit } from "react-router-dom"
import { useEffect, useState, useMemo } from "react"
import { motion } from "framer-motion"
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
    { service: "Rizos semipermanente", price: 0, duration: 2 }, 
    { service: "Otros", price: 0, duration: 0 },
];

export default function ListDate() {
    const submit = useSubmit();
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [price, setPrice] = useState<number | string>(""); 
    const [service, setService] = useState("");
    const [barber, setBarber] = useState("");
    const [busySlots, setBusySlots] = useState<any[]>([]);
    const [currentDuration, setCurrentDuration] = useState(30);
    const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
    
    const [clientName, setClientName] = useState(localStorage.getItem("cliente_nombre") || "");
    const [clientPhone, setClientPhone] = useState(localStorage.getItem("cliente_telefono") || "");

    // 1. CARGAR DISPONIBILIDAD (Se activa al elegir barbero)
    useEffect(() => {
        let isMounted = true;
        if (barber) {
            setIsLoadingAvailability(true);
            getBarberAvailability(barber).then(res => {
                if (!isMounted) return;
                // Importante: Aseguramos que los slots sean strings de fecha limpios
                const slots = Array.isArray(res) ? res : [];
                setBusySlots(slots);
                setIsLoadingAvailability(false);
            }).catch(() => {
                if (isMounted) setIsLoadingAvailability(false);
            });
        }
        return () => { isMounted = false; };
    }, [barber]);

    // 2. VALIDACIÓN DEL FORMULARIO (Memoizada)
    const isFormValid = useMemo(() => {
        return (
            barber !== "" &&
            service !== "" &&
            selectedDate !== null &&
            clientName.trim() !== "" &&
            clientPhone.trim() !== ""
        );
    }, [barber, service, selectedDate, clientName, clientPhone]);

    // 3. FORMATEADOR DE FECHA LOCAL (Eliminada variable 'dif' no usada)
    const getLocalISOString = (date: Date) => {
        const pad = (num: number) => (num < 10 ? '0' : '') + num;
        return date.getFullYear() +
            '-' + pad(date.getMonth() + 1) +
            '-' + pad(date.getDate()) +
            'T' + pad(date.getHours()) +
            ':' + pad(date.getMinutes()) +
            ':' + pad(date.getSeconds());
    };

    const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        setService(val);
        const info = SERVICIOS_DATA.find(s => s.service === val);
        if (info) {
            setPrice(info.price);
            setCurrentDuration(info.duration);
        }
    };

   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid) return;

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData);

    // Formatear la fecha para que se lea bonita: "miércoles, 11 de febrero"
    const dateObj = new Date(data.dateList as string);
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = dateObj.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    });
    
    // CONSTRUCCIÓN DEL MENSAJE
    const message = 
        `*¡Hola LatinosVip!* 💈\n\n` +
        `Nueva cita reservada:\n` +
        `👤 *Cliente:* ${data.client}\n` +
        `✂️ *Servicio:* ${data.service}\n` +
        `📅 *Fecha:* ${dateStr}\n` +
        `⏰ *Hora:* ${timeStr}\n` +
        `💰 *Precio:* ${data.price}€\n` +
        `🧔 *Barbero:* ${data.barber}\n\n` +
        `_Enviado desde el sistema de reservas._`;

    // Limpiar el teléfono de símbolos
    const cleanPhone = data.phone?.toString().replace(/\D/g, ''); 
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`; 
    
    // Enviar formulario al backend
    submit(e.currentTarget); 
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank');
};

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-10 max-w-lg mx-auto p-8 bg-zinc-950 border border-zinc-800 rounded-[2.5rem] shadow-2xl">
            <header className="text-center mb-8">
                <h2 className="text-3xl font-black text-white">Reserva tu <span className="text-amber-400">Cita</span></h2>
            </header>

            <Form method="POST" onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Especialista */}
                <div className="space-y-3">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Especialista</label>
                    <div className="flex gap-4">
                        {BARBEROS_DATA.map((b) => (
                            <div key={b.id} onClick={() => { setBarber(b.barber); setSelectedDate(null); }}
                                className={`flex-1 cursor-pointer p-4 rounded-3xl border-2 transition-all duration-300 ${barber === b.barber ? "border-amber-400 bg-amber-400/10 scale-105" : "border-zinc-800 bg-zinc-900/50 grayscale hover:grayscale-0"}`}>
                                <img src={b.foto} className="rounded-full w-full aspect-square object-cover" alt={b.barber} />
                                <p className={`text-center mt-2 text-[10px] font-bold ${barber === b.barber ? "text-amber-400" : "text-zinc-500"}`}>{b.barber}</p>
                            </div>
                        ))}
                    </div>
                    <input type="hidden" name="barber" value={barber} />
                </div>

                {/* Servicio */}
                <div className="space-y-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Servicio</label>
                   <select 
                name="service" 
                value={service} 
                onChange={handleServiceChange} 
                className="w-full font-bold text-white rounded-2xl p-4 bg-zinc-900 border-2 border-zinc-800 focus:border-amber-400 outline-none transition-colors"
            >
                <option value="">Selecciona un servicio</option>
                {SERVICIOS_DATA.map(s => (
                    <option key={s.service} value={s.service}>
                        {s.service} — {s.price}€ ({s.duration} min)
                    </option>
                ))}
</select>
                </div>

                {/* Horario y Precio */}
                <div className="flex flex-col gap-4">
                    <div className="space-y-2">
                        <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Horario</label>
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
                </div>

                {/* Datos Cliente */}
                <div className="space-y-2">
                    <label className="text-zinc-400 text-xs font-bold uppercase ml-1">Tus Datos</label>
                    <div className="grid grid-cols-2 gap-4">
                        <input name="client" value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Tu Nombre" className="w-full p-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white outline-none focus:border-amber-400 transition-all" />
                        <input name="phone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="WhatsApp" className="w-full p-4 rounded-2xl bg-zinc-900 border-2 border-zinc-800 text-white outline-none focus:border-amber-400 transition-all" />
                    </div>
                </div>

                {/* Resumen de Precio */}
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
                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}`}
                >
                    {isFormValid ? "Confirmar Cita" : "Completa los datos"}
                </motion.button>
            </Form>
        </motion.div>
    );
}