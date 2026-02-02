// CustomDatePicker.tsx
import ReactDatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale/es';


registerLocale('es', es);

// Actualizamos la Interface para incluir busySlots
interface DatePickerProps {
    selectedDate: Date | null;
    onChange: (date: Date | null) => void;
    busySlots: any[]; // <--- Agregamos esto
}

export default function CustomDatePicker({ selectedDate, onChange, busySlots }: DatePickerProps) {
    
   const filterOccupied = (time: Date) => {
    // Si busySlots no existe o no es array, permitimos la hora
    if (!Array.isArray(busySlots)) return true;

    return !busySlots.some(slot => {
        const busyDate = new Date(slot);
        return (
            busyDate.getDate() === time.getDate() &&
            busyDate.getMonth() === time.getMonth() &&
            busyDate.getHours() === time.getHours()
        );
    });
};
// const SERVICIOS_DATA = [
//         { nombre: "Corte", precio: 13, duracion: 30 },
//         { nombre: "Corte con cejas", precio: 15, duracion: 40 },
//         { nombre: "Corte con barba", precio: 18, duracion: 50 },
//         { nombre: "Corte Vip", precio: 25, duracion: 70 },
//         { nombre: "Barba", precio: 8, duracion: 15 },
//         { nombre: "Barba VIP", precio: 11, duracion: 25 },
//         { nombre: "Cejas", precio: 5, duracion: 10},
//         { nombre: "Mechas", precio: 30, duracion: 60 },
//         { nombre: "Tinte", precio: 30, duracion: 60 },
//         { nombre: "Trenzas", precio: 20, duracion: 45 },
//         { nombre: "Mask Carbon", precio: 3, duracion: 10 },
//         { nombre: "Limpieza Facial", precio: 15, duracion: 25 },
//         { nombre: "Diseño", precio: 3, duracion: 10 },
//         { nombre: "Lavado de Cabello", precio: 2, duracion: 10},
//         { nombre: "Otros", precio: 0, duracion: 0 },
//             ];
            
    return (
        <div className="relative">
            <ReactDatePicker
                selected={selectedDate}
                onChange={onChange}
                showTimeSelect
                locale="es"
                filterTime={filterOccupied} // Esto hará que las horas ocupadas no se puedan clickear                timeCaption="Hora"
                dateFormat="Pp"
                placeholderText="Selecciona fecha y hora"
                className="mt-2 block w-full p-3 rounded-2xl font-bold text-white bg-zinc-800 border-2 border-amber-400 focus:outline-none focus:border-amber-200"
            />
           {/* <input type="hidden" name="duration" value={SERVICIOS_DATA.find(s => s.nombre === selectedService)?.duracion || 30} /> */}
        </div>
    );
}