// =======================
// Tabs + Gantt handling
// =======================

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));

    btn.classList.add("active");
    const targetId = btn.getAttribute("data-target");
    document.getElementById(targetId).classList.add("active");

    // If we switched to the Gantt tab, render it
    if (targetId === "tab-3") {
      ensureGanttRendered();
    }

    // Fix map display after tab switch
    setTimeout(() => {
      mapCH.invalidateSize();
      mapUAE.invalidateSize();
    }, 80);
  });
});

// =======================
// Municipality data (info panel values)
// =======================

const municipalityData = {
  ch: {
    zurich: {
      name: "Zürich",
      area: "87.9",
      population: "448,664",
      schools: "1,170",
    },
    geneva: {
      name: "Genève",
      area: "16.0",
      population: "203,856",
      schools: "599",
    },
  },
  uae: {
    dubai: {
      name: "Dubai",
      area: "4,771",
      population: "3,655,000",
      schools: "220",
    },
    abudhabi: {
      name: "Abu Dhabi",
      area: "972",
      population: "1,567,000",
      schools: "369",
    },
  },
};

function updateMunicipalityInfo(country, id) {
  const data = municipalityData[country] && municipalityData[country][id];
  if (!data) return;

  if (country === "ch") {
    document.getElementById("ch-name").textContent = data.name;
    document.getElementById("ch-area").textContent = data.area;
    document.getElementById("ch-population").textContent = data.population;
    document.getElementById("ch-schools").textContent = data.schools;

    const buttons = document.querySelectorAll(
      '.municipality-button[data-country="ch"]'
    );
    buttons.forEach((b) =>
      b.classList.toggle("selected", b.getAttribute("data-id") === id)
    );
  } else if (country === "uae") {
    document.getElementById("uae-name").textContent = data.name;
    document.getElementById("uae-area").textContent = data.area;
    document.getElementById("uae-population").textContent = data.population;
    document.getElementById("uae-schools").textContent = data.schools;

    const buttons = document.querySelectorAll(
      '.municipality-button[data-country="uae"]'
    );
    buttons.forEach((b) =>
      b.classList.toggle("selected", b.getAttribute("data-id") === id)
    );
  }
}

// =======================
// Time / forecast label
// =======================

function formatForecastDateTime() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = monthNames[now.getMonth()];
  const year = now.getFullYear();

  return `Current local time ${hours}:${minutes}, ${day} ${month} ${year}`;
}

function updateForecastDateTimes() {
  const formatted = formatForecastDateTime();
  const elCH = document.getElementById("forecast-datetime-ch");
  const elUAE = document.getElementById("forecast-datetime-uae");
  if (elCH) elCH.textContent = formatted;
  if (elUAE) elUAE.textContent = formatted;
}

// =======================
// Base layers: light gray canvas and satellite imagery
// =======================

const lightGray = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles © Esri — Esri, DeLorme, NAVTEQ",
    maxZoom: 18,
  }
);

const worldImagery = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxZoom: 18,
  }
);

// Switzerland map
const mapCH = L.map("map-ch", {
  center: [46.8, 8.2],
  zoom: 8,
  minZoom: 8,
  layers: [lightGray],
});

const baseMapsCH = {
  "Light gray": lightGray,
  Satellite: worldImagery,
};
L.control.layers(baseMapsCH, null, { position: "topright" }).addTo(mapCH);

// UAE base layers
const lightGray2 = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  {
    attribution: "Tiles © Esri — Esri, DeLorme, NAVTEQ",
    maxZoom: 18,
  }
);

const worldImagery2 = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    maxZoom: 18,
  }
);

// Bounds to keep the UAE centered and avoid global view
const uaeBounds = L.latLngBounds(
  [26, 58], // NW
  [23, 51] // SE
);

const mapUAE = L.map("map-uae", {
  center: [27, 54],
  zoom: 9.5,
  layers: [lightGray2],
  maxBounds: uaeBounds.pad(0.05),
  maxBoundsViscosity: 1.0,
  minZoom: 8,
});

const baseMapsUAE = {
  "Light gray": lightGray2,
  Satellite: worldImagery2,
};
L.control.layers(baseMapsUAE, null, { position: "topright" }).addTo(mapUAE);

// Fit to UAE only (no global view)
mapUAE.fitBounds(uaeBounds);

// =======================
// Switzerland + UAE polygons
// =======================

// Zürich feature (hard-coded)
const zurichFeature = {
  type: "Feature",
  properties: { id: "zurich", name: "Zürich" },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [8.46, 47.33],
        [8.55, 47.32],
        [8.63, 47.36],
        [8.6, 47.44],
        [8.5, 47.46],
        [8.46, 47.4],
        [8.46, 47.33],
      ],
    ],
  },
};

// Start Switzerland collection with Zürich only; Geneva will be added from geneva.json
const switzerlandMunicipalities = {
  type: "FeatureCollection",
  features: [zurichFeature],
};

const swissLayers = {};
let swissGeo;

const uaeMunicipalities = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { id: "dubai", name: "Dubai" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [55.18, 25.17],
            [55.3, 25.15],
            [55.37, 25.22],
            [55.33, 25.29],
            [55.22, 25.31],
            [55.17, 25.24],
            [55.18, 25.17],
          ],
        ],
      },
    },
    {
      type: "Feature",
      properties: { id: "abudhabi", name: "Abu Dhabi" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [54.25, 24.35],
            [54.45, 24.32],
            [54.55, 24.42],
            [54.5, 24.57],
            [54.32, 24.62],
            [54.23, 24.48],
            [54.25, 24.35],
          ],
        ],
      },
    },
  ],
};

const uaeLayers = {};

// =======================
// Styles + interaction
// =======================

function municipalityStyle() {
  return {
    color: "#b71c1c",
    weight: 2,
    fillColor: "#ef5350",
    fillOpacity: 0.2, // lighter fill for base
  };
}

function municipalityHighlightStyle() {
  return {
    weight: 3,
    fillOpacity: 0.55, // stronger semi-transparent red when highlighted
  };
}

function resetSwissStyles() {
  Object.values(swissLayers).forEach((layer) =>
    layer.setStyle(municipalityStyle())
  );
}

function resetUaeStyles() {
  Object.values(uaeLayers).forEach((layer) =>
    layer.setStyle(municipalityStyle())
  );
}

function onSwissFeature(feature, layer) {
  const id = feature.properties.id;
  swissLayers[id] = layer;
  layer.setStyle(municipalityStyle());
  layer.on("click", () => {
    resetSwissStyles();
    layer.setStyle({
      ...municipalityStyle(),
      ...municipalityHighlightStyle(),
    });
    updateMunicipalityInfo("ch", id);
  });
}

function onUaeFeature(feature, layer) {
  const id = feature.properties.id;
  uaeLayers[id] = layer;
  layer.setStyle(municipalityStyle());
  layer.on("click", () => {
    resetUaeStyles();
    layer.setStyle({
      ...municipalityStyle(),
      ...municipalityHighlightStyle(),
    });
    updateMunicipalityInfo("uae", id);
  });
}

// =======================
// Load Geneva from external geneva.json
// =======================

fetch("geneva.json")
  .then((res) => res.json())
  .then((genevaFeature) => {
    // If geneva.json is a FeatureCollection, take the first feature
    if (genevaFeature.type === "FeatureCollection") {
      genevaFeature = genevaFeature.features[0];
    }

    genevaFeature.properties = genevaFeature.properties || {};
    genevaFeature.properties.id = "geneva";
    genevaFeature.properties.name = "Genève";

    // Add to FeatureCollection
    switzerlandMunicipalities.features.push(genevaFeature);

    // Create the Leaflet GeoJSON layer now that we have both municipalities
    swissGeo = L.geoJSON(switzerlandMunicipalities, {
      onEachFeature: onSwissFeature,
    }).addTo(mapCH);

    mapCH.fitBounds(swissGeo.getBounds());
  })
  .catch((err) => {
    console.error("Failed to load Geneva GeoJSON:", err);
  });

// =======================
// UAE polygons layer
// =======================

const uaeGeo = L.geoJSON(uaeMunicipalities, {
  onEachFeature: onUaeFeature,
}).addTo(mapUAE);

// =======================
// Buttons -> map + info sync
// =======================

function setupMunicipalityButtons(country, layers, map) {
  const buttons = document.querySelectorAll(
    '.municipality-button[data-country="' + country + '"]'
  );

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");

      // Update stats / info
      updateMunicipalityInfo(country, id);

      // Highlight polygon and zoom
      const layer = layers[id];
      if (layer) {
        if (country === "ch") resetSwissStyles();
        if (country === "uae") resetUaeStyles();
        layer.setStyle({
          ...municipalityStyle(),
          ...municipalityHighlightStyle(),
        });
        map.fitBounds(layer.getBounds(), { maxZoom: 11 });
      }
    });
  });
}

setupMunicipalityButtons("ch", swissLayers, mapCH);
setupMunicipalityButtons("uae", uaeLayers, mapUAE);

// =======================
// Init default selections + time labels
// =======================

updateMunicipalityInfo("ch", "zurich");
updateMunicipalityInfo("uae", "dubai");

updateForecastDateTimes();
setInterval(updateForecastDateTimes, 60 * 1000);

// =======================
// Gantt definition
// =======================

const ganttTasks = [
  {
    name: "Historical weather data collection",
    start: "2026-01-01",
    end: "2026-01-15",
  },
  {
    name: "Radar & Satellite weather data collection",
    start: "2026-01-15",
    end: "2026-02-01",
  },
    {
    name: "Extreme rainfall assessment",
    start: "2026-02-01",
    end: "2026-02-15",
  },
  {
    name: "Predictive model setup",
    start: "2026-02-15",
    end: "2026-03-15",
  },
  {
    name: "Predictive model calibration",
    start: "2026-03-10",
    end: "2026-04-05",
  },
  {
    name: "Test phase with real-time weather data",
    start: "2026-04-01",
    end: "2026-07-01",
  },
  {
    name: "User API development",
    start: "2026-07-01",
    end: "2026-07-15",
  },
  {
    name: "Deployment",
    start: "2026-07-15",
    end: "2026-09-01",
  },
];

function renderGantt(tasks) {
  const container = document.getElementById("gantt-container");
  if (!container || !tasks || tasks.length === 0) return;

  // Convert date strings to Date objects
  const parseDate = (str) => new Date(str + "T00:00:00");

  const dates = tasks.flatMap((t) => [parseDate(t.start), parseDate(t.end)]);
  const minDate = new Date(Math.min.apply(null, dates));
  const maxDate = new Date(Math.max.apply(null, dates));
  const oneDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.max(1, Math.round((maxDate - minDate) / oneDay));

  container.innerHTML = "";

  tasks.forEach((task) => {
    const start = parseDate(task.start);
    const end = parseDate(task.end);

    const offsetDays = Math.max(0, Math.round((start - minDate) / oneDay));
    const durationDays = Math.max(1, Math.round((end - start) / oneDay));

    const offsetPct = (offsetDays / totalDays) * 100;
    const widthPct = (durationDays / totalDays) * 100;

    const row = document.createElement("div");
    row.className = "gantt-row";

    const label = document.createElement("div");
    label.className = "gantt-task-label";
    label.textContent = task.name;

    // NEW: date label above the bar
    const dateLabel = document.createElement("div");
    dateLabel.className = "gantt-bar-dates";
    dateLabel.style.marginLeft = offsetPct + "%";
    dateLabel.style.width = widthPct + "%";
    dateLabel.textContent = `${task.start} → ${task.end}`;

    const bar = document.createElement("div");
    bar.className = "gantt-bar";
    bar.style.marginLeft = offsetPct + "%";
    bar.style.width = widthPct + "%";
    bar.setAttribute("data-dates", `${task.start} → ${task.end}`);

    row.appendChild(label);
    row.appendChild(dateLabel);
    row.appendChild(bar);
    container.appendChild(row);
  });
}

let ganttRendered = false;

function ensureGanttRendered() {
  if (ganttRendered) return;
  renderGantt(ganttTasks);
  ganttRendered = true;
}

// If Gantt tab is initially active on page load
if (document.getElementById("tab-3")?.classList.contains("active")) {
  ensureGanttRendered();
}
