require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sql, poolPromise } = require('./db');

const app = express();
app.use(express.json());
app.use(cors());



// Pobieranie unikalnych modeli samochodów
app.get('/models', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT DISTINCT c.Brand, c.Model 
            FROM Cars c
            WHERE EXISTS (
                SELECT 1 FROM Cars c2
                WHERE c2.Model = c.Model 
                AND NOT EXISTS (
                    SELECT 1 FROM Rentals r 
                    WHERE r.CarID = c2.CarID 
                    AND r.EndDate >= GETDATE()
                )
            )
        `);
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Pobieranie dostępnych egzemplarzy dla wybranego modelu
app.get('/available-cars', async (req, res) => {
    try {
        const { model } = req.query;
        const pool = await poolPromise;

        const result = await pool.request()
            .input('Model', sql.VarChar, model)
            .query(`
                SELECT c.CarID, c.Year, c.Color
                FROM Cars c
                WHERE c.Model = @Model 
                AND NOT EXISTS (
                    SELECT 1 FROM Rentals r 
                    WHERE r.CarID = c.CarID 
                    AND r.EndDate >= GETDATE()
                )
            `);

        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/customers', async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Customers');
        res.json(result.recordset);
    } catch (error) {
        console.error('Błąd zapytania:', error);
        res.status(500).json({ error: 'Błąd połączenia z bazą danych' });
    }
});


app.post('/rentals', async (req, res) => {
    try {
        const { CarID, CustomerName, Email, Phone, StartDate, EndDate } = req.body;
        const pool = await poolPromise;

        // Check if the customer already exists
        const customerCheck = await pool.request()
            .input('Email', sql.VarChar, Email)
            .query('SELECT CustomerID FROM Customers WHERE Email = @Email');

        let CustomerID;
        if (customerCheck.recordset.length > 0) {
            // Client exists
            CustomerID = customerCheck.recordset[0].CustomerID;
        } else {
            // Client doesn't exist
            const customerResult = await pool.request()
                .input('Name', sql.VarChar, CustomerName)
                .input('Email', sql.VarChar, Email)
                .input('Phone', sql.VarChar, Phone)
                .query('INSERT INTO Customers (FullName, Email, Phone) OUTPUT INSERTED.CustomerID VALUES (@Name, @Email, @Phone)');

            CustomerID = customerResult.recordset[0].CustomerID;
        }

        await pool.request()
            .input('CarID', sql.Int, CarID)
            .input('CustomerID', sql.Int, CustomerID)
            .input('StartDate', sql.Date, StartDate)
            .input('EndDate', sql.Date, EndDate)
            .query('INSERT INTO Rentals (CarID, CustomerID, StartDate, EndDate) VALUES (@CarID, @CustomerID, @StartDate, @EndDate)');

        res.status(201).json({ message: 'Wypożyczenie dodane!' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/rentals', async (req, res) => {
    try {
        const { email } = req.query;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Email', sql.VarChar, email)
            .query(`
                SELECT r.RentalID, c.Brand, c.Model, r.StartDate, r.EndDate
                FROM Rentals r
                JOIN Cars c ON r.CarID = c.CarID
                JOIN Customers cu ON r.CustomerID = cu.CustomerID
                WHERE cu.Email = @Email
            `);
        
        res.json(result.recordset);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Serwer działa na porcie 3000'));
