import api from "/shared/api-handler.js";
import {
    VEHICLES,
    MECHANICS,
    TYPES,
    STATUSES,
    DESCRIPTIONS,
} from "../storage/work-orders.js";

// ─── Global Setup ─────────────────────────────────────────────────────────────

api.setBaseURL("http://localhost:3000");

// ─── Internal helpers ─────────────────────────────────────────────────────────

function _rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function _formatDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" })
             .replace(",", "");
}

function _relativeLabel(days) {
    if (days === 0) return "Today";
    if (days === 1) return "1d ago";
    return `${days}d ago`;
}

// ─── API Methods ──────────────────────────────────────────────────────────────

/**
 * Returns the full list of vehicles.
 */
function getVehicles() {
    return [...VEHICLES];
}

/**
 * Returns the full list of mechanics.
 */
function getMechanics() {
    return [...MECHANICS];
}

/**
 * Returns the available work-order types.
 */
function getTypes() {
    return [...TYPES];
}

/**
 * Returns the available work-order statuses.
 */
function getStatuses() {
    return [...STATUSES];
}

/**
 * Generates and returns `count` mock work orders using the seed data.
 * @param {number} count
 * @returns {Array}
 */
function getMockOrders(count = 14) {
    // Plate strings only (view expects plain strings for vehicle column)
    const plates = VEHICLES.map(v => v.plate);
    const orders = [];

    for (let i = 0; i < count; i++) {
        const type    = _rand(TYPES);
        const status  = _rand(STATUSES);
        const mechObj = (status === "Open" && Math.random() > 0.5)
                         ? MECHANICS[3]
                         : _rand(MECHANICS.slice(0, 3));
        const openedDays  = Math.floor(Math.random() * 20) + 2;
        const updatedDays = Math.floor(Math.random() * openedDays);
        const hasCost     = status === "Resolved" || status === "Closed";

        orders.push({
            id:          `WO-${2034 + (count - 1 - i)}`,
            vehicle:     plates[i % plates.length],
            type,
            mechanic:    mechObj,
            status,
            priority:    (type === "Breakdown" || type === "Emergency") && Math.random() > 0.3
                             ? "Urgent" : "Normal",
            description: DESCRIPTIONS[i % DESCRIPTIONS.length],
            cost:        hasCost ? `EGP ${(Math.floor(Math.random() * 45) * 100 + 1000).toLocaleString()}` : "—",
            opened:      _formatDate(openedDays),
            updated:     _relativeLabel(updatedDays),
            _source:     "mock",
        });
    }

    return orders;
}

// ─── LocalStorage & Stored Orders ─────────────────────────────────────────────

const LS_KEY = "maintenance-app:work-orders";

function loadStoredOrders() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch { return []; }
}

function normalizeStoredOrder(o) {
    let mechObj;
    if (!o.mechanic || o.mechanic === "Unassigned" || o.mechanic === "") {
        mechObj = MECHANICS[3]; // Unassigned
    } else {
        mechObj = MECHANICS.find(m =>
            m.name.toLowerCase() === o.mechanic.toLowerCase()
        ) || { name: o.mechanic, initials: o.mechanic.slice(0, 2).toUpperCase(), avatarClass: "wo-avatar--km" };
    }

    return { ...o, mechanic: mechObj, _source: "local" };
}

// ─── Export ───────────────────────────────────────────────────────────────────

const MOCK_ORDERS = getMockOrders(14);

/**
 * Returns all orders, combining LocalStorage items and Mock items.
 */
function getAllOrders() {
    const stored    = loadStoredOrders().map(normalizeStoredOrder);
    const storedIds = new Set(stored.map(o => o.id));
    const filtered  = MOCK_ORDERS.filter(o => !storedIds.has(o.id));
    return [...stored, ...filtered];
}

/**
 * Finds a specific order by ID.
 * @param {string} id 
 */
function getOrderById(id) {
    return getAllOrders().find(o => o.id === id) || null;
}

/**
 * Updates the assigned mechanic for an order in LocalStorage.
 * Does not persist mock orders to storage, only stored ones!
 * For a real app, this would be an API PUT request.
 */
function updateOrderMechanic(id, mechanicName) {
    const stored = loadStoredOrders();
    const index = stored.findIndex(o => o.id === id);
    if (index !== -1) {
        stored[index].mechanic = mechanicName;
        // If assigning, status might change to Assigned or In Progress, but let's keep it simple
        if (stored[index].status === "Open" && mechanicName !== "Unassigned" && mechanicName !== "") {
            stored[index].status = "Assigned";
        }
        localStorage.setItem(LS_KEY, JSON.stringify(stored));
        return true;
    }
    return false; // Can't update mock orders in local storage
}

const WorkOrdersApi = {
    getVehicles,
    getMechanics,
    getTypes,
    getStatuses,
    getMockOrders,
    getAllOrders,
    getOrderById,
    updateOrderMechanic,
};

export default WorkOrdersApi;
