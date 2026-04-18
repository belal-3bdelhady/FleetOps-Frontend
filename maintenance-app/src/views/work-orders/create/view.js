import WorkOrdersApi from "../../../services/api/work-orders.js";

// ─── State ───────────────────────────────────────────────────────────────────
let attachedFiles = [];

// ─── Populate vehicle select ─────────────────────────────────────────────────
function populateVehicles() {
    const sel = document.getElementById("cwo-vehicle");
    if (!sel) return;
    WorkOrdersApi.getVehicles().forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.plate;
        opt.textContent = `${v.plate} — ${v.category} — ${v.model} (${v.status})`;
        sel.appendChild(opt);
    });
}

// ─── Maintenance type card toggle ─────────────────────────────────────────────
function initTypeCards() {
    const cards = document.querySelectorAll(".cwo-type-card");
    cards.forEach(card => {
        card.addEventListener("click", () => {
            cards.forEach(c => c.classList.remove("cwo-type-card--active"));
            card.classList.add("cwo-type-card--active");
        });
    });
}

// ─── Priority pill toggle ────────────────────────────────────────────────────
function initPriorityPills() {
    const pills = document.querySelectorAll(".cwo-priority-pill");
    pills.forEach(pill => {
        pill.addEventListener("click", () => {
            pills.forEach(p => p.classList.remove("cwo-priority-pill--active"));
            pill.classList.add("cwo-priority-pill--active");
        });
    });
}

// ─── Dropzone / file upload ──────────────────────────────────────────────────
function initDropzone() {
    const zone      = document.getElementById("cwo-dropzone");
    const fileInput = document.getElementById("cwo-file-input");
    const fileList  = document.getElementById("cwo-file-list");
    if (!zone || !fileInput || !fileList) return;

    // Drag-over highlight
    zone.addEventListener("dragover", e => {
        e.preventDefault();
        zone.classList.add("cwo-dropzone--dragover");
    });
    zone.addEventListener("dragleave", () => zone.classList.remove("cwo-dropzone--dragover"));
    zone.addEventListener("drop", e => {
        e.preventDefault();
        zone.classList.remove("cwo-dropzone--dragover");
        addFiles([...e.dataTransfer.files]);
    });

    fileInput.addEventListener("change", () => {
        addFiles([...fileInput.files]);
        fileInput.value = ""; // reset so same file can be re-added
    });

    function addFiles(incoming) {
        const MAX = 10 * 1024 * 1024; // 10 MB
        incoming.forEach(f => {
            if (f.size > MAX) return; // silently skip oversized
            if (attachedFiles.some(a => a.name === f.name && a.size === f.size)) return; // dedup
            attachedFiles.push(f);
        });
        renderFileList(fileList);
    }
}

function renderFileList(container) {
    container.innerHTML = attachedFiles.map((f, idx) => `
        <div class="cwo-file-item">
            <span class="cwo-file-item__name" title="${f.name}">${f.name}</span>
            <span style="color:var(--color-text-muted);font-size:11px">${(f.size / 1024).toFixed(0)} KB</span>
            <button class="cwo-file-item__remove" type="button" data-idx="${idx}" title="Remove">✕</button>
        </div>
    `).join("");

    container.querySelectorAll(".cwo-file-item__remove").forEach(btn => {
        btn.addEventListener("click", () => {
            attachedFiles.splice(parseInt(btn.dataset.idx, 10), 1);
            renderFileList(container);
        });
    });
}

// ─── Validation ──────────────────────────────────────────────────────────────
function validateForm(form) {
    let valid = true;
    let firstInvalid = null;

    const vehicle   = form.querySelector("#cwo-vehicle");
    const desc      = form.querySelector("#cwo-description");
    const vErr      = form.querySelector("#cwo-vehicle-error");
    const dErr      = form.querySelector("#cwo-description-error");

    // Reset
    [vehicle, desc].forEach(el => el.classList.remove("cwo-input--error",
                                                        "cwo-select--error",
                                                        "cwo-textarea--error"));
    if (vErr) vErr.textContent = "";
    if (dErr) dErr.textContent = "";

    // Vehicle
    if (!vehicle.value) {
        vehicle.classList.add("cwo-select--error");
        if (vErr) vErr.textContent = "Please select a vehicle.";
        valid = false;
        if (!firstInvalid) firstInvalid = vehicle;
    }

    // Description
    if (!desc.value.trim()) {
        desc.classList.add("cwo-textarea--error");
        if (dErr) dErr.textContent = "Description is required";
        valid = false;
        if (!firstInvalid) firstInvalid = desc;
    }

    if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return valid;
}

// ─── Collect form data ───────────────────────────────────────────────────────
function collectFormData(form) {
    const activeType     = form.querySelector(".cwo-type-card--active input[type='radio']");
    const activePriority = form.querySelector(".cwo-priority-pill--active input[type='radio']");
    return {
        vehicle:     form.querySelector("#cwo-vehicle").value,
        type:        activeType     ? activeType.value     : "Routine",
        description: form.querySelector("#cwo-description").value.trim(),
        priority:    activePriority ? activePriority.value : "Normal",
        startDate:   form.querySelector("#cwo-start-date").value,
        mechanic:    form.querySelector("#cwo-mechanic").value,
        files:       attachedFiles.map(f => f.name),
    };
}

// ─── LocalStorage helpers ────────────────────────────────────────────────────
const LS_KEY = "maintenance-app:work-orders";

function loadStoredOrders() {
    try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; }
    catch { return []; }
}

function saveOrder(data) {
    const orders = loadStoredOrders();
    const nextId = orders.length > 0
        ? "WO-" + (parseInt(orders[0].id.replace("WO-", ""), 10) + 1)
        : "WO-3000";

    const newOrder = {
        id:          nextId,
        vehicle:     data.vehicle,
        type:        data.type,
        description: data.description,
        priority:    data.priority,
        startDate:   data.startDate,
        mechanic:    data.mechanic || "Unassigned",
        status:      "Open",
        cost:        "—",
        files:       data.files,
        opened:      new Date().toLocaleDateString("en-GB", {
                         day: "2-digit", month: "short", year: "2-digit"
                     }).replace(",", ""),
        updated:     "Just now",
        _createdAt:  new Date().toISOString(),
    };

    orders.unshift(newOrder);   // newest first
    localStorage.setItem(LS_KEY, JSON.stringify(orders));
    console.log("[WorkOrders] Saved to localStorage:", newOrder);
    return newOrder;
}

// ─── Submit handler ──────────────────────────────────────────────────────────
function initSubmit(form) {
    form.addEventListener("submit", e => {
        e.preventDefault();
        if (!validateForm(form)) return;

        const data = collectFormData(form);
        saveOrder(data);

        // ── Future API hook ─────────────────────────────────────────────────
        // fetch("/api/work-orders", { method: "POST", body: JSON.stringify(data),
        //   headers: { "Content-Type": "application/json" } })
        //   .then(r => r.json()).then(() => navigate());

        navigate("/work-orders");
    });
}

// ─── SPA Navigation helper ───────────────────────────────────────────────────
function navigate(path) {
    window.history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
}

// ─── Mount / Unmount ─────────────────────────────────────────────────────────
export function mount() {
    attachedFiles = []; // reset on each mount

    populateVehicles();
    initTypeCards();
    initPriorityPills();
    initDropzone();

    const form = document.getElementById("cwo-form");
    if (form) initSubmit(form);

    // Cancel button — works even if data-link isn't picked up
    const cancelBtn = document.querySelector("[data-cancel-nav]");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", e => {
            e.preventDefault();
            navigate("/work-orders");
        });
    }
}

export function unmount() {
    attachedFiles = [];
}
