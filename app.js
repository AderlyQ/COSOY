/* =========================================================
   COSO — App JS integrado (Teoría + Práctica)
   - Mantiene TODO tu contenido
   - Ordena inicialización (DOMContentLoaded)
   - Paleta profesional consistente
   - Control de Tabs, Buscador, ToTop
========================================================= */

/* ---------------------------
   Chart.js defaults (global)
--------------------------- */
Chart.defaults.font.family = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Arial';
Chart.defaults.color = "#334155";
Chart.defaults.responsive = true;

/* ---------------------------
   Helpers DOM
--------------------------- */
const $ = (id) => document.getElementById(id);

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
function avg(arr){ return arr.reduce((a,b)=>a+b,0) / (arr.length || 1); }

function bindRangeValue(rangeId){
  const el = $(rangeId);
  if(!el) return;
  const badge = document.querySelector(`[data-bind="${rangeId}"]`);
  const update = () => { if(badge) badge.textContent = el.value; };
  el.addEventListener("input", update);
  update();
}

function setList(listEl, items){
  if(!listEl) return;
  listEl.innerHTML = "";
  items.forEach(t=>{
    const li = document.createElement("li");
    li.textContent = t;
    listEl.appendChild(li);
  });
}

/* =========================================================
   Paleta única (bonita + sobria) para TODO
========================================================= */
const COLORS = {
  indigo: "rgba(99,102,241,.88)",
  indigoFill: "rgba(99,102,241,.18)",

  emerald: "rgba(16,185,129,.86)",
  emeraldFill: "rgba(16,185,129,.18)",

  amber: "rgba(245,158,11,.88)",
  amberFill: "rgba(245,158,11,.18)",

  sky: "rgba(14,165,233,.86)",
  skyFill: "rgba(14,165,233,.18)",

  rose: "rgba(244,63,94,.86)",
  roseFill: "rgba(244,63,94,.16)",

  purple: "rgba(168,85,247,.86)",
  purpleFill: "rgba(168,85,247,.16)",

  slate: "rgba(15,23,42,.78)",
  grid: "rgba(15,23,42,.08)",
  gridStrong: "rgba(15,23,42,.12)",
  whiteStroke: "rgba(255,255,255,.92)",
  grayBar: "rgba(148,163,184,.78)"
};

/* ---------------------------
   Estilo común Chart.js
--------------------------- */
function commonLegend(){
  return {
    labels: {
      color: COLORS.slate,
      usePointStyle: true,
      boxWidth: 10,
      boxHeight: 10
    }
  };
}

function commonScales(){
  return {
    ticks: { color: COLORS.slate },
    grid: { color: COLORS.grid }
  };
}

function baseBarOptions({horizontal=false, max=100} = {}) {
  const opt = {
    responsive: true,
    maintainAspectRatio: false, // ✅ evita gráficos “raros” por contenedor
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    scales: {}
  };

  if (horizontal) {
    opt.indexAxis = "y";
    opt.scales.x = { ...commonScales(), min: 0, max };
    opt.scales.y = { ...commonScales(), grid: { display: false } };
  } else {
    opt.scales.x = { ...commonScales(), grid: { display: false } };
    opt.scales.y = { ...commonScales(), min: 0, max };
  }
  return opt;
}

function donutOptions({cutout="70%"} = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom", labels: commonLegend().labels },
      tooltip: { enabled: true }
    },
    cutout
  };
}

function radarOptions({min=0, max=100, showLegend=true} = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: showLegend ? commonLegend() : { display:false } },
    scales: {
      r: {
        min, max,
        grid: { color: COLORS.grid },
        angleLines: { color: COLORS.gridStrong },
        pointLabels: { color: COLORS.slate },
        ticks: { color: COLORS.slate, backdropColor: "transparent" }
      }
    }
  };
}

/* =========================================================
   UI: Tabs Teoría / Práctica + Buscador + ToTop
========================================================= */
function initTabs(){
  const tabs = document.querySelectorAll(".tab[data-view]");
  const views = document.querySelectorAll(".view[data-view]");
  if(!tabs.length || !views.length) return;

  const show = (name) => {
    views.forEach(v => v.classList.toggle("is-visible", v.dataset.view === name));
    tabs.forEach(b => b.classList.toggle("is-active", b.dataset.view === name));
  };

  tabs.forEach(btn=>{
    btn.addEventListener("click", ()=> show(btn.dataset.view));
  });

  // default: teoría
  show("teoria");
}

