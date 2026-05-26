import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="bg-usv-blue text-white py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Sistem de Management al Evenimentelor USV
          </h1>
          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8 text-blue-100">
            O platformă centralizată pentru conferințe, workshop-uri și târguri de carieră. 
            Conectează studenții cu oportunități educative și profesionale de-a lungul întregului an universitar.
          </p>
          <button
            onClick={() => navigate('/evenimente')}
            className="inline-block bg-white text-usv-blue px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Explorează evenimente
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">
            De ce să folosești EventUSV?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-usv-blue mb-3">
                Descoperă Evenimente
              </h3>
              <p className="text-slate-600">
                Explorează o gamă largă de evenimente universităților, de la conferințe academice 
                la oportunități de networking profesional.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-usv-blue mb-3">
                Gestionează Evenimente
              </h3>
              <p className="text-slate-600">
                Organizatorii pot ușor crea, edita și gestiona evenimentele, cu notificări în timp real 
                și tracking participanți.
              </p>
            </div>
            <div className="p-6 rounded-lg border border-slate-200 hover:shadow-lg transition-shadow">
              <h3 className="text-xl font-semibold text-usv-blue mb-3">
                Planificare Eficientă
              </h3>
              <p className="text-slate-600">
                Evită conflictele de program cu verificarea automată a disponibilității locațiilor 
                și calendarul integrat.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Gata să descoperi evenimentele?
          </h2>
          <p className="text-slate-600 mb-8">
            Accesează lista completă de evenimente și ți-te înregistrează pentru cele care te interesează.
          </p>
          <button
            onClick={() => navigate('/evenimente')}
            className="inline-block bg-usv-blue text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Vezi toate evenimentele
          </button>
        </div>
      </section>
    </div>
  )
}
