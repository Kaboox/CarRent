const sql = require('mssql');
require('dotenv').config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: false,
        enableArithAbort: true,
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log("✔ Połączono z bazą danych MSSQL");
        return pool;
    })
    .catch(err => {
        console.error("❌ Błąd połączenia z bazą danych: ", err);
    });

module.exports = { sql, poolPromise };
