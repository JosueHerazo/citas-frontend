import { Form, Link, type ActionFunctionArgs, redirect, useActionData } from "react-router-dom"
import { motion } from "framer-motion"
import ErrorMessaje from "../components/ErrorMessage"

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)

    // Validación básica
    if (Object.values(data).includes("")) {
        return "Todos los campos son obligatorios"
    }

    try {
        // Aquí llamarías a tu servicio de backend (ej: registerUser(data))
        console.log("Enviando datos al backend:", data)
        
        // Simulación de éxito: Guardar el ID o nombre en localStorage para las citas
        localStorage.setItem("cliente_nombre", data.nombre as string)
        localStorage.setItem("cliente_telefono", data.telefono as string)

        return redirect("/nuevo/inicio")
    } catch (error) {
        return "Error al crear la cuenta"
    }
}

export default function Register() {
    const error = useActionData() as string

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md mx-auto my-10 bg-black p-10 rounded-[2.5rem] border border-zinc-800 shadow-2xl"
        >
            <div className="text-center mb-8">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">
                    Únete a <span className="text-amber-500">VIP</span>
                </h2>
                <p className="text-zinc-500 text-sm mt-2 font-bold uppercase tracking-widest">
                    Crea tu cuenta para gestionar tus citas
                </p>
            </div>

            {/* {error && <ErrorMessaje>{error}</ErrorMessaje>} */}

            <Form method="POST" className="flex flex-col gap-5">
                {/* NOMBRE COMPLETO */}
                <div className="space-y-2">
                    <label className="text-amber-500 text-xs font-black uppercase ml-1">Nombre Completo</label>
                    <input 
                        name="nombre" 
                        type="text" 
                        placeholder="Ej. Juan Pérez"
                        className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white focus:border-amber-500 outline-none transition-all"
                    />
                </div>

                {/* TELÉFONO (Vital para ventas y contacto) */}
                <div className="space-y-2">
                    <label className="text-amber-500 text-xs font-black uppercase ml-1">Teléfono / WhatsApp</label>
                    <input 
                        name="telefono" 
                        type="tel" 
                        placeholder="600 000 000"
                        className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white focus:border-amber-500 outline-none transition-all"
                    />
                </div>

                {/* USUARIO / EMAIL */}
                <div className="space-y-2">
                    <label className="text-amber-500 text-xs font-black uppercase ml-1">Usuario o Correo</label>
                    <input 
                        name="username" 
                        type="text" 
                        placeholder="usuario123"
                        className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white focus:border-amber-500 outline-none transition-all"
                    />
                </div>

                {/* CONTRASEÑA */}
                <div className="space-y-2">
                    <label className="text-amber-500 text-xs font-black uppercase ml-1">Contraseña</label>
                    <input 
                        name="password" 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white focus:border-amber-500 outline-none transition-all"
                    />
                </div>

                <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit" 
                    className="mt-4 bg-amber-500 text-black font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20"
                >
                    Crear mi cuenta
                </motion.button>
            </Form>

            <p className="text-zinc-500 text-center mt-8 text-sm font-bold uppercase">
                ¿Ya tienes cuenta? {" "}
                <Link to="/login" className="text-amber-500 hover:underline">Inicia Sesión</Link>
            </p>
        </motion.div>
    )
}