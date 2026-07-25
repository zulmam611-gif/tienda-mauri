const parametros = new URLSearchParams(window.location.search);
const categoria = parametros.get("categoria") || "Productos";

const tituloCategoria = document.getElementById("tituloCategoria");
const pasoGenero = document.getElementById("pasoGenero");
const pasoProductos = document.getElementById("pasoProductos");
const tituloProductos = document.getElementById("tituloProductos");

if (tituloCategoria) {
  tituloCategoria.textContent = categoria;
}

window.seleccionarGenero = function (genero) {
  if (tituloProductos) {
    tituloProductos.textContent = categoria + " - " + genero;
  }

  if (pasoGenero) pasoGenero.style.display = "none";
  if (pasoProductos) pasoProductos.style.display = "block";
};

window.volverAGeneros = function () {
  if (pasoProductos) pasoProductos.style.display = "none";
  if (pasoGenero) pasoGenero.style.display = "block";
};