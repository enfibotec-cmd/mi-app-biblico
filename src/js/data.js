
"use strict";

/**
 * data.js — Responsable único de cargar y validar los datos.
 * Expone la variable global BIBLIA para que app.js la use.
 */

let BIBLIA = null;
let META_DATOS = null;

async function cargarBiblia() {
  const respuesta = await fetch("../data/biblia.json");
  
  if (!respuesta.ok) {
    throw new Error(`Error HTTP ${respuesta.status}: no se pudo leer biblia.json`);
  }

  const json = await respuesta.json();
  validarEstructura(json);

  META_DATOS = json.meta || {};
  BIBLIA = json.libros;
}

function validarEstructura(json) {
  if (!json || typeof json !== "object" || !json.libros) {
    throw new Error("El archivo JSON no tiene la estructura esperada (falta 'libros').");
  }

  for (const [libro, capitulos] of Object.entries(json.libros)) {
    if (typeof capitulos !== "object") throw new Error(`Formato inválido en el libro "${libro}".`);
    
    for (const [cap, versiculos] of Object.entries(capitulos)) {
      for (const [num, texto] of Object.entries(versiculos)) {
        if (typeof texto !== "string" || texto.trim() === "") {
          throw new Error(`Texto vacío o inválido en ${libro} ${cap}:${num}.`);
        }
      }
    }
  }
}
