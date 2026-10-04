/* =========================================================
   TERRA2SPACE — script
   1. Data      (add new places here)
   2. Map setup
   3. Markers
   4. Location card
   5. Filters
   ========================================================= */

/* ---------- 1. DATA ----------
   To add a location, copy one object and edit it.
   analogs: any of "mars", "moon", "potential"
   score:   "Project Analog Score" — our own educational number, not a NASA score.
*/
const LOCATIONS = [
  {
    id: "atacama",
    name: "Atakama cho‘li",
    country: "Chili",
    coords: [-24.5, -69.25],
    analogs: ["mars"],
    environment: "Ekstremal cho‘l",
    why: "Uning juda quruq va qattiq muhiti Marsga oid sharoitlarni o‘rganish uchun foydali yerdagi sinov maydonini beradi.",
    science: "Atakamaning ayrim hududlariga yomg‘ir juda kam yog‘adi, tuprog‘i quruq, sho‘r va kuchli quyosh nuri ostida bo‘ladi. Tadqiqotchilar bu yerda hayot, kimyo va uskunalar quruq, qattiq muhitda o‘zini qanday tutishini sinab, Mars haqidagi savollarni aniqlashtiradi.",
    score: 83
  },
  {
    id: "death-valley",
    name: "O‘lim vodiysi",
    country: "Qo‘shma Shtatlar",
    coords: [36.5, -117.1],
    analogs: ["mars"],
    environment: "Issiq cho‘l havzasi",
    why: "Uning quruq relyef shakllari olimlarga cho‘l geologiyasini Marsda ko‘rilgan shakllar bilan solishtirish imkonini beradi.",
    science: "O‘lim vodiysida allyuvial konuslar, sho‘rxoklar va kamdan-kam suv oqimlari hosil qilgan qurigan ko‘l o‘rinlari bor. Bunday relyef Yerda qanday shakllanishini o‘rganish Mars suratlaridagi o‘xshash joylarni talqin qilishga yordam beradi.",
    score: 74
  },
  {
    id: "kilauea",
    name: "Kilauea, Gavayi",
    country: "Qo‘shma Shtatlar",
    coords: [19.42, -155.29],
    analogs: ["moon", "mars"],
    environment: "Faol bazalt vulqoni",
    why: "Bazalt Oy va Marsda keng tarqalgan, shuning uchun Gavayi vulqon maydonlari shunga o‘xshash tog‘ jinsida o‘rganish va sinov o‘tkazish uchun ishlatiladi.",
    science: "Kilauea yangi bazalt lava oqimlari, shlak va kul hosil qiladi. Bunday vulqon relyefi dala tadqiqotlari hamda tadqiqot asboblari va usullarini boshqa olamlar uchun ko‘rib chiqishdan oldin sinash uchun ishlatiladi.",
    score: 80
  },
  {
    id: "lava-beds",
    name: "Lava-Bedz milliy yodgorligi",
    country: "Qo‘shma Shtatlar",
    coords: [41.71, -121.51],
    analogs: ["moon"],
    environment: "Lava tunnellari maydoni",
    why: "Uning lava tunnellari olimlarga Oyda bo‘lishi mumkin bo‘lgan shunga o‘xshash yer osti tunnellari haqida fikr yuritishga yordam beradi.",
    science: "Lava tunnellari lava oqimining tashqi qismi sovib qotganda, ichkarida esa erigan tog‘ jinsi harakatlanishda davom etganda hosil bo‘ladi. Ularni Yerda o‘rganish tadqiqotchilarga Oydagi bunday g‘orlarni qanday tekshirishni rejalashtirishda yordam beradi.",
    score: 71
  },
  {
    id: "iceland",
    name: "Islandiya vulqon hududlari",
    country: "Islandiya",
    coords: [64.9, -18.5],
    analogs: ["moon", "mars"],
    environment: "Vulqon va muzlik relyefi",
    why: "Islandiya bazalt lava maydonlari, vulqon relyef shakllari va muzni birlashtirib, tadqiqotchilarga solishtirish uchun turli xil relyef beradi.",
    science: "Islandiya vulqon jihatidan faol hududda joylashgan: lava maydonlari, vulqon kraterlari va muzliklar yonma-yon turadi. Uning manzaralari geologik tadqiqotlarda ishlatiladi va uzoq vaqtdan beri astronavtlarni dala sharoitida tayyorlashda qo‘llanib kelinadi.",
    score: 78
  }
];

/* Text and CSS names for each analog type */
const LABELS = { mars: "Mars", moon: "Oy", potential: "Potensial" };

/* ---------- 2. MAP SETUP ---------- */
const $ = (id) => document.getElementById(id);

/* If the Leaflet library did not load (offline, blocked CDN), say so
   instead of crashing with "L is not defined". */
