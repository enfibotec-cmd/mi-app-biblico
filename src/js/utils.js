"use strict";

const $ = (id) => document.getElementById(id);

function elegirAlAzar(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function avisar(mensaje, esExito = false) {
  const aviso = $("error"); // Reutilizamos tu div original id="error"
  aviso.textContent = mensaje;
  aviso.className = esExito ? "ok" : "error";
}

function limpiarAviso() {
  const aviso = $("error");
  aviso.textContent = "";
  aviso.className = "error";
}

function leerStorage(clave, porDefecto = []) {
  try {
    const crudo = localStorage.getItem(clave);
    return crudo === null ? porDefecto : JSON.parse(crudo);
  } catch {
    return porDefecto;
  }
}

function guardarStorage(clave, valor) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

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