function initToTop(){
  const btn = $("toTop");
  if(!btn) return;

  const onScroll = ()=>{
    const y = window.scrollY || document.documentElement.scrollTop;
    btn.style.display = y > 600 ? "flex" : "none";
  };

  btn.addEventListener("click", ()=> window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initSearch(){
  const input = $("searchInput");
  const clear = $("clearSearch");
  if(!input || !clear) return;

  // Filtra SOLO dentro de la vista visible (teoría o práctica)
  const getActiveScope = () => document.querySelector(".view.is-visible") || document;

  const apply = ()=>{
    const q = (input.value || "").trim().toLowerCase();
    const scope = getActiveScope();

    // Buscamos elementos marcados como searchable
    const blocks = scope.querySelectorAll(".searchable");
    if(!blocks.length) return;

    if(!q){
      blocks.forEach(b => b.style.display = "");
      return;
    }

    blocks.forEach(b=>{
      const txt = (b.innerText || "").toLowerCase();
      b.style.display = txt.includes(q) ? "" : "none";
    });
  };

  input.addEventListener("input", apply);
  clear.addEventListener("click", ()=>{
    input.value = "";
    apply();
  });

  apply();
}
/* =========================================================
   TEORÍA — Gráficos G1..G7 (COSO 2013)
   (Se inicializan dentro de funciones para evitar errores)
========================================================= */

let g1, g2, g3, g4, g5, g6, g7;

function initTeoriaCharts(){
  // Si algún canvas no existe, simplemente no crea el chart (sin romper la página)

  /* G1: Componentes del sistema de control COSO */
  const c1 = $("g1_componentes");
  if(c1){
    g1 = new Chart(c1, {
      type: "bar",
      data: {
        labels: [
          "Entorno de control",
          "Evaluación de riesgos",
          "Actividad de control",
          "Información y comunicación",
          "Actividades de supervisión"
        ],
        datasets: [{
          data: [30,20,20,15,15],
          backgroundColor: [COLORS.indigo, COLORS.emerald, COLORS.amber, COLORS.purple, COLORS.rose],
          borderRadius: 10,
          borderSkipped: false
        }]
      },
      options: baseBarOptions({ max: 40 })
    });
  }

  /* G2: Elementos del componente ético (donut) */
  const c2 = $("g2_etico");
  if(c2){
    g2 = new Chart(c2, {
      type: "doughnut",
      data: {
        labels: ["Liderazgo ejemplar","Formalización","Evaluación continua","Acciones correctivas"],
        datasets: [{
          data: [35,30,20,15],
          backgroundColor: [COLORS.indigo, COLORS.emerald, COLORS.amber, COLORS.rose],
          borderColor: COLORS.whiteStroke,
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: donutOptions({ cutout: "68%" })
    });
  }

  /* G3: Premisas del principio de independencia (horizontal) */
  const c3 = $("g3_independencia");
  if(c3){
    g3 = new Chart(c3, {
      type: "bar",
      data: {
        labels: [
          "Identificación de responsabilidades",
          "Competencia del Consejo",
          "Independencia",
          "Supervisión efectiva"
        ],
        datasets: [{
          data: [85,75,80,90],
          backgroundColor: [COLORS.sky, COLORS.purple, COLORS.indigo, COLORS.emerald],
          borderRadius: 10,
          borderSkipped: false
        }]
      },
      options: baseBarOptions({ horizontal:true, max: 100 })
    });
  }

  /* G4: Modelo de Tres Líneas de Defensa (radar) */
  const c4 = $("g4_tres_lineas");
  if(c4){
    g4 = new Chart(c4, {
      type: "radar",
      data: {
        labels: ["Primera","Segunda","Tercera","Comunicación","Supervisión"],
        datasets: [{
          label: "Efectividad",
          data: [90,75,85,90,80],
          borderColor: COLORS.indigo,
          backgroundColor: COLORS.indigoFill,
          pointBackgroundColor: COLORS.indigo,
          pointRadius: 3,
          borderWidth: 2
        }]
      },
      options: radarOptions({ min:0, max:100, showLegend:true })
    });
  }

  /* G5: Impacto de riesgo por categoría (bar) */
  const c5 = $("g5_impacto_riesgo");
  if(c5){
    g5 = new Chart(c5, {
      type: "bar",
      data: {
        labels: ["Financiero","Operacional","Reputación","Cumplimiento","Estratégico"],
        datasets: [{
          data: [84,78,86,62,80],
          backgroundColor: [COLORS.indigo, COLORS.emerald, COLORS.rose, COLORS.amber, COLORS.purple],
          borderRadius: 10,
          borderSkipped: false
        }]
      },
      options: baseBarOptions({ max: 100 })
    });
  }

  /* G6: Riesgos por categoría (horizontal) */
  const c6 = $("g6_riesgos_categoria");
  if(c6){
    g6 = new Chart(c6, {
      type: "bar",
      data: {
        labels: ["Estratégicos","Operacionales","Financieros","Cumplimiento","Tecnológicos","Reputacionales"],
        datasets: [{
          data: [25,40,30,20,35,15],
          backgroundColor: [COLORS.purple, COLORS.emerald, COLORS.indigo, COLORS.amber, COLORS.sky, COLORS.rose],
          borderRadius: 10,
          borderSkipped: false
        }]
      },
      options: baseBarOptions({ horizontal:true, max: 45 })
    });
  }

  /* G7: Características de la información (donut) */
  const c7 = $("g7_info");
  if(c7){
    g7 = new Chart(c7, {
      type: "doughnut",
      data: {
        labels: ["Comprensibles","Útil","Pertinente","Confiable","Relevante"],
        datasets: [{
          data: [20,20,20,20,20],
          backgroundColor: [COLORS.indigo, COLORS.emerald, COLORS.amber, COLORS.purple, COLORS.rose],
          borderColor: COLORS.whiteStroke,
          borderWidth: 2,
          hoverOffset: 6
        }]
      },
      options: donutOptions({ cutout: "68%" })
    });
  }
}
  /* G8 (ERM 2017): Distribución conceptual de los 5 componentes */
  const c8 = $("g8_erm_componentes");
  if(c8){
    new Chart(c8, {
      type: "bar",
      data: {
        labels: [
          "Gobernanza y Cultura",
          "Estrategia y Obj.",
          "Rendimiento",
          "Revisión",
          "Info/Com/Informes"
        ],
        datasets: [{
          label: "Peso conceptual",
          data: [22, 20, 22, 18, 18], // puedes ajustar
          backgroundColor: [COLORS.indigo, COLORS.emerald, COLORS.amber, COLORS.purple, COLORS.sky],
          borderRadius: 10,
          borderSkipped: false
        }]
      },
      options: baseBarOptions({ max: 30 })
    });
  }

  /* G9 (ERM 2017): Principios por componente (5/4/5/3/3) */
  const c9 = $("g9_erm_principios");
  if(c9){
    new Chart(c9, {
      type: "bar",
      data: {
        labels: [
          "Gobernanza y Cultura",
          "Estrategia y Obj.",
          "Rendimiento",
          "Revisión",
          "Info/Com/Informes"
        ],
        datasets: [{
          label: "N° de principios",
          data: [5, 4, 5, 3, 3],
          backgroundColor: [COLORS.indigo, COLORS.emerald, COLORS.amber, COLORS.purple, COLORS.sky],
          borderRadius: 10,
          borderSkipped: false
        }]
      },
      options: baseBarOptions({ horizontal: true, max: 6 })

    });
  }

/* =========================================================
   SIMULACIONES — 1..7 (se mantienen como tus reglas)
========================================================= */

let chartS1, chartS2, chartS3, chartS4Donut, chartS4Radar, chartS5, chartS6, chartS7;

// ---------------------------
// SIM 1 — Radar doble
// ---------------------------
function initSim1(){
  ["s1_entorno","s1_riesgos","s1_actividades","s1_info","s1_supervision"].forEach(bindRangeValue);

  const ctx = $("chart_s1_radar");
  if(!ctx) return;

  const labels = [
    "Entorno de control",
    "Administración de riesgos",
    "Actividades de control",
    "Información y comunicación",
    "Actividades de supervisión"
  ];

  chartS1 = new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: [
        {
          label: "Importancia Relativa",
          data: [80,70,90,75,65],
          borderColor: COLORS.emerald,
          backgroundColor: COLORS.emeraldFill,
          pointBackgroundColor: COLORS.emerald
        },
        {
          label: "Implementación Típica",
          data: [70,60,85,65,55],
          borderColor: COLORS.indigo,
          backgroundColor: COLORS.indigoFill,
          pointBackgroundColor: COLORS.indigo
        }
      ]
    },
    options: radarOptions({ min:0, max:100, showLegend:true })
  });

  const update = ()=>{
    const v = [
      +$("s1_entorno").value,
      +$("s1_riesgos").value,
      +$("s1_actividades").value,
      +$("s1_info").value,
      +$("s1_supervision").value
    ];

    chartS1.data.datasets[0].data = v;
    chartS1.data.datasets[1].data = v.map(x => clamp(Math.round(x * 0.85), 0, 100));
    chartS1.update();
  };

  ["s1_entorno","s1_riesgos","s1_actividades","s1_info","s1_supervision"].forEach(id=>{
    $(id)?.addEventListener("input", update);
  });

  update();
}

// ---------------------------
// SIM 2 — Donut objetivos
// ---------------------------
function initSim2(){
  const ctx = $("chart_s2_donut");
  if(!ctx) return;

  chartS2 = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Objetivos de información", "Objetivos operacionales", "Objetivos de cumplimiento"],
      datasets: [{
        data: [50, 30, 20],
        backgroundColor: [COLORS.sky, COLORS.emerald, COLORS.rose],
        borderColor: COLORS.whiteStroke,
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: donutOptions({ cutout:"70%" })
  });
}

// ---------------------------
// SIM 3 — Barras + KPIs + recomendaciones
// ---------------------------
function initSim3(){
  ["s3_entorno","s3_eval","s3_ctrl","s3_info","s3_sup","s3_compl"].forEach(bindRangeValue);

  const ctx = $("chart_s3_bars");
  if(!ctx) return;

  chartS3 = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Entorno","Eval. Riesgos","Act. Control","Info/Com","Supervisión","Complejidad"],
      datasets: [{
        label: "Nivel",
        data: [75,50,65,55,70,60],
        backgroundColor: [COLORS.indigo, COLORS.emerald, COLORS.amber, COLORS.sky, COLORS.rose, COLORS.grayBar],
        borderRadius: 10,
        borderSkipped: false
      }]
    },
    options: baseBarOptions({ max: 100 })
  });

  const update = ()=>{
    const values = [
      +$("s3_entorno").value,
      +$("s3_eval").value,
      +$("s3_ctrl").value,
      +$("s3_info").value,
      +$("s3_sup").value,
      +$("s3_compl").value
    ];

    chartS3.data.datasets[0].data = values;
    chartS3.update();

    const eff = Math.round(avg(values.slice(0,5)));
    $("s3_eff").textContent = eff;

    const complexity = values[5];
    const residual = clamp(Math.round((100 - eff) * 0.75 + complexity * 0.25), 0, 100);
    $("s3_risk").textContent = residual;

    const recos = [];
    const labels = ["Entorno de Control","Evaluación de Riesgos","Actividades de Control","Información y Comunicación","Actividades de Supervisión"];
    values.slice(0,5).forEach((v,i)=>{
      if(v < 60) recos.push(`Fortalecer ${labels[i]} (nivel actual: ${v}%).`);
    });
    if(complexity > 75) recos.push(`Alta complejidad del entorno (${complexity}%) — priorizar estandarización y controles compensatorios.`);
    if(recos.length === 0) recos.push("Buen nivel general. Mantener monitoreo continuo y ajustes puntuales.");
    setList($("s3_recos"), recos);
  };

  ["s3_entorno","s3_eval","s3_ctrl","s3_info","s3_sup","s3_compl"].forEach(id=>{
    $(id)?.addEventListener("input", update);
  });

  update();
}

