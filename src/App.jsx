import { useEffect, useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, PlayCircle } from 'lucide-react'
import { apiGet, apiPost } from './api'

function Layout({ children, title }) {
  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white flex flex-col" style={{fontFamily: 'Inter, Montserrat, sans-serif'}}>
      <header className="sticky top-0 z-20 backdrop-blur bg-[#0b0f1a]/70 border-b border-white/10">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-gradient-to-br from-[#1A73E8] to-[#18C6C0]" />
            <h1 className="text-xl font-semibold" style={{fontFamily: 'Montserrat, Inter, sans-serif'}}>
              NovaMarket
            </h1>
          </div>
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50" size={20} />
            <input placeholder="Rechercher objets, maisons, sons, visuels..." className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]" />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 pb-24">
        <h2 className="text-lg mb-3 text-white/80">{title}</h2>
        {children}
      </main>
      <BottomNav />
    </div>
  )
}

function BottomNav(){
  const tabs = [
    { to: '/', label: 'Accueil' },
    { to: '/buy', label: 'Acheter' },
    { to: '/rent', label: 'Louer' },
    { to: '/digital', label: 'Digital' },
    { to: '/sell', label: 'Vendre' },
  ]
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1E1E1E] text-white border-t border-white/10">
      <div className="max-w-6xl mx-auto grid grid-cols-5 gap-2 px-2 py-2 text-xs">
        {tabs.map(t => (
          <Link key={t.to} to={t.to} className="text-center px-2 py-1 rounded-lg hover:bg-white/5 transition">
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

function Card({item}){
  return (
    <motion.div layout whileHover={{y:-4}} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="aspect-video bg-white/10 relative">
        {item.media_type === 'audio' ? (
          <div className="absolute inset-0 grid place-items-center text-white/70">
            <PlayCircle size={48} />
          </div>
        ) : (
          <img src={item.photos?.[0]} alt="" className="w-full h-full object-cover" />
        )}
      </div>
      <div className="p-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold" style={{fontFamily: 'Montserrat'}}> {item.title} </h3>
          <span className="text-[#18C6C0]">{item.price === 0 ? 'Gratuit' : `${item.price}€`}</span>
        </div>
        <p className="text-sm text-white/60 line-clamp-2">{item.description}</p>
      </div>
    </motion.div>
  )}

function Home(){
  const [items, setItems] = useState([])
  useEffect(()=>{ apiGet('/api/listings?limit=12').then(setItems).catch(()=>{}) },[])
  return (
    <Layout title="Tendances">
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map(it=> <Card key={it.id} item={it} />)}
      </div>
    </Layout>
  )
}

function GridByKind({kind}){
  const [items, setItems] = useState([])
  useEffect(()=>{ apiGet(`/api/listings?kind=${kind}`).then(setItems).catch(()=>{}) },[kind])
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {items.map(it=> <Card key={it.id} item={it} />)}
    </div>
  )
}

function Buy(){
  return <Layout title="Acheter"><GridByKind kind="sale" /></Layout>
}
function Rent(){
  return <Layout title="Louer"><GridByKind kind="rent" /></Layout>
}
function Digital(){
  return <Layout title="Digital"><GridByKind kind="digital" /></Layout>
}

function Sell(){
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    title: '', description: '', kind: 'sale', price: 0, currency:'EUR',
    photos: ['', '', ''], category:'Autres', is_digital_free:false, digital_license:'', media_type:'other', files:[], location_text:'', owner_name:'', owner_email:''
  })
  const [cats, setCats] = useState([])
  const nav = useNavigate()

  useEffect(()=>{ apiGet('/api/categories').then(setCats) },[])

  const next = ()=> setStep(s=>Math.min(5, s+1))
  const prev = ()=> setStep(s=>Math.max(1, s-1))

  const canNext = ()=>{
    if(step===1) return form.title.trim().length>2
    if(step===2) return form.price>=0
    if(step===3) return form.photos.filter(Boolean).length>=3
    if(step===4) return !!form.category && (form.kind!=='digital' || (form.media_type && (form.is_digital_free || form.price>=0)))
    return true
  }

  const submit = async ()=>{
    const payload = {...form, photos: form.photos.filter(Boolean)}
    await apiPost('/api/listings', payload)
    nav('/')
  }

  return (
    <Layout title="Vendre">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4 text-sm text-white/70">
          <span>Étape {step} / 5</span>
          <div className="flex gap-1">{Array.from({length:5}).map((_,i)=> <div key={i} className={`h-1.5 w-10 rounded-full ${i<step? 'bg-[#1A73E8]':'bg-white/10'}`} />)}</div>
        </div>
        {step===1 && (
          <Section title="Nom de l'article">
            <Input label="Titre" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} />
            <TextArea label="Description" value={form.description} onChange={e=>setForm({...form, description:e.target.value})} />
          </Section>
        )}
        {step===2 && (
          <Section title="Prix">
            <Input type="number" min={0} label="Prix" value={form.price} onChange={e=>setForm({...form, price: parseFloat(e.target.value||'0')})} />
          </Section>
        )}
        {step===3 && (
          <Section title="Photos (min 3)">
            <div className="grid grid-cols-3 gap-3">
              {form.photos.map((p,idx)=> (
                <Input key={idx} label={`URL ${idx+1}`} value={p} onChange={e=>{
                  const arr=[...form.photos]; arr[idx]=e.target.value; setForm({...form, photos:arr})
                }} />
              ))}
            </div>
          </Section>
        )}
        {step===4 && (
          <Section title="Catégorie et type">
            <Select label="Type" value={form.kind} onChange={e=>setForm({...form, kind:e.target.value})} options={[{value:'sale',label:'Vente'},{value:'rent',label:'Location'},{value:'digital',label:'Digital'}]} />
            <Select label="Catégorie" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} options={cats.map(c=>({value:c,label:c}))} />
            {form.kind==='digital' && (
              <div className="grid sm:grid-cols-2 gap-3">
                <Select label="Type de média" value={form.media_type} onChange={e=>setForm({...form, media_type:e.target.value})} options={[{value:'audio',label:'Musique/Son'},{value:'image',label:'Image'},{value:'video',label:'Vidéo'},{value:'effect',label:'Effet visuel'},{value:'other',label:'Autre'}]} />
                <Toggle label="Gratuit et libre de droit" checked={form.is_digital_free} onChange={v=>setForm({...form, is_digital_free:v, price: v?0:form.price})} />
                <Input label="Licence" placeholder="ex: CC BY 4.0" value={form.digital_license} onChange={e=>setForm({...form, digital_license:e.target.value})} />
                <Input label="Fichiers (URL, séparés par des virgules)" value={form.files?.join(',')||''} onChange={e=>setForm({...form, files: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} />
              </div>
            )}
          </Section>
        )}
        {step===5 && (
          <Section title="Localisation et contact (facultatif)">
            <Input label="Localisation" value={form.location_text} onChange={e=>setForm({...form, location_text:e.target.value})} />
            <div className="grid sm:grid-cols-2 gap-3">
              <Input label="Votre nom" value={form.owner_name} onChange={e=>setForm({...form, owner_name:e.target.value})} />
              <Input label="Votre email" value={form.owner_email} onChange={e=>setForm({...form, owner_email:e.target.value})} />
            </div>
          </Section>
        )}
        <div className="flex justify-between mt-6">
          <button onClick={prev} className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15">Retour</button>
          {step<5 ? (
            <button disabled={!canNext()} onClick={next} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#1A73E8] to-[#18C6C0] disabled:opacity-50">Suivant</button>
          ) : (
            <button onClick={submit} className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#1A73E8] to-[#18C6C0]">Publier</button>
          )}
        </div>
      </div>
    </Layout>
  )
}

function Section({title, children}){
  return (
    <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 shadow-xl shadow-[#1A73E8]/5">
      <h3 className="font-semibold mb-3" style={{fontFamily:'Montserrat'}}>{title}</h3>
      <div className="space-y-3">{children}</div>
    </motion.div>
  )
}

function Input({label, ...props}){
  return (
    <label className="block text-sm">
      <span className="text-white/70">{label}</span>
      <input className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]" {...props} />
    </label>
  )
}

function TextArea({label, ...props}){
  return (
    <label className="block text-sm">
      <span className="text-white/70">{label}</span>
      <textarea rows={4} className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1A73E8]" {...props} />
    </label>
  )
}

function Select({label, options, ...props}){
  return (
    <label className="block text-sm">
      <span className="text-white/70">{label}</span>
      <select className="mt-1 w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2" {...props}>
        {options.map(o=> <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </label>
  )
}

function Toggle({label, checked, onChange}){
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-white/70">{label}</span>
      <button type="button" onClick={()=>onChange(!checked)} className={`w-12 h-7 rounded-full transition relative ${checked? 'bg-[#18C6C0]':'bg-white/10'}`}>
        <span className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white transition ${checked? 'translate-x-5':''}`} />
      </button>
    </div>
  )
}

function AppRoutes(){
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/buy" element={<Layout title="Acheter"><GridByKind kind="sale" /></Layout>} />
      <Route path="/rent" element={<Layout title="Louer"><GridByKind kind="rent" /></Layout>} />
      <Route path="/digital" element={<Layout title="Digital"><GridByKind kind="digital" /></Layout>} />
      <Route path="/sell" element={<Sell />} />
    </Routes>
  )
}

export default function App(){
  return <AppRoutes />
}
