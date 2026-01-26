import ReactDatePicker, { registerLocale } from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { es } from 'date-fns/locale/es';

// Registrar el idioma español
registerLocale('es', es);

interface DatePickerProps {
    selectedDate: Date | null;
    onChange: (date: Date | null) => void;
}

export default function CustomDatePicker({ selectedDate, onChange }: DatePickerProps) {
    return (
        <div className="relative">
            <ReactDatePicker
                selected={selectedDate}
                onChange={onChange}
                showTimeSelect
                locale="es"
                timeCaption="Hora"
                dateFormat="Pp"
                placeholderText="Selecciona fecha y hora"
                className="mt-2 block w-full p-3 rounded-2xl font-bold text-white bg-zinc-800 border-2 border-amber-400 focus:outline-none focus:border-amber-200"
            />
            {/* Este input oculto es el que React Router leerá en el Action */}
            <input 
                type="hidden" 
                name="dateList" 
                value={selectedDate ? selectedDate.toISOString() : ""} 
            />
        </div>
    );
}