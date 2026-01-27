import { Outlet, Link, useLocation } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faInstagram } from "@fortawesome/free-brands-svg-icons"
import { motion, AnimatePresence } from "framer-motion"
import latinosvip from "../assets/latinosvip.jpg"

export default function Layout() {
    const userRole = localStorage.getItem("userRole");
    const location = useLocation();

    const navLinks = [
        { path: "nuevo/inicio", label: "Inicio" },
        { path: "nuestros/barberos", label: "Barberos" },
        { path: "nuestros/trabajos", label: "Trabajos" },
        { path: "nuestros/videos", label: "Videos" },
        { path: "nuestras/noticias", label: "Noticias" },
        { path: "/", label: "Citas" },
    ];

    return (
        <div className="min-h-screen bg-[#050505]">
            {/* HEADER ANIMADO */}
            <motion.header 
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4"
            >
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    
                    {/* LOGO */}
                    <Link to="/" className="group relative">
                        <motion.img 
                            whileHover={{ scale: 1.05 }}
                            src={latinosvip} 
                            alt="Logo" 
                            className="h-16 w-auto rounded-xl shadow-2xl border border-zinc-800 group-hover:border-amber-500 transition-colors" 
                        />
                    </Link>

                    {/* NAVEGACIÓN PRINCIPAL */}
                    <nav className="flex flex-wrap justify-center gap-6">
                        {navLinks.map((link) => (
                            <Link 
                                key={link.path}
                                to={link.path} 
                                className="relative text-sm font-bold uppercase tracking-widest text-zinc-400 hover:text-white transition-colors py-2"
                            >
                                {link.label}
                                {location.pathname.includes(link.path) && (
                                    <motion.div 
                                        layoutId="underline"
                                        className="absolute bottom-0 left-0 w-full h-0.5 bg-amber-500"
                                    />
                                )}
                            </Link>
                        ))}
                    </nav>

                    {/* ACCIONES Y SOCIAL */}
                    <div className="flex items-center gap-6">
                        {/* Instagram Link */}
                        <motion.a 
                            whileHover={{ scale: 1.2, color: "#fbbf24" }}
                            href="https://instagram.com" 
                            target="_blank"
                            className="text-zinc-400 text-2xl"
                        >
                            <FontAwesomeIcon icon={faInstagram} />
                        </motion.a>

                        <div className="flex items-center gap-3">
                            {/* Panel Admin (Si aplica) */}
                            {(userRole === "admin" || userRole === "barber") && (
                                <Link 
                                    to="/admin/dashboard" 
                                    className="hidden lg:block text-amber-500 text-[10px] font-black uppercase border border-amber-500/30 px-3 py-2 rounded-xl hover:bg-amber-500/10 transition-all"
                                >
                                    Panel Admin
                                </Link>
                            )}

                            {/* Botón Registro */}
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Link 
                                    to="/nuevo/registro" 
                                    className="bg-amber-500 text-black px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-tighter hover:bg-white shadow-[0_0_20px_rgba(251,191,36,0.2)] transition-colors"
                                >
                                    Regístrate
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* CONTENIDO PRINCIPAL */}
            <main className="relative z-10 py-10 px-4 max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>

            {/* DECORACIÓN DE FONDO */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-zinc-500/5 rounded-full blur-[100px]" />
            </div>
        </div>
    )
}