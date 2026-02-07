import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getBarberAvailability } from "../services/ServiceDates";

interface DatePickerProps {
    selectedDate?: Date | null;
    onChange?: (date: Date | null) => void;
    busySlots?: any[];
}

export default function CustomDatePicker({ selectedDate, onChange, busySlots: propSlots }: DatePickerProps) {
    const navigate = useNavigate();
    const { barber: urlBarber } = useParams();
    const barber = urlBarber || ""; 
    const [internalSlots, setInternalSlots] = useState<any[]>([]);
    const [currentDay, setCurrentDay] = useState<Date>(new Date());

    // 1. Cargar disponibilidad desde el backend
    useEffect(() => {
        if (barber && !propSlots) {
            getBarberAvailability(barber).then(data => {
                setInternalSlots(data);
            });
        }
    }, [barber, propSlots]);

    const finalSlots = Array.isArray(propSlots || internalSlots) ? (propSlots || internalSlots) : [];

    // 2. Función para generar horarios (Faltaba definirla)
    const getHoursForDay = (date: Date) => {
        const day = date.getDay();
        const hours: string[] = [];
        let start = 10;
        let end = 20;

        if (day === 0) { // Domingo
            start = 11; end = 17;
        } else if (day >= 4 && day <= 6) { // Jueves a Sábado
            start = 10; end = 21;
        }

        for (let i = start; i < end; i++) {
            hours.push(`${i}:00`, `${i}:30`);
        }
        // Añadir la última hora de cierre si no es domingo
        if (day !== 0) hours.push(`${end}:00`); 
        return hours;
    };

    // 3. Lógica de comparación
    const checkIsBusy = (horaStr: string) => {
        const [h, m] = horaStr.split(':').map(Number);
        return finalSlots.some(slot => {
            const dateSlot = new Date(slot);
            return (
                dateSlot.getDate() === currentDay.getDate() &&
                dateSlot.getMonth() === currentDay.getMonth() &&
                dateSlot.getFullYear() === currentDay.getFullYear() &&
                dateSlot.getHours() === h &&
                dateSlot.getMinutes() === m
            );
        });
    };

    const checkIsSelected = (horaStr: string) => {
        if (!selectedDate) return false;
        const [h, m] = horaStr.split(':').map(Number);
        return (
            selectedDate.getDate() === currentDay.getDate() &&
            selectedDate.getMonth() === currentDay.getMonth() &&
            selectedDate.getHours() === h &&
            selectedDate.getMinutes() === m
        );
    };

    const handleHourSelect = (hora: string) => {
        const [h, m] = hora.split(':').map(Number);
        const nuevaFecha = new Date(currentDay);
        nuevaFecha.setHours(h, m, 0, 0);
        if (onChange) onChange(nuevaFecha);
    };

    // 4. Acción de Confirmación (Uso de navigate)
    const handleConfirmBooking = () => {
        if (selectedDate) {
            localStorage.setItem("temp_date", selectedDate.toISOString());
            localStorage.setItem("temp_barber", barber);
            navigate("/"); // Redirige al home o formulario principal
        }
    };

    return (
        <div className="p-4 bg-zinc-950 rounded-[2rem] border border-zinc-800 shadow-2xl">
            
            {/* BOTÓN DE CONFIRMACIÓN */}
            {selectedDate && (
                <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleConfirmBooking}
                    className="w-full mb-6 py-4 bg-amber-400 text-black font-black uppercase rounded-2xl shadow-lg hover:bg-amber-500 transition-all"
                >
                    Confirmar: {selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </motion.button>
            )}

            {/* SELECTOR DE DÍA */}
            <div className="flex justify-between items-center mb-6 px-2">
                <button 
                    type="button"
                    onClick={() => { const d = new Date(currentDay); d.setDate(d.getDate() - 1); setCurrentDay(d); }}
                    className="p-2 text-amber-500 font-black text-xl"
                >
                    {"<"}
                </button>
                <div className="text-center">
                    <p className="text-white font-bold capitalize">
                        {currentDay.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </p>
                </div>
                <button 
                    type="button"
                    onClick={() => { const d = new Date(currentDay); d.setDate(d.getDate() + 1); setCurrentDay(d); }}
                    className="p-2 text-amber-500 font-black text-xl"
                >
                    {">"}
                </button>
            </div>

            {/* GRID DE HORAS */}
            <div className="grid grid-cols-3 gap-2">
                {getHoursForDay(currentDay).map((hora) => {
                    const isBusy = checkIsBusy(hora);
                    const isSelected = checkIsSelected(hora);

                    return (
                        <button
                            key={hora}
                            type="button"
                            disabled={isBusy}
                            onClick={() => handleHourSelect(hora)}
                            className={`py-3 rounded-xl text-[11px] font-bold transition-all border-2 ${
                                isBusy 
                                ? "bg-zinc-900/50 text-zinc-700 border-transparent cursor-not-allowed" 
                                : isSelected
                                ? "bg-amber-400 text-black border-amber-400"
                                : "bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-amber-400"
                            }`}
                        >
                            {hora}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}