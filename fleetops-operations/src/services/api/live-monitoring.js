import {
    LIVE_MONITORING_DATE_OPTIONS,
    LIVE_MONITORING_SHIFT_OPTIONS,
    LIVE_MONITORING_STATUS_OPTIONS,
    liveMonitoringSeedData,
} from "../storage/live-monitoring.js";

function getStatusOptions() {
    return [...LIVE_MONITORING_STATUS_OPTIONS];
}

function getShiftOptions() {
    return [...LIVE_MONITORING_SHIFT_OPTIONS];
}

function getDateOptions() {
    return [...LIVE_MONITORING_DATE_OPTIONS];
}

function getDefaultDate() {
    return LIVE_MONITORING_DATE_OPTIONS[0];
}

function getMapMeta() {
    return clone({
        labels: liveMonitoringSeedData.mapLabels,
        routes: liveMonitoringSeedData.routeGeometry,
    });
}

function getSnapshot(date) {
    const fallbackDate = getDefaultDate();
    const selectedDate = liveMonitoringSeedData.monitoringSeeds[date]
        ? date
        : fallbackDate;

    return clone({
        date: selectedDate,
        ...liveMonitoringSeedData.monitoringSeeds[selectedDate],
    });
}

function getVehicleById(date, vehicleId) {
    const snapshot = getSnapshot(date);
    return snapshot.operations.find((vehicle) => vehicle.id === vehicleId) ?? null;
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

const LiveMonitoringApi = {
    getDateOptions,
    getDefaultDate,
    getMapMeta,
    getShiftOptions,
    getSnapshot,
    getStatusOptions,
    getVehicleById,
};

export default LiveMonitoringApi;
