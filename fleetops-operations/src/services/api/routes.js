import {
    ROUTE_DATE_OPTIONS,
    ROUTE_SHIFT_OPTIONS,
    ROUTE_STATUS_OPTIONS,
    routesSeedData,
} from "../storage/routes.js";

const routes = clone(routesSeedData);

function getRoutes() {
    return clone(routes);
}

function getRouteById(routeId) {
    return clone(routes.find((route) => route.id === routeId) ?? null);
}

function getStatusOptions() {
    return [...ROUTE_STATUS_OPTIONS];
}

function getShiftOptions() {
    return [...ROUTE_SHIFT_OPTIONS];
}

function getDateOptions() {
    return [...ROUTE_DATE_OPTIONS];
}

function getOverviewStats() {
    const activeRoutes = routes.filter((route) =>
        ["Active", "In Transit"].includes(route.status),
    ).length;
    const completedToday = routes.filter(
        (route) =>
            route.status === "Completed" && route.date === "Apr 14, 2026",
    ).length;
    const totalDistanceKm = routes.reduce(
        (sum, route) => sum + route.distanceKm,
        0,
    );
    const avgStops = Math.round(
        routes.reduce((sum, route) => sum + route.totalStops, 0) / routes.length,
    );

    return {
        activeRoutes,
        avgStops,
        completedToday,
        totalDistanceKm,
    };
}

function createRoute(payload) {
    const nextId = createNextRouteId();
    const totalStops = Number(payload.totalStops) || 8;
    const distanceKm = Number(payload.distanceKm) || 40;
    const route = {
        id: nextId,
        driverName: payload.driverName?.trim() || "Unassigned Driver",
        driverInitials: createInitials(payload.driverName),
        vehicleId: payload.vehicleId?.trim() || "TRK-000",
        vehicleType: payload.vehicleType?.trim() || "Light",
        status: "Pending",
        shift: payload.shift?.trim() || "Morning",
        completedStops: 0,
        totalStops,
        progress: 0,
        distanceKm,
        startTime: "--",
        eta: "--",
        etaStatus: "",
        date: payload.date?.trim() || "Apr 14, 2026",
        version: 1,
        totalWeightKg: Number(payload.totalWeightKg) || 250,
        totalVolumeM3: Number(payload.totalVolumeM3) || 5.5,
        eventTime: "08:00 AM",
        playbackFrames: 0,
        playbackStopsDelivered: 0,
        playbackStopsRemaining: totalStops,
        linePoints: [16, 22, 18, 27, 20, 30],
        eventLog: [{ title: "New route created and queued", time: "08:00 AM" }],
        stops: [
            {
                index: 1,
                customer: "First assigned stop",
                address: payload.zone?.trim() || "Operations Zone",
                orderId: "ORD-NEW01",
                planned: "09:00",
                actual: "--",
                delivered: false,
            },
        ],
    };

    routes.unshift(route);
    return clone(route);
}

function clone(value) {
    return JSON.parse(JSON.stringify(value));
}

function createInitials(name) {
    const tokens = (name || "UR")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2);
    return tokens.map((token) => token[0]?.toUpperCase() ?? "").join("") || "UR";
}

function createNextRouteId() {
    const highest = routes.reduce((max, route) => {
        const numericId = Number(route.id.replace("R-", ""));
        return Number.isFinite(numericId) ? Math.max(max, numericId) : max;
    }, 1000);

    return `R-${highest + 1}`;
}

const RoutesApi = {
    createRoute,
    getDateOptions,
    getOverviewStats,
    getRouteById,
    getRoutes,
    getShiftOptions,
    getStatusOptions,
};

export default RoutesApi;
