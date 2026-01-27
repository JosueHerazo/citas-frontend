import { useState } from "react";
import { motion } from "framer-motion";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCashRegister, faCheckCircle, faUserSlash, faChartLine } from "@fortawesome/free-solid-svg-icons";

// Datos de ejemplo (Esto vendría de tu getProducts o servicio de citas)
const CITAS_HOY = [
    { id: 1, cliente: "Carlos Ruiz", servicio: "Corte + Barba", precio: 18, hora: "10:30", barbero: "Josue", estado: "pendiente" },
    { id: 2, cliente: "Dani Flow", servicio: "Corte VIP", precio: 25, hora: "11:30", barbero: "Vato", estado: "completado" },
    { id: 3, cliente: "Mario B.", servicio: "Cejas", precio: 5, hora: "12:00", barbero: "Josue", estado: "pendiente" },
];

export default function AdminDashboard() {
    const [citas, setCitas] = useState(CITAS_HOY);

    // Lógica para calcular la "Lista de Ventas"
    const totalVentas = citas
        .filter(c => c.estado === "completado")
        .reduce((acc, curr) => acc + curr.precio, 0);

    const marcarComoCobrado = (id: number) => {
        setCitas(prev => prev.map(c => c.id === id ? { ...c, estado: "completado" } : c));
        // Aquí llamarías a tu API: await updateVenta(id, { estado: 'completado' })
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-4 md:p-8">
            {/* CABECERA DE VENTAS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <motion.div 
                    whileHover={{ scale: 1.02 }}
                    className="bg-zinc-900 p-6 rounded-[2rem] border-l-4 border-amber-500 shadow-xl"
                >
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Ventas del Día</p>
                    <h3 className="text-4xl font-black mt-2 text-amber-500">{totalVentas}€</h3>
                    <FontAwesomeIcon icon={faChartLine} className="absolute top-6 right-6 opacity-20 text-2xl" />
                </motion.div>

                <div className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800">
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Citas Pendientes</p>
                    <h3 className="text-4xl font-black mt-2">{citas.filter(c => c.estado === "pendiente").length}</h3>
                </div>

                <div className="bg-zinc-900 p-6 rounded-[2rem] border border-zinc-800">
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">Barbero Activo</p>
                    <h3 className="text-2xl font-black mt-2 text-white">Todos</h3>
                </div>
            </div>

            {/* TABLA DE GESTIÓN DE CITAS */}
            <div className="bg-zinc-900 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-zinc-800 flex justify-between items-center">
                    <h2 className="text-2xl font-black uppercase italic">Control de <span className="text-amber-500">Caja</span></h2>
                    <FontAwesomeIcon icon={faCashRegister} className="text-amber-500 text-xl" />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-800/50 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                            <tr>
                                <th className="p-6">Hora</th>
                                <th className="p-6">Cliente</th>
                                <th className="p-6">Servicio</th>
                                <th className="p-6">Barbero</th>
                                <th className="p-6">Precio</th>
                                <th className="p-6 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {citas.map((cita) => (
                                <tr key={cita.id} className={`hover:bg-zinc-800/30 transition-colors ${cita.estado === 'completado' ? 'opacity-50' : ''}`}>
                                    <td className="p-6 font-bold text-amber-500">{cita.hora}</td>
                                    <td className="p-6 font-bold">{cita.cliente}</td>
                                    <td className="p-6 text-sm text-zinc-400">{cita.servicio}</td>
                                    <td className="p-6">
                                        <span className="bg-zinc-800 px-3 py-1 rounded-full text-[10px] font-bold uppercase border border-zinc-700">
                                            {cita.barbero}
                                        </span>
                                    </td>
                                    <td className="p-6 font-black">{cita.precio}€</td>
                                    <td className="p-6">
                                        <div className="flex justify-center gap-3">
                                            {cita.estado === "pendiente" ? (
                                                <button 
                                                    onClick={() => marcarComoCobrado(cita.id)}
                                                    className="bg-amber-500 text-black px-4 py-2 rounded-xl font-black text-[10px] uppercase hover:bg-white transition-all shadow-lg shadow-amber-500/10"
                                                >
                                                    <FontAwesomeIcon icon={faCheckCircle} className="mr-1" /> Cobrar
                                                </button>
                                            ) : (
                                                <span className="text-green-500 text-[10px] font-black uppercase">
                                                    Pagado ✓
                                                </span>
                                            )}
                                            <button className="text-zinc-600 hover:text-red-500 transition-colors">
                                                <FontAwesomeIcon icon={faUserSlash} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}