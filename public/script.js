document.addEventListener("DOMContentLoaded", () => {
    fetchCars();
});

async function fetchCars() {
    const response = await fetch("http://localhost:3000/cars");
    const cars = await response.json();

    const carSelect = document.getElementById("cars");
    carSelect.innerHTML = cars.map(car => `<option value="${car.CarID}">${car.Brand} ${car.Model}</option>`).join("");
}

async function reserveCar() {
    const CarID = document.getElementById("cars").value;
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
    console.log(result);  // <-- Zobacz w konsoli, co zwraca backend
    alert(result.message);
}

async function getRentals() {
    const email = document.getElementById("searchEmail").value;
    const response = await fetch(`http://localhost:3000/rentals?email=${email}`);
    const rentals = await response.json();

    const rentalsList = document.getElementById("rentals");
    rentalsList.innerHTML = rentals.map(r => `<li>${r.Brand} ${r.Model} - ${r.StartDate} do ${r.EndDate}</li>`).join("");
}