// ---------------------------
// SIM 4 — Parámetros org: donut + radar
// ---------------------------
function initSim4(){
  bindRangeValue("s4_recursos");

  const donutCtx = $("chart_s4_donut");
  const radarCtx = $("chart_s4_radar");
  if(!donutCtx || !radarCtx) return;

  chartS4Donut = new Chart(donutCtx, {
    type: "doughnut",
    data: {
      labels: ["Efectividad estimada", "Brecha"],
      datasets: [{
        data: [60, 40],
        backgroundColor: [COLORS.indigo, "rgba(148,163,184,.45)"],
        borderWidth: 2,
        borderColor: COLORS.whiteStroke
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display:false } },
      cutout: "72%"
    }
  });

  chartS4Radar = new Chart(radarCtx, {
    type: "radar",
    data: {
      labels: ["Entorno", "Riesgos", "Control", "Info/Com", "Supervisión"],
      datasets: [{
        label: "Resultado",
        data: [62,58,60,55,57],
        borderColor: COLORS.emerald,
        backgroundColor: COLORS.emeraldFill,
        pointBackgroundColor: COLORS.emerald
      }]
    },
    options: radarOptions({ min:0, max:100, showLegend:false })
  });

  const update = ()=>{
    const tipo = $("s4_tipo").value;        // pequena|mediana|grande
    const tec  = $("s4_tec").value;         // bajo|medio|alto
    const rec  = +$("s4_recursos").value;   // 0..100

    const tipoFactor = (tipo === "pequena") ? -6 : (tipo === "grande") ? +6 : 0;
    const tecFactor  = (tec === "bajo") ? -6 : (tec === "alto") ? +6 : 0;

    const eff = clamp(Math.round(rec * 0.7 + 30 + tipoFactor + tecFactor), 0, 100);

    chartS4Donut.data.datasets[0].data = [eff, 100 - eff];
    chartS4Donut.update();

    const base = eff;
    chartS4Radar.data.datasets[0].data = [
      clamp(base + tipoFactor, 0, 100),
      clamp(base - 4, 0, 100),
      clamp(base + tecFactor, 0, 100),
      clamp(base - 6, 0, 100),
      clamp(base - 2, 0, 100)
    ];
    chartS4Radar.update();
  };

  $("s4_tipo")?.addEventListener("change", update);
  $("s4_tec")?.addEventListener("change", update);
  $("s4_recursos")?.addEventListener("input", update);

  update();
}

// ---------------------------
// SIM 5 — Calidad info (radar + % total)
// ---------------------------
function initSim5(){
  ["s5_acc","s5_pre","s5_opo","s5_pro","s5_suf","s5_ver"].forEach(bindRangeValue);

  const ctx = $("chart_s5_radar");
  if(!ctx) return;

  chartS5 = new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["Accesibilidad","Precisión","Oportunidad","Protección","Suficiencia","Verificabilidad"],
      datasets: [
        {
          label: "Nivel actual",
          data: [70,85,78,80,60,68],
          borderColor: COLORS.indigo,
          backgroundColor: COLORS.indigoFill,
          pointBackgroundColor: COLORS.indigo
        },
        {
          label: "Nivel óptimo",
          data: [90,90,90,90,90,90],
          borderColor: COLORS.emerald,
          backgroundColor: COLORS.emeraldFill,
          pointBackgroundColor: COLORS.emerald
        }
      ]
    },
    options: radarOptions({ min:0, max:100, showLegend:true })
  });

  const update = ()=>{
    const vals = [
      +$("s5_acc").value,
      +$("s5_pre").value,
      +$("s5_opo").value,
      +$("s5_pro").value,
      +$("s5_suf").value,
      +$("s5_ver").value
    ];
    chartS5.data.datasets[0].data = vals;
    chartS5.update();

    $("s5_quality").textContent = Math.round(avg(vals));
  };

  ["s5_acc","s5_pre","s5_opo","s5_pro","s5_suf","s5_ver"].forEach(id=>{
    $(id)?.addEventListener("input", update);
  });

  update();
}
// ---------------------------
// SIM 6 — Supervisión (radar + KPIs + recomendaciones)
// ---------------------------
function initSim6(){
  ["s6_madurez","s6_cambio","s6_cont","s6_ind","s6_com","s6_seg","s6_mej"].forEach(bindRangeValue);

  const ctx = $("chart_s6_radar");
  if(!ctx) return;

  chartS6 = new Chart(ctx, {
    type: "radar",
    data: {
      labels: ["Eval. continuas","Eval. independientes","Comunicación","Seguimiento","Mejora continua"],
      datasets: [
        {
          label: "Estado actual",
          data: [60,45,58,52,50],
          borderColor: COLORS.indigo,
          backgroundColor: COLORS.indigoFill,
          pointBackgroundColor: COLORS.indigo
        },
        {
          label: "Objetivo",
          data: [80,80,80,80,80],
          borderColor: COLORS.emerald,
          backgroundColor: COLORS.emeraldFill,
          pointBackgroundColor: COLORS.emerald
        }
      ]
    },
    options: radarOptions({ min:0, max:100, showLegend:true })
  });

  const update = ()=>{
    const mad = +$("s6_madurez").value;
    const cam = +$("s6_cambio").value;

    const actual = [
      +$("s6_cont").value,
      +$("s6_ind").value,
      +$("s6_com").value,
      +$("s6_seg").value,
      +$("s6_mej").value
    ];

    chartS6.data.datasets[0].data = actual;
    chartS6.update();

    const eff = Math.round(avg(actual));
    const coverage = Math.round((actual[0] + actual[1]) / 2);
    const plans = clamp(Math.round((eff * 0.6 + mad * 0.4) - cam * 0.15), 0, 100);

    $("s6_kpi_eff").textContent = eff;
    $("s6_kpi_cov").textContent = coverage;
    $("s6_kpi_plan").textContent = plans;
    $("s6_kpi_mad").textContent = mad;

    const recos = [];
    if(actual[1] < 60) recos.push("Aumentar evaluaciones independientes para fortalecer objetividad.");
    if(actual[3] < 60) recos.push("Mejorar seguimiento: definir responsables, plazos y evidencias de cierre.");
    if(actual[2] < 60) recos.push("Reforzar comunicación (canales y reportes) para visibilidad de hallazgos.");
    if(mad < 60) recos.push("Elevar madurez: estandarizar metodología y capacitar a responsables.");
    if(cam > 70) recos.push("Alta velocidad de cambio: elevar frecuencia de monitoreo y revisiones.");
    if(recos.length === 0) recos.push("Buen desempeño de supervisión. Mantener evaluaciones periódicas y mejora continua.");

    setList($("s6_recos"), recos);
  };

  ["s6_madurez","s6_cambio","s6_cont","s6_ind","s6_com","s6_seg","s6_mej"].forEach(id=>{
    $(id)?.addEventListener("input", update);
  });

  update();
}

// ---------------------------
// SIM 7 — Panel donut (valores fijos + donut)
// ---------------------------
function initSim7(){
  const ctx = $("chart_s7_donut");
  if(!ctx) return;

  const vals = [72,58,64,55,61];
  const labels = ["Ambiente de Control","Evaluación de Riesgos","Actividades de Control","Info/Com","Supervisión"];

  // setea los porcentajes en el panel si existen
  $("s7_c1") && ($("s7_c1").textContent = `${vals[0]}%`);
  $("s7_c2") && ($("s7_c2").textContent = `${vals[1]}%`);
  $("s7_c3") && ($("s7_c3").textContent = `${vals[2]}%`);
  $("s7_c4") && ($("s7_c4").textContent = `${vals[3]}%`);
  $("s7_c5") && ($("s7_c5").textContent = `${vals[4]}%`);

  chartS7 = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [{
        data: vals,
        backgroundColor: [COLORS.indigo, COLORS.emerald, COLORS.amber, COLORS.sky, COLORS.rose],
        borderColor: COLORS.whiteStroke,
        borderWidth: 2,
        hoverOffset: 6
      }]
    },
    options: donutOptions({ cutout:"68%" })
  });
}

/* =========================================================
   SIM 8 — ERM integral
========================================================= */
let chartS8Scatter, chartS8Radar, chartS8Line, chartS8Heat, chartS8Kpis, chartS8Perf;

