// ====== Shopify routing/filters (verified from your URLs) ======
console.log("TGA FIT JS LOADED");

const AVAILABLE = {
  klubbtyp: ["Driver", "Fairway Wood", "Hybrid", "Järnset", "Wedge", "Putter"],
  fattning: ["Höger", "Vänster"],
  gender: ["Herr", "Dam"],
  niva: ["Nybörjare", "Medel"], // ex: Avancerad saknas
  spel: [
    "Förlåtande (hjälp vid missar)",
    "Träffsäkerhet (rakare slag)"
  ],
  swingHerr: ["Låg", "Medel"] // ex: inga Hög ännu
};

function filterOptionsForStep(step) {
  const stepEl = document.querySelector(`.tga-step[data-step="${step}"]`);
  if (!stepEl) return;

  const buttons = stepEl.querySelectorAll(".tga-opt");

  buttons.forEach(btn => {
    const value = btn.textContent.trim();
    let allowed = true;

    if (step === 1) {
      allowed = AVAILABLE.klubbtyp.includes(value);
    }

    if (step === 2) {
      allowed = AVAILABLE.fattning.includes(value);
    }

    if (step === 3) {
      allowed = AVAILABLE.gender.includes(value);
    }

    if (step === 4) {
      allowed = AVAILABLE.niva.includes(value);
    }

    if (step === 5) {
      allowed = AVAILABLE.spel.includes(value);
    }

    if (step === 6 && values.gender === "Herr") {
      allowed = AVAILABLE.swingHerr.includes(value);
    }

    btn.disabled = !allowed;
    btn.classList.toggle("tga-opt--disabled", !allowed);
  });
}


function showStep(n){
  document.querySelectorAll(".tga-step").forEach(el =>
    el.classList.add("hidden")
  );

  const el = document.querySelector(`.tga-step[data-step="${n}"]`);
  if (el) el.classList.remove("hidden");

  currentStep = n;
  filterOptionsForStep(n);
  updateSummary();
}

const BASE_COLLECTION = "/collections/golfklubbor";
  const FILTER_KEYS = {
    klubbtyp: "filter.p.m.custom.klubbtyp",
    fattning: "filter.p.m.custom.fattning",
    niva:     "filter.p.m.custom.golfarens_niva",
    flex:     "filter.p.m.custom.skaft_styvhet",
    spel:     "filter.p.m.custom.spelkvaliteter",
    priceGte: "filter.v.price.gte",
    priceLte: "filter.v.price.lte",
    sortBy:   "sort_by"
  };

  // Herr: Hög => Stiff + X-stiff (multi-filter)
  const SWING_TO_FLEX_HERR = {
    "Låg":   ["Senior"],
    "Medel": ["Regular"],
    "Hög":   ["Stiff", "X-stiff"]
  };

  const values = {}; // klubbtyp, fattning, gender, niva, spel, flexList
  let currentStep = 1;

  function showStep(n){
    document.querySelectorAll(".tga-step").forEach(el => el.classList.add("hidden"));
    const el = document.querySelector(`.tga-step[data-step="${n}"]`);
    if (el) el.classList.remove("hidden");
    currentStep = n;
    updateSummary();
  }

  function restart(){
    for (const k in values) delete values[k];
    showStep(1);
  }

  function setValue(key, value){
    values[key] = value;

    // Om vi precis satte spel och kunden är Dam -> redirect direkt (hoppa flex)
    if (key === "spel" && values.gender === "Dam") {
      redirectToResults();
      return;
    }

    showStep(currentStep + 1);
  }

  function setGender(g){
    values.gender = g;
    showStep(currentStep + 1);
  }

  function setNiva(niva){
    values.niva = niva;
    showStep(currentStep + 1);
  }

  function setSwing(speed){
    values.flexList = SWING_TO_FLEX_HERR[speed] || ["Regular"];
    redirectToResults();
  }

  function buildUrl(){
    const p = new URLSearchParams();

    if (values.klubbtyp) p.set(FILTER_KEYS.klubbtyp, values.klubbtyp);
    if (values.fattning) p.set(FILTER_KEYS.fattning, values.fattning);
    if (values.niva)     p.set(FILTER_KEYS.niva, values.niva);
    if (values.spel)     p.set(FILTER_KEYS.spel, values.spel);

    // Flex endast för Herr
    if (values.gender === "Herr" && Array.isArray(values.flexList)) {
      values.flexList.forEach(f => p.append(FILTER_KEYS.flex, f));
    }

    // Match your collection URLs
    p.set(FILTER_KEYS.priceGte, "");
    p.set(FILTER_KEYS.priceLte, "");
    p.set(FILTER_KEYS.sortBy, "best-selling");

    return `${BASE_COLLECTION}?${p.toString()}`;
  }

  function redirectToResults(){
    window.location.href = buildUrl();
  }

  function updateSummary(){
    const root = document.getElementById("tgaSummary");
    if (!root) return;

    const flexText =
      (values.gender === "Herr" && Array.isArray(values.flexList) && values.flexList.length)
        ? values.flexList.join(" / ")
        : "-";

    const rows = [
      ["Klubbtyp", values.klubbtyp || "-"],
      ["Fattning", values.fattning || "-"],
      ["Dam/Herr", values.gender || "-"],
      ["Golfarens nivå", values.niva || "-"],
      ["Spelkvaliteter", values.spel || "-"],
      ["Skaft styvhet", flexText],
    ];

    root.innerHTML = rows.map(([k,v]) => (
      `<div class="tga-sumRow"><span>${escapeHtml(k)}</span><span>${escapeHtml(v)}</span></div>`
    )).join("");
  }

  function escapeHtml(str){
    return String(str).replace(/[&<>"']/g, s => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
    }[s]));
  }

// Expose functions for inline onclick handlers
window.setValue = setValue;
window.setGender = setGender;
window.setNiva = setNiva;
window.setSwing = setSwing;
window.restart = restart;


document.addEventListener("DOMContentLoaded", () => {
  showStep(1);
});

