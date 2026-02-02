// services/ServiceDates.ts
import axios from "axios";

const HORARIOS_BARBERIA = {
    0: null, // Domingo: Cerrado
    1: { inicio: 10, fin: 20 }, // Lunes
    2: { inicio: 10, fin: 20 }, // Martes
    3: { inicio: 10, fin: 20 }, // Miércoles
    4: { inicio: 10, fin: 21 }, // Jueves
    5: { inicio: 10, fin: 21 }, // Viernes
    6: { inicio: 10, fin: 21 }, // Sábado
};

export async function addProduct(data: any) {
    try {
        const selectedDate = new Date(data.dateList);
        const diaSemana = selectedDate.getDay();
        const hora = selectedDate.getHours();
        const horarioHoy = HORARIOS_BARBERIA[diaSemana as keyof typeof HORARIOS_BARBERIA];

        // 1. Validar si es Domingo o está fuera de hora
        if (!horarioHoy) {
            throw new Error("La barbería está cerrada los domingos");
        }
        if (hora < horarioHoy.inicio || hora >= horarioHoy.fin) {
            throw new Error(`Horario hoy: ${horarioHoy.inicio}:00 a ${horarioHoy.fin}:00`);
        }

        // 2. Validar 3 horas de antelación
        const now = new Date();
        if (selectedDate.getTime() < now.getTime() + (3 * 60 * 60 * 1000)) {
            throw new Error("Reserva con mínimo 3 horas de antelación");
        }

        const url = `${import.meta.env.VITE_API_URL}/api/date`;
        const response = await axios.post(url, {
            ...data,
            price: Number(data.price),
            phone: Number(data.phone)
        });
        
        return response.data;
    } catch (error: any) {
        // Extraer el mensaje de error para mostrarlo en el componente
        const msg = error.response?.data?.error || error.message;
        console.error("❌ Error:", msg);
        throw new Error(msg); 
    }
}

export async function getBarberAvailability(barberName: string) {
    if (!barberName) return [];
    try {
        // Usamos params de axios para evitar errores de formato en la URL
        const url = `${import.meta.env.VITE_API_URL}/api/date/availability`;
        const { data } = await axios.get(url, { params: { barber: barberName } });
        return data.data || data; 
    } catch (error) {
        console.error("Error trayendo disponibilidad:", error);
        return [];
    }
}