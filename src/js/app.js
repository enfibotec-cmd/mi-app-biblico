"use strict";

const LS_FAV  = "selector-biblico:favoritos";
const LS_TEMA = "selector-biblico:tema";
let actual = null;

const bookSel  = $("book");
const chapSel  = $("chapter");
const verSel   = $("verse");
const display  = $("verseDisplay");
const favList  = $("favList");
const themeBtn = $("themeToggle");

/* --- Selectores --- */
function llenarSelect(select, valores, lugar) {
  select.innerHTML = `<option value="">${lugar}</option>` +
    valores.map(v => `<option value="${v}">${v}</option>`).join("");
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

/* --- Mostrar / Aleatorio --- */
function pintarVersiculo(libro, cap, vers) {
  const texto = BIBLIA[libro][cap][vers];
  actual = { libro, cap, vers, texto };
  // Usamos textContent para el texto (seguro) e innerHTML solo para la etiqueta ref
  display.innerHTML = `<span class="ref">${libro} ${cap}:${vers}</span>`;
  const spanTexto = document.createElement("span");
  spanTexto.textContent = texto; 
  display.appendChild(spanTexto);
}

$("showBtn").addEventListener("click", () => {
  if (!BIBLIA) { avisar("Los datos aún no están disponibles."); return; }
  const libro = bookSel.value, cap = chapSel.value, vers = verSel.value;
  if (!libro || !cap || !vers) { avisar("Completa libro, capítulo y versículo para mostrar el pasaje."); return; }
  limpiarAviso();
  pintarVersiculo(libro, cap, vers);
});

$("randomBtn").addEventListener("click", () => {
  if (!BIBLIA) { avisar("Los datos aún no están disponibles."); return; }
  const libro = elegirAlAzar(Object.keys(BIBLIA));
  const cap   = elegirAlAzar(Object.keys(BIBLIA[libro]));
  const vers  = elegirAlAzar(Object.keys(BIBLIA[libro][cap]));

  bookSel.value = libro;
  llenarSelect(chapSel, Object.keys(BIBLIA[libro]).map(Number), "— Capítulo —");
  chapSel.value = cap;
  llenarSelect(verSel, Object.keys(BIBLIA[libro][cap]).map(Number), "— Versículo —");
  verSel.value = vers;

  limpiarAviso();
  pintarVersiculo(libro, cap, vers);
});

/* --- Copiar --- */
$("copyBtn").addEventListener("click", async () => {
  if (!actual) { avisar("No hay versículo para copiar todavía."); return; }
  const texto = `«${actual.texto}» — ${actual.libro} ${actual.cap}:${actual.vers}`;
  try {
    await copiarAlPortapapeles(texto);
    avisar("Copiado al portapapeles.", true);
  } catch {
    avisar("No se pudo copiar automáticamente.");
  }
});

/* --- Favoritos --- */
$("favBtn").addEventListener("click", () => {
  if (!actual) { avisar("Primero muestra un versículo antes de guardarlo."); return; }
  const favs = leerStorage(LS_FAV, []);
  const clave = `${actual.libro}|${actual.cap}|${actual.vers}`;
  if (favs.some(f => f.clave === clave)) { avisar("Ese versículo ya está en favoritos.", true); return; }

  favs.push({ clave, libro: actual.libro, cap: actual.cap, vers: actual.vers, texto: actual.texto });
  guardarStorage(LS_FAV, favs);
  pintarFavoritos();
  avisar("Guardado en favoritos.", true);
});

function pintarFavoritos() {
  const favs = leerStorage(LS_FAV, []);
  if (!favs.length) {
    favList.innerHTML = '<li class="empty">Aún no hay favoritos guardados.</li>';
    return;
  }
  favList.innerHTML = favs.map((f, i) => `
    <li>
      <button type="button" class="load" data-i="${i}" title="Ver este versículo">${f.libro} ${f.cap}:${f.vers}</button>
      <button type="button" class="del" data-del="${i}" aria-label="Quitar de favoritos">✖</button>
    </li>`).join("");
}

favList.addEventListener("click", (e) => {
  const favs = leerStorage(LS_FAV, []);
  const load = e.target.closest("[data-i]");
  const del  = e.target.closest("[data-del]");

  if (load) {
    const f = favs[Number(load.dataset.i)];
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
  if (del) {
    favs.splice(Number(del.dataset.del), 1);
    guardarStorage(LS_FAV, favs);
    pintarFavoritos();
  }
});

/* --- Tema --- */
function aplicarTema(tema) {
  document.documentElement.setAttribute("data-theme", tema);
  themeBtn.textContent = tema === "dark" ? "☀️ Claro" : "🌙 Oscuro";
  localStorage.setItem(LS_TEMA, tema);
}

themeBtn.addEventListener("click", () => {
  const nuevo = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
  aplicarTema(nuevo);
});

/* --- Inicio --- */
async function iniciar() {
  const temaGuardado = localStorage.getItem(LS_TEMA);
  const prefiereOscuro = window.matchMedia("(prefers-color-scheme: dark)").matches;
  aplicarTema(temaGuardado || (prefiereOscuro ? "dark" : "light"));

  display.innerHTML = '<span class="cargando">Cargando datos…</span>';

  try {
    await cargarBiblia(); // Viene de data.js
    iniciarSelectores();
    pintarFavoritos();
    display.innerHTML = "Selecciona un libro, capítulo y versículo para comenzar.";
    limpiarAviso();

    if (META_DATOS.fuente) {
      $("stats").textContent = `Datos incluidos como muestra representativa (${META_DATOS.fuente}).`;
    }
  } catch (err) {
    display.innerHTML = "No se pudieron cargar los datos.";
    avisar(err.message);

    // Si está en file://, mostramos ayuda para que no parezca roto
    if (location.protocol === "file:") {
      const ayuda = $("ayudaLocal");
      if (ayuda) ayuda.hidden = false;
    }
  }
}

iniciar();
