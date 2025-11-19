// Tabs
const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    tabButtons.forEach((b) => b.classList.remove("active"));
    tabContents.forEach((c) => c.classList.remove("active"));

    btn.classList.add("active");
    const targetId = btn.getAttribute("data-target");
    document.getElementById(targetId).classList.add("active");

    // Fix map display after tab switch
    setTimeout(() => {
      mapCH.invalidateSize();
      mapUAE.invalidateSize();
    }, 80);
  });
});

// Municipality data (approximate real-world values)
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

function formatForecastDateTime() {
  const now = new Date();

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  const day = String(now.getDate()).padStart(2, "0");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
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

// Base layers: light gray canvas and satellite imagery
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
  zoom: 7,
  layers: [lightGray],
});

const baseMapsCH = {
  "Light gray": lightGray,
  Satellite: worldImagery,
};
L.control.layers(baseMapsCH, null, { position: "topright" }).addTo(mapCH);

// UAE map
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
  [26, 56], // NW
  [24, 51] // SE
);

const mapUAE = L.map("map-uae", {
  center: [30.5, 54],
  zoom: 8.5,
  layers: [lightGray2],
  maxBounds: uaeBounds.pad(0.05),
  maxBoundsViscosity: 1.0,
  minZoom: 7,
});

const baseMapsUAE = {
  "Light gray": lightGray2,
  Satellite: worldImagery2,
};
L.control.layers(baseMapsUAE, null, { position: "topright" }).addTo(mapUAE);

// Fit to UAE only (no global view)
mapUAE.fitBounds(uaeBounds);

// Simple illustrative municipality polygons, non-square contours
const switzerlandMunicipalities = {
  type: "FeatureCollection",
  features: [
    {
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
    },
    {
      type: "Feature",
      properties: { id: "geneva", name: "Genève" },
      geometry: {
        type: "Polygon",
        coordinates: [
          [
            [6.08, 46.16],
            [6.18, 46.15],
            [6.23, 46.19],
            [6.21, 46.24],
            [6.13, 46.26],
            [6.07, 46.21],
            [6.08, 46.16],
          ],
        ],
      },
    },
  ],
};

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

const swissLayers = {};
const uaeLayers = {};

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

const swissGeo = L.geoJSON(switzerlandMunicipalities, {
  onEachFeature: onSwissFeature,
}).addTo(mapCH);
mapCH.fitBounds(swissGeo.getBounds());

const uaeGeo = L.geoJSON(uaeMunicipalities, {
  onEachFeature: onUaeFeature,
}).addTo(mapUAE);

// Buttons -> map + info sync
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

// Initialize default selections
updateMunicipalityInfo("ch", "zurich");
updateMunicipalityInfo("uae", "dubai");

// Initialize and refresh forecast date/times
updateForecastDateTimes();
setInterval(updateForecastDateTimes, 60 * 1000);
