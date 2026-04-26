import api from "/shared/api-handler.js";
import {
    VEHICLES,
    MECHANICS,
    TYPES,
    STATUSES,
    WORK_ORDERS_STORAGE_KEY,
    workOrdersMockData,
} from "../storage/work-orders.js";

api.setBaseURL("http://localhost:3000");

function cloneOrders(orders) {
    return JSON.parse(JSON.stringify(orders));
}

function serializeMechanic(mechanic) {
    if (mechanic && typeof mechanic === "object") {
        return mechanic.name || "Unassigned";
    }

    return mechanic || "Unassigned";
}

function writeOrders(orders) {
    const serializedOrders = cloneOrders(
        orders.map((order) => ({
            ...order,
            mechanic: serializeMechanic(order.mechanic),
        })),
    );

    localStorage.setItem(WORK_ORDERS_STORAGE_KEY, JSON.stringify(serializedOrders));
    return serializedOrders;
}

function readOrders() {
    const storedOrders = localStorage.getItem(WORK_ORDERS_STORAGE_KEY);

    if (!storedOrders) {
        return writeOrders(workOrdersMockData);
    }

    try {
        return JSON.parse(storedOrders);
    } catch {
        return writeOrders(workOrdersMockData);
    }
}

function getNextOrderId(orders) {
    const maxId = orders.reduce((max, order) => {
        const match = /^WO-(\d+)$/.exec(order.id || "");
        return match ? Math.max(max, Number(match[1])) : max;
    }, 2999);

    return `WO-${maxId + 1}`;
}

function getVehicles() {
    return [...VEHICLES];
}

function getMechanics() {
    return [...MECHANICS];
}

function getTypes() {
    return [...TYPES];
}

function getStatuses() {
    return [...STATUSES];
}

function normalizeStoredOrder(order) {
    const mechanicName = serializeMechanic(order.mechanic);

    let mechanic = MECHANICS[3];
    if (mechanicName !== "Unassigned") {
        mechanic = MECHANICS.find((item) => item.name.toLowerCase() === mechanicName.toLowerCase()) || {
            name: mechanicName,
            initials: mechanicName.slice(0, 2).toUpperCase(),
            avatarClass: "wo-avatar--km",
        };
    }

    return { ...order, mechanic, _source: "local" };
}

function getAllOrders() {
    return readOrders().map(normalizeStoredOrder);
}

function getOrderById(id) {
    return getAllOrders().find((order) => order.id === id) || null;
}

function replaceOrders(orders) {
    return writeOrders(orders);
}

function createOrder(data) {
    const orders = readOrders();
    const newOrder = {
        id: data.id || getNextOrderId(orders),
        vehicle: data.vehicle,
        type: data.type,
        description: data.description,
        priority: data.priority,
        startDate: data.startDate,
        mechanic: serializeMechanic(data.mechanic),
        status: data.status || "Open",
        cost: data.cost || "—",
        files: data.files || [],
        opened: data.opened || new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit",
        }).replace(",", ""),
        updated: data.updated || "Just now",
        _createdAt: data._createdAt || new Date().toISOString(),
    };

    writeOrders([newOrder, ...orders]);
    return normalizeStoredOrder(newOrder);
}

function updateOrder(id, updates) {
    const orders = readOrders();
    const orderIndex = orders.findIndex((order) => order.id === id);

    if (orderIndex === -1) {
        return null;
    }

    const updatedOrder = {
        ...orders[orderIndex],
        ...updates,
        id: orders[orderIndex].id,
    };

    if (Object.prototype.hasOwnProperty.call(updates, "mechanic")) {
        updatedOrder.mechanic = serializeMechanic(updates.mechanic);
    }

    orders[orderIndex] = updatedOrder;
    writeOrders(orders);
    return normalizeStoredOrder(updatedOrder);
}

function updateOrderMechanic(id, mechanicName) {
    const existingOrder = readOrders().find((order) => order.id === id);

    if (!existingOrder) {
        return false;
    }

    const nextStatus = existingOrder.status === "Open" && mechanicName && mechanicName !== "Unassigned"
        ? "Assigned"
        : existingOrder.status;

    return Boolean(updateOrder(id, {
        mechanic: mechanicName,
        status: nextStatus,
        updated: "Just now",
    }));
}

function updateOrderStatus(id, status) {
    return Boolean(updateOrder(id, { status, updated: "Just now" }));
}

function deleteOrder(id) {
    const orders = readOrders();
    const nextOrders = orders.filter((order) => order.id !== id);

    if (nextOrders.length === orders.length) {
        return false;
    }

    writeOrders(nextOrders);
    return true;
}

const WorkOrdersApi = {
    getVehicles,
    getMechanics,
    getTypes,
    getStatuses,
    getAllOrders,
    getOrderById,
    replaceOrders,
    createOrder,
    updateOrder,
    updateOrderMechanic,
    updateOrderStatus,
    deleteOrder,
};

export default WorkOrdersApi;
