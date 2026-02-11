import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getBarberAvailability } from "../services/ServiceDates";

interface DatePickerProps {
    selectedDate?: Date | null;
    onChange?: (date: Date | null) => void;
    busySlots?: any[];
}

export default function CustomDatePicker({ selectedDate, onChange, busySlots: propSlots }: DatePickerProps) {
    const { barber: urlBarber } = useParams();
    const barber = urlBarber || ""; 
    const [internalSlots, setInternalSlots] = useState<any[]>([]);
    const [currentDay, setCurrentDay] = useState<Date>(new Date());
    
    // Cargar disponibilidad si no viene por props
    useEffect(() => {
        if (barber && !propSlots) {
            getBarberAvailability(barber).then(data => {
                setInternalSlots(data);
            });
        }
    }, [barber, propSlots]);

    const finalSlots = Array.isArray(propSlots || internalSlots) ? (propSlots || internalSlots) : [];

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
        if (day !== 0) hours.push(`${end}:00`); 
        return hours;
    };

    const checkIsBusy = (horaStr: string) => {
    const [h, m] = horaStr.split(':').map(Number);
    return finalSlots.some(slot => {
        const dateSlot = new Date(slot);
        
        // Comparamos año, mes, día, hora y minuto ignorando segundos/milisegundos
        return (
            dateSlot.getFullYear() === currentDay.getFullYear() &&
            dateSlot.getMonth() === currentDay.getMonth() &&
            dateSlot.getDate() === currentDay.getDate() &&
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
            selectedDate.getFullYear() === currentDay.getFullYear() &&
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

    return (
        <div className="p-4 bg-zinc-950 rounded-[2rem] border border-zinc-800 shadow-2xl">
            
            {/* SELECTOR DE DÍA */}
            <div className="flex justify-between items-center mb-6 px-2">
                <button 
                    type="button"
                    onClick={() => { const d = new Date(currentDay); d.setDate(d.getDate() - 1); setCurrentDay(d); }}
                    className="p-2 text-amber-500 font-black text-xl hover:scale-110 transition-transform"
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
                    className="p-2 text-amber-500 font-black text-xl hover:scale-110 transition-transform"
                >
                    {">"}
                </button>
            </div>

            {/* LEYENDA RÁPIDA */}
            <div className="flex justify-center gap-4 mb-4 text-[10px] uppercase font-bold">
                <div className="flex items-center gap-1 text-emerald-500">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Libre
                </div>
                <div className="flex items-center gap-1 text-red-500">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span> Ocupado
                </div>
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
                                ? "bg-red-500/10 text-red-500 border-red-500/20 cursor-not-allowed" // ESTADO OCUPADO (ROJO)
                                : isSelected
                                ? "bg-amber-400 text-black border-amber-400 scale-95" // ESTADO SELECCIONADO
                                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:border-emerald-500" // ESTADO LIBRE (VERDE)
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