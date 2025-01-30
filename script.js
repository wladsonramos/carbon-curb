document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    const chartCanvas = document.createElement("canvas");
    chartCanvas.id = "carbonChart";
    document.body.appendChild(chartCanvas);
    let chart;

    function getCarbonEmission(vehicle, distance) {
        const emissions = { carro: 0.1268, moto: 0.0711, onibus: 0.0160, bicicleta: 0 };
        return emissions[vehicle] * distance;
    }

    function saveUserData(user) {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        users.push(user);
        localStorage.setItem("users", JSON.stringify(users));
    }

    function updateChart() {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        let weeklyReduction = { segunda: 0, terca: 0, quarta: 0, quinta: 0, sexta: 0 };

        users.forEach(user => {
            user.days.forEach(day => {
                weeklyReduction[day] += user.reduction;
            });
        });

        if (chart) chart.destroy();
        chart = new Chart(chartCanvas, {
            type: "bar",
            data: {
                labels: Object.keys(weeklyReduction),
                datasets: [{
                    label: "Redução de CO₂ (kg)",
                    data: Object.values(weeklyReduction),
                    backgroundColor: "#25995c",
                }],
            },
        });
    }

    function displayUserSummaries() {
        const users = JSON.parse(localStorage.getItem("users")) || [];
        const summaryContainer = document.getElementById("summary");
        summaryContainer.innerHTML = "<h2>Resumo da Semana</h2>";

        users.forEach((user, index) => {
            const userSummary = document.createElement("div");
            userSummary.classList.add("user-summary");

            userSummary.innerHTML = `
                <p>${user.name}: Reduziu ${user.reduction.toFixed(2)} kg de CO₂ nos dias ${user.days.join(", ")}</p>
                <div class="button-group">
                    <button onclick="editUser(${index})">Editar</button>
                    <button onclick="deleteUser(${index})">Excluir</button>
                </div>
            `;

            summaryContainer.appendChild(userSummary);
        });
    }

    window.editUser = function (index) {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        let user = users[index];

        document.getElementById("name").value = user.name;
        document.getElementById("distance").value = user.distance;
        document.querySelector(`input[name='vehicleused'][value='${user.vehicle}']`).checked = true;
        document.getElementById("newvehicle").value = user.newVehicle;

        document.querySelectorAll("input[name='dias']").forEach(input => {
            input.checked = user.days.includes(input.value);
        });

        users.splice(index, 1);
        localStorage.setItem("users", JSON.stringify(users));
        updateChart();
        displayUserSummaries();
    }

    window.deleteUser = function (index) {
        let users = JSON.parse(localStorage.getItem("users")) || [];
        users.splice(index, 1);
        localStorage.setItem("users", JSON.stringify(users));
        updateChart();
        displayUserSummaries();
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        const name = document.getElementById("name").value;
        const distance = parseFloat(document.getElementById("distance").value);
        const vehicle = document.querySelector("input[name='vehicleused']:checked").value;
        const newVehicle = document.getElementById("newvehicle").value;
        const days = [...document.querySelectorAll("input[name='dias']:checked")].map(e => e.value);

        const currentEmission = getCarbonEmission(vehicle, distance);
        const newEmission = getCarbonEmission(newVehicle, distance);
        const reduction = currentEmission - newEmission;

        const userData = { name, distance, vehicle, newVehicle, days, reduction };
        saveUserData(userData);
        updateChart();
        displayUserSummaries();
    });

    updateChart();
    displayUserSummaries();
});