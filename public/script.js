document.addEventListener("DOMContentLoaded", () => {
    loadCarModels();
});

async function loadCarModels() {
    try {
        console.log('Ładowanie modeli samochodów...');
        const response = await fetch('http://localhost:3000/models');
        console.log('Odpowiedź z API:', response);
        
        if (!response.ok) {
            throw new Error(`Błąd HTTP: ${response.status}`);
        }

        const models = await response.json();
        console.log('Dane modeli:', models);

        const select = document.getElementById('carModelSelect');
        select.innerHTML = models.map(m => `<option value="${m.Model}">${m.Brand} ${m.Model}</option>`).join('');

        if (models.length > 0) {
            loadAvailableCars();
        }
    } catch (error) {
        console.error('Błąd wczytywania modeli:', error);
    }
}


async function loadAvailableCars() {
    const model = document.getElementById('carModelSelect').value;
    
    try {
        const response = await fetch(`http://localhost:3000/available-cars?model=${encodeURIComponent(model)}`);
        const cars = await response.json();
        console.log(cars)

        const select = document.getElementById('carOptionsSelect');
        select.innerHTML = cars.map(c => `<option value="${c.CarID}">${c.Year} - ${c.Color}</option>`).join('');
    } catch (error) {
        console.error('Błąd wczytywania samochodów:', error);
    }
}


async function reserveCar() {
    const CarID = document.getElementById("carOptionsSelect").value;
    console.log(CarID)
    const CustomerName = document.getElementById("name").value;
    const Email = document.getElementById("email").value;
    const Phone = document.getElementById("phone").value;
    const StartDate = document.getElementById("startDate").value;
    const EndDate = document.getElementById("endDate").value;

    const response = await fetch("http://localhost:3000/rentals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ CarID, CustomerName, Email, Phone, StartDate, EndDate })
    });

    const result = await response.json();
    alert(result.message);
    loadAvailableCars();
}

async function getRentals() {
    const email = document.getElementById("searchEmail").value;
    const response = await fetch(`http://localhost:3000/rentals?email=${email}`);
    const rentals = await response.json();

    const rentalsList = document.getElementById("rentals");
    rentalsList.innerHTML = rentals.map(r => `<li>${r.Brand} ${r.Model} - ${r.StartDate} do ${r.EndDate}</li>`).join("");
}

