import LiveMonitoringApi from "../../services/api/live-monitoring.js";
import {
    createIcons,
    icons,
} from "/node_modules/lucide/dist/esm/lucide.mjs";

let cleanupFns = [];
let playbackTimer = null;
let state = null;

const PLAYBACK_SPEEDS = [1, 2, 4];
let handleDatePickerTrigger = null;

export function mount() {
    const defaultDate = LiveMonitoringApi.getDefaultDate();
    const snapshot = LiveMonitoringApi.getSnapshot(defaultDate);
    const firstVehicleId = snapshot.operations[0]?.id ?? null;

    state = {
        activeDate: defaultDate,
        activeStatus: "All",
        searchTerm: "",
        selectedVehicleId: firstVehicleId,
        shift: "All Shifts",
        snapshot,
        playback: {
            frame: 100,
            isPlaying: false,
            speed: 1,
        },
    };

    bindEvents();
    renderPage();
}

export function unmount() {
    stopPlayback();
    cleanupFns.forEach((cleanup) => cleanup?.());
    cleanupFns = [];
    state = null;
}

function bindEvents() {
    cleanupFns = [];

    const filters = document.getElementById("live-monitoring-filters");
    const searchInput = document.getElementById("live-monitoring-search-input");
    const shiftSelect = document.getElementById("live-monitoring-shift-select");
    const shortcuts = document.getElementById("live-monitoring-date-shortcuts");
    const dateInput = document.getElementById("live-monitoring-date-input");
    const rangeInput = document.getElementById("live-monitoring-frame-range");
    const playBtn = document.getElementById("live-monitoring-play-btn");
    const pauseBtn = document.getElementById("live-monitoring-pause-btn");
    const speedSelect = document.getElementById("live-monitoring-speed-select");
    const map = document.getElementById("live-monitoring-map");
    const dateTrigger = document.getElementById("live-monitoring-date-picker-trigger");
    const viewRoutesBtn = document.getElementById("live-monitoring-view-routes-btn");
    handleDatePickerTrigger = () => dateInput?.showPicker?.();

    filters?.addEventListener("click", handleFilterClick);
    searchInput?.addEventListener("input", handleSearch);
    shiftSelect?.addEventListener("change", handleShiftChange);
    shortcuts?.addEventListener("click", handleDateShortcutClick);
    dateInput?.addEventListener("change", handleDateChange);
    rangeInput?.addEventListener("input", handleFrameChange);
    playBtn?.addEventListener("click", startPlayback);
    pauseBtn?.addEventListener("click", stopPlayback);
    speedSelect?.addEventListener("change", handleSpeedChange);
    map?.addEventListener("click", handleMapClick);
    dateTrigger?.addEventListener("click", handleDatePickerTrigger);
    viewRoutesBtn?.addEventListener("click", handleViewRoutesClick);

    cleanupFns.push(
        () => filters?.removeEventListener("click", handleFilterClick),
        () => searchInput?.removeEventListener("input", handleSearch),
        () => shiftSelect?.removeEventListener("change", handleShiftChange),
        () => shortcuts?.removeEventListener("click", handleDateShortcutClick),
        () => dateInput?.removeEventListener("change", handleDateChange),
        () => rangeInput?.removeEventListener("input", handleFrameChange),
        () => playBtn?.removeEventListener("click", startPlayback),
        () => pauseBtn?.removeEventListener("click", stopPlayback),
        () => speedSelect?.removeEventListener("change", handleSpeedChange),
        () => map?.removeEventListener("click", handleMapClick),
        () => dateTrigger?.removeEventListener("click", handleDatePickerTrigger),
        () => viewRoutesBtn?.removeEventListener("click", handleViewRoutesClick),
    );
}

function renderPage() {
    renderFilters();
    renderToolbarControls();
    renderOverview();
    renderMap();
    renderSidebar();
    renderAlerts();
    refreshIcons();
}

function renderFilters() {
    const filters = document.getElementById("live-monitoring-filters");
    if (!filters) {
        return;
    }

    filters.innerHTML = LiveMonitoringApi.getStatusOptions()
        .map(
            (status) => `
                <button
                    class="live-filter-chip ${state.activeStatus === status ? "is-active" : ""}"
                    type="button"
                    data-status="${status}">
                    ${status}
                </button>
            `,
        )
        .join("");
}

function renderToolbarControls() {
    const shiftSelect = document.getElementById("live-monitoring-shift-select");
    const shortcuts = document.getElementById("live-monitoring-date-shortcuts");
    const dateInput = document.getElementById("live-monitoring-date-input");
    const speedSelect = document.getElementById("live-monitoring-speed-select");
    const frameRange = document.getElementById("live-monitoring-frame-range");

    if (shiftSelect) {
        shiftSelect.innerHTML = LiveMonitoringApi.getShiftOptions()
            .map(
                (option) =>
                    `<option value="${option}" ${state.shift === option ? "selected" : ""}>${option}</option>`,
            )
            .join("");
    }

    if (shortcuts) {
        shortcuts.innerHTML = LiveMonitoringApi.getDateOptions()
            .slice(0, 3)
            .map((date) => {
                const label = date === "2026-04-23" ? "Today" : formatDateLabel(date);
                return `
                    <button
                        class="live-date-chip ${state.activeDate === date ? "is-active" : ""}"
                        type="button"
                        data-date-shortcut="${date}">
                        ${label}
                    </button>
                `;
            })
            .join("");
    }

    if (dateInput) {
        dateInput.value = state.activeDate;
        dateInput.min = LiveMonitoringApi.getDateOptions().at(-1);
        dateInput.max = LiveMonitoringApi.getDateOptions()[0];
    }

    if (speedSelect) {
        speedSelect.innerHTML = PLAYBACK_SPEEDS.map(
            (speed) =>
                `<option value="${speed}" ${state.playback.speed === speed ? "selected" : ""}>${speed}x</option>`,
        ).join("");
    }

    if (frameRange) {
        frameRange.value = String(state.playback.frame);
    }
}

function renderOverview() {
    const root = document.getElementById("live-monitoring-overview");
    if (!root) {
        return;
    }

    const { summary } = state.snapshot;
    const visibleCount = getFilteredOperations().length;

    root.innerHTML = [
        renderOverviewCard("Visible Operations", visibleCount, `${summary.activeTrips} active on selected day`),
        renderOverviewCard("On-Time Fleet", summary.onTime, "Healthy routes and confirmed ETA"),
        renderOverviewCard("At-Risk Trips", summary.atRisk, "Needs dispatcher attention"),
        renderOverviewCard("Incidents", summary.incidents, "Breakdowns, delays, or anomalies"),
    ].join("");
}

function renderOverviewCard(label, value, meta) {
    return `
        <article class="live-overview-card">
            <span class="live-overview-card__label">${label}</span>
            <strong class="live-overview-card__value">${value}</strong>
            <span class="live-overview-card__meta">${meta}</span>
        </article>
    `;
}

function renderMap() {
    const root = document.getElementById("live-monitoring-map");
    if (!root) {
        return;
    }

    const mapMeta = LiveMonitoringApi.getMapMeta();
    const operations = getFilteredOperations();
    const selected = getSelectedVehicle();

    root.innerHTML = `
        <div class="live-monitoring-map-frame">
            <iframe
                class="live-monitoring-map-embed"
                src="${getEmbeddedMapSrc()}"
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
                aria-label="Live monitoring map of Greater Cairo"></iframe>
            <div class="live-monitoring-map-overlay">
                ${mapMeta.labels
                    .map(
                        (label) => `
                            <span class="map-label" style="left:${label.x}%; top:${label.y}%;">${label.text}</span>
                        `,
                    )
                    .join("")}
                ${operations.map((vehicle) => renderVehicleMarker(vehicle)).join("")}
                <article class="map-overlay-card">
                    <strong>${formatDateLong(state.activeDate)}</strong>
                    <span>${selected ? `${selected.id} selected for detailed playback` : "Select any vehicle on the map"}</span>
                    <span>${state.activeDate === "2026-04-23" ? "Live day" : "Historical playback snapshot"}</span>
                </article>
            </div>
        </div>
    `;
}

