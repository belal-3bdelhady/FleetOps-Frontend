import vehiclesData from "../../services/storage/vehicles.js";

let allVehicles = vehiclesData;

export function mount() {
    const tableBody = renderTable(allVehicles);
    const searchInput = document.getElementById("vehicle-page-filter-search");
    const statusFilter = document.getElementById("vehicle-page-filter-status");
    const typeFilter = document.getElementById("vehicle-page-filter-type");

    // Event listeners for filtering
    const handleFilter = () => {
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;
        const typeValue = typeFilter.value;

        const filtered = allVehicles.filter(vehicle => {
            const matchesSearch = vehicle.licensePlate.toLowerCase().includes(searchTerm) || 
                                 vehicle.makeAndModel.toLowerCase().includes(searchTerm);
            const matchesStatus = !statusValue || vehicle.status === statusValue;
            const matchesType = !typeValue || vehicle.type === typeValue;

            return matchesSearch && matchesStatus && matchesType;
        });

        renderTable(filtered);
    };

    searchInput.addEventListener("input", handleFilter);
    statusFilter.addEventListener("change", handleFilter);
    typeFilter.addEventListener("change", handleFilter);
}

function renderTable(vehicles) {
    const tableBody = document.getElementById("vehicle-table-body");
    if (!tableBody) return;

    if (vehicles.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="11" style="text-align: center; padding: 20px;">No vehicles found matching your filters.</td></tr>`;
        return;
    }

    tableBody.innerHTML = vehicles.map(vehicle => `
        <tr>
            <td>${vehicle.licensePlate}</td>
            <td>${vehicle.type}</td>
            <td>${vehicle.makeAndModel}</td>
            <td><span class="status-badge status-${vehicle.status.toLowerCase()}">${vehicle.status}</span></td>
            <td>${vehicle.odometer}</td>
            <td>${vehicle.lastService}</td>
            <td>${vehicle.nextService}</td>
            <td>${vehicle.insuranceExpiry}</td>
            <td>${vehicle.marketValue}</td>
            <td>${vehicle.ctv}</td>
            <td>
                <a href="/vehicles/details?id=${vehicle.id}" class="btn-view" data-link>View</a>
            </td>
        </tr>
    `).join("");
}

export function unmount() {
    // Reserved for cleanup logic.
}

