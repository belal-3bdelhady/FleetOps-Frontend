import RoutesApi from "../../services/api/routes.js";
import {
    createIcons,
    icons,
} from "/node_modules/lucide/dist/esm/lucide.mjs";

let cleanupFns = [];
let state = null;
let routePlaybackTimer = null;

const PAGE_SIZE = 10;

export function mount() {
    state = {
        activeStatus: "All",
        currentPage: 1,
        date: "All Dates",
        modal: null,
        routes: RoutesApi.getRoutes(),
        searchTerm: "",
        shift: "All Shifts",
    };

    bindEvents();
    renderPage();
    openRouteFromLiveMonitoring();
}

export function unmount() {
    cleanupFns.forEach((cleanup) => cleanup?.());
    cleanupFns = [];
    state = null;
}

function bindEvents() {
    cleanupFns = [];

    const searchInput = document.getElementById("routes-search-input");
    const filters = document.getElementById("routes-filters");
    const shiftSelect = document.getElementById("routes-shift-select");
    const dateSelect = document.getElementById("routes-date-select");
    const tableBody = document.getElementById("routes-table-body");
    const pagination = document.getElementById("routes-pagination");
    const exportButton = document.getElementById("routes-export-btn");
    const newRouteButton = document.getElementById("routes-new-btn");
    const modalRoot = document.getElementById("routes-modal-root");

    searchInput?.addEventListener("input", handleSearchInput);
    filters?.addEventListener("click", handleFilterClick);
    shiftSelect?.addEventListener("change", handleShiftChange);
    dateSelect?.addEventListener("change", handleDateChange);
    tableBody?.addEventListener("click", handleTableClick);
    pagination?.addEventListener("click", handlePaginationClick);
    exportButton?.addEventListener("click", handleExport);
    newRouteButton?.addEventListener("click", openNewRouteModal);
    modalRoot?.addEventListener("click", handleModalClick);
    modalRoot?.addEventListener("submit", handleModalSubmit);

    const handleEscape = (event) => {
        if (event.key === "Escape" && state?.modal) {
            closeModal();
        }
    };

    document.addEventListener("keydown", handleEscape);

    cleanupFns.push(
        () => searchInput?.removeEventListener("input", handleSearchInput),
        () => filters?.removeEventListener("click", handleFilterClick),
        () => shiftSelect?.removeEventListener("change", handleShiftChange),
        () => dateSelect?.removeEventListener("change", handleDateChange),
        () => tableBody?.removeEventListener("click", handleTableClick),
        () => pagination?.removeEventListener("click", handlePaginationClick),
        () => exportButton?.removeEventListener("click", handleExport),
        () => newRouteButton?.removeEventListener("click", openNewRouteModal),
        () => modalRoot?.removeEventListener("click", handleModalClick),
        () => modalRoot?.removeEventListener("submit", handleModalSubmit),
        () => document.removeEventListener("keydown", handleEscape),
    );
}

function renderPage() {
    renderSummary();
    renderOverview();
    renderFilters();
    renderSelects();
    renderTable();
    renderModal();
    refreshIcons();
}

function renderSummary() {
    const summary = document.getElementById("routes-summary");
    if (!summary) {
        return;
    }

    summary.textContent = `${state.routes.length} total routes`;
}

function renderOverview() {
    const container = document.getElementById("routes-overview");
    if (!container) {
        return;
    }

    const stats = RoutesApi.getOverviewStats();
    container.innerHTML = [
        renderStatCard("Active Routes", stats.activeRoutes, "map-pinned", "blue"),
        renderStatCard("Completed Today", stats.completedToday, "circle-check-big", "green"),
        renderStatCard("Total Distance", `${formatNumber(stats.totalDistanceKm)} km`, "route", "purple"),
        renderStatCard("Avg Stops/Route", stats.avgStops, "package", "orange"),
    ].join("");
}

function renderStatCard(label, value, icon, tone) {
    return `
        <article class="route-stat-card">
            <div class="route-stat-card__top">
                <span>${label}</span>
                <span class="route-stat-card__icon route-stat-card__icon--${tone}">
                    <i data-lucide="${icon}"></i>
                </span>
            </div>
            <strong class="route-stat-card__value">${value}</strong>
        </article>
    `;
}

