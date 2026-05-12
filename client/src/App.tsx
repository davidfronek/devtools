import { useState } from 'react'
import DbTester from './components/DbTester'

type Section = {
  id: string
  label: string
  icon: string
  component: React.ReactNode
}

const SECTIONS: Section[] = [
  {
    id: 'db',
    label: 'Databáze',
    icon: '⬡',
    component: <DbTester />,
  },
  // Sem přidávat další sekce:
  // { id: 'http', label: 'HTTP', icon: '⇌', component: <HttpTester /> },
]

export default function App() {
  const [activeId, setActiveId] = useState(SECTIONS[0].id)
  const active = SECTIONS.find(s => s.id === activeId)!

  return (
    <div className="page">
      <header className="header">
        <div className="header-inner">
          <span className="header-icon">⬡</span>
          <div>
            <h1>Tools</h1>
            <p>Vývojářské nástroje</p>
          </div>
        </div>
      </header>

      <div className="layout">
        <nav className="nav">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`nav-item${activeId === s.id ? ' nav-item--active' : ''}`}
              onClick={() => setActiveId(s.id)}
            >
              <span className="nav-icon">{s.icon}</span>
              <span className="nav-label">{s.label}</span>
            </button>
          ))}
        </nav>

        <main className="main">
          {active.component}
        </main>
      </div>
    </div>
  )
}
