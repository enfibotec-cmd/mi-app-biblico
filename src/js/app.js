"use strict";

/* ===== Selector Bíblico — lógica principal ===== */

const RUTA_DATOS = "data/biblia.json";
const LS_FAV  = "selector-biblico:favoritos";
const LS_TEMA = "selector-biblico:tema";

let BIBLIA = null;  // datos cargados desde el JSON
let actual = null;  // versículo actualmente en pantalla

/* Referencias al DOM */
const bookSel  = $("book");
const chapSel  = $("chapter");
const verSel   = $("verse");
const display  = $("verseDisplay");
const favList  = $("favList");
const themeBtn = $("themeToggle");

/* ============ CARGA Y VALIDACIÓN DE DATOS ============ */

async function cargarDatos() {
  const res = await fetch(RUTA_DATOS);
  if (!res.ok) throw new Error(`Error HTTP ${res.status} al leer ${RUTA_DATOS}`);
  const json = await res.json();
  validarDatos(json);
  return json;
}

/** Valida la estructura del dataset antes de usarlo (calidad de datos). */
function validarDatos(json) {
  const errores = [];

  if (!json || typeof json !== "object") errores.push("El archivo no contiene un objeto JSON válido.");
  if (!json.libros || typeof json.libros !== "object") errores.push("Falta la clave principal \"libros\".");
  if (errores.length) throw new Error(errores.join(" "));

  for (const [libro, capitulos] of Object.entries(json.libros)) {
    if (typeof capitulos !== "object" || capitulos === null) {
      errores.push(`El libro "${libro}" no tiene capítulos válidos.`);
      continue;
    }
    for (const [cap, versiculos] of Object.entries(capitulos)) {
      if (!/^\d+$/.test(cap)) { errores.push(`Capítulo no numérico en ${libro}: "${cap}".`); continue; }
      for (const [num, texto] of Object.entries(versiculos)) {
        if (!/^\d+$/.test(num)) errores.push(`Versículo no numérico en ${libro} ${cap}: "${num}".`);
        if (typeof texto !== "string" || texto.trim() === "") errores.push(`Texto vacío en ${libro} ${cap}:${num}.`);
      }
    }
  }
  if (errores.length) {
    throw new Error("Datos con problemas → " + errores.slice(0, 3).join(" | "));
  }
}

/* ============ SELECTORES EN CASCADA ============ */

/** Llena un <select> creando nodos (sin innerHTML) y con DocumentFragment (rápido). */
function llenarSelect(select, valores, lugar) {
  const frag = document.createDocumentFragment();

  const vacia = document.createElement("option");
  vacia.value = "";
  vacia.textContent = lugar;
  frag.appendChild(vacia);

  for (const v of valores) {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    frag.appendChild(opt);
  }

  select.textContent = "";
  select.appendChild(frag);
}

function iniciarSelectores() {
  llenarSelect(bookSel, Object.keys(BIBLIA), "— Libro —");
  llenarSelect(chapSel, [], "— Capítulo —");
  llenarSelect(verSel, [], "— Versículo —");
}

bookSel.addEventListener("change", () => {
  const libro = bookSel.value;
  llenarSelect(chapSel, libro ? Object.keys(BIBLIA[libro]).map(Number) : [], "— Capítulo —");
  llenarSelect(verSel, [], "— Versículo —");
  limpiarAviso();
});

chapSel.addEventListener("change", () => {
  const libro = bookSel.value, cap = chapSel.value;
  llenarSelect(verSel, (libro && cap) ? Object.keys(BIBLIA[libro][cap]).map(Number) : [], "— Versículo —");
  limpiarAviso();
});

/* ============ MOSTRAR Y ALEATORIO ============ */

function pintarVersiculo(libro, cap, vers) {
  const texto = BIBLIA[libro][cap][vers];
  actual = { libro, cap, vers, texto };

  display.textContent = "";
  display.appendChild(crearElemento("span", "ref verso-nuevo", `${libro} ${cap}:${vers}`));
  display.appendChild(crearElemento("span", "texto verso-nuevo", texto));
}

$("showBtn").addEventListener("click", () => {
  if (!BIBLIA) { avisar("Los datos aún no están disponibles."); return; }
  const libro = bookSel.value, cap = chapSel.value, vers = verSel.value;
  if (!libro || !cap || !vers) { avisar("⚠️ Elige libro, capítulo y versículo antes de mostrar."); return; }
  limpiarAviso();
  pintarVersiculo(libro, cap, vers);
});

$("randomBtn").addEventListener("click", () => {
  if (!BIBLIA) { avisar("Los datos aún no están disponibles."); return; }
  const libro = elegir(Object.keys(BIBLIA));
  const cap   = elegir(Object.keys(BIBLIA[libro]));
  const vers  = elegir(Object.keys(BIBLIA[libro][cap]));

  bookSel.value = libro;
  llenarSelect(chapSel, Object.keys(BIBLIA[libro]).map(Number), "— Capítulo —");
  chapSel.value = cap;
  llenarSelect(verSel, Object.keys(BIBLIA[libro][cap]).map(Number), "— Versículo —");
  verSel.value = vers;

  limpiarAviso();
  pintarVersiculo(libro, cap, vers);
});

/* ============ COPIAR ============ */

$("copyBtn").addEventListener("click", async () => {
  if (!actual) { avisar("No hay versículo en pantalla para copiar."); return; }
  const texto = `«${actual.texto}» (${actual.libro} ${actual.cap}:${actual.vers})`;
  try {
    await copiarAlPortapapeles(texto);
    avisar("📋 Versículo copiado al portapapeles.", "ok");
  } catch {
    avisar("No se pudo copiar automáticamente. Selecciona el texto de forma manual.");
  }
});

/* ============ FAVORITOS ============ */

$("favBtn").addEventListener("click", () => {
  if (!actual) { avisar("Primero muestra un versículo para poder guardarlo."); return; }
  const favs = leerStorage(LS_FAV, []);
  const clave = `${actual.libro}|${actual.cap}|${actual.vers}`;

  if (favs.some(f => f.clave === clave)) { avisar("Ese versículo ya está en favoritos.", "ok"); return; }

  favs.push({ clave, libro: actual.libro, cap: actual.cap, vers: actual.vers, texto: actual.texto });
  if (!guardarStorage(LS_FAV, favs)) { avisar("No se pudo guardar en este navegador."); return; }

  pintarFavoritos();
  avisar("⭐ Guardado en favoritos.", "ok");
});

function pintarFavoritos() {
  const favs = leerStorage(LS_FAV, []);
  favList.textContent = "";

  if (!favs.length) {
    favList.appendChild(crearElemento("li", "vacio",
      "Aún no hay favoritos. Muestra un pasaje y pulsa ⭐ Guardar."));
    return;
  }

  const frag = document.createDocumentFragment();
  favs.forEach((f, i) => {
    const li = document.createElement("li");

    const abrir = crearElemento("button", "fav-load", `📖 ${f.libro} ${f.cap}:${f.vers}`);
    abrir.type = "button";
    abrir.dataset.i = i;
    abrir.title = `Abrir ${f.libro} ${f.cap}:${f.vers}`;

    const quitar = crearElemento("button", "fav-del", "✕");
    quitar.type = "button";
    quitar.dataset.del = i;
    quitar.setAttribute("aria-label", `Eliminar ${f.libro} ${f.cap}:${f.vers} de favoritos`);

    li.append(abrir, quitar);
    frag.appendChild(li);
  });
  favList.appendChild(frag);
}

/* Delegación de eventos: un solo listener para toda la lista (eficiente). */
favList.addEventListener("click", (e) => {
  const favs = leerStorage(LS_FAV, []);
  const cargar = e.target.closest("[data-i]");
  const borrar = e.target.closest("[data-del]");

  if (cargar) {
    const f = favs[Number(cargar.dataset.i)];
    if (!f) return;
    bookSel.value = f.libro;
    llenarSelect(chapSel, Object.keys(BIBLIA[f.libro]).map(Number), "— Capítulo —");
    chapSel.value = f.cap;
    llenarSelect(verSel, Object.keys(BIBLIA[f.libro][f.cap]).map(Number), "— Versículo —");
    verSel.value = f.vers;
    limpiarAviso();
    pintarVersiculo(f.libro, f.cap, f.vers);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (borrar) {
    favs.splice(Number(borrar.dataset.del), 1);
    guardarStorage(LS_FAV, favs);
    pintarFavoritos();
  }
});

/* ============ TEMA CLARO / OSCURO ============ */

function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  themeBtn.textContent = tema === "dark" ? "☀️ Claro" : "🌙 Oscuro";
  themeBtn.setAttribute("aria-label",
    tema === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro");
  localStorage.setItem(LS_TEMA, tema);
}

themeBtn.addEventListener("click", () => {
  const nuevo = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  aplicarTema(nuevo);
});

function aplicarTemaInicial() {
  const guardado = localStorage.getItem(LS_TEMA);
  const prefiereOscuro = window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  aplicarTema(guardado || (prefiereOscuro ? "dark" : "light"));
}

/* ============ ESTADÍSTICAS DEL DATASET ============ */

function pintarEstadisticas(meta) {
  let capitulos = 0, versiculos = 0;
  for (const caps of Object.values(BIBLIA)) {
    const lista = Object.values(caps);
    capitulos += lista.length;
    for (const v of lista) versiculos += Object.keys(v).length;
  }
  const fuente = meta && meta.fuente ? ` · ${meta.fuente}` : "";
  $("stats").textContent =
    `${Object.keys(BIBLIA).length} libros · ${capitulos} capítulos · ${versiculos} versículos${fuente}`;
}

/* ============ INICIO ============ */

async function iniciar() {
  aplicarTemaInicial();

  display.textContent = "";
  display.appendChild(crearElemento("span", "placeholder cargando", "Cargando datos…"));

  try {
    const json = await cargarDatos();
    BIBLIA = json.libros;
    iniciarSelectores();
    pintarFavoritos();
    pintarEstadisticas(json.meta);
    display.textContent = "";
    display.appendChild(crearElemento("span", "placeholder",
      "Selecciona un libro, capítulo y versículo para comenzar…"));
    limpiarAviso();
  } catch (err) {
    display.textContent = "";
    display.appendChild(crearElemento("span", "placeholder", "No se pudieron cargar los datos."));
    avisar("⚠️ " + err.message);
    if (location.protocol === "file:") $("ayudaLocal").hidden = false;
  }
}

iniciar();
