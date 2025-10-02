import React, { useEffect, useState } from 'react'

const API = 'http://localhost:8080'

function App(){
  const [activeTab, setActiveTab] = useState('dashboard')
  const [contacts, setContacts] = useState([])
  const [projects, setProjects] = useState([])
  const [appointments, setAppointments] = useState([])
  const [invoices, setInvoices] = useState([])
  const [ws, setWs] = useState(null)
  const [liveEvents, setLiveEvents] = useState([])

  // WebSocket connection for real-time updates
  useEffect(() => {
    const websocket = new WebSocket('ws://localhost:8080/ws')
    websocket.onopen = () => console.log('Connected to live updates')
    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      setLiveEvents(prev => [data, ...prev.slice(0, 9)]) // Keep last 10 events
    }
    setWs(websocket)
    return () => websocket.close()
  }, [])

  async function loadData(){
    try {
      const [c, p, a, i] = await Promise.all([
        fetch(`${API}/crm/contacts`).then(r=>r.json()),
        fetch(`${API}/crm/projects`).then(r=>r.json()),
        fetch(`${API}/scheduling/appointments`).then(r=>r.json()),
        fetch(`${API}/invoicing/invoices`).then(r=>r.json())
      ])
      setContacts(c); setProjects(p); setAppointments(a); setInvoices(i)
    } catch (e) { console.error('Failed to load data:', e) }
  }

  useEffect(() => { loadData() }, [])

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'cases', label: 'Ärenden', icon: '📄' },
    { id: 'calendar', label: 'Kalender', icon: '📅' },
    { id: 'voice', label: 'Voice Agent', icon: '📞' },
    { id: 'invoices', label: 'Fakturor', icon: '💰' },
    { id: 'settings', label: 'Inställningar', icon: '⚙️' }
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Sidebar */}
      <div style={{ width: 250, background: '#f8f9fa', borderRight: '1px solid #e9ecef', padding: '20px 0' }}>
        <div style={{ padding: '0 20px 30px', borderBottom: '1px solid #e9ecef' }}>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: '#2c3e50' }}>Byggare Bob</h1>
          <p style={{ margin: '5px 0 0', color: '#6c757d', fontSize: 14 }}>AI Construction CRM</p>
        </div>
        <nav style={{ padding: '20px 0' }}>
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                width: '100%',
                padding: '12px 20px',
                border: 'none',
                background: activeTab === item.id ? 'linear-gradient(90deg, #007bff, #fd7e14)' : 'transparent',
                color: activeTab === item.id ? 'white' : '#6c757d',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 16
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, background: '#f8f9fa', padding: 30 }}>
        {activeTab === 'dashboard' && <DashboardView projects={projects} liveEvents={liveEvents} />}
        {activeTab === 'cases' && <CasesView projects={projects} onRefresh={loadData} />}
        {activeTab === 'calendar' && <CalendarView appointments={appointments} onRefresh={loadData} />}
        {activeTab === 'voice' && <VoiceView liveEvents={liveEvents} />}
        {activeTab === 'invoices' && <InvoicesView invoices={invoices} onRefresh={loadData} />}
        {activeTab === 'settings' && <SettingsView />}
      </div>
    </div>
  )
}

function DashboardView({ projects, liveEvents }){
  const stats = [
    { title: 'Aktiva Ärenden', value: projects.length, change: '+12%', icon: '👥' },
    { title: 'Schemalagda Möten', value: 8, change: '+5%', icon: '📅' },
    { title: 'Slutförda Projekt', value: 156, change: '+18%', icon: '✅' },
    { title: 'Voice Agent Samtal', value: liveEvents.length, change: '+23%', icon: '📞' }
  ]

  return (
    <div>
      <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: 40, borderRadius: 12, marginBottom: 30, color: 'white' }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 'bold' }}>Välkommen till Byggare Bob</h1>
        <p style={{ margin: '10px 0 0', fontSize: 18, opacity: 0.9 }}>AI-driven byggledning för modern entreprenad</p>
      </div>

      <h2 style={{ marginBottom: 20 }}>Dashboard Översikt</h2>
      <p style={{ color: '#6c757d', marginBottom: 30 }}>Översikt av dina projekt och aktiviteter</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
        {stats.map((stat, i) => (
          <div key={i} style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ margin: '0 0 8px', color: '#6c757d', fontSize: 14 }}>{stat.title}</p>
                <p style={{ margin: 0, fontSize: 32, fontWeight: 'bold', color: '#2c3e50' }}>{stat.value}</p>
                <p style={{ margin: '8px 0 0', color: '#28a745', fontSize: 14 }}>↑ {stat.change} från förra månaden</p>
              </div>
              <span style={{ fontSize: 24, opacity: 0.6 }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ marginBottom: 20 }}>Senaste Ärenden</h2>
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {projects.slice(0, 3).map((p, i) => (
          <div key={p.id} style={{ padding: 20, borderBottom: i < 2 ? '1px solid #e9ecef' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>#{String(i+1).padStart(3,'0')} {p.title}</p>
              <p style={{ margin: 0, color: '#6c757d' }}>{p.description}</p>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ background: '#dc3545', color: 'white', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>hög</span>
              <span style={{ background: '#007bff', color: 'white', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>Schemalagd</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CasesView({ projects, onRefresh }){
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ margin: '0 0 5px', fontSize: 28 }}>Ärenden</h1>
          <p style={{ margin: 0, color: '#6c757d' }}>Hantera alla dina projekt och kundärenden</p>
        </div>
        <button style={{ background: '#007bff', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer' }}>
          + Nytt Ärende
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {projects.map((p, i) => (
          <div key={p.id} style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
              <h3 style={{ margin: 0 }}>#{String(i+1).padStart(3,'0')} {p.title}</h3>
              <span style={{ background: '#007bff', color: 'white', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>Schemalagd</span>
            </div>
            <p style={{ color: '#6c757d', marginBottom: 15 }}>{p.description}</p>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button style={{ border: '1px solid #007bff', background: 'white', color: '#007bff', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>
                Visa Detaljer
              </button>
              <button style={{ border: '1px solid #fd7e14', background: 'white', color: '#fd7e14', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>
                Redigera
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CalendarView({ appointments, onRefresh }){
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ margin: '0 0 5px', fontSize: 28 }}>Kalender</h1>
          <p style={{ margin: 0, color: '#6c757d' }}>Schemaläggning och möteshantering</p>
        </div>
        <button style={{ background: '#007bff', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer' }}>
          + Nytt Möte
        </button>
      </div>

      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: 24 }}>
        <h3 style={{ margin: '0 0 20px' }}>Idag - 23 September 2024</h3>
        {appointments.map((a, i) => (
          <div key={a.id} style={{ padding: 16, borderBottom: i < appointments.length-1 ? '1px solid #e9ecef' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
              <div style={{ width: 4, height: 40, background: '#dc3545', borderRadius: 2 }}></div>
              <div>
                <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>09:00 (2h) - Anna Andersson</p>
                <p style={{ margin: 0, color: '#6c757d' }}>Takrenovering - Besiktning</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={{ background: '#28a745', color: 'white', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>Bekräftad</span>
              <button style={{ border: '1px solid #007bff', background: 'white', color: '#007bff', padding: '6px 12px', borderRadius: 4, cursor: 'pointer' }}>
                Visa Ärende
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function VoiceView({ liveEvents }){
  return (
    <div>
      <h1 style={{ margin: '0 0 5px', fontSize: 28 }}>Voice Agent</h1>
      <p style={{ margin: '0 0 30px', color: '#6c757d' }}>AI-driven kundsamtal och ärendehantering</p>

      <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: 30 }}>
        <h3 style={{ margin: '0 0 15px' }}>Voice Agent Status</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <span>📞</span>
          <span style={{ background: '#6c757d', color: 'white', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>Standby</span>
        </div>
        <p style={{ margin: '0 0 20px' }}>Voice Agent är redo att ta emot samtal</p>
        <button style={{ background: 'linear-gradient(90deg, #007bff, #fd7e14)', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer' }}>
          📞 Simulera Inkommande Samtal
        </button>
      </div>

      <h2 style={{ marginBottom: 20 }}>Senaste Samtal</h2>
      <div style={{ background: 'white', borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        {liveEvents.slice(0, 3).map((event, i) => (
          <div key={i} style={{ padding: 20, borderBottom: i < 2 ? '1px solid #e9ecef' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
              <div style={{ width: 40, height: 40, background: '#e3f2fd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                👤
              </div>
              <div>
                <p style={{ margin: '0 0 5px', fontWeight: 'bold' }}>Anna Andersson</p>
                <p style={{ margin: '0 0 5px', color: '#6c757d' }}>+46 70 123 4567</p>
                <p style={{ margin: 0, color: '#6c757d' }}>Takrenovering</p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: '0 0 5px', color: '#6c757d' }}>14:32 • 3:45</p>
              <span style={{ background: '#28a745', color: 'white', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>Schemalagt möte</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InvoicesView({ invoices, onRefresh }){
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 }}>
        <div>
          <h1 style={{ margin: '0 0 5px', fontSize: 28 }}>Fakturor</h1>
          <p style={{ margin: 0, color: '#6c757d' }}>Automatisk fakturering och kostnadsuppföljning</p>
        </div>
        <button style={{ background: '#007bff', color: 'white', border: 'none', padding: '12px 24px', borderRadius: 8, cursor: 'pointer' }}>
          + Ny Faktura
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 30 }}>
        <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px', color: '#6c757d', fontSize: 14 }}>Total Omsättning</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: '#007bff' }}>282,000 SEK</p>
        </div>
        <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px', color: '#6c757d', fontSize: 14 }}>Betalda</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: '#28a745' }}>117,000 SEK</p>
        </div>
        <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px', color: '#6c757d', fontSize: 14 }}>Väntande</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: '#fd7e14' }}>133,000 SEK</p>
        </div>
        <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <p style={{ margin: '0 0 8px', color: '#6c757d', fontSize: 14 }}>Förfallna</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 'bold', color: '#dc3545' }}>32,000 SEK</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 20 }}>
        {invoices.map((inv, i) => (
          <div key={inv.id} style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 }}>
              <h3 style={{ margin: 0 }}>F2024-{String(i+1).padStart(3,'0')}</h3>
              <span style={{ background: '#28a745', color: 'white', padding: '4px 8px', borderRadius: 12, fontSize: 12 }}>Skickad</span>
            </div>
            <p style={{ margin: '0 0 15px', color: '#6c757d' }}>Anna Andersson - Takrenovering</p>
            <div style={{ marginBottom: 15 }}>
              <p style={{ margin: '0 0 8px', fontSize: 14, fontWeight: 'bold' }}>Kostnader (Voice Agent loggade):</p>
              <ul style={{ margin: 0, paddingLeft: 20, color: '#6c757d' }}>
                <li>Takpannor 18,000 SEK</li>
                <li>Isolering 8,000 SEK</li>
                <li>Arbetskostnader 19,000 SEK</li>
              </ul>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ margin: '0 0 5px', fontSize: 20, fontWeight: 'bold' }}>45,000 SEK</p>
                <p style={{ margin: 0, color: '#6c757d', fontSize: 14 }}>Förfall: 2024-10-15</p>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button style={{ background: '#007bff', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>
                  Ladda ner
                </button>
                <button style={{ background: '#fd7e14', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>
                  Skicka
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsView(){
  return (
    <div>
      <h1 style={{ margin: '0 0 5px', fontSize: 28 }}>Inställningar</h1>
      <p style={{ margin: '0 0 30px', color: '#6c757d' }}>Hantera dina kontoinställningar och preferenser</p>
      <div style={{ background: 'white', padding: 24, borderRadius: 12, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <p>Inställningar kommer snart...</p>
      </div>
    </div>
  )
}

export default App