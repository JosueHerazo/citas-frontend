import { Form, Link, type ActionFunctionArgs, redirect, useActionData } from "react-router-dom"
import { motion } from "framer-motion"
import ErrorMessaje from "../components/ErrorMessage"

export async function action({ request }: ActionFunctionArgs) {
    const formData = await request.formData()
    const data = Object.fromEntries(formData)

    if (Object.values(data).includes("")) {
        return "Por favor, rellena todos los campos"
    }

    try {
        // Simulación de Login con tu Backend
        // const user = await loginUser(data)
        
        // Guardamos la sesión (Esto lo usaremos en el formulario de citas)
        localStorage.setItem("isLoggedIn", "true")
        localStorage.setItem("userRole", "client")
        localStorage.setItem("userName", "Cliente VIP") // Aquí vendría el nombre real desde el backend
        
        return redirect("/")
    } catch (error) {
        return "Usuario o contraseña incorrectos"
    }
}

export default function Login() {
    const error = useActionData() as string

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-md mx-auto my-20 bg-zinc-950 p-10 rounded-[2.5rem] border border-zinc-800 shadow-2xl"
        >
            <div className="text-center mb-10">
                <h2 className="text-4xl font-black text-white uppercase tracking-tight">
                    Bienvenido <span className="text-amber-500 italic">Back</span>
                </h2>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] mt-2">Accede a tu cuenta VIP</p>
            </div>

            {error && <ErrorMessaje>{error}</ErrorMessaje>}

            <Form method="POST" className="flex flex-col gap-6">
                <div className="space-y-2">
                    <label className="text-zinc-400 text-[10px] font-black uppercase ml-1">Usuario / Email</label>
                    <input 
                        name="username" 
                        type="text" 
                        className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white focus:ring-2 ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                        placeholder="Tu usuario"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-zinc-400 text-[10px] font-black uppercase ml-1">Contraseña</label>
                    <input 
                        name="password" 
                        type="password" 
                        className="w-full p-4 rounded-2xl bg-zinc-900 border border-zinc-800 text-white focus:ring-2 ring-amber-500/20 focus:border-amber-500 outline-none transition-all"
                        placeholder="••••••••"
                    />
                </div>

                <button 
                    type="submit" 
                    className="mt-4 bg-white text-black font-black py-4 rounded-2xl uppercase tracking-widest hover:bg-amber-500 transition-all shadow-xl active:scale-95"
                >
                    Entrar ahora
                </button>
            </Form>

            <div className="mt-10 pt-6 border-t border-zinc-900 text-center">
                <p className="text-zinc-500 text-xs font-bold uppercase">
                    ¿Eres nuevo? {" "}
                    <Link to="/nuevo/registro" className="text-amber-500 hover:underline">Crea una cuenta</Link>
                </p>
            </div>
        </motion.div>
    )
}