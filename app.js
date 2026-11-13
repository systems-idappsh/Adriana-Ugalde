const TELEGRAM_BOT_TOKEN = "8627529703:AAG2Zaz-iKQdKM03hKM1EcJd-jaB8obYDDo";
const TELEGRAM_CHAT_ID = "8967018249";

const FACILITY_ID_NOMBRE = {
  "65": "Ciudad Juárez",
  "66": "Guadalajara",
  "67": "Hermosillo",
  "68": "Matamoros",
  "69": "Mérida",
  "70": "México City",
  "71": "Monterrey",
  "72": "Nogales",
  "73": "Nuevo Laredo",
  "74": "Tijuana"
};

const ASC_FACILITY_ID_NOMBRE = {
  "76": "Ciudad Juárez ASC",
  "77": "Guadalajara ASC",
  "78": "Hermosillo ASC",
  "79": "Matamoros ASC",
  "81": "Mérida ASC",
  "82": "México City ASC",
  "83": "Monterrey ASC",
  "84": "Nogales ASC",
  "85": "Nuevo Laredo ASC",
  "88": "Tijuana ASC"
};

const state = {
  records: [],
  currentRecord: 1,
  currentStep: 1
};

const el = {
  form: document.getElementById("accountForm"),
  recordNumber: document.getElementById("recordNumber"),
  savedCount: document.getElementById("savedCount"),
  savedBadge: document.getElementById("savedBadge"),
  progressLabel: document.getElementById("progressLabel"),
  progressBar: document.getElementById("progressBar"),
  globalStatus: document.getElementById("globalStatus"),
  email: document.getElementById("email"),
  password: document.getElementById("password"),
  togglePassword: document.getElementById("togglePassword"),
  minDate: document.getElementById("minDate"),
  maxDate: document.getElementById("maxDate"),
  facilityId: document.getElementById("facilityId"),
  ascFacilityId: document.getElementById("ascFacilityId"),
  reference: document.getElementById("reference"),
  notes: document.getElementById("notes"),
  notesCount: document.getElementById("notesCount"),
  addMore: document.getElementById("addMore"),
  sendAll: document.getElementById("sendAll"),
  recordSummary: document.getElementById("recordSummary"),
  savedPanel: document.getElementById("savedPanel"),
  savedList: document.getElementById("savedList"),
  successModal: document.getElementById("successModal"),
  successMessage: document.getElementById("successMessage"),
  successOk: document.getElementById("successOk"),
  stepCredentials: document.getElementById("stepCredentials"),
  stepDates: document.getElementById("stepDates"),
  stepType: document.getElementById("stepType"),
  stepFacility: document.getElementById("stepFacility"),
  stepAsc: document.getElementById("stepAsc"),
  stepReference: document.getElementById("stepReference"),
  stepNotes: document.getElementById("stepNotes"),
  stepActions: document.getElementById("stepActions")
};

const steps = [
  el.stepCredentials,
  el.stepDates,
  el.stepType,
  el.stepFacility,
  el.stepAsc,
  el.stepReference,
  el.stepNotes
];

function localToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysToDateString(dateString, days) {
  const [y, m, d] = dateString.split("-").map(Number);
  if (!y || !m || !d) return dateString;
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() + days);
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(date.getUTCDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

function populateSelect(select, values, placeholder) {
  select.innerHTML = `<option value="">${placeholder}</option>`;
  for (const [id, name] of Object.entries(values)) {
    const option = document.createElement("option");
    option.value = id;
    option.textContent = `${id} — ${name}`;
    select.appendChild(option);
  }
}

function getRequiresCas() {
  return document.querySelector('input[name="requiresCas"]:checked')?.value || "";
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function setError(fieldName, message = "") {
  const error = document.getElementById(`${fieldName}Error`);
  const wrap = document.querySelector(`[data-field="${fieldName}"]`);
  if (error) error.textContent = message;
  if (wrap) wrap.classList.toggle("error-field", Boolean(message));
}

function clearAllErrors() {
  document.querySelectorAll(".field-error").forEach(node => node.textContent = "");
  document.querySelectorAll(".error-field").forEach(node => node.classList.remove("error-field"));
}

function activateField(fieldName) {
  document.querySelectorAll(".active-field").forEach(node => node.classList.remove("active-field"));
  const wrap = document.querySelector(`[data-field="${fieldName}"]`);
  if (wrap) wrap.classList.add("active-field");
}

function markFieldSelected(fieldName, selected = true) {
  const wrap = document.querySelector(`[data-field="${fieldName}"]`);
  if (wrap) wrap.classList.toggle("selected-field", selected);
}

function setActiveStep(stepNumber, scroll = true) {
  const step = steps[stepNumber - 1];
  if (!step) return;

  steps.forEach((node, index) => {
    node.classList.remove("active", "editing");
    if (index + 1 < stepNumber && node.classList.contains("visible")) {
      node.classList.add("completed");
      node.querySelector(".edit-step")?.classList.remove("hidden");
    }
  });

  step.classList.add("visible", "active");
  step.classList.remove("completed");
  step.querySelector(".edit-step")?.classList.add("hidden");
  state.currentStep = stepNumber;
  updateProgress(stepNumber);

  if (scroll) {
    requestAnimationFrame(() => step.scrollIntoView({ behavior: "smooth", block: "center" }));
  }
}

function revealNextStep(nextNumber) {
  setActiveStep(nextNumber, true);
  focusFirstControl(nextNumber);
}

function focusFirstControl(stepNumber) {
  const step = steps[stepNumber - 1];
  if (!step) return;
  const target = step.querySelector("input:not([type='radio']), select, input[type='radio'], textarea");
  setTimeout(() => {
    if (target && typeof target.focus === "function") {
      target.focus({ preventScroll: true });
    }
  }, 260);
}

function updateProgress(stepNumber = 1) {
  const normalized = Math.max(1, Math.min(7, stepNumber));
  el.progressLabel.textContent = `Paso ${normalized} de 7`;
  el.progressBar.style.width = `${(normalized / 7) * 100}%`;
}

function showStatus(message, type = "info") {
  el.globalStatus.textContent = message;
  el.globalStatus.className = `status ${type}`;
  el.globalStatus.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function hideStatus() {
  el.globalStatus.className = "status hidden";
  el.globalStatus.textContent = "";
}

function validateCredentials() {
  let ok = true;
  if (!validEmail(el.email.value)) {
    setError("email", "Ingrese un correo válido.");
    ok = false;
  } else {
    setError("email");
    markFieldSelected("email");
  }

  if (!el.password.value) {
    setError("password", "Ingrese el password.");
    ok = false;
  } else {
    setError("password");
    markFieldSelected("password");
  }

  if (!ok) {
    const target = !validEmail(el.email.value) ? el.email : el.password;
    const name = target === el.email ? "email" : "password";
    activateField(name);
    target.focus({ preventScroll: true });
  }
  return ok;
}

function syncDateRules() {
  const today = localToday();
  if (!el.minDate.value) el.minDate.value = today;
  if (el.minDate.value < today) el.minDate.value = today;
  el.minDate.min = today;

  const minPlusOne = addDaysToDateString(el.minDate.value, 1);
  el.maxDate.min = minPlusOne;

  // MAX DATE nunca se autocompleta: queda vacío hasta que el cliente lo elige.
  // Si ya tenía un valor y dejó de ser válido (por cambio de MIN DATE), se limpia.
  if (el.maxDate.value && el.maxDate.value <= el.minDate.value) {
    el.maxDate.value = "";
  }
}

function commitMinDate() {
  if (!el.minDate.value) return;
  syncDateRules();
  setError("minDate");
  markFieldSelected("minDate");
  activateField("maxDate");
  setTimeout(() => el.maxDate.focus({ preventScroll: true }), 0);
}

function commitMaxDate() {
  if (!el.maxDate.value) return;
  if (el.maxDate.value <= el.minDate.value) {
    setError("maxDate", "MAX DATE debe ser posterior a MIN DATE (no puede ser igual).");
    el.maxDate.value = "";
    activateField("maxDate");
    return;
  }
  setError("maxDate");
  markFieldSelected("maxDate");
  completeDates();
}

function validateDates() {
  syncDateRules();
  let ok = true;

  if (!el.minDate.value) {
    setError("minDate", "Seleccione MIN DATE.");
    ok = false;
  } else {
    setError("minDate");
    markFieldSelected("minDate");
  }

  if (!el.maxDate.value) {
    setError("maxDate", "Seleccione MAX DATE.");
    ok = false;
  } else if (el.maxDate.value <= el.minDate.value) {
    setError("maxDate", "MAX DATE debe ser posterior a MIN DATE (no puede ser igual).");
    ok = false;
  } else {
    setError("maxDate");
    markFieldSelected("maxDate");
  }

  return ok;
}

function validateType() {
  const value = getRequiresCas();
  if (!value) {
    setError("requiresCas", "Seleccione Sí o No.");
    return false;
  }
  setError("requiresCas");
  markFieldSelected("requiresCas");
  return true;
}

function validateFacility() {
  if (!el.facilityId.value) {
    setError("facilityId", "Seleccione un consulado.");
    return false;
  }
  setError("facilityId");
  markFieldSelected("facilityId");
  return true;
}

function validateAsc() {
  if (getRequiresCas() !== "si") return true;
  if (!el.ascFacilityId.value) {
    setError("ascFacilityId", "Seleccione un ASC / CAS.");
    return false;
  }
  setError("ascFacilityId");
  markFieldSelected("ascFacilityId");
  return true;
}

function validateReference() {
  if (!el.reference.value.trim()) {
    setError("reference", "Ingrese una referencia, ID o nombre.");
    return false;
  }
  setError("reference");
  markFieldSelected("reference");
  return true;
}

function completeCredentials() {
  if (!validateCredentials()) return;
  syncDateRules();
  revealNextStep(2);
}

function completeDates() {
  if (!validateDates()) return;
  revealNextStep(3);
}

function completeType() {
  if (!validateType()) return;
  if (getRequiresCas() === "no") {
    el.ascFacilityId.value = "";
    el.stepAsc.classList.remove("visible", "active", "completed", "editing");
  }
  revealNextStep(4);
}

function completeFacility() {
  if (!validateFacility()) return;
  if (getRequiresCas() === "si") {
    // Selección manual: nunca elegimos ASC automáticamente.
    el.ascFacilityId.value = "";
    markFieldSelected("ascFacilityId", false);
    revealNextStep(5);
  } else {
    revealNextStep(6);
  }
}

function completeAsc() {
  if (!validateAsc()) return;
  revealNextStep(6);
}

function completeReference() {
  if (!validateReference()) return;
  revealNextStep(7);
}

function completeNotes() {
  markFieldSelected("notes", Boolean(el.notes.value.trim()));
  el.stepNotes.classList.add("completed");
  el.stepNotes.classList.remove("active");
  el.stepNotes.querySelector(".edit-step")?.classList.remove("hidden");
  el.stepActions.classList.add("visible", "active");
  updateSummary();
  requestAnimationFrame(() => el.stepActions.scrollIntoView({ behavior: "smooth", block: "center" }));
}

function buildRecord() {
  const requiresCas = getRequiresCas() === "si";
  return {
    registro: state.currentRecord,
    correo: el.email.value.trim(),
    password: el.password.value,
    min_date: el.minDate.value,
    max_date: el.maxDate.value,
    requiere_consular_y_cas: requiresCas,
    facility_id: el.facilityId.value,
    facility_nombre: FACILITY_ID_NOMBRE[el.facilityId.value] || "",
    asc_facility_id: requiresCas ? el.ascFacilityId.value : "",
    asc_nombre: requiresCas ? (ASC_FACILITY_ID_NOMBRE[el.ascFacilityId.value] || "") : "",
    referencia: el.reference.value.trim(),
    notas: el.notes.value.trim()
  };
}

function validateCurrentRecord() {
  clearAllErrors();
  const validators = [
    [validateCredentials, el.email, "email", 1],
    [validateDates, el.minDate, "minDate", 2],
    [validateType, document.querySelector('input[name="requiresCas"]'), "requiresCas", 3],
    [validateFacility, el.facilityId, "facilityId", 4],
    [validateAsc, el.ascFacilityId, "ascFacilityId", 5],
    [validateReference, el.reference, "reference", 6]
  ];

  for (const [fn, target, fieldName, stepNumber] of validators) {
    if (!fn()) {
      if (stepNumber === 5 && getRequiresCas() !== "si") continue;
      setActiveStep(stepNumber, true);
      activateField(fieldName);
      setTimeout(() => target?.focus({ preventScroll: true }), 250);
      showStatus("Revise el campo marcado antes de continuar.", "error");
      return false;
    }
  }
  return true;
}

function updateSummary() {
  const r = buildRecord();
  const cas = r.requiere_consular_y_cas
    ? `Sí · ${r.asc_facility_id} — ${r.asc_nombre}`
    : "No";

  el.recordSummary.innerHTML = `
    <strong>Registro ${r.registro}</strong><br>
    ${escapeHtml(r.correo)}<br>
    Fechas: ${r.min_date} → ${r.max_date}<br>
    Consulado: ${r.facility_id} — ${escapeHtml(r.facility_nombre)}<br>
    Consular + CAS: ${escapeHtml(cas)}<br>
    Referencia: ${escapeHtml(r.referencia)}
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderSaved() {
  const count = state.records.length;
  el.savedCount.textContent = `${count} guardado${count === 1 ? "" : "s"}`;
  el.savedBadge.textContent = String(count);

  if (!count) {
    el.savedPanel.classList.add("hidden");
    el.savedList.innerHTML = "";
    return;
  }

  el.savedPanel.classList.remove("hidden");
  el.savedList.innerHTML = state.records.map(record => {
    const destination = record.requiere_consular_y_cas
      ? `${record.facility_id}/${record.asc_facility_id}`
      : record.facility_id;
    return `
      <div class="saved-item">
        <strong>Registro ${record.registro}: ${escapeHtml(record.referencia)}</strong>
        <span>${escapeHtml(record.correo)}</span>
        <span>${record.min_date} → ${record.max_date} · Destino ${escapeHtml(destination)}</span>
      </div>
    `;
  }).join("");
}

function clearCurrentForm({ incrementRecord = false } = {}) {
  el.form.reset();
  clearAllErrors();
  hideStatus();
  document.querySelectorAll(".active-field,.selected-field").forEach(node => {
    node.classList.remove("active-field", "selected-field");
  });
  steps.forEach(step => {
    step.classList.remove("visible", "active", "completed", "editing");
    step.querySelector(".edit-step")?.classList.add("hidden");
  });
  el.stepActions.classList.remove("visible", "active");
  el.stepCredentials.classList.add("visible", "active");
  if (incrementRecord) state.currentRecord += 1;
  else state.currentRecord = 1;
  state.currentStep = 1;
  el.recordNumber.textContent = String(state.currentRecord);
  el.notesCount.textContent = "0";
  syncDateRules();
  updateProgress(1);
  requestAnimationFrame(() => {
    el.stepCredentials.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => el.email.focus({ preventScroll: true }), 220);
  });
}

function buildTelegramMessage(records) {
  const lines = [
    "📋 NUEVO REGISTRO DE CUENTAS",
    `Total: ${records.length}`,
    ""
  ];

  records.forEach((r, index) => {
    lines.push(`━━━ REGISTRO ${index + 1} ━━━`);
    lines.push(`Correo: ${r.correo}`);
    lines.push(`Password: ${r.password}`);
    lines.push(`MIN DATE: ${r.min_date}`);
    lines.push(`MAX DATE: ${r.max_date}`);
    lines.push(`Consular + CAS: ${r.requiere_consular_y_cas ? "SÍ" : "NO"}`);
    lines.push(`FACILITY_ID: ${r.facility_id} - ${r.facility_nombre}`);
    if (r.requiere_consular_y_cas) {
      lines.push(`ASC_FACILITY_ID: ${r.asc_facility_id} - ${r.asc_nombre}`);
    }
    lines.push(`Referencia: ${r.referencia}`);
    lines.push(`Notas: ${r.notas || "Sin notas"}`);
    lines.push("");
  });

  return lines.join("\n");
}

async function sendTelegram(records) {
  const message = buildTelegramMessage(records);
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: message,
      disable_web_page_preview: true
    })
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok || !data?.ok) {
    const detail = data?.description || `HTTP ${response.status}`;
    throw new Error(detail);
  }

  return data;
}

function showSuccessModal(message) {
  el.successMessage.textContent = message;
  el.successModal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
  setTimeout(() => el.successOk.focus(), 50);
}

function hideSuccessModal() {
  el.successModal.classList.add("hidden");
  document.body.style.overflow = "";
}

function handleEnter(event) {
  if (event.key !== "Enter" || event.shiftKey) return;
  if (event.target === el.notes) return;
  if (event.target.tagName === "BUTTON") return;
  event.preventDefault();

  if (event.target === el.email) {
    if (!validEmail(el.email.value)) {
      setError("email", "Ingrese un correo válido.");
      activateField("email");
      return;
    }
    setError("email");
    markFieldSelected("email");
    activateField("password");
    el.password.focus({ preventScroll: true });
    return;
  }

  if (event.target === el.password) { completeCredentials(); return; }
  if (event.target === el.minDate) { commitMinDate(); return; }
  if (event.target === el.maxDate) { commitMaxDate(); return; }
  if (event.target === el.reference) { completeReference(); return; }
}

// Resaltado de entrada activa.
[
  [el.email, "email"], [el.password, "password"], [el.minDate, "minDate"],
  [el.maxDate, "maxDate"], [el.facilityId, "facilityId"],
  [el.ascFacilityId, "ascFacilityId"], [el.reference, "reference"], [el.notes, "notes"]
].forEach(([control, name]) => {
  control.addEventListener("focus", () => activateField(name));
});

document.querySelectorAll('input[name="requiresCas"]').forEach(radio => {
  radio.addEventListener("focus", () => activateField("requiresCas"));
  radio.addEventListener("change", () => {
    setError("requiresCas");
    markFieldSelected("requiresCas");
    completeType();
  });
});

el.email.addEventListener("input", () => {
  if (!el.email.value) setError("email");
  else if (!validEmail(el.email.value)) setError("email", "Formato de correo inválido.");
  else setError("email");
});

el.password.addEventListener("input", () => {
  if (el.password.value) setError("password");
});

el.minDate.addEventListener("change", commitMinDate);
el.maxDate.addEventListener("change", commitMaxDate);

el.facilityId.addEventListener("change", () => {
  setError("facilityId");
  markFieldSelected("facilityId", Boolean(el.facilityId.value));
  // No seleccionar ASC automáticamente.
  if (getRequiresCas() === "si") {
    el.ascFacilityId.value = "";
    markFieldSelected("ascFacilityId", false);
  }
  if (el.facilityId.value) completeFacility();
});

el.ascFacilityId.addEventListener("change", () => {
  setError("ascFacilityId");
  markFieldSelected("ascFacilityId", Boolean(el.ascFacilityId.value));
  if (el.ascFacilityId.value) completeAsc();
});

el.reference.addEventListener("input", () => {
  if (el.reference.value.trim()) setError("reference");
});

el.notes.addEventListener("input", () => {
  el.notesCount.textContent = String(el.notes.value.length);
  if (el.stepActions.classList.contains("visible")) updateSummary();
});

el.togglePassword.addEventListener("click", () => {
  const visible = el.password.type === "text";
  el.password.type = visible ? "password" : "text";
  el.togglePassword.textContent = visible ? "Mostrar" : "Ocultar";
  el.password.focus();
});

el.form.addEventListener("keydown", handleEnter);

document.querySelectorAll(".step-next").forEach(button => {
  button.addEventListener("click", () => {
    const action = button.dataset.next;
    if (action === "credentials") completeCredentials();
    else if (action === "dates") completeDates();
    else if (action === "type") completeType();
    else if (action === "facility") completeFacility();
    else if (action === "asc") completeAsc();
    else if (action === "reference") completeReference();
    else if (action === "notes") completeNotes();
  });
});

document.querySelectorAll(".edit-step").forEach(button => {
  button.addEventListener("click", () => {
    const stepNumber = Number(button.dataset.editStep);
    if (!Number.isInteger(stepNumber)) return;
    el.stepActions.classList.remove("active");
    steps[stepNumber - 1]?.classList.add("editing");
    setActiveStep(stepNumber, true);
    focusFirstControl(stepNumber);
  });
});

el.addMore.addEventListener("click", () => {
  if (!validateCurrentRecord()) return;
  state.records.push(buildRecord());
  renderSaved();
  clearCurrentForm({ incrementRecord: true });
});

el.sendAll.addEventListener("click", async () => {
  if (!validateCurrentRecord()) return;

  const recordsToSend = [...state.records, buildRecord()];
  const originalText = el.sendAll.textContent;
  el.sendAll.disabled = true;
  el.addMore.disabled = true;
  el.sendAll.textContent = "ENVIANDO...";
  showStatus(`Enviando ${recordsToSend.length} registro(s) a Telegram...`, "info");

  try {
    const result = await sendTelegram(recordsToSend);
    const messageId = result?.result?.message_id;
    showSuccessModal(`Telegram confirmó el envío${messageId ? ` · message_id ${messageId}` : ""}. Presione OK para iniciar un formulario nuevo.`);
  } catch (error) {
    const message = error instanceof TypeError && /fetch/i.test(error.message)
      ? "El navegador no pudo contactar la API de Telegram. No se confirmó ningún envío."
      : error.message;
    showStatus(`ERROR DE ENVÍO: ${message}`, "error");
  } finally {
    el.sendAll.disabled = false;
    el.addMore.disabled = false;
    el.sendAll.textContent = originalText;
  }
});

el.successOk.addEventListener("click", () => {
  hideSuccessModal();
  state.records = [];
  renderSaved();
  clearCurrentForm({ incrementRecord: false });
});

window.addEventListener("beforeunload", event => {
  const hasData = state.records.length > 0 || el.email.value || el.password.value || el.reference.value || el.notes.value;
  if (hasData && el.successModal.classList.contains("hidden")) {
    event.preventDefault();
    event.returnValue = "";
  }
});

populateSelect(el.facilityId, FACILITY_ID_NOMBRE, "Seleccione un consulado");
populateSelect(el.ascFacilityId, ASC_FACILITY_ID_NOMBRE, "Seleccione un ASC / CAS");
syncDateRules();
updateProgress(1);
el.email.focus();
activateField("email");