function getEmbeddedMapSrc() {
    const bbox = "31.10,29.85,31.55,30.05";
    return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik`;
}

function renderMapSvg(routes) {
    return `
        <svg class="map-base-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            ${routes
                .map((route) => {
                    const polyline = route.points.map(([x, y]) => `${x},${y}`).join(" ");
                    return `
                        <polyline
                            fill="none"
                            stroke="${route.color}"
                            stroke-width="0.45"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            opacity="0.7"
                            points="${polyline}">
                        </polyline>
                    `;
                })
                .join("")}
        </svg>
    `;
}

function renderVehicleMarker(vehicle) {
    const [x, y] = getVehiclePosition(vehicle);
    const statusClass = toKebabCase(vehicle.status);
    const isSelected = state.selectedVehicleId === vehicle.id;

    return `
        <div
            class="map-point map-point--${statusClass} ${isSelected ? "is-selected" : ""}"
            style="left:${x}%; top:${y}%"
            data-vehicle-id="${vehicle.id}">
            <span class="map-point__trail"></span>
            <span class="map-point__pin"></span>
            <button class="map-point__label" type="button" data-vehicle-id="${vehicle.id}">
                <i data-lucide="truck"></i>
                <span class="map-point__copy">
                    <strong>${vehicle.id}</strong>
                    <span>${vehicle.speed} km/h</span>
                </span>
            </button>
        </div>
    `;
}

function renderSidebar() {
    const root = document.getElementById("live-monitoring-sidebar");
    if (!root) {
        return;
    }

    const selected = getSelectedVehicle();
    if (!selected) {
        root.innerHTML = `
            <div class="live-sidebar-empty">
                <div>
                    <strong>No operation selected</strong>
                    <p>Pick any truck from the map to inspect route state, ETA, and historical events.</p>
                </div>
            </div>
        `;
        return;
    }

    root.innerHTML = `
        <header class="live-sidebar-head">
            <div class="live-sidebar-head__title">
                <strong>${selected.id}</strong>
                <span>${selected.driver} | ${selected.plate}</span>
                <span>${selected.address}</span>
            </div>
            ${renderStatusBadge(selected.status)}
        </header>

        <section class="live-sidebar-grid">
            ${renderMetricCard("Speed", `${selected.speed} km/h`)}
            ${renderMetricCard("ETA", selected.eta)}
            ${renderMetricCard("Shift", selected.shift)}
            ${renderMetricCard("Orders", `${selected.orderCount} drops`)}
            ${renderMetricCard("Progress", `${selected.progress}%`)}
            ${renderMetricCard("Temp", selected.temperature)}
        </section>

        <section class="live-sidebar-banner">
            <strong>${selected.alert}</strong>
            <span>Destination: ${selected.destination}</span>
            <span>Last update: ${selected.lastUpdate}</span>
        </section>

        <section class="live-sidebar-timeline">
            <div class="live-sidebar-timeline__head">
                <strong>Operation Timeline</strong>
                <span>${formatDateLong(state.activeDate)}</span>
            </div>
            ${selected.timeline
                .map(
                    (entry) => `
                        <article class="live-timeline-item">
                            <span class="live-timeline-item__time">${entry.time}</span>
                            <div class="live-timeline-item__content">
                                <strong>${entry.title}</strong>
                                <span>${entry.location}</span>
                            </div>
                        </article>
                    `,
                )
                .join("")}
        </section>
    `;
}

function renderMetricCard(label, value) {
    return `
        <article class="live-sidebar-metric">
            <span>${label}</span>
            <strong>${value}</strong>
        </article>
    `;
}

function renderAlerts() {
    const root = document.getElementById("live-monitoring-alerts");
    if (!root) {
        return;
    }

    root.innerHTML = state.snapshot.alerts
        .map(
            (alert) => `
                <span class="live-alert-chip live-alert-chip--${alert.tone}">
                    <i data-lucide="${getAlertIcon(alert.tone)}"></i>
                    <span>${alert.text}</span>
                </span>
            `,
        )
        .join("");
}

function handleFilterClick(event) {
    const button = event.target.closest("[data-status]");
    if (!button) {
        return;
    }

    state.activeStatus = button.dataset.status;
    ensureSelectedVehicleVisible();
    renderPage();
}

function handleSearch(event) {
    state.searchTerm = event.target.value.trim().toLowerCase();
    ensureSelectedVehicleVisible();
    renderPage();
}

function handleShiftChange(event) {
    state.shift = event.target.value;
    ensureSelectedVehicleVisible();
    renderPage();
}

function handleDateShortcutClick(event) {
    const button = event.target.closest("[data-date-shortcut]");
    if (!button) {
        return;
    }

    updateDate(button.dataset.dateShortcut);
}

function handleDateChange(event) {
    updateDate(event.target.value);
}

function handleMapClick(event) {
    const button = event.target.closest("[data-vehicle-id]");
    if (!button) {
        return;
    }

    state.selectedVehicleId = button.dataset.vehicleId;
    renderMap();
    renderSidebar();
    refreshIcons();
}

function handleFrameChange(event) {
    state.playback.frame = Number(event.target.value);
    renderMap();
    refreshIcons();
}

function handleViewRoutesClick() {
    const selectedVehicle = getSelectedVehicle();
    if (selectedVehicle?.routeId) {
        sessionStorage.setItem("fleetops-live-selected-route", selectedVehicle.routeId);
    } else {
        sessionStorage.removeItem("fleetops-live-selected-route");
    }

    stopPlayback();
}

function handleSpeedChange(event) {
    state.playback.speed = Number(event.target.value);

    if (state.playback.isPlaying) {
        startPlayback();
    }
}

function updateDate(date) {
    if (!LiveMonitoringApi.getDateOptions().includes(date)) {
        return;
    }

    stopPlayback();
    state.activeDate = date;
    state.snapshot = LiveMonitoringApi.getSnapshot(date);
    state.playback.frame = 100;
    state.selectedVehicleId = state.snapshot.operations[0]?.id ?? null;
    ensureSelectedVehicleVisible();
    renderPage();
}

function startPlayback() {
    stopPlayback();
    state.playback.isPlaying = true;

    playbackTimer = window.setInterval(() => {
        const nextFrame = state.playback.frame >= 100 ? 0 : state.playback.frame + state.playback.speed * 4;
        state.playback.frame = Math.min(nextFrame, 100);
        renderMap();
        renderToolbarControls();
        refreshIcons();
    }, 420);
}

function stopPlayback() {
    state.playback.isPlaying = false;

    if (playbackTimer) {
        window.clearInterval(playbackTimer);
        playbackTimer = null;
    }
}

function getFilteredOperations() {
    return state.snapshot.operations.filter((vehicle) => {
        const matchesStatus =
            state.activeStatus === "All" || vehicle.status === state.activeStatus;
        const matchesShift =
            state.shift === "All Shifts" || vehicle.shift === state.shift;
        const matchesSearch =
            !state.searchTerm ||
            vehicle.id.toLowerCase().includes(state.searchTerm) ||
            vehicle.driver.toLowerCase().includes(state.searchTerm) ||
            vehicle.plate.toLowerCase().includes(state.searchTerm);

        return matchesStatus && matchesShift && matchesSearch;
    });
}

function getSelectedVehicle() {
    return getFilteredOperations().find((vehicle) => vehicle.id === state.selectedVehicleId) ?? null;
}

function ensureSelectedVehicleVisible() {
    const visible = getFilteredOperations();
    const stillVisible = visible.some((vehicle) => vehicle.id === state.selectedVehicleId);

    if (!stillVisible) {
        state.selectedVehicleId = visible[0]?.id ?? null;
    }
}

function getVehiclePosition(vehicle) {
    const path = vehicle.playbackPath;
    const scaledFrame = state.playback.frame / 25;
    const index = Math.min(Math.floor(scaledFrame), path.length - 1);
    const nextIndex = Math.min(index + 1, path.length - 1);
    const progress = Math.min(scaledFrame - index, 1);
    const [x1, y1] = path[index];
    const [x2, y2] = path[nextIndex];

    return [
        x1 + (x2 - x1) * progress,
        y1 + (y2 - y1) * progress,
    ];
}

function renderStatusBadge(status) {
    return `<span class="live-status-badge live-status-badge--${toKebabCase(status)}">${status}</span>`;
}

function getAlertIcon(tone) {
    if (tone === "success") {
        return "badge-check";
    }

    if (tone === "danger") {
        return "circle-alert";
    }

    return "triangle-alert";
}

function formatDateLabel(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "short",
    }).format(date);
}

function formatDateLong(dateString) {
    const date = new Date(`${dateString}T00:00:00`);
    return new Intl.DateTimeFormat("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
    }).format(date);
}

function toKebabCase(value) {
    return value.toLowerCase().replace(/\s+/g, "-");
}

function refreshIcons() {
    createIcons({ icons });
}
