const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.post('/api/test-connection', async (req, res) => {
  const { dbType, host, port, database, serviceName, username, password } = req.body;

  if (!host || !port || !username) {
    return res.json({ ok: false, message: 'Vyplňte host, port a uživatelské jméno.' });
  }

  try {
    switch (dbType) {

      case 'oracle': {
        let oracledb;
        try { oracledb = require('oracledb'); }
        catch { return res.json({ ok: false, message: 'Balíček oracledb není nainstalován (npm install oracledb).' }); }

        const conn = await oracledb.getConnection({
          user: username,
          password,
          connectString: `${host}:${port}/${serviceName || 'ORCL'}`,
        });
        await conn.close();
        return res.json({ ok: true, message: `Připojení k Oracle (${host}:${port}) proběhlo úspěšně.` });
      }

      case 'mysql': {
        let mysql;
        try { mysql = require('mysql2/promise'); }
        catch { return res.json({ ok: false, message: 'Balíček mysql2 není nainstalován (npm install mysql2).' }); }

        const conn = await mysql.createConnection({
          host,
          port: parseInt(port),
          user: username,
          password,
          database: database || undefined,
          connectTimeout: 6000,
        });
        await conn.end();
        return res.json({ ok: true, message: `Připojení k MySQL (${host}:${port}) proběhlo úspěšně.` });
      }

      case 'mssql': {
        let sql;
        try { sql = require('mssql'); }
        catch { return res.json({ ok: false, message: 'Balíček mssql není nainstalován (npm install mssql).' }); }

        const pool = await sql.connect({
          server: host,
          port: parseInt(port),
          user: username,
          password,
          database: database || undefined,
          options: { trustServerCertificate: true },
          connectionTimeout: 6000,
        });
        await pool.close();
        return res.json({ ok: true, message: `Připojení k MS SQL Server (${host}:${port}) proběhlo úspěšně.` });
      }

      case 'postgres': {
        let pg;
        try { pg = require('pg'); }
        catch { return res.json({ ok: false, message: 'Balíček pg není nainstalován (npm install pg).' }); }

        const client = new pg.Client({
          host,
          port: parseInt(port),
          user: username,
          password,
          database: database || 'postgres',
          connectionTimeoutMillis: 6000,
        });
        await client.connect();
        await client.end();
        return res.json({ ok: true, message: `Připojení k PostgreSQL (${host}:${port}) proběhlo úspěšně.` });
      }

      default:
        return res.json({ ok: false, message: 'Neznámý typ databáze.' });
    }
  } catch (err) {
    return res.json({ ok: false, message: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Tools server běží na http://localhost:${PORT}`);
});
