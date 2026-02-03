import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion"; // <-- 1. IMPORTACIÓN AGREGADA
import { getBarberAvailability } from "../services/ServiceDates";

interface DatePickerProps {
    selectedDate?: Date | null;
    onChange?: (date: Date | null) => void;
    busySlots?: any[];
}

export default function CustomDatePicker({ selectedDate, onChange, busySlots: propSlots }: DatePickerProps) {
    const navigate = useNavigate(); // <-- 2. MOVIDO AQUÍ DENTRO
    const { barber: urlBarber } = useParams();
    const barberName = urlBarber || ""; 
    const [internalSlots, setInternalSlots] = useState<any[]>([]);
    const [currentDay, setCurrentDay] = useState<Date>(new Date());

    const handleConfirmBooking = () => {
        if (selectedDate) {
            localStorage.setItem("temp_date", selectedDate.toISOString());
            localStorage.setItem("temp_barber", urlBarber || "");
            navigate("/"); 
        }
    };

    useEffect(() => {
        if (barberName && !propSlots) {
            getBarberAvailability(barberName).then(setInternalSlots);
        }
    }, [barberName, propSlots]);

    const finalSlots = propSlots || internalSlots;

    const getHoursForDay = (date: Date) => {
        const day = date.getDay();
        const hours: string[] = [];
        let start = 10;
        let end = 20;

        if (day === 0) { 
            start = 11;
            end = 17;
        } else if (day >= 4 && day <= 6) { 
            start = 10;
            end = 21;
        } else { 
            start = 10;
            end = 20;
        }

        for (let i = start; i < end; i++) {
            hours.push(`${i}:00`, `${i}:30`);
        }
        if (day !== 0) hours.push(`${end}:00`); 
        return hours;
    };

    const handleHourSelect = (hora: string) => {
        const [h, m] = hora.split(':');
        const nuevaFecha = new Date(currentDay);
        nuevaFecha.setHours(parseInt(h), parseInt(m), 0, 0);
        if (onChange) onChange(nuevaFecha);
    };

    return (
        <div className="p-4 bg-zinc-950 rounded-[2rem] border border-zinc-800 shadow-2xl">
            
            {/* BOTÓN DE RESERVA RÁPIDA */}
            {urlBarber && selectedDate && (
                <motion.button
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleConfirmBooking}
                    className="w-full mb-6 py-4 bg-amber-400 text-black font-black uppercase rounded-2xl shadow-[0_10px_20px_rgba(251,191,36,0.3)] hover:bg-amber-500 transition-all"
                >
                    Confirmar: {selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </motion.button>
            )}

            {/* SELECTOR DE DÍA */}
            <div className="flex justify-between items-center mb-6">
                <button 
                    type="button" 
                    onClick={() => { const d = new Date(currentDay); d.setDate(d.getDate() - 1); setCurrentDay(d); }}
                    className="p-2 text-amber-500 font-bold"
                >
                    {"<"}
                </button>
                <div className="text-center">
                    <p className="text-white font-bold capitalize text-sm">
                        {currentDay.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                </div>
                <button 
                    type="button" 
                    onClick={() => { const d = new Date(currentDay); d.setDate(d.getDate() + 1); setCurrentDay(d); }}
                    className="p-2 text-amber-500 font-bold"
                >
                    {">"}
                </button>
            </div>

            {/* LEYENDA */}
            <div className="flex justify-center gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Libre</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Tu selección</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-800"></div>
                    <span className="text-[9px] text-zinc-700 font-bold uppercase">Ocupado</span>
                </div>
            </div>

            {/* GRID DE HORAS */}
            <div className="grid grid-cols-3 gap-2">
                {getHoursForDay(currentDay).map((hora) => {
                    const isBusy = finalSlots.some(slot => {
                        const d = new Date(slot);
                        return d.toDateString() === currentDay.toDateString() && 
                               d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false}) === (hora.length === 4 ? `0${hora}` : hora);
                    });

                    const isSelected = selectedDate?.toDateString() === currentDay.toDateString() && 
                                      selectedDate?.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit', hour12: false}) === (hora.length === 4 ? `0${hora}` : hora);

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

            {/* HORARIOS BARBERÍA */}
            <div className="mt-6 pt-6 border-t border-zinc-800 space-y-2">
                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-2">Horarios de la Barbería</p>
                <div className={`flex justify-between items-center p-2 rounded-lg ${currentDay.getDay() >= 1 && currentDay.getDay() <= 3 ? 'bg-amber-400/10' : ''}`}>
                    <span className="text-xs text-zinc-400">Lun - Mié</span>
                    <span className={`text-xs ${currentDay.getDay() >= 1 && currentDay.getDay() <= 3 ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>10:00 a 20:00</span>
                </div>
                <div className={`flex justify-between items-center p-2 rounded-lg ${currentDay.getDay() >= 4 && currentDay.getDay() <= 6 ? 'bg-amber-400/10' : ''}`}>
                    <span className="text-xs text-zinc-400">Jue - Sáb</span>
                    <span className={`text-xs ${currentDay.getDay() >= 4 && currentDay.getDay() <= 6 ? 'text-amber-400 font-bold' : 'text-zinc-300'}`}>10:00 a 21:00</span>
                </div>
                <div className={`flex justify-between items-center p-2 rounded-lg ${currentDay.getDay() === 0 ? 'bg-amber-400/10' : ''}`}>
                    <span className="text-xs text-zinc-400">Domingos</span>
                    <span className={`text-xs ${currentDay.getDay() === 0 ? 'text-amber-500 font-bold' : 'text-zinc-300'}`}>11:00 a 17:00</span>
                </div>
            </div>
        </div>
    );
}