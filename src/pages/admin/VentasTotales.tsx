import { useMemo } from "react";
import { motion } from "framer-motion";
import { formatCurrency } from   "../../utils";
import { useLoaderData } from "react-router-dom";
import { getHistorialCierres } from "../../services/ServiceDates"; 
import type { WeeklyClosing } from "../../types"; 

interface LoaderData {
    cierres: WeeklyClosing[];
}

export async function loader() {
    try {
        const cierres = await getHistorialCierres();
        return { cierres: cierres || [] };
    } catch (error) {
        return { cierres: [] };
    }
}

export default function VentasTotales() {
    const data = useLoaderData() as LoaderData;
    const cierres = data?.cierres || [];

    const totalHistorico = useMemo(() => 
        cierres.reduce((acc, cur) => acc + (Number(cur.totalGross) || 0), 0), 
    [cierres]);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="max-w-6xl mx-auto p-6 min-h-screen"
        >
        
        
            {cierres.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/30 rounded-[3rem] border-2 border-dashed border-zinc-800">
                    <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-6 text-4xl">
                        📂
                    </div>
                    <h3 className="text-xl font-bold text-white uppercase">No hay cierres registrados</h3>
                </div>
            ) : (
                <div className="space-y-6">
                    <div className="bg-amber-500 p-8 rounded-[2.5rem] flex justify-between items-center text-black shadow-2xl shadow-amber-500/10">
                        <div>
                            <p className="font-black uppercase text-[10px] tracking-widest">Facturación Total Bruta</p>
                            <p className="text-5xl font-black tracking-tighter">{formatCurrency(totalHistorico)}</p>
                        </div>
                    </div>

                    <div className="bg-zinc-950 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-zinc-900/50 text-amber-500 text-[10px] font-black uppercase tracking-widest">
                                <tr>
                                    <th className="p-6">Fecha</th>
                                    <th className="p-6">Barbero</th>
                                    <th className="p-6 text-right">Caja</th>
                                    <th className="p-6 text-right">Liquidado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-900 text-white">
                                {cierres.map((c) => (
                                    <tr key={c.id} className="hover:bg-zinc-900/30 transition-colors">
                                        <td className="p-6 text-zinc-400 text-sm">
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="p-6 font-bold uppercase italic">{c.barber}</td>
                                        <td className="p-6 text-right font-mono text-zinc-300">
                                            {formatCurrency(Number(c.totalGross))}
                                        </td>
                                        <td className="p-6 text-right font-black text-green-400">
                                            {formatCurrency(Number(c.commission))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </motion.div>
    );
}       



