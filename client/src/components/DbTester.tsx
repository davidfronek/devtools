import { useState } from 'react'

type DbType = 'oracle' | 'mysql' | 'mssql' | 'postgres'

interface FormState {
  host: string
  port: string
  database: string
  serviceName: string
  username: string
  password: string
}

interface TestResult {
  ok: boolean
  message: string
}

const DB_CONFIG: Record<DbType, { label: string; port: string; hasServiceName: boolean }> = {
  oracle:   { label: 'Oracle',        port: '1521', hasServiceName: true  },
  mysql:    { label: 'MySQL',         port: '3306', hasServiceName: false },
  mssql:    { label: 'MS SQL Server', port: '1433', hasServiceName: false },
  postgres: { label: 'PostgreSQL',    port: '5432', hasServiceName: false },
}

const INITIAL_FORM: FormState = {
  host: 'localhost',
  port: '1521',
  database: '',
  serviceName: '',
  username: '',
  password: '',
}

export default function DbTester() {
  const [dbType, setDbType] = useState<DbType>('oracle')
  const [form, setForm]     = useState<FormState>(INITIAL_FORM)
  const [result, setResult] = useState<TestResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleDbTypeChange = (type: DbType) => {
    setDbType(type)
    setForm(f => ({ ...f, port: DB_CONFIG[type].port }))
    setResult(null)
  }

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleTest = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dbType, ...form }),
      })
      const data: TestResult = await res.json()
      setResult(data)
    } catch {
      setResult({ ok: false, message: 'Nelze kontaktovat server. Je spuštěný?' })
    } finally {
      setLoading(false)
    }
  }

  const cfg = DB_CONFIG[dbType]

  return (
    <div className="card">
      <div className="card-title">Test připojení k databázi</div>

      <div className="field">
        <label htmlFor="db-type">Typ databáze</label>
        <select
          id="db-type"
          value={dbType}
          onChange={e => handleDbTypeChange(e.target.value as DbType)}
        >
          {(Object.keys(DB_CONFIG) as DbType[]).map(key => (
            <option key={key} value={key}>{DB_CONFIG[key].label}</option>
          ))}
        </select>
      </div>

      <div className="row">
        <div className="field" style={{ flex: 3 }}>
          <label>Host / Server</label>
          <input value={form.host} onChange={set('host')} placeholder="localhost" />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>Port</label>
          <input value={form.port} onChange={set('port')} placeholder={cfg.port} />
        </div>
      </div>

      {cfg.hasServiceName ? (
        <div className="field">
          <label>Service Name / SID</label>
          <input value={form.serviceName} onChange={set('serviceName')} placeholder="ORCL" />
        </div>
      ) : (
        <div className="field">
          <label>Databáze <span className="optional">(nepovinné)</span></label>
          <input value={form.database} onChange={set('database')} placeholder="název databáze" />
        </div>
      )}

      <div className="row">
        <div className="field" style={{ flex: 1 }}>
          <label>Uživatel</label>
          <input value={form.username} onChange={set('username')} placeholder="uživatelské jméno" autoComplete="username" />
        </div>
        <div className="field" style={{ flex: 1 }}>
          <label>Heslo</label>
          <input type="password" value={form.password} onChange={set('password')} placeholder="••••••••" autoComplete="current-password" />
        </div>
      </div>

      <button className="btn-test" onClick={handleTest} disabled={loading}>
        {loading
          ? <><span className="spinner" /> Testuji připojení…</>
          : 'Test připojení'}
      </button>

      {result && (
        <div className={`result ${result.ok ? 'result--ok' : 'result--err'}`}>
          <span className="result-icon">{result.ok ? '✓' : '✗'}</span>
          <span>{result.message}</span>
        </div>
      )}
    </div>
  )
}
