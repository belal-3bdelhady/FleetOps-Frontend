import { MY_WORK_ORDERS } from "../storage/my-work-orders.js";

function getAllWorkOrders() {
    return MY_WORK_ORDERS.map((order) => ({ ...order }));
}

function getOrderById(id) {
    const order = MY_WORK_ORDERS.find((order) => order.id === id);
    return order ? { ...order } : null;
}

export default {
    getAllWorkOrders,
    getOrderById,
};