if (typeof L === "undefined") {
  $("map").innerHTML =
    '<p style="padding:1.5rem;color:#93a0bd">Xarita kutubxonasini yuklab bo‘lmadi. ' +
    "Internet aloqasini tekshirib, sahifani qayta yuklang.</p>";
  $("count").textContent = "";
  throw new Error("Leaflet (L) is not available");
}

const WORLD = L.latLngBounds([-85, -180], [85, 180]);

const map = L.map("map", {
  center: [25, 0],
  zoom: 2,
  minZoom: 2,
  zoomSnap: 0.25,                 // lets min zoom fit any screen size exactly
  maxBounds: WORLD,               // no dragging into the empty void
  maxBoundsViscosity: 1.0,
  zoomControl: false              // added below, top-right, so the card never covers it
});
L.control.zoom({ position: "topright", zoomInTitle: "Kattalashtirish", zoomOutTitle: "Kichraytirish" }).addTo(map);

/* Keyless basemaps. (The old CARTO URL stamps "API KEY REQUIRED" on every tile
   unless a CARTO key is appended.) The visitor can switch between the two. */
const osmLayer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> hissa qo‘shuvchilari',
  maxZoom: 19,
  noWrap: true,                   // markers exist once, so the world should too
  className: "tiles-osm"          // lets CSS darken only this layer
});

const satelliteLayer = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  attribution: "Tiles &copy; Esri — Esri, Maxar, Earthstar Geographics va GIS User Community",
  maxNativeZoom: 17,              // Esri has no sharper imagery in most places; stretch beyond this
  maxZoom: 19,
  noWrap: true
});

osmLayer.addTo(map);
L.control.layers(
  { "Xarita": osmLayer, "Sun’iy yo‘ldosh": satelliteLayer },
  null,
  { position: "topright", collapsed: false }
).addTo(map);
L.control.scale({ position: "bottomleft", imperial: false }).addTo(map);

/* "My location" button (needs https or localhost; the browser asks permission) */
let me = null;
const LocateControl = L.Control.extend({
  options: { position: "topright" },
  onAdd() {
    const box = L.DomUtil.create("div", "leaflet-bar");
    const btn = L.DomUtil.create("a", "locate-btn", box);
    btn.href = "#";
    btn.setAttribute("role", "button");
    btn.title = "Mening joylashuvim";
    btn.setAttribute("aria-label", "Mening joylashuvim");
    btn.textContent = "◎";
    L.DomEvent.disableClickPropagation(box);
    L.DomEvent.on(btn, "click", (e) => {
      L.DomEvent.preventDefault(e);
      map.locate({ setView: true, maxZoom: 12 });
    });
    return box;
  }
});
new LocateControl().addTo(map);

let msgTimer;
function showMsg(text) {
  $("map-msg").textContent = text;
  $("map-msg").hidden = false;
  clearTimeout(msgTimer);
  msgTimer = setTimeout(() => { $("map-msg").hidden = true; }, 4500);
}
map.on("locationfound", (e) => {
  if (me) me.remove();
  me = L.circleMarker(e.latlng, {
    radius: 8, color: "#ffffff", weight: 3, fillColor: "#4a97ff", fillOpacity: 1
  }).addTo(map);
});
map.on("locationerror", () =>
  showMsg("Joylashuvingizni aniqlab bo‘lmadi. Brauzerda ruxsat bering va saytni https orqali oching."));

/* If tiles cannot be fetched (offline, blocked, or opened from file://), say so */
let tileErrors = 0;
function watchTiles(layer) {
  layer.on("tileload", () => { tileErrors = 0; $("tile-error").hidden = true; });
  layer.on("tileerror", () => { if (++tileErrors >= 3) $("tile-error").hidden = false; });
}
watchTiles(osmLayer);
watchTiles(satelliteLayer);

/* Keep the minimum zoom just large enough that the world fills the map box.
   Runs on load and whenever the map box changes size (rotate, resize, mobile bars). */
function fitMinZoom() {
  map.invalidateSize();
  const min = Math.max(0, map.getBoundsZoom(WORLD, true));
  map.setMinZoom(min);
  if (map.getZoom() < min) map.setZoom(min);
}
map.on("resize", fitMinZoom);
if ("ResizeObserver" in window) {
  new ResizeObserver(() => map.invalidateSize()).observe($("map"));
}
window.addEventListener("load", () => map.invalidateSize());
fitMinZoom();

/* ---------- 3. MARKERS ---------- */
const markerLayer = L.layerGroup().addTo(map);
const markers = {};          // id -> Leaflet marker
let selectedId = null;

/* Pick the CSS class for a location's marker color */
function pinClass(loc) {
  if (loc.analogs.includes("mars") && loc.analogs.includes("moon")) return "pin-dual";
  return "pin-" + loc.analogs[0];
}

function makeIcon(loc, isSelected) {
  return L.divIcon({
    className: "pin-wrap",
    html: `<span class="pin ${pinClass(loc)} ${isSelected ? "is-selected" : ""}"></span>`,
    iconSize: [36, 36],      // 36px tap target, 20px visible dot
    iconAnchor: [18, 18]
  });
}

