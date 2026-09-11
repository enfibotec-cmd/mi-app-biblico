"use strict";

/* ===== Utilidades generales (sin lógica de la app) ===== */

const $ = (id) => document.getElementById(id);

/** Devuelve un elemento aleatorio de un arreglo. */
function elegir(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Crea un elemento con clase y texto de forma SEGURA.
 * Usa textContent en lugar de innerHTML → evita inyección de HTML.
 */
function crearElemento(etiqueta, clase = "", texto = "") {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto) el.textContent = texto;
  return el;
}

/** Muestra un aviso en el área de mensajes (tipo: "error" u "ok"). */
function avisar(mensaje, tipo = "error") {
  const aviso = $("aviso");
  aviso.textContent = mensaje;
  aviso.className = "aviso " + tipo;
}

function limpiarAviso() {
  const aviso = $("aviso");
  aviso.textContent = "";
  aviso.className = "aviso";
}

/** Lee JSON de localStorage con protección contra datos corruptos. */
function leerStorage(clave, porDefecto = []) {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo === null ? porDefecto : JSON.parse(crudo);
  } catch {
    return porDefecto;
  }
}

/** Guarda JSON en localStorage. Devuelve false si falla. */
function guardarStorage(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

/** Copia texto al portapapeles, con respaldo para navegadores antiguos. */
async function copiarAlPortapapeles(texto) {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(texto);
  }
  const area = document.createElement("textarea");
  area.value = texto;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try { document.execCommand("copy"); }
  finally { area.remove(); }
}