function renderFilters() {
    const filters = document.getElementById("routes-filters");
    if (!filters) {
        return;
    }

    filters.innerHTML = RoutesApi.getStatusOptions()
        .map(
            (status) => `
                <button
                    class="routes-filter-chip ${state.activeStatus === status ? "is-active" : ""}"
                    type="button"
                    data-status-filter="${status}">
                    ${status}
                </button>
            `,
        )
        .join("");
}

function renderSelects() {
    const shiftSelect = document.getElementById("routes-shift-select");
    const dateSelect = document.getElementById("routes-date-select");

    if (shiftSelect) {
        shiftSelect.innerHTML = RoutesApi.getShiftOptions()
            .map(
                (option) =>
                    `<option value="${option}" ${state.shift === option ? "selected" : ""}>${option}</option>`,
            )
            .join("");
    }

    if (dateSelect) {
        dateSelect.innerHTML = RoutesApi.getDateOptions()
            .map(
                (option) =>
                    `<option value="${option}" ${state.date === option ? "selected" : ""}>${option}</option>`,
            )
            .join("");
    }
}

function renderTable() {
    const tableBody = document.getElementById("routes-table-body");
    const footerSummary = document.getElementById("routes-footer-summary");
    const pagination = document.getElementById("routes-pagination");

    if (!tableBody || !footerSummary || !pagination) {
        return;
    }

    const filteredRoutes = getFilteredRoutes();
    const totalPages = Math.max(1, Math.ceil(filteredRoutes.length / PAGE_SIZE));
    state.currentPage = Math.min(state.currentPage, totalPages);
    const pagedRoutes = paginate(filteredRoutes, state.currentPage, PAGE_SIZE);

    if (!filteredRoutes.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="12">
                    <div class="routes-empty">
                        <i data-lucide="map"></i>
                        <p>No routes match the selected filters.</p>
                    </div>
                </td>
            </tr>
        `;
        footerSummary.textContent = "Showing 0 routes";
        pagination.innerHTML = "";
        return;
    }

    tableBody.innerHTML = pagedRoutes.map(renderRouteRow).join("");

    const start = (state.currentPage - 1) * PAGE_SIZE + 1;
    const end = Math.min(start + PAGE_SIZE - 1, filteredRoutes.length);
    footerSummary.textContent = `Showing ${start}-${end} of ${filteredRoutes.length} routes`;
    pagination.innerHTML = renderPagination(totalPages);
}

function renderRouteRow(route) {
    return `
        <tr data-route-id="${route.id}">
            <td><span class="route-id">${route.id}</span></td>
            <td>
                <div class="route-driver">
                    <span class="route-driver__avatar">${route.driverInitials}</span>
                    <div class="route-driver__meta">
                        <strong>${route.driverName}</strong>
                    </div>
                </div>
            </td>
            <td>
                <div class="route-vehicle">
                    <i data-lucide="truck"></i>
                    <div class="route-vehicle__meta">
                        <strong>${route.vehicleId}</strong>
                        <span>${route.vehicleType}</span>
                    </div>
                </div>
            </td>
            <td>${renderStatusBadge(route.status)}</td>
            <td>${renderShiftBadge(route.shift)}</td>
            <td>${route.completedStops}/${route.totalStops}</td>
            <td>
                <div class="progress-cell">
                    <div class="progress-bar">
                        <span class="${getProgressClass(route.status)}" style="width: ${route.progress}%"></span>
                    </div>
                    <span class="progress-label">${route.progress}%</span>
                </div>
            </td>
            <td>${route.distanceKm} km</td>
            <td>${route.startTime}</td>
            <td>
                <div class="route-eta">
                    <div class="route-eta__meta">
                        <strong>${route.eta}</strong>
                        <span>${route.etaStatus || "--"}</span>
                    </div>
                </div>
            </td>
            <td>${route.date}</td>
            <td>
                <button class="route-action-btn" type="button" data-action="open-route" data-route-id="${route.id}">
                    <i data-lucide="eye"></i>
                </button>
            </td>
        </tr>
    `;
}

function renderPagination(totalPages) {
    const buttons = [];
    buttons.push(
        `<button class="page-btn" type="button" data-page-action="prev" ${state.currentPage === 1 ? "disabled" : ""}><i data-lucide="chevron-left"></i></button>`,
    );

    for (let page = 1; page <= totalPages; page += 1) {
        buttons.push(`
            <button
                class="page-btn ${page === state.currentPage ? "is-active" : ""}"
                type="button"
                data-page="${page}">
                ${page}
            </button>
        `);
    }

    buttons.push(
        `<button class="page-btn" type="button" data-page-action="next" ${state.currentPage === totalPages ? "disabled" : ""}><i data-lucide="chevron-right"></i></button>`,
    );

    return buttons.join("");
}

function renderModal() {
    const root = document.getElementById("routes-modal-root");
    if (!root) {
        return;
    }

    if (!state.modal) {
        root.innerHTML = "";
        return;
    }

    if (state.modal.type === "details") {
        root.innerHTML = renderDetailsModal(state.modal.routeId);
        return;
    }

    if (state.modal.type === "new") {
        root.innerHTML = renderNewRouteModal();
    }
}

function renderDetailsModal(routeId) {
    const route = RoutesApi.getRouteById(routeId);
    if (!route) {
        return "";
    }

    const activeTab = state.modal?.tab ?? "stops";

    return `
        <div class="routes-modal-overlay" data-modal-close="overlay">
            <section class="routes-modal" role="dialog" aria-modal="true" aria-label="Route details">
                <header class="routes-modal__header">
                    <div class="routes-modal__head">
                        <div class="routes-modal__icon">
                            <i data-lucide="map-pinned"></i>
                        </div>
                        <div>
                            <div class="routes-modal__title">
                                <strong>${route.id}</strong>
                                ${renderStatusBadge(route.status)}
                                ${renderShiftBadge(route.shift)}
                            </div>
                            <div class="routes-modal__sub">${route.date} - Version ${route.version}</div>
                        </div>
                    </div>
                    <button class="routes-modal__close" type="button" data-modal-close="button" aria-label="Close">
                        <i data-lucide="x"></i>
                    </button>
                </header>
                <div class="routes-modal__body">
                    <section class="route-detail-grid">
                        ${renderDetailCard("user-round", "Driver", route.driverName)}
                        ${renderDetailCard("truck", "Vehicle", `${route.vehicleId} (${route.vehicleType})`)}
                        ${renderDetailCard("map-pin", "Distance", `${route.distanceKm} km`)}
                        ${renderDetailCard("package", "Stops", `${route.completedStops}/${route.totalStops}`)}
                    </section>

                    <section>
                        <div class="route-progress-head">
                            <span>Route Progress</span>
                            <span>${route.progress}%</span>
                        </div>
                        <div class="route-progress-bar">
                            <span style="width:${route.progress}%"></span>
                        </div>
                    </section>

                    <section class="route-tab-strip">
                        <button class="route-tab-btn ${activeTab === "stops" ? "is-active" : ""}" type="button" data-tab="stops">Stops (${route.totalStops})</button>
                        <button class="route-tab-btn ${activeTab === "summary" ? "is-active" : ""}" type="button" data-tab="summary">Summary</button>
                        <button class="route-tab-btn ${activeTab === "playback" ? "is-active" : ""}" type="button" data-tab="playback">Playback</button>
                    </section>

                    ${renderRouteTab(route, activeTab)}
                </div>
            </section>
        </div>
    `;
}

function renderDetailCard(icon, label, value) {
    return `
        <article class="route-detail-card">
            <span class="route-detail-card__label"><i data-lucide="${icon}"></i><span>${label}</span></span>
            <strong class="route-detail-card__value">${value}</strong>
        </article>
    `;
}

function renderRouteTab(route, tab) {
    if (tab === "summary") {
        return `
            <section class="route-summary-layout">
                <div class="route-summary-grid">
                    <div><span>Total Weight</span><strong>${route.totalWeightKg} kg</strong></div>
                    <div><span>Total Volume</span><strong>${route.totalVolumeM3} m3</strong></div>
                    <div><span>Start Time</span><strong>${route.startTime}</strong></div>
                    <div><span>ETA Last Stop</span><strong>${route.eta}</strong></div>
                    <div><span>ETA Status</span><strong>${route.etaStatus || "--"}</strong></div>
                    <div><span>Route Version</span><strong>${route.version}</strong></div>
                </div>
                <div class="route-summary-chart">
                    <div class="playback-grid"></div>
                    ${renderSummaryChart(route)}
                    <div class="route-summary-chart__pill">
                        <span>${route.distanceKm} km</span>
                        <span>${route.totalStops} Stops</span>
                    </div>
                </div>
            </section>
        `;
    }

    if (tab === "playback") {
        const frame = state.modal?.playbackFrame ?? 1;
        const speed = state.modal?.playbackSpeed ?? 1;
        const isPlaying = state.modal?.isPlaying ?? false;
        const playLabel = isPlaying ? "Pause" : "Play";

        return `
            <section class="route-banner">
                <div class="route-banner__left">
                    <i data-lucide="circle-check-big"></i>
                    <strong>Route ${route.status.toLowerCase()} - full historical playback available</strong>
                </div>
                <span>${route.completedStops}/${route.totalStops} stops - ${route.distanceKm} km</span>
            </section>
            <section class="route-playback-layout">
                <div>
                    <div class="route-playback">
                        <div class="playback-grid"></div>
                        ${renderPlaybackMap(route, frame)}
                        <div class="playback-legend">
                            <span class="legend-chip"><span class="legend-dot legend-dot--purple"></span>Depot</span>
                            <span class="legend-chip"><span class="legend-dot legend-dot--green"></span>Delivered</span>
                            <span class="legend-chip"><span class="legend-dot legend-dot--teal"></span>Visited</span>
                            <span class="legend-chip"><span class="legend-dot legend-dot--slate"></span>Upcoming</span>
                            <span class="legend-chip"><span class="legend-dot legend-dot--yellow"></span>Vehicle</span>
                        </div>
                    </div>
                    <div class="route-timeline-strip">
                        <span>${route.eventTime}</span>
                        <div class="route-timeline-strip__line"></div>
                        <span>01:18 PM</span>
                    </div>
                    <div class="route-timeline-strip__labels">
                        <span>Delivery</span>
                        <span>Speed alert</span>
                        <span>Delay</span>
                        <span>Break</span>
                    </div>
                    <div class="route-playback-controls">
                        <button class="play-btn" type="button" data-action="toggle-play">
                            <i data-lucide="${isPlaying ? "pause" : "play"}"></i>
                            <span>${playLabel}</span>
                        </button>
                        <div class="playback-speed">
                            <span>Speed</span>
                            <button class="speed-chip ${speed === 1 ? "is-active" : ""}" type="button" data-action="change-speed" data-speed="1">1x</button>
                            <button class="speed-chip ${speed === 2 ? "is-active" : ""}" type="button" data-action="change-speed" data-speed="2">2x</button>
                            <button class="speed-chip ${speed === 5 ? "is-active" : ""}" type="button" data-action="change-speed" data-speed="5">5x</button>
                            <button class="speed-chip ${speed === 10 ? "is-active" : ""}" type="button" data-action="change-speed" data-speed="10">10x</button>
                        </div>
                        <span>Frame ${frame} / ${route.playbackFrames} - ${route.eventTime}</span>
                    </div>
                </div>
                <div class="route-playback-panel">
                    <div class="route-log">
                        <div class="route-log__title">EVENT LOG</div>
                        ${route.eventLog
                            .map(
                                (entry) => `
                                    <div class="route-log__entry">
                                        <strong>${entry.title}</strong>
                                        <span>${entry.time}</span>
                                    </div>
                                `,
                            )
                            .join("")}
                    </div>
                    <div class="route-playback-summary">
                        <div><strong>Delivered</strong> ${route.playbackStopsDelivered}</div>
                        <div><strong>Remaining</strong> ${route.playbackStopsRemaining}</div>
                        <div><strong>Progress</strong> ${route.progress}%</div>
                    </div>
                </div>
            </section>
        `;
    }

    return `
        <section class="route-stop-list">
            ${route.stops
                .map(
                    (stop) => `
                        <article class="route-stop-row">
                            <div class="route-stop-row__main">
                                <span class="route-stop-check ${stop.delivered ? "" : "is-pending"}">
                                    <i data-lucide="${stop.delivered ? "check" : "clock-3"}"></i>
                                </span>
                                <div class="route-stop-copy">
                                    <strong>Stop ${stop.index} - ${stop.customer}</strong>
                                    <span>${stop.address} - ${stop.orderId}</span>
                                </div>
                            </div>
                            <div class="route-stop-time">
                                <div>Planned: ${stop.planned}</div>
                                <div>Actual: ${stop.actual}</div>
                            </div>
                        </article>
                    `,
                )
                .join("")}
        </section>
    `;
}

function renderPlaybackMap(route, frame = 1) {
    const points = route.linePoints;
    const step = 100 / (points.length + 1);
    const frameIndex = Math.min(points.length - 1, Math.max(0, frame - 1));

    return `
        <div class="playback-path">
            ${points
                .map((point, index) => {
                    const left = 10 + step * index;
                    const top = 70 - point;
                    const isVehicle = index === frameIndex;
                    const isDelivered = index < frameIndex;

                    return `<span class="playback-node ${isVehicle ? "is-vehicle" : ""} ${isDelivered ? "is-delivered" : ""}" style="left:${left}%; top:${top}%"></span>`;
                })
                .join("")}
        </div>
    `;
}

function renderSummaryChart(route) {
    const points = route.linePoints
        .map((point, index) => {
            const x = 20 + index * 60;
            const y = 100 - point * 2;
            return `${x},${y}`;
        })
        .join(" ");

    return `
        <svg viewBox="0 0 420 120" preserveAspectRatio="none" aria-hidden="true">
            <polyline
                fill="none"
                stroke="#19c6c1"
                stroke-width="3"
                points="${points}" />
            ${route.linePoints
                .map((point, index) => {
                    const x = 20 + index * 60;
                    const y = 100 - point * 2;
                    return `
                        <circle cx="${x}" cy="${y}" r="8" fill="#10b981"></circle>
                        <text x="${x}" y="${y + 3}" text-anchor="middle" font-size="8" fill="#ffffff" font-weight="700">${index + 1}</text>
                    `;
                })
                .join("")}
        </svg>
    `;
}

function renderNewRouteModal() {
    return `
        <div class="routes-modal-overlay" data-modal-close="overlay">
            <section class="routes-modal routes-modal--compact" role="dialog" aria-modal="true" aria-label="New route">
                <header class="routes-modal__header">
                    <div>
                        <div class="routes-modal__title"><strong>New Route</strong></div>
                        <div class="routes-modal__sub">Create a route plan and add it to the dispatch queue.</div>
                    </div>
                    <button class="routes-modal__close" type="button" data-modal-close="button" aria-label="Close">
                        <i data-lucide="x"></i>
                    </button>
                </header>
                <div class="routes-modal__body">
                    <form class="routes-form" id="new-route-form">
                        <div class="routes-form-grid">
                            <label>
                                <span class="label">Driver Name</span>
                                <input name="driverName" required />
                            </label>
                            <label>
                                <span class="label">Vehicle ID</span>
                                <input name="vehicleId" required />
                            </label>
                            <label>
                                <span class="label">Vehicle Type</span>
                                <input name="vehicleType" value="Light" required />
                            </label>
                            <label>
                                <span class="label">Shift</span>
                                <select name="shift">
                                    ${RoutesApi.getShiftOptions()
                                        .filter((option) => option !== "All Shifts")
                                        .map((option) => `<option value="${option}">${option}</option>`)
                                        .join("")}
                                </select>
                            </label>
                            <label>
                                <span class="label">Total Stops</span>
                                <input name="totalStops" type="number" min="1" value="8" required />
                            </label>
                            <label>
                                <span class="label">Distance (km)</span>
                                <input name="distanceKm" type="number" min="1" value="40" required />
                            </label>
                            <label>
                                <span class="label">Total Weight (kg)</span>
                                <input name="totalWeightKg" type="number" min="1" value="250" required />
                            </label>
                            <label>
                                <span class="label">Total Volume (m3)</span>
                                <input name="totalVolumeM3" type="number" min="0.1" step="0.1" value="5.5" required />
                            </label>
                            <label class="full">
                                <span class="label">Zone / Area</span>
                                <input name="zone" placeholder="Greater Cairo Cluster" required />
                            </label>
                            <label class="full">
                                <span class="label">Date</span>
                                <select name="date">
                                    ${RoutesApi.getDateOptions()
                                        .filter((option) => option !== "All Dates")
                                        .map((option) => `<option value="${option}">${option}</option>`)
                                        .join("")}
                                </select>
                            </label>
                        </div>
                        <div class="routes-form-actions">
                            <button class="button secondary" type="button" data-modal-close="button">Cancel</button>
                            <button class="button primary" type="submit">Create Route</button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    `;
}

function handleSearchInput(event) {
    state.searchTerm = event.target.value.trim().toLowerCase();
    state.currentPage = 1;
    renderTable();
    refreshIcons();
}

function handleFilterClick(event) {
    const button = event.target.closest("[data-status-filter]");
    if (!button) {
        return;
    }

    state.activeStatus = button.dataset.statusFilter;
    state.currentPage = 1;
    renderFilters();
    renderTable();
    refreshIcons();
}

function handleShiftChange(event) {
    state.shift = event.target.value;
    state.currentPage = 1;
    renderTable();
}

function handleDateChange(event) {
    state.date = event.target.value;
    state.currentPage = 1;
    renderTable();
}

function handleTableClick(event) {
    const trigger = event.target.closest("[data-route-id], [data-action='open-route']");
    if (!trigger) {
        return;
    }

    const routeId =
        trigger.dataset.routeId ??
        trigger.closest("[data-route-id]")?.dataset.routeId;

    if (routeId) {
        openDetailsModal(routeId);
    }
}

function handlePaginationClick(event) {
    const pageButton = event.target.closest("[data-page]");
    const actionButton = event.target.closest("[data-page-action]");

    const filteredRoutes = getFilteredRoutes();
    const totalPages = Math.max(1, Math.ceil(filteredRoutes.length / PAGE_SIZE));

    if (pageButton) {
        state.currentPage = Number(pageButton.dataset.page);
        renderTable();
        refreshIcons();
        return;
    }

    if (!actionButton) {
        return;
    }

    if (actionButton.dataset.pageAction === "prev") {
        state.currentPage = Math.max(1, state.currentPage - 1);
    }

    if (actionButton.dataset.pageAction === "next") {
        state.currentPage = Math.min(totalPages, state.currentPage + 1);
    }

    renderTable();
    refreshIcons();
}

function handleModalClick(event) {
    const overlay = event.target.closest("[data-modal-close='overlay']");
    const closeButton = event.target.closest("[data-modal-close='button']");
    const tabButton = event.target.closest("[data-tab]");
    const actionButton = event.target.closest("[data-action]");

    if (event.target === overlay || closeButton) {
        closeModal();
        return;
    }

    if (tabButton) {
        state.modal = {
            ...state.modal,
            tab: tabButton.dataset.tab,
        };
        renderModal();
        refreshIcons();
        return;
    }

    if (actionButton) {
        const action = actionButton.dataset.action;

        if (action === "toggle-play") {
            if (state.modal?.isPlaying) {
                stopRoutePlayback();
            } else {
                startRoutePlayback();
            }
            return;
        }

        if (action === "change-speed") {
            const speed = Number(actionButton.dataset.speed);
            if (!Number.isNaN(speed)) {
                setRoutePlaybackSpeed(speed);
            }
            return;
        }
    }
}

function handleModalSubmit(event) {
    if (event.target.id !== "new-route-form") {
        return;
    }

    event.preventDefault();
    const formData = new FormData(event.target);
    RoutesApi.createRoute(Object.fromEntries(formData.entries()));
    state.routes = RoutesApi.getRoutes();
    state.currentPage = 1;
    closeModal();
    renderPage();
}

function clearRoutePlaybackTimer() {
    if (routePlaybackTimer) {
        window.clearInterval(routePlaybackTimer);
        routePlaybackTimer = null;
    }
}

function startRoutePlayback() {
    if (!state.modal || !state.modal.routeId) {
        return;
    }

    const route = RoutesApi.getRouteById(state.modal.routeId);
    if (!route) {
        return;
    }

    state.modal.isPlaying = true;
    clearRoutePlaybackTimer();

    routePlaybackTimer = window.setInterval(() => {
        const maxFrame = Math.max(1, route.playbackFrames);
        const nextFrame = state.modal.playbackFrame >= maxFrame ? 1 : state.modal.playbackFrame + state.modal.playbackSpeed;
        state.modal.playbackFrame = Math.min(nextFrame, maxFrame);
        renderModal();
        refreshIcons();
    }, 500);
}

function stopRoutePlayback() {
    if (!state.modal) {
        return;
    }

    state.modal.isPlaying = false;
    clearRoutePlaybackTimer();
    renderModal();
    refreshIcons();
}

function setRoutePlaybackSpeed(speed) {
    if (!state.modal) {
        return;
    }

    state.modal.playbackSpeed = speed;
    if (state.modal.isPlaying) {
        startRoutePlayback();
    } else {
        renderModal();
        refreshIcons();
    }
}

function handleExport() {
    const rows = getFilteredRoutes();
    const csv = [
        ["Route ID", "Driver", "Vehicle", "Status", "Shift", "Stops", "Distance", "Date"].join(","),
        ...rows.map((route) =>
            [
                route.id,
                route.driverName,
                route.vehicleId,
                route.status,
                route.shift,
                `${route.completedStops}/${route.totalStops}`,
                route.distanceKm,
                route.date,
            ]
                .map((value) => `"${String(value).replaceAll('"', '""')}"`)
                .join(","),
        ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "routes-export.csv";
    link.click();
    URL.revokeObjectURL(url);
}

function openDetailsModal(routeId) {
    clearRoutePlaybackTimer();

    state.modal = {
        routeId,
        tab: "stops",
        type: "details",
        playbackFrame: 1,
        playbackSpeed: 1,
        isPlaying: false,
    };
    renderModal();
    refreshIcons();
}

function openRouteFromLiveMonitoring() {
    const routeId = sessionStorage.getItem("fleetops-live-selected-route");
    if (!routeId) {
        return;
    }

    sessionStorage.removeItem("fleetops-live-selected-route");
    const route = RoutesApi.getRouteById(routeId);
    if (route) {
        openDetailsModal(routeId);
    }
}

function openNewRouteModal() {
    state.modal = { type: "new" };
    renderModal();
    refreshIcons();
}

function closeModal() {
    state.modal = null;
    clearRoutePlaybackTimer();
    renderModal();
}

function getFilteredRoutes() {
    return state.routes.filter((route) => {
        const matchesStatus =
            state.activeStatus === "All" || route.status === state.activeStatus;
        const matchesShift =
            state.shift === "All Shifts" || route.shift === state.shift;
        const matchesDate =
            state.date === "All Dates" || route.date === state.date;
        const term = state.searchTerm;
        const matchesSearch =
            !term ||
            route.id.toLowerCase().includes(term) ||
            route.driverName.toLowerCase().includes(term) ||
            route.vehicleId.toLowerCase().includes(term);

        return matchesStatus && matchesShift && matchesDate && matchesSearch;
    });
}

function paginate(items, page, pageSize) {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
}

function renderStatusBadge(status) {
    return `<span class="route-status-badge route-status-badge--${toKebabCase(status)}">${status}</span>`;
}

function renderShiftBadge(shift) {
    return `<span class="route-shift-badge route-shift-badge--${toKebabCase(shift)}">${shift}</span>`;
}

function getProgressClass(status) {
    if (status === "Completed") {
        return "progress--done";
    }

    if (status === "Active" || status === "In Transit") {
        return "progress--moving";
    }

    return "progress--idle";
}

function toKebabCase(value) {
    return value.toLowerCase().replace(/\s+/g, "-");
}

function formatNumber(value) {
    return new Intl.NumberFormat("en-US").format(value);
}

function refreshIcons() {
    createIcons({ icons });
}