LOCATIONS.forEach((loc) => {
  const marker = L.marker(loc.coords, {
    icon: makeIcon(loc, false),
    title: loc.name,
    alt: loc.name
  });
  marker.on("click", () => selectLocation(loc.id));
  // Leaflet only sets aria-label-like text on image icons, so add it for div icons
  marker.on("add", () => {
    const el = marker.getElement();
    if (el) el.setAttribute("aria-label", loc.name + " — " + analogLabel(loc));
  });
  markers[loc.id] = marker;
});

/* Clicking empty map closes the card */
map.on("click", closeCard);

/* Toggle the "selected" look on a marker without rebuilding its element
   (rebuilding drops keyboard focus and restarts hover/click state). */
function highlight(id, on) {
  const el = id && markers[id] && markers[id].getElement();
  const pin = el && el.querySelector(".pin");
  if (pin) pin.classList.toggle("is-selected", on);
}

/* ---------- 4. LOCATION CARD ---------- */
const card = $("card");

function analogLabel(loc) {
  if (loc.analogs.includes("potential")) return "Potensial analog";
  const names = loc.analogs.map((a) => LABELS[a]);
  return names.join(" va ") + " analogi";
}

function selectLocation(id) {
  const loc = LOCATIONS.find((l) => l.id === id);
  if (!loc) return;

  // Update marker highlight
  highlight(selectedId, false);
  selectedId = id;
  highlight(id, true);

  // Fill the card
  $("card-tag").textContent = analogLabel(loc);
  $("card-name").textContent = loc.name;
  $("card-country").textContent = loc.country;
  $("card-env").textContent = loc.environment;
  $("card-why").textContent = loc.why;
  $("card-science").textContent = loc.science;
  $("card-score").textContent = loc.score;

  // Animate the score bar from empty
  const bar = $("card-bar");
  bar.style.width = "0%";
  requestAnimationFrame(() => requestAnimationFrame(() => {
    bar.style.width = loc.score + "%";
  }));

  card.hidden = false;
  card.scrollTop = 0;
  centerOn(loc.coords);
}

function closeCard() {
  card.hidden = true;
  highlight(selectedId, false);
  selectedId = null;
}

$("card-close").addEventListener("click", closeCard);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeCard();
});

/* Move the map so the marker sits in the middle of the area the card
   leaves free (right of the card on desktop, above it on phones). */
const phoneQuery = window.matchMedia("(max-width: 640px)");

function centerOn(coords) {
  const zoom = Math.max(map.getZoom(), 4);
  const point = map.project(coords, zoom);
  const shift = phoneQuery.matches
    ? L.point(0, card.offsetHeight / 2)                       // card covers the bottom
    : L.point(-(card.offsetLeft + card.offsetWidth) / 2, 0);  // card covers the left
  map.flyTo(map.unproject(point.add(shift), zoom), zoom, { duration: 0.8 });
}

/* ---------- 5. FILTERS ---------- */
const chips = document.querySelectorAll(".chip");
let activeFilter = "all";

function applyFilter(filter, animate = true) {
  activeFilter = filter;

  // Button states
  chips.forEach((chip) => {
    const on = chip.dataset.filter === filter;
    chip.classList.toggle("is-active", on);
    chip.setAttribute("aria-pressed", String(on));
  });

  // Which locations match?
  const visible = LOCATIONS.filter(
    (loc) => filter === "all" || loc.analogs.includes(filter)
  );

  // Show/hide markers (only touch the ones that changed, so the open one keeps its highlight)
  LOCATIONS.forEach((loc) => {
    const show = visible.includes(loc);
    const has = markerLayer.hasLayer(markers[loc.id]);
    if (show && !has) markerLayer.addLayer(markers[loc.id]);
    if (!show && has) markerLayer.removeLayer(markers[loc.id]);
  });

  // Close the card if its location was filtered out
  if (selectedId && !visible.some((l) => l.id === selectedId)) closeCard();

  // Count + empty message
  $("count").textContent =
    visible.length + " ta joy";
  $("empty").hidden = visible.length > 0;

  // Zoom to fit what is shown
  if (visible.length > 0) {
    const bounds = L.latLngBounds(visible.map((l) => l.coords));
    const opts = { padding: [60, 60], maxZoom: 4 };
    if (animate) map.flyToBounds(bounds, { ...opts, duration: 0.8 });
    else map.fitBounds(bounds, { ...opts, animate: false });
  } else {
    const z = Math.max(2, map.getMinZoom());
    if (animate) map.flyTo([25, 0], z, { duration: 0.8 });
    else map.setView([25, 0], z, { animate: false });
  }
}

chips.forEach((chip) => {
  chip.addEventListener("click", () => applyFilter(chip.dataset.filter));
});

/* Start with everything visible */
applyFilter("all", false);
