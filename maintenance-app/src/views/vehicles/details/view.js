
export function mount() {
    const urlParams = new URLSearchParams(window.location.search);
    const vehicleId = urlParams.get("id");

    if (!vehicleId) {
        showError("No vehicle ID provided.");
        return;
    }

    const vehicle = VehiclesApi.getVehicleById(vehicleId);

    if (!vehicle) {
        showError("Vehicle not found.");
        return;
    }

    populateDetails(vehicle);
}

function populateDetails(vehicle) {
    document.getElementById("vehicle-title").textContent = `Vehicle: ${vehicle.licensePlate}`;
    document.getElementById("info-plate").textContent = vehicle.licensePlate;
    document.getElementById("info-type").textContent = vehicle.type;
    document.getElementById("info-make").textContent = vehicle.makeAndModel;
    document.getElementById("info-status").textContent = vehicle.status;
    document.getElementById("info-odometer").textContent = vehicle.odometer;
    document.getElementById("info-value").textContent = vehicle.marketValue;
    document.getElementById("info-ctv").textContent = vehicle.ctv;
    document.getElementById("info-last-service").textContent = vehicle.lastService;
    document.getElementById("info-next-service").textContent = vehicle.nextService;
    document.getElementById("info-insurance").textContent = vehicle.insuranceExpiry;
    document.getElementById("info-details").textContent = vehicle.details || "No additional details available.";
}

function showError(message) {
    const content = document.getElementById("vehicle-details-content");
    if (content) {
        content.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

export function unmount() {
    // Cleanup
}
