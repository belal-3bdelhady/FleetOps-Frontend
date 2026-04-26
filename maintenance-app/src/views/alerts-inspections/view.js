import AlertData from "../../services/storage/alerts.js";

export function mount() {
    const data = AlertData; // Directly use the imported storage object
    initTabs();
    renderOdometer(data.odometer);
    renderInsurance(data.insurance);
    renderInspection(data.inspection);
    renderParts(data.parts);
    updateBadges(data);
}

export function unmount() {
    // For this specific view, all listeners are on local elements
    // which are automatically removed from memory when the DOM is cleared.
    // No explicit cleanup is required currently.
    console.log("Alerts & Inspections view unmounted");
}


function renderOdometer(alerts){
    const tbody = document.getElementById("odometer-table-body")
    tbody.innerHTML = alerts.map(alert => ` 
        <tr>
            <td>
                <div class="vehicle-cell">
                    <span class="vehicle-plate">${alert.vehiclePlate}</span>
                    <span class="vehicle-model">${alert.vehicleModel}</span>
                </div>
            </td>
            <td>${alert.lastServiceKM} km</td>
            <td>${alert.currentOdometer} km</td>
            <td class="${alert.status === 'warning' ? 'text-danger' : ''}">${alert.kmSinceService} km</td>
            <td>${alert.threshold} km</td>
            <td><span class="chip ${alert.status}">${alert.status === 'warning' ? 'Due Soon' : 'OK'}</span></td>
            <td>
                <button class="button primary sm">
                    <i data-lucide="plus"></i> Work Order
                </button>
            </td>
        </tr>`).join('')
}

function renderInsurance(alerts) {
    const tbody = document.getElementById('insurance-table-body');
    if (!tbody) return;

    tbody.innerHTML = alerts.map(alert => `
        <tr>
            <td>
                <div class="vehicle-cell">
                    <span class="vehicle-plate">${alert.vehiclePlate}</span>
                    <span class="vehicle-model">${alert.vehicleModel}</span>
                </div>
            </td>
            <td>${alert.policyNumber}</td>
            <td>${alert.expiryDate}</td>
            <td class="${alert.status === 'warning' ? 'text-danger' : ''}">${alert.daysRemaining} Days</td>
            <td><span class="chip ${alert.status}">${alert.status === 'warning' ? 'Expiring Soon' : 'Active'}</span></td>
            <td>
                <button class="button primary sm">Renew Policy</button>
            </td>
        </tr>
    `).join('');
}

function renderInspection(alerts) {
    const tbody = document.getElementById('inspection-table-body');
    if (!tbody) return;

    tbody.innerHTML = alerts.map(alert => `
        <tr>
            <td>
                <div class="vehicle-cell">
                    <span class="vehicle-plate">${alert.vehiclePlate}</span>
                    <span class="vehicle-model">${alert.vehicleModel}</span>
                </div>
            </td>
            <td>${alert.lastInspection}</td>
            <td>${alert.nextDueDate}</td>
            <td class="${alert.status === 'danger' ? 'text-danger' : ''}">${alert.daysRemaining}</td>
            <td><span class="chip ${alert.status}">${alert.status === 'danger' ? 'Overdue' : 'OK'}</span></td>
            <td>
                <button class="button primary sm">Schedule</button>
            </td>
        </tr>
    `).join('');
}

function renderParts(alerts) {
    const tbody = document.getElementById('parts-table-body');
    if (!tbody) return;

    tbody.innerHTML = alerts.map(alert => `
        <tr>
            <td>
                <div class="vehicle-cell">
                    <span class="vehicle-plate">${alert.vehiclePlate}</span>
                    <span class="vehicle-model">${alert.vehicleModel}</span>
                </div>
            </td>
            <td>${alert.partName}</td>
            <td>${alert.installDate}</td>
            <td>${alert.usage}</td>
            <td>${alert.lifespan}</td>
            <td><span class="chip ${alert.status}">${alert.status === 'warning' ? 'Low Life' : 'Good'}</span></td>
            <td>
                <button class="button primary sm">Replace</button>
            </td>
        </tr>
    `).join('');
}

function initTabs() {
    const tabs = document.querySelectorAll('.tab-item');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.getAttribute('data-tab');

            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            contents.forEach(content => {
                content.style.display = content.id === `${target}-content` ? 'block' : 'none';
            });
        });
    });
}

function updateBadges(data) {
    const badges = {
        odometer: data.odometer.length,
        insurance: data.insurance.length,
        inspection: data.inspection.length,
        parts: data.parts.length
    };

    Object.keys(badges).forEach(type => {
        const tab = document.querySelector(`.tab-item[data-tab="${type}"] .tab-badge`);
        if (tab) tab.textContent = badges[type];
    });
}