function initSim8(){
  ["s8_apetito","s8_inversion","s8_severidad","s8_respuesta"].forEach(bindRangeValue);

  // Radar ERM (importancia del marco)
  const radarCtx = $("chart_s8_radar");
  if(radarCtx){
    chartS8Radar = new Chart(radarCtx, {
      type: "radar",
      data: {
        labels: ["Gobernanza y Cultura","Estrategia y Objetivos","Rendimiento","Revisión y Monitoreo","Información y Comunicación"],
        datasets: [{
          label: "Importancia en el marco",
          data: [70,65,60,58,62],
          borderColor: COLORS.sky,
          backgroundColor: COLORS.skyFill,
          pointBackgroundColor: COLORS.sky
        }]
      },
      options: radarOptions({ min:0, max:100, showLegend:true })
    });
  }

  // Scatter Riesgo vs Retorno
  const scatterCtx = $("chart_s8_scatter");
  if(scatterCtx){
    chartS8Scatter = new Chart(scatterCtx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Estrategia actual",
            data: [{x:4.5,y:6.5}],
            backgroundColor: COLORS.indigo
          },
          {
            label: "Estrategias alternativas",
            data: [{x:3.2,y:5.0},{x:5.6,y:7.8},{x:6.8,y:8.6}],
            backgroundColor: COLORS.emerald
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: commonLegend() },
        scales: {
          x: { ...commonScales(), title:{ display:true, text:"Nivel de riesgo", color: COLORS.slate } },
          y: { ...commonScales(), title:{ display:true, text:"Retorno", color: COLORS.slate } }
        }
      }
    });
  }

  // Línea de escenarios (normal vs evento)
  const lineCtx = $("chart_s8_line");
  if(lineCtx){
    chartS8Line = new Chart(lineCtx, {
      type: "line",
      data: {
        labels: ["Inicio","Mes 1","Mes 2","Mes 3","Mes 4","Mes 5","Mes 6"],
        datasets: [
          {
            label: "Rendimiento normal",
            data: [100,102,104,106,108,110,112],
            borderColor: COLORS.emerald,
            backgroundColor: COLORS.emeraldFill,
            tension: .35,
            fill: false
          },
          {
            label: "Rendimiento con evento",
            data: [100,80,70,72,78,85,92],
            borderColor: COLORS.rose,
            backgroundColor: COLORS.roseFill,
            tension: .35,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: commonLegend() },
        scales: {
          x: commonScales(),
          y: { ...commonScales(), suggestedMin: 50, suggestedMax: 120 }
        }
      }
    });
  }

  // Heatmap tipo burbujas (Impacto vs Probabilidad)
  const heatCtx = $("chart_s8_heat");
  if(heatCtx){
    chartS8Heat = new Chart(heatCtx, {
      type: "bubble",
      data: {
        datasets: [
          { label: "Estratégico", data: [{x:85,y:7,r:14}], backgroundColor: COLORS.rose },
          { label: "Operacional", data: [{x:60,y:5,r:10}], backgroundColor: COLORS.amber },
          { label: "Cumplimiento", data: [{x:40,y:3,r:8}], backgroundColor: COLORS.emerald }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: commonLegend() },
        scales: {
          x: { ...commonScales(), min: 0, max: 100, title:{ display:true, text:"Impacto", color: COLORS.slate } },
          y: { ...commonScales(), min: 0, max: 8,   title:{ display:true, text:"Probabilidad", color: COLORS.slate } }
        }
      }
    });
  }

  // KPIs bar horizontal
  const kpiCtx = $("chart_s8_kpis");
  if(kpiCtx){
    chartS8Kpis = new Chart(kpiCtx, {
      type: "bar",
      data: {
        labels: ["Capacidad de Respuesta","Madurez de Procesos","Cultura de Riesgo","Efectividad de ERM"],
        datasets: [{
          label: "Nivel",
          data: [70,82,65,78],
          backgroundColor: [COLORS.indigo, COLORS.amber, COLORS.emerald, COLORS.sky],
          borderRadius: 10,
          borderSkipped: false
        }]
      },
      options: baseBarOptions({ horizontal:true, max: 100 })
    });
  }

  // Evolución rendimiento (3 líneas)
  const perfCtx = $("chart_s8_perf");
  if(perfCtx){
    chartS8Perf = new Chart(perfCtx, {
      type: "line",
      data: {
        labels: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"],
        datasets: [
          { label: "Índice de riesgo", data: [95,96,96,94,92,90,88,86,84,82,80,78], borderColor: COLORS.rose, tension:.35, fill:false },
          { label: "Rendimiento real", data: [85,87,86,89,91,93,95,97,99,101,103,104], borderColor: COLORS.indigo, tension:.35, fill:false },
          { label: "Objetivo de rendimiento", data: [88,88,88,89,90,91,92,93,94,95,96,97], borderColor: COLORS.emerald, tension:.35, fill:false }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: commonLegend() },
        scales: {
          x: commonScales(),
          y: { ...commonScales(), suggestedMin: 70, suggestedMax: 110 }
        }
      }
    });
  }

  // Actualización integral (cada control afecta TODO)
  const update = ()=>{
    const apetito = +$("s8_apetito").value;        // 0..10
    const inversion = +$("s8_inversion").value;    // 0..10
    const enfoque = $("s8_enfoque").value;         // conservador|equilibrado|agresivo

    const f = (enfoque === "conservador") ? -1 : (enfoque === "agresivo") ? +1 : 0;

    // KPIs estratégicos
    const mision = clamp(Math.round(55 + inversion*3 - apetito*2 - f*3), 0, 100);
    const crece  = clamp(Math.round(45 + apetito*4 + f*6 - inversion*1.5), 0, 100);
    const resi   = clamp(Math.round(40 + inversion*4 - apetito*2.2 - f*3), 0, 100);

    $("s8_kpi_mision").textContent = mision;
    $("s8_kpi_crece").textContent  = crece;
    $("s8_kpi_resi").textContent   = resi;

    // Scatter
    if(chartS8Scatter){
      chartS8Scatter.data.datasets[0].data = [{ x: clamp(2 + apetito*0.6, 0, 10), y: clamp(3 + crece*0.07, 0, 10) }];
      chartS8Scatter.update();
    }

    // Radar ERM
    if(chartS8Radar){
      const base = clamp(55 + inversion*2 - apetito*1.2, 0, 100);
      chartS8Radar.data.datasets[0].data = [
        clamp(base + 10, 0, 100),
        clamp(base + 6, 0, 100),
        clamp(base + 2, 0, 100),
        clamp(base, 0, 100),
        clamp(base + 4, 0, 100)
      ];
      chartS8Radar.update();
    }

    // Escenarios
    const sev = +$("s8_severidad").value;     // 1..10
    const rsp = +$("s8_respuesta").value;     // 1..10
    const escenario = $("s8_escenario").value;

    const impacto = clamp(Math.round(-(sev*6 + (apetito*1.2))), -90, 0);
    const recupMeses = clamp(Math.round(12 + sev - rsp*1.2), 2, 24);
    const impactoResil = clamp(Math.round(-(sev*3 + f*4) + inversion*2), -60, 20);

    $("s8_impacto").textContent = impacto;
    $("s8_recupera").textContent = recupMeses;
    $("s8_resil").textContent = impactoResil;

    if(chartS8Line){
      const normal = [100,102,104,106,108,110,112];

      const drop = clamp(100 - sev*8, 40, 95);
      const slope = clamp(2 + rsp*1.2, 2, 16);

      const event = [100, drop];
      for(let i=2;i<=6;i++){
        const prev = event[i-1];
        event[i] = clamp(prev + slope, 40, 112);
      }

      chartS8Line.data.datasets[0].data = normal;
      chartS8Line.data.datasets[1].data = event;
      chartS8Line.update();
    }

    // Lecciones
    const lessons = [
      `Escenario: ${escenario.replaceAll("_"," ")}.`,
      `Impacto estimado: ${impacto}%. Revisar planes de mitigación.`,
      `Tiempo de recuperación estimado: ${recupMeses} meses.`,
      `Velocidad de respuesta actual: ${rsp}. Mejorar respuesta reduce el tiempo de recuperación.`
    ];
    setList($("s8_lessons"), lessons);

    // Heatmap
    const pEstr = clamp(Math.round(50 + apetito*4 + f*8), 0, 100);
    const iEstr = clamp(Math.round(60 + apetito*3 + f*6), 0, 100);

    const pOper = clamp(Math.round(35 + apetito*2), 0, 100);
    const iOper = clamp(Math.round(45 + sev*2), 0, 100);

    const pCump = clamp(Math.round(25 - inversion*1 + (f>0? 6:0)), 0, 100);
    const iCump = clamp(Math.round(40 + (f>0? 6:0)), 0, 100);

    $("s8_r_estr").textContent = `${pEstr}% / ${iEstr}%`;
    $("s8_r_oper").textContent = `${pOper}% / ${iOper}%`;
    $("s8_r_cump").textContent = `${pCump}% / ${iCump}%`;

    if(chartS8Heat){
      const rEstr = clamp(Math.round((pEstr/10) * (iEstr/10) / 3), 6, 18);
      const rOper = clamp(Math.round((pOper/10) * (iOper/10) / 4), 5, 16);
      const rCump = clamp(Math.round((pCump/10) * (iCump/10) / 5), 4, 14);

      chartS8Heat.data.datasets[0].data = [{ x: iEstr, y: clamp(Math.round(pEstr/12.5), 0, 8), r: rEstr }];
      chartS8Heat.data.datasets[1].data = [{ x: iOper, y: clamp(Math.round(pOper/12.5), 0, 8), r: rOper }];
      chartS8Heat.data.datasets[2].data = [{ x: iCump, y: clamp(Math.round(pCump/12.5), 0, 8), r: rCump }];
      chartS8Heat.update();
    }

    // Acciones recomendadas
    const actions = [
      "Revisar y realinear la estrategia con la misión organizacional.",
      "Fortalecer los controles operativos en procesos críticos.",
      "Implementar un programa de monitoreo de cumplimiento proactivo."
    ];
    setList($("s8_actions"), actions);

    // KPIs finales
    const kResp = clamp(Math.round(50 + rsp*5), 0, 100);
    const kProc = clamp(Math.round(60 + inversion*3 - sev*1.5), 0, 100);
    const kCult = clamp(Math.round(55 + (enfoque==="conservador"? 8: enfoque==="agresivo"? -4: 2)), 0, 100);
    const kErm  = clamp(Math.round(50 + inversion*4 - apetito*1.5), 0, 100);

    $("s8_kpi_resp").textContent = kResp;
    $("s8_kpi_proc").textContent = kProc;
    $("s8_kpi_cult").textContent = kCult;
    $("s8_kpi_erm").textContent  = kErm;

    if(chartS8Kpis){
      chartS8Kpis.data.datasets[0].data = [kResp, kProc, kCult, kErm];
      chartS8Kpis.update();
    }

    if(chartS8Perf){
      const baseRisk = clamp(95 + apetito*0.8 + sev*0.6, 70, 110);
      const riskLine = chartS8Perf.data.datasets[0].data.map((_,i)=> clamp(Math.round(baseRisk - i*1.8), 60, 115));

      const baseReal = clamp(82 + crece*0.2 + inversion*1.2, 70, 110);
      const realLine = chartS8Perf.data.datasets[1].data.map((_,i)=> clamp(Math.round(baseReal + i*1.6 - (sev*0.4)), 60, 120));

      chartS8Perf.data.datasets[0].data = riskLine;
      chartS8Perf.data.datasets[1].data = realLine;
      chartS8Perf.update();
    }
  };

  ["s8_apetito","s8_inversion","s8_severidad","s8_respuesta"].forEach(id=>{
    $(id)?.addEventListener("input", update);
  });
  $("s8_enfoque")?.addEventListener("change", update);
  $("s8_escenario")?.addEventListener("change", update);

  update();
}

/* =========================================================
   BOOT — Arranque global
========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // UI
  initTabs();
  initSearch();
  initToTop();

  // Teoría: gráficos
  initTeoriaCharts();

  // Simulaciones
  initSim1();
  initSim2();
  initSim3();
  initSim4();
  initSim5();
  initSim6();
  initSim7();
  initSim8();
});


