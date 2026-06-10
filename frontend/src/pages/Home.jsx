import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      <section className="px-6 py-20 text-white">
        <div className="mx-auto max-w-7xl text-center">
          <p className="mb-4 text-sm font-semibold uppercase text-usv-gold">Universitatea Stefan cel Mare</p>
          <h1 className="mb-6 text-5xl font-bold md:text-6xl">Sistem de Management al Evenimentelor USV</h1>
          <p className="mx-auto mb-8 max-w-3xl text-lg text-slate-300 md:text-xl">
            O platforma centralizata pentru conferinte, workshop-uri si targuri de cariera, construita pentru
            comunitatea academica USV.
          </p>
          <button
            onClick={() => navigate('/evenimente')}
            className="inline-block rounded-lg bg-usv-gold px-8 py-3 font-semibold text-slate-950 transition-colors hover:bg-yellow-300"
          >
            Exploreaza evenimente
          </button>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-white">De ce sa folosesti EventUSV?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              ['Descopera Evenimente', 'Exploreaza evenimente universitare, conferinte academice si oportunitati profesionale.'],
              ['Gestioneaza Evenimente', 'Organizatorii pot crea, edita si urmari evenimente cu fluxuri clare de aprobare.'],
              ['Planificare Eficienta', 'Pastreaza toate participarile si detaliile importante intr-un spatiu modern, usor de scanat.'],
            ].map(([title, description]) => (
              <div key={title} className="rounded-lg border border-slate-800 bg-slate-900/70 p-6 transition-shadow hover:shadow-lg">
                <h3 className="mb-3 text-xl font-semibold text-usv-gold">{title}</h3>
                <p className="text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-950/60 px-6 py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-white">Gata sa descoperi evenimentele?</h2>
          <p className="mb-8 text-slate-300">Acceseaza lista completa si confirma participarea la evenimentele relevante.</p>
          <button
            onClick={() => navigate('/evenimente')}
            className="inline-block rounded-lg bg-usv-gold px-8 py-3 font-semibold text-slate-950 transition-colors hover:bg-yellow-300"
          >
            Vezi toate evenimentele
          </button>
        </div>
      </section>
    </div>
  )
}
