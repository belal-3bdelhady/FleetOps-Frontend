import {
    IMPORT_NOTE,
    ORDER_PAYMENT_OPTIONS,
    ORDER_PRIORITY_OPTIONS,
    ORDER_STATUS_OPTIONS,
    ordersSeedData,
} from "../storage/orders.js";

const orders = clone(ordersSeedData);

function getOrders() {
    return clone(orders);
}

function getOrderById(orderId) {
    return clone(orders.find((order) => order.id === orderId) ?? null);
}

function getStatusOptions() {
    return [...ORDER_STATUS_OPTIONS];
}

function getPriorityOptions() {
    return [...ORDER_PRIORITY_OPTIONS];
}

function getPaymentOptions() {
    return [...ORDER_PAYMENT_OPTIONS];
}

function getImportNote() {
    return IMPORT_NOTE;
}

function createOrder(payload) {
    const nextId = createNextOrderId();
    const customerName = payload.customerName?.trim() || "New Customer";
    const customerPhone = payload.customerPhone?.trim() || "+20 100 000 0000";
    const customerEmail =
        payload.customerEmail?.trim() || "customer@fleetops.eg";
    const address = payload.address?.trim() || "Cairo";
    const priority = ORDER_PRIORITY_OPTIONS.includes(payload.priority)
        ? payload.priority
        : "Normal";
    const paymentType = ORDER_PAYMENT_OPTIONS.includes(payload.paymentType)
        ? payload.paymentType
        : "Prepaid";
    const paymentWindow = payload.paymentWindow?.trim() || "09:00-12:00";
    const weightKg = Number(payload.weightKg) || 0;
    const volumeM3 = Number(payload.volumeM3) || 0;
    const linkId = nextId.split("-")[1];

    const order = {
        id: nextId,
        customerName,
        customerPhone,
        customerEmail,
        address,
        weightKg,
        volumeM3,
        paymentType,
        paymentWindow,
        priority,
        status: "Pending",
        trackingLink: `https://track.fleetops.eg/${linkId}`,
        driver: null,
        vehicleId: null,
        createdAt: "Apr 22, 2026",
        liveTrackingMessage:
            "Order not yet dispatched - tracking will activate when driver picks up",
        liveTrackingHint:
            "Customer can view all status changes at their tracking link.",
        notificationsSummary: { sent: 3, total: 3, failed: 0 },
        notifications: [
            {
                channel: "SMS",
                icon: "smartphone",
                sentAt: "Apr 22, 10:00 AM",
                content: `Tracking link + order confirmation sent to ${customerPhone}`,
                status: "Sent",
            },
            {
                channel: "WhatsApp",
                icon: "message-circle",
                sentAt: "Apr 22, 10:01 AM",
                content: `Tracking link + order confirmation sent to ${customerPhone}`,
                status: "Sent",
            },
            {
                channel: "Email",
                icon: "mail",
                sentAt: "Apr 22, 10:01 AM",
                content: `Tracking link + order confirmation sent to ${customerEmail}`,
                status: "Sent",
            },
        ],
        timeline: [
            {
                title: "Order Created",
                description: "Order added manually from operations panel",
                at: "Apr 22, 10:00 AM",
                notified: true,
            },
        ],
    };

    orders.unshift(order);
    return clone(order);
}

function importOrders(fileName) {
    const fileLabel = fileName?.replace(/\.[^.]+$/, "") || "Imported Batch";
    const imported = createOrder({
        customerName: `${fileLabel} Client`,
        customerPhone: "+20 100 123 4567",
        customerEmail: "import@fleetops.eg",
        address: "Imported via file upload",
        paymentType: "Prepaid",
        paymentWindow: "13:00-16:00",
        priority: "Normal",
        weightKg: 7.5,
        volumeM3: 0.4,
    });

    imported.timeline[0].description = `Imported from ${fileName}`;
    const liveOrder = orders.find((order) => order.id === imported.id);
    if (liveOrder) {
        liveOrder.timeline[0].description = `Imported from ${fileName}`;
    }

    return {
        importedCount: 1,
        latestOrder: clone(imported),
        message: `${fileName} imported successfully.`,
    };
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function createNextOrderId() {
    const highest = orders.reduce((max, order) => {
        const numericId = Number(order.id.replace("ORD-", ""));
        return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
    }, 4500);

    return `ORD-${highest + 1}`;
}

const OrdersApi = {
    createOrder,
    getImportNote,
    getOrderById,
    getOrders,
    getPaymentOptions,
    getPriorityOptions,
    getStatusOptions,
    importOrders,
};

export default OrdersApi;
