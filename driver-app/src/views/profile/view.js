import VehicleStorage from "../../services/api/vehicles.js";
import DriverStorage from "../../services/api/drivers.js";
import AuthStorage from "../../services/api/auth.js";

/**
 * Generates initials from a full name (e.g., "Ahmed Sayed" → "AS").
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join("");
}

/**
 * Handles the logout process by calling the API and clearing client-side state.
 * @param {Event} event
 */
async function handleLogout(event) {
  const logoutBtn = event.currentTarget;

  // 1. UI Feedback: Disable button to prevent spamming
  logoutBtn.disabled = true;
  logoutBtn.style.opacity = "0.7";
  logoutBtn.textContent = "Logging out...";

  try {
    // 2. API Call: Securely invalidate session on the server
    await AuthStorage.logoutApi();
  } catch (error) {
    console.warn("Backend logout failed, proceeding with client-side cleanup:", error);
  } finally {
    // 3. Client-side Cleanup: CRITICAL RULE
    // This must execute regardless of API success or failure
    localStorage.clear();
    
    // Redirect to login (using window.location.href as requested for absolute cleanup)
    window.location.href = "/login-page";
  }
}

export async function mount(rootElement) {
  const view = rootElement || document;

  const profileContainer = view.querySelector(".profile-owner");
  const phoneValue = view.querySelector(".phone-value");
  const emailValue = view.querySelector(".driver-email");
  const plateValue = view.querySelector(".vehicle-plate-value");
  const modelValue = view.querySelector(".vehicle-model-value");

  // ── Step A: Read IDs from localStorage ──────────────────────────────────────
  const driverId = localStorage.getItem("driver_id");
  const vehicleId = localStorage.getItem("vehicle_id") || 1;

  if (!driverId) {
    if (profileContainer) {
      profileContainer.innerHTML = `
        <p class="helper-text" style="text-align:center;padding:1rem;">
          No driver session found. Please log in again.
        </p>`;
    }
    return;
  }

  // ── Loading State ───────────────────────────────────────────────────────────
  if (profileContainer) {
    profileContainer.innerHTML = `
      <div class="stack" style="align-items:center;padding:1.5rem;">
        <span class="helper-text">Loading profile…</span>
      </div>`;
  }
  if (phoneValue) phoneValue.textContent = "…";
  if (emailValue) emailValue.textContent = "…";
  if (plateValue) plateValue.textContent = "…";
  if (modelValue) modelValue.textContent = "…";

  // ── Step B: Fetch Data in Parallel ──────────────────────────────────────────
  const [driverResult, vehicleResult] = await Promise.allSettled([
    DriverStorage.getDriverProfile(driverId),
    VehicleStorage.getVehicleById(vehicleId),
  ]);

  // ── Step C: Render Driver Data ──────────────────────────────────────────────
  if (driverResult.status === "fulfilled") {
    const user = driverResult.value;

    if (profileContainer) {
      const initials = getInitials(user.name);
      const isActive = user.is_active;
      const statusLabel = isActive ? "Active" : "Inactive";
      const statusChipClass = isActive ? "success" : "neutral";

      profileContainer.innerHTML = `
        <div class="profile-avatar-wrapper">
            <div class="profile-avatar profile-initials">${initials}</div>
            <span class="profile-avatar-badge">A</span>
        </div>
        <div class="stack profile-meta-text">
            <h1 class="heading-xl profile-name">${user.name}</h1>
            <div class="row profile-meta-chips">
                <span class="chip neutral profile-id">ID: ${user.user_id}</span>
                <span class="chip ${statusChipClass} profile-status">${statusLabel}</span>
            </div>
        </div>`;
    }

    if (phoneValue) phoneValue.textContent = user.phone_no || "—";
    if (emailValue) emailValue.textContent = user.email || "—";
  } else {
    console.error("Error fetching driver profile:", driverResult.reason);
    if (profileContainer) {
      profileContainer.innerHTML = `
        <p class="helper-text" style="text-align:center;padding:1rem;color:var(--color-error, #e53935);">
          Could not load profile. Please try again later.
        </p>`;
    }
    if (phoneValue) phoneValue.textContent = "—";
    if (emailValue) emailValue.textContent = "—";
  }

  // ── Step D: Render Vehicle Data ─────────────────────────────────────────────
  if (vehicleResult.status === "fulfilled") {
    const vehicle = vehicleResult.value;

    if (plateValue) plateValue.textContent = vehicle.VehicleLicense || "—";
    if (modelValue) modelValue.textContent = vehicle.VehicleModel || "—";
  } else {
    console.error("Error fetching vehicle data:", vehicleResult.reason);
    if (plateValue) plateValue.textContent = "Unavailable";
    if (modelValue) modelValue.textContent = "Unavailable";
  }

  // ── Logout Handler ──────────────────────────────────────────────────────────
  const logoutBtn = rootElement.querySelector(".logout-button");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

export function unmount(rootElement) {
  // Cleanup Logout event listener
  const logoutBtn = rootElement.querySelector(".logout-button");
  if (logoutBtn) {
    logoutBtn.removeEventListener("click", handleLogout);
  }
}
