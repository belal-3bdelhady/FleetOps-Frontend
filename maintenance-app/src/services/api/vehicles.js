import api from "/shared/api-handler.js";
import vehiclesData from "../storage/vehicles.js";

// ─── Global Setup ─────────────────────────────────────────────────────────────

api.setBaseURL("http://localhost:3000");


// ─── API Methods ─────────────────────────────────────────────────────────────

function getVehiclesData() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([...vehiclesData]);
        }, 200);
    });
}

function getVehicleById(id) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(vehiclesData.find(v => v.id === id) || null);
        }, 200);
    });
}

const VehiclesApi = {
    getVehiclesData,
    getVehicleById,
};

export default VehiclesApi;
