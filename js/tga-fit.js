// ====== Shopify routing/filters (verified from your URLs) ======
console.log("TGA FIT JS LOADED RIGHT NOW");

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

function showStep(n){
  document.querySelectorAll(".tga-step").forEach(el =>
    el.classList.add("hidden")
  );

  // Dölj spel/swing-steg om de inte ska användas
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


/*
function isCombinationValid() {
  if (!AVAILABLE.klubbtyp.includes(values.klubbtyp)) return false;
  if (!AVAILABLE.fattning.includes(values.fattning)) return false;
  if (!AVAILABLE.niva.includes(values.niva)) return false;
  if (!AVAILABLE.spel.includes(values.spel)) return false;

  if (values.gender === "Herr") {
    const swingValid = Object.values(SWING_TO_FLEX_HERR)
      .flat()
      .some(f => values.flexList?.includes(f));
    if (!swingValid) return false;
  }

  return true;
}
*/

/*
function buildTestUrl(testKey, testValue) {
  const p = new URLSearchParams();
  const temp = { ...values, [testKey]: testValue };

  if (temp.klubbtyp) p.set(FILTER_KEYS.klubbtyp, temp.klubbtyp);
  if (temp.fattning) p.set(FILTER_KEYS.fattning, temp.fattning);
  if (temp.niva)     p.set(FILTER_KEYS.niva, temp.niva);
  if (temp.spel)     p.set(FILTER_KEYS.spel, temp.spel);

  if (temp.gender === "Herr" && Array.isArray(temp.flexList)) {
    temp.flexList.forEach(f => p.append(FILTER_KEYS.flex, f));
  }

  p.set(FILTER_KEYS.sortBy, "best-selling");

  return `${BASE_COLLECTION}?${p.toString()}`;
}
*/

/*Ä
async function shopifyHasResults(url) {
  const res = await fetch(url, { method: "GET" });
  const html = await res.text();

  // Anpassa om ditt tema använder annan text
  return !html.includes("Inga produkter hittades");
}*/


/*
async function filterOptionsForStep(step) {
  const stepEl = document.querySelector(`.tga-step[data-step="${step}"]`);
  if (!stepEl) return;

  const buttons = stepEl.querySelectorAll(".tga-opt");

  let key;
  if (step === 1) key = "klubbtyp";
  if (step === 2) key = "fattning";
  if (step === 3) key = "gender";
  if (step === 4) key = "niva";
  if (step === 5) key = "spel";

  if (!key) return;

  for (const btn of buttons) {
    const value = btn.textContent.trim();

    btn.disabled = true;
    btn.classList.add("tga-opt--disabled");

    const testUrl = buildTestUrl(key, value);
    const hasResults = await shopifyHasResults(testUrl);

    if (hasResults) {
      btn.disabled = false;
      btn.classList.remove("tga-opt--disabled");
    }
  }
}
*/



function showStep(n){
  document.querySelectorAll(".tga-step").forEach(el =>
    el.classList.add("hidden")
  );

  const el = document.querySelector(`.tga-step[data-step="${n}"]`);
  if (el) el.classList.remove("hidden");

  currentStep = n;
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

  /* 
  function showStep(n){
    document.querySelectorAll(".tga-step").forEach(el => el.classList.add("hidden"));
    const el = document.querySelector(`.tga-step[data-step="${n}"]`);
    if (el) el.classList.remove("hidden");
    currentStep = n;
    updateSummary();
  } 
  */

  function restart(){
    for (const k in values) delete values[k];
    showStep(1);
  }

const SWING_TO_FLEX = {
  Herr: {
    "Låg":   ["Senior"],
    "Medel": ["Regular"],
    "Hög":   ["Stiff", "X-stiff"]
  },
  Dam: {
    "Låg":   ["Ladies"],
    "Medel": ["Ladies", "Senior"],
    "Hög":   ["Regular"]
  }
};


function setValue(key, value){
  values[key] = value;

  // Om klubbtyp valdes → avgör vilka steg som ska hoppas över
  if (key === "klubbtyp") {
    const rules = CLUB_RULES[value] || {};

    values._skipSpel  = rules.hasSpel === false;
    values._skipSwing = rules.hasSwing === false;
  }

  // Hoppa över spelkvalitet om ej relevant
  if (key === "niva" && values._skipSpel) {
    showStep(currentStep + 2); // hoppa spel
    return;
  }

  // Hoppa direkt till resultat om sving ej relevant
  if (key === "spel" && values._skipSwing) {
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
  const gender = values.gender || "Herr";

  values.flexList =
    SWING_TO_FLEX[gender]?.[speed] || [];

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

  function redirectToResults() {
  const payload = JSON.stringify({
    klubbtyp: values.klubbtyp,
    fattning: values.fattning,
    gender: values.gender,
    niva: values.niva,
    spel: values.spel,
    flex: values.flexList,
    hadResults: true
  });

  // 🔹 Logga utan att blockera redirect
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      "https://tga-fitting-tool.vercel.app/api/log-search",
      payload
    );
  } else {
    // fallback (äldre browsers)
    fetch("https://tga-fitting-tool.vercel.app/api/log-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true
    }).catch(() => {});
  }

  // 🔹 Redirect direkt
 /* window.location.href = buildUrl(); */
    window.location.href = buildUrl() + '.sectiontemplate';

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

