// src/pages/Videos.tsx
import { Link } from "react-router-dom"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons"

export default function Videos() {
  return (
    <div className="bg-zinc-950 min-h-screen text-white">
      <section className="pt-16 pb-8 px-6 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-amber-500 font-bold mb-6">
          <FontAwesomeIcon icon={faArrowLeft} /> Volver
        </Link>
        <h1 className="text-5xl font-black uppercase tracking-tighter text-amber-500">
          Videos
        </h1>
        <p className="text-zinc-500 mt-4">Próximamente más contenido</p>
      </section>
    </div>
  )
}