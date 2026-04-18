const testData = {
    vehicles: [
        { id: "TRK-042", type: "Heavy", odometer: "124,500 km", lastService: "25 days ago", nextDue: "Oil Change", state: "healthy" },
        { id: "TRK-015", type: "Light", odometer: "89,200 km", lastService: "13 days ago", nextDue: "Tire Rotation", state: "healthy" },
        { id: "TRK-023", type: "Heavy", odometer: "210,300 km", lastService: "30 days ago", nextDue: "Brake Inspection", state: "warning" },
        { id: "TRK-007", type: "Refrigerated", odometer: "156,800 km", lastService: "45 days ago", nextDue: "Engine Overhaul", state: "critical" },
        { id: "TRK-031", type: "Light", odometer: "67,400 km", lastService: "9 days ago", nextDue: "Oil Change", state: "healthy" },
        { id: "TRK-019", type: "Heavy", odometer: "185,000 km", lastService: "35 days ago", nextDue: "Transmission Check", state: "warning" }
    ],
    workOrders: [
        { id: "WO-301", vehicle: "TRK-007", issue: "Breakdown", mechanic: "Ahmed Tariq", status: "In Progress", opened: "Apr 12, 2026" },
        { id: "WO-302", vehicle: "TRK-023", issue: "Routine", mechanic: "Khalid Omar", status: "Open", opened: "Apr 13, 2026" },
        { id: "WO-298", vehicle: "TRK-042", issue: "Routine", mechanic: "Ahmed Tariq", status: "Resolved", opened: "Apr 8, 2026" },
        { id: "WO-295", vehicle: "TRK-019", issue: "Emergency", mechanic: "Khalid Omar", status: "In Progress", opened: "Apr 10, 2026" }
    ],
    alerts: [
        { vehicle: "TRK-023", title: "Service Due", desc: "500 km remaining", icon: "wrench" },
        { vehicle: "TRK-007", title: "Insurance Expiry", desc: "18 days", icon: "triangle-alert" },
        { vehicle: "TRK-019", title: "Inspection Expiry", desc: "22 days", icon: "clock" },
        { vehicle: "TRK-042", title: "Service Due", desc: "1,200 km remaining", icon: "wrench" }
    ],
    stockWarnings: [
        { item: "Oil Filter", category: "Filters", qty: 3, capacity: 10, unit: "min", reorder: 20 },
        { item: "Brake Pads", category: "Brakes", qty: 5, capacity: 8, unit: "min", reorder: 15 },
        { item: "Coolant 5L", category: "Fluids", qty: 2, capacity: 6, unit: "min", reorder: 12 },
        { item: "Air Filter", category: "Filters", qty: 8, capacity: 10, unit: "min", reorder: 20 }
    ]
};

export function mount() {
    renderVehicles();
    renderWorkOrders();
    renderAlerts();
    renderInventory();

    if (window.lucide) {
        window.lucide.createIcons();
    }
}

export function unmount() {
    // cleanup
}

function renderVehicles() {
    const grid = document.getElementById('vehicle-grid');
    if (!grid) return;

    grid.innerHTML = testData.vehicles.map(v => {
        const healthClass = v.state === 'critical' ? 'critical' : v.state === 'warning' ? 'warning' : 'healthy';
        return `
            <div class="health-card ${healthClass}">
                <div class="health-card__header">
                    <div class="health-card__identity">
                        <i data-lucide="truck"></i>
                        <h3 class="health-card__id">${v.id}<span class="health-card__type">${v.type}</span></h3>
                    </div>
                    <div class="health-dot ${healthClass}"></div>
                </div>
                <div class="health-card__meta">
                    <p>Odometer: <span>${v.odometer}</span></p>
                    <p>Last Service: <span>${v.lastService}</span></p>
                    <p>Next Due: <strong>${v.nextDue}</strong></p>
                </div>
            </div>
        `;
    }).join('');
}

function renderWorkOrders() {
    const tbody = document.getElementById('work-orders-tbody');
    if (!tbody) return;

    tbody.innerHTML = testData.workOrders.map(order => {
        const issueKey = order.issue.toLowerCase();
        const issueBadge = `<span class="pill ${issueKey}">${order.issue}</span>`;

        const statusKey = order.status.toLowerCase().replace(' ', '-');
        const statusBadge = `<span class="pill rounded ${statusKey}">${order.status}</span>`;

        return `
            <tr>
                <td>${order.id}</td>
                <td>${order.vehicle}</td>
                <td>${issueBadge}</td>
                <td>${order.mechanic}</td>
                <td>${statusBadge}</td>
                <td>${order.opened}</td>
            </tr>
        `;
    }).join('');
}

function renderAlerts() {
    const list = document.getElementById('alerts-list');
    if (!list) return;

    list.innerHTML = testData.alerts.map(alert => `
        <div class="alert-row">
            <i data-lucide="${alert.icon}"></i>
            <div class="alert-row__body">
                <span class="alert-row__title">${alert.vehicle} &mdash; ${alert.title}</span>
                <span class="alert-row__desc">${alert.desc}</span>
            </div>
        </div>
    `).join('');
}

function renderInventory() {
    const list = document.getElementById('stock-list');
    if (!list) return;

    // update badge count
    const countBadge = document.getElementById('stock-count-badge');
    if (countBadge) countBadge.textContent = `${testData.stockWarnings.length} items`;

    list.innerHTML = testData.stockWarnings.map(item => `
        <div class="stock-row">
            <div class="stock-row__info">
                <span class="stock-row__name">${item.item}</span>
                <span class="stock-row__category">${item.category}</span>
            </div>
            <div class="stock-row__qty-block">
                <span class="stock-qty">${item.qty} <span>/ ${item.capacity} ${item.unit}</span></span>
                <span class="stock-reorder">Reorder: ${item.reorder}</span>
            </div>
        </div>
    `).join('');
}
