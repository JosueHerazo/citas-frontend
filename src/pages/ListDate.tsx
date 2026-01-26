import { Link, Form, type ActionFunctionArgs, redirect, useActionData } from "react-router-dom"
import ErrorMessaje from "../components/ErrorMessage"
import { addProduct } from "../services/ServiceDates"
import { useState } from "react"
// Importamos nuestro nuevo componente
import DatePicker from "../components/DatePicker"

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)
    
    // Verificación en consola: verás que 'dateList' ahora sí trae la fecha ISO
    console.log("Datos enviados:", data);
    
    if (Object.values(data).includes("")) {
        return "Todos los campos son obligatorios"
    }

    try {
        await addProduct(data)
        return redirect("/")
    } catch (error) {
        return "Error al guardar la cita"
    }
}

export default function ListDate() {
    const error = useActionData() as string
    
    // Estado para controlar la fecha seleccionada
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    const servicios = ["Corte", "Corte con cejas", "Corte con barba", "Corte Vip", "Corte de Niño", "Barba", "Barba VIP", "Cejas", "Mechas", "Tinte", "Trenzas", "Mask Carbon", "Limpieza Facial", "Diseño", "Lavado de Cabello", "Otros"];
    const barberos = ["Josue", "Vato"];
    
    return (
        <div className="mt-10 max-w-md mx-auto">
            <h2 className="text-2xl font-black text-amber-50 mb-5">Registrar Nuevo Servicio</h2>
            
            {error && <ErrorMessaje>{error}</ErrorMessaje>}

            <Form method="POST" className="flex flex-col gap-4">
                {/* SERVICIO */}
                <div className="mb-4">
                    <label className="text-amber-50" htmlFor="service">Servicio</label>
                    <select id="service" name="service" className="mt-2 block w-full font-bold text-white rounded-2xl p-3 bg-zinc-800 border-2 border-amber-400">
                        <option value="">Selecciona un Servicio</option>
                        {servicios.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                </div>

                {/* PRECIO */}
                <div className="mb-4">
                    <label className="text-amber-50" htmlFor="price">Precio:</label>
                    <input id="price" name="price" type="number" className="mt-2 font-bold text-white block w-full rounded-2xl p-3 bg-zinc-800 border-2 border-amber-400" placeholder="Ej. 15" />
                </div>

                {/* BARBERO */}
                <div className="mb-4">
                    <label className="text-amber-50" htmlFor="barber">Barbero</label>
                    <select id="barber" name="barber" className="mt-2 block w-full font-bold text-white rounded-2xl p-3 bg-zinc-800 border-2 border-amber-400">
                        <option value="">Selecciona Barbero</option>
                        {barberos.map((b) => (<option key={b} value={b}>{b}</option>))}
                    </select>
                </div>

                {/* FECHA (Componente Personalizado) */}
                <div className="mb-4">
                    <label className="text-amber-50">Fecha y Hora de la Cita</label>
                    <DatePicker 
                        selectedDate={selectedDate} 
                        onChange={(date) => setSelectedDate(date)} 
                    />
                </div>
                
                {/* CLIENTE */}
                <div className="mb-4">
                    <label className="text-amber-50" htmlFor="client">Nombre del Cliente</label>
                    <input id="client" name="client" type="text" className="mt-2 block w-full p-3 rounded-2xl font-bold text-white bg-zinc-800 border-2 border-amber-400" placeholder="Nombre completo" />
                </div>

                {/* TELÉFONO */}
                <div className="mb-4">
                    <label className="text-amber-50" htmlFor="phone">Teléfono:</label>
                    <input id="phone" name="phone" type="number" className="mt-2 block w-full p-3 rounded-2xl font-bold text-white bg-zinc-800 border-2 border-amber-400" placeholder="Número de contacto" />
                </div>

                <input type="submit" className="mt-5 bg-amber-400 p-3 text-white font-black text-lg cursor-pointer rounded-2xl hover:bg-amber-500 transition-colors" value="Reservar citas"/>
            </Form>

            <div className="mt-10">
                <Link className="text-amber-400 font-bold hover:underline" to="/">
                    ← Volver al Inicio
                </Link>
            </div>
        </div>
    )
}