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

    useEffect(() => {
        if (barber && !propSlots) {
            getBarberAvailability(barber).then(data => setInternalSlots(data));
        }
    }, [barber, propSlots]);

    const finalSlots = Array.isArray(propSlots || internalSlots)
        ? (propSlots || internalSlots)
        : [];

    const getHoursForDay = (date: Date) => {
        const day = date.getDay();
        const hours: string[] = [];
        let start = 10, end = 20;
        if (day === 0) { start = 11; end = 17; }
        else if (day >= 4 && day <= 6) { start = 10; end = 21; }
        for (let i = start; i < end; i++) {
            hours.push(`${i}:00`, `${i}:30`);
        }
        if (day !== 0) hours.push(`${end}:00`);
        return hours;
    };

    const checkIsBusy = (horaStr: string) => {
        const [h, m] = horaStr.split(':').map(Number);
        const slotMin = h * 60 + m;

        return finalSlots.some(slot => {
            const rawDate = typeof slot === 'object' && slot !== null ? slot.dateList : slot;
            const duration = typeof slot === 'object' && slot !== null ? (slot.duration || 30) : 30;

            // Parseo manual — evita bugs UTC/local en Android
            const raw = String(rawDate); // "2026-03-18T11:00:00"
            const [datePart, timePart] = raw.split('T');
            if (!datePart || !timePart) return false;
            const [year, month, day] = datePart.split('-').map(Number);
            const [ch, cm] = timePart.split(':').map(Number);

            // ¿Es el mismo día?
            const mismoDia =
                year  === currentDay.getFullYear() &&
                month === currentDay.getMonth() + 1 &&
                day   === currentDay.getDate();

            if (!mismoDia) return false;

            // ¿Cae dentro del rango de la cita?
            const citaStartMin = ch * 60 + cm;
            const citaEndMin   = citaStartMin + duration;

            return slotMin >= citaStartMin && slotMin < citaEndMin;
        });
    };

    const checkIsSelected = (horaStr: string) => {
        if (!selectedDate) return false;
        const [h, m] = horaStr.split(':').map(Number);
        return (
            selectedDate.getDate()     === currentDay.getDate()     &&
            selectedDate.getMonth()    === currentDay.getMonth()    &&
            selectedDate.getFullYear() === currentDay.getFullYear() &&
            selectedDate.getHours()    === h &&
            selectedDate.getMinutes()  === m
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
                    onClick={() => {
                        const d = new Date(currentDay);
                        d.setDate(d.getDate() - 1);
                        if (d >= new Date(new Date().setHours(0, 0, 0, 0))) setCurrentDay(d);
                    }}
                    className={`p-2 font-black text-xl ${
                        currentDay.toDateString() === new Date().toDateString()
                            ? "text-zinc-800 cursor-not-allowed"
                            : "text-amber-500"
                    }`}
                >{"<"}</button>

                <div className="text-center">
                    <p className="text-white font-bold capitalize">
                        {currentDay.toLocaleDateString('es-ES', {
                            weekday: 'long', day: 'numeric', month: 'short'
                        })}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        const d = new Date(currentDay);
                        d.setDate(d.getDate() + 1);
                        setCurrentDay(d);
                    }}
                    className="p-2 text-amber-500 font-black text-xl hover:scale-110 transition-transform"
                >{">"}</button>
            </div>

            {/* CONTADOR */}
            {finalSlots.length > 0 ? (
                <p className="text-[9px] text-zinc-600 text-center mb-2">
                    {finalSlots.length} slots ocupados cargados
                </p>
            ) : (
                <p className="text-[9px] text-zinc-700 text-center mb-2">
                    Sin slots ocupados
                </p>
            )}

            {/* LEYENDA */}
            <div className="flex justify-center gap-4 mb-4 text-[10px] uppercase font-bold">
                <div className="flex items-center gap-1 text-emerald-500">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Libre
                </div>
                <div className="flex items-center gap-1 text-red-500">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span> Ocupado
                </div>
                <div className="flex items-center gap-1 text-zinc-600">
                    <span className="w-2 h-2 bg-zinc-700 rounded-full"></span> Pasado
                </div>
            </div>

            {/* GRID DE HORAS */}
            <div className="grid grid-cols-3 gap-2">
                {getHoursForDay(currentDay).map((hora) => {
                    const isBusy     = checkIsBusy(hora);
                    const isSelected = checkIsSelected(hora);
                    const [h, m]     = hora.split(':').map(Number);
                    const now        = new Date();
                    const isToday    =
                        currentDay.getDate()     === now.getDate()     &&
                        currentDay.getMonth()    === now.getMonth()    &&
                        currentDay.getFullYear() === now.getFullYear();
                    const isPast = isToday && (
                        h < now.getHours() ||
                        (h === now.getHours() && m <= now.getMinutes())
                    );

                    return (
                        <button
                            key={hora}
                            type="button"
                            disabled={isBusy || isPast}  // ✅ bloquea click
                            onClick={() => {
                                if (!isBusy && !isPast) handleHourSelect(hora)
                            }}
                            className={`py-3 rounded-xl text-[11px] font-bold transition-all border-2 ${
                                isBusy   // ✅ isBusy PRIMERO siempre
                                    ? "bg-red-500/10 text-red-500 border-red-500/20 cursor-not-allowed opacity-60"
                                    : isPast
                                    ? "bg-zinc-900 text-zinc-700 border-transparent cursor-not-allowed opacity-30"
                                    : isSelected
                                    ? "bg-amber-400 text-black border-amber-400"
                                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:border-emerald-500"
                            }`}
                        >
                            {hora}
                        </button>
                    );
                })}
            </div>
        </div>
    );
} internalSlots)
        ? (propSlots || internalSlots)
        : [];

    const getHoursForDay = (date: Date) => {
        const day = date.getDay();
        const hours: string[] = [];
        let start = 10, end = 20;
        if (day === 0) { start = 11; end = 17; }
        else if (day >= 4 && day <= 6) { start = 10; end = 21; }
        for (let i = start; i < end; i++) {
            hours.push(`${i}:00`, `${i}:30`);
        }
        if (day !== 0) hours.push(`${end}:00`);
        return hours;
    };

    const checkIsBusy = (horaStr: string) => {
    const [h, m] = horaStr.split(':').map(Number);

    return finalSlots.some(slot => {
        const rawDate = typeof slot === 'object' && slot !== null ? slot.dateList : slot;
        const duration = typeof slot === 'object' && slot !== null ? (slot.duration || 30) : 30;

        // ✅ Parseo manual para evitar diferencias UTC/local en Android
        const raw = String(rawDate); // "2026-03-17T18:30:00"
        const [datePart, timePart] = raw.split('T');
        const [year, month, day] = datePart.split('-').map(Number);
        const [ch, cm] = timePart.split(':').map(Number);

        // Comparar directamente sin crear objetos Date
        const mismoDia =
            year  === currentDay.getFullYear() &&
            month === currentDay.getMonth() + 1 &&
            day   === currentDay.getDate();

        if (!mismoDia) return false;

        // Convertir todo a minutos y comparar el rango
        const citaStartMin = ch * 60 + cm;
        const citaEndMin   = citaStartMin + duration;
        const slotMin      = h * 60 + m;

        return slotMin >= citaStartMin && slotMin < citaEndMin;
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
                    onClick={() => {
                        const d = new Date(currentDay);
                        d.setDate(d.getDate() - 1);
                        if (d >= new Date(new Date().setHours(0, 0, 0, 0))) setCurrentDay(d);
                    }}
                    className={`p-2 font-black text-xl ${
                        currentDay.toDateString() === new Date().toDateString()
                            ? "text-zinc-800 cursor-not-allowed"
                            : "text-amber-500"
                    }`}
                >{"<"}</button>

                <div className="text-center">
                    <p className="text-white font-bold capitalize">
                        {currentDay.toLocaleDateString('es-ES', {
                            weekday: 'long', day: 'numeric', month: 'short'
                        })}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => {
                        const d = new Date(currentDay);
                        d.setDate(d.getDate() + 1);
                        setCurrentDay(d);
                    }}
                    className="p-2 text-amber-500 font-black text-xl hover:scale-110 transition-transform"
                >{">"}</button>
            </div>

            {/* CONTADOR DE SLOTS */}
            {finalSlots.length > 0 && (
                <p className="text-[9px] text-zinc-600 text-center mb-2">
                    {finalSlots.length} slots ocupados cargados
                </p>
            )}
            {finalSlots.length === 0 && (
                <p className="text-[9px] text-zinc-700 text-center mb-2">
                    Sin slots ocupados
                </p>
            )}

            {/* LEYENDA */}
            <div className="flex justify-center gap-4 mb-4 text-[10px] uppercase font-bold">
                <div className="flex items-center gap-1 text-emerald-500">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full"></span> Libre
                </div>
                <div className="flex items-center gap-1 text-red-500">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span> Ocupado
                </div>
                <div className="flex items-center gap-1 text-zinc-600">
                    <span className="w-2 h-2 bg-zinc-700 rounded-full"></span> Pasado
                </div>
            </div>

            {/* GRID DE HORAS */}
            <div className="grid grid-cols-3 gap-2">
                {getHoursForDay(currentDay).map((hora) => {
                    const isBusy     = checkIsBusy(hora);
                    const isSelected = checkIsSelected(hora);
                    const [h, m]     = hora.split(':').map(Number);
                    const now        = new Date();
                    const isToday    =
                        currentDay.getDate()     === now.getDate()     &&
                        currentDay.getMonth()    === now.getMonth()    &&
                        currentDay.getFullYear() === now.getFullYear();
                    const isPast = isToday && (
                        h < now.getHours() ||
                        (h === now.getHours() && m <= now.getMinutes())
                    );

                    return (
                        <button
                            key={hora}
                            type="button"
                            disabled={isBusy || isPast}
                            onClick={() => !isBusy && !isPast && handleHourSelect(hora)}
                            className={`py-3 rounded-xl text-[11px] font-bold transition-all border-2 ${
                                isBusy        // ✅ isBusy SIEMPRE tiene prioridad
                                    ? "bg-red-500/10 text-red-500 border-red-500/20 cursor-not-allowed opacity-60"
                                    : isPast
                                    ? "bg-zinc-900 text-zinc-700 border-transparent cursor-not-allowed opacity-30"
                                    : isSelected
                                    ? "bg-amber-400 text-black border-amber-400"
                                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:border-emerald-500"
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