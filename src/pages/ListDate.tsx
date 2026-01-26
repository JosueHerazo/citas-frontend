import { Link, Form, type ActionFunctionArgs, redirect, useActionData } from "react-router-dom"
import ErrorMessaje from "../components/ErrorMessage"
import { addProduct } from "../services/ServiceDates"
// import datePicker from "react-datepicker";
// import { useSearchParams } from "react-router-dom";
// import { useEffect, useState } from "react";

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)
    console.log(data);
    
    // Validación básica
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
    
    const servicios = ["Corte", "Corte con cejas", "Corte con barba", "Corte Vip", "Corte de Niño", "Barba", "Barba VIP", "Cejas", "Mechas", "Tinte", "Trenzas", "Mask Carbon", "Limpieza Facial", "Diseño", "Lavado de Cabello", "Otros"];
    const barberos = ["Josue", "Vato"];
    
    // const [searchParams] = useSearchParams();
    
    // Estados para los campos que queremos auto-completar
    // const [clientName, setClientName] = useState("");
    // const [clientPhone, setClientPhone] = useState("");

    // useEffect(() => {
    //     const name = searchParams.get("client");
    //     // const phone = searchParams.get("phone");
    //     if (name) setClientName(name);
    //     // if (phone) setClientPhone(phone);
    // }, [searchParams]);
    return (
        <div className="mt-10 max-w-md mx-auto">
            <h2 className="text-2xl font-black text-amber-50 mb-5">Registrar Nuevo Servicio</h2>
            
            {error && <ErrorMessaje>{error}</ErrorMessaje>}

            <Form method="POST" className="flex flex-col gap-4">
                <div className="mb-4">
                    <label className="text-amber-50" htmlFor="service">Servicio</label>
                    <select id="service" name="service" className="mt-2 block w-full font-bold text-white rounded-2xl p-3 bg-zinc-800 border-2 border-amber-400">
                        <option value="">Selecciona un Servicio</option>
                        {servicios.map((s) => (<option key={s} value={s}>{s}</option>))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="text-amber-50" htmlFor="price">Precio:</label>
                    <input id="price" name="price" type="number" className="mt-2 font-bold text-white block w-full rounded-2xl p-3 bg-zinc-800 border-2 border-amber-400" placeholder="Ej. 15" />
                </div>

                <div className="mb-4">
                    <label className="text-amber-50" htmlFor="barber">Barbero</label>
                    <select id="barber" name="barber" className="mt-2 block w-full font-bold text-white rounded-2xl p-3 bg-zinc-800 border-2 border-amber-400">
                        <option value="">Selecciona Barbero</option>
                        {barberos.map((b) => (<option key={b} value={b}>{b}</option>))}
                    </select>
                </div>

                <div className="mb-4">
                    <label className="text-amber-50" htmlFor="dateList">Fecha de la Cita</label>
                    <input id="dateList" name="dateList" type="date" className="mt-2 block w-full p-3 rounded-2xl font-bold text-white bg-zinc-800 border-2 border-amber-400" placeholder="Nombre completo"
                    // defaultValue={clientName}
                    />
                </div>

                
                <div className="mb-4">
                    <label className="text-amber-50" htmlFor="client">Nombre del Cliente</label>
                    <input id="client" name="client" type="text" className="mt-2 block w-full p-3 rounded-2xl font-bold text-white bg-zinc-800 border-2 border-amber-400" placeholder="Nombre completo"
                    // defaultValue={clientName}
                    />
                </div>

                <div className="mb-4">
                    <label className="text-amber-50" htmlFor="phone">Teléfono:</label>
                    <input id="phone" name="phone" type="number" className="mt-2 block w-full p-3 rounded-2xl font-bold text-white bg-zinc-800 border-2 border-amber-400" placeholder="Número de contacto" 
                    // defaultValue={clientPhone}
                    />

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