// ====== Shopify routing/filters ======
console.log("TGA FIT JS LOADED");

// ----------------------------
// KLUBBREGLER
// ----------------------------
const CLUB_RULES = {
  Putter: {
    hasSpel: false,
    hasSwing: false
  },
  Driver: {
    hasSpel: true,
    hasSwing: true
  },
  Järn: {
    hasSpel: true,
    hasSwing: true
  },
  Wedge: {
    hasSpel: true,
    hasSwing: false
  }
};

// ----------------------------
// SVING → FLEX (förenklad modell)
// ----------------------------
const SWING_TO_FLEX = {
  "Dam":   ["Lady"],
  "Låg":   ["Senior"],
  "Medel": ["Regular"],
  "Hög":   ["Stiff", "X-stiff"]
};

// ----------------------------
// STATE
// ----------------------------
const values = {}; // klubbtyp, fattning, niva, spel, swing, flexList
let currentStep = 1;

// ----------------------------
// STEG-HANTERING
// ----------------------------
function showStep(n){
  document.querySelectorAll(".tga-step").forEach(el =>
    el.classList.add("hidden")
  );

  // Dölj irrelevanta steg
  if (values._skipSpel) {
    document.querySelector('[data-step="5"]')?.classList.add("hidden");
  }
  if (values._skipSwing) {
    document.querySelector('[data-step="6"]')?.classList.add("hidden");
  }

  const el = document.querySelector(`.tga-step[data-step="${n}"]`);
  if (el) el.classList.remove("hidden");

  currentStep = n;
  updateSummary();
}

// ----------------------------
// STARTA OM
// ----------------------------
function restart(){
  for (const k in values) delete values[k];
  currentStep = 1;
  showStep(1);
}

// ----------------------------
// GENERISK VALUE-SETTER
// ----------------------------
function setValue(key, value){
  values[key] = value;

  // Klubbtyp → bestäm vilka steg som gäller
  if (key === "klubbtyp") {
    const rules = CLUB_RULES[value] || {};
    values._skipSpel  = rules.hasSpel === false;
    values._skipSwing = rules.hasSwing === false;
  }

  // Hoppa över spelkvalitet
  if (key === "niva" && values._skipSpel) {
    showStep(currentStep + 2);
    return;
  }

  // Hoppa direkt till resultat om ingen sving
  if (key === "spel" && values._skipSwing) {
    redirectToResults();
    return;
  }

  showStep(currentStep + 1);
}

// ----------------------------
// NIVÅ
// ----------------------------
function setNiva(niva){
  values.niva = niva;
  showStep(currentStep + 1);
}

// ----------------------------
// SVING → FLEX
// ----------------------------
function setSwing(swingLabel){
  values.swing = swingLabel;
  values.flexList = SWING_TO_FLEX[swingLabel] || [];
  redirectToResults();
}

// ----------------------------
// SHOPIFY URL-BYGGARE
// ----------------------------
const BASE_COLLECTION = "/collections/golfklubbor";

const FILTER_KEYS = {
  klubbtyp: "filter.p.m.custom.klubbtyp",
  fattning: "filter.p.m.custom.fattning",
  niva:     "filter.p.m.custom.golfarens_niva",
  spel:     "filter.p.m.custom.spelkvaliteter",
  flex:     "filter.p.m.custom.skaft_styvhet",
  priceGte: "filter.v.price.gte",
  priceLte: "filter.v.price.lte",
  sortBy:   "sort_by"
};

function buildUrl(){
  const p = new URLSearchParams();

  if (values.klubbtyp) p.set(FILTER_KEYS.klubbtyp, values.klubbtyp);
  if (values.fattning) p.set(FILTER_KEYS.fattning, values.fattning);
  if (values.niva)     p.set(FILTER_KEYS.niva, values.niva);
  if (values.spel)     p.set(FILTER_KEYS.spel, values.spel);

  if (Array.isArray(values.flexList)) {
    values.flexList.forEach(f =>
      p.append(FILTER_KEYS.flex, f)
    );
  }

  p.set(FILTER_KEYS.priceGte, "");
  p.set(FILTER_KEYS.priceLte, "");
  p.set(FILTER_KEYS.sortBy, "best-selling");

  return `${BASE_COLLECTION}?${p.toString()}`;
}

// ----------------------------
// REDIRECT + LOGGNING
// ----------------------------
function redirectToResults(){
  const payload = JSON.stringify({
    klubbtyp: values.klubbtyp,
    fattning: values.fattning,
    niva: values.niva,
    spel: values.spel,
    swing: values.swing,
    flex: values.flexList,
    hadResults: true
  });

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "https://tga-fitting-tool.vercel.app/api/log-search",
      payload
    );
  } else {
    fetch("https://tga-fitting-tool.vercel.app/api/log-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true
    }).catch(() => {});
  }

  window.location.href = buildUrl() + "div.section-template";
}

// ----------------------------
// SUMMARY
// ----------------------------
function updateSummary(){
  const root = document.getElementById("tgaSummary");
  if (!root) return;

  const flexText = Array.isArray(values.flexList) && values.flexList.length
    ? values.flexList.join(" / ")
    : "-";

  const rows = [
    ["Klubbtyp", values.klubbtyp || "-"],
    ["Fattning", values.fattning || "-"],
    ["Golfarens nivå", values.niva || "-"],
    ["Spelkvaliteter", values.spel || "-"],
    ["Sving / Skaft", flexText],
  ];

  root.innerHTML = rows.map(([k,v]) => `
    <div class="tga-sumRow">
      <span>${escapeHtml(k)}</span>
      <span>${escapeHtml(v)}</span>
    </div>
  `).join("");
}

function escapeHtml(str){
  return String(str).replace(/[&<>"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[s]));
}

// ----------------------------
// GLOBAL EXPORTS
// ----------------------------
window.setValue = setValue;
window.setNiva = setNiva;
window.setSwing = setSwing;
window.restart = restart;

// ----------------------------
document.addEventListener("DOMContentLoaded", () => {
  showStep(1);
});
