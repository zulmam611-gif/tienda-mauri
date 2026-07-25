const parametros = new URLSearchParams(window.location.search);
const categoriaElegida =
  parametros.get("categoria") || "Productos";

const tituloCategoria =
  document.getElementById("tituloCategoria");

const pasoGenero =
  document.getElementById("pasoGenero");

const pasoProductos =
  document.getElementById("pasoProductos");

const tituloProductos =
  document.getElementById("tituloProductos");

if (tituloCategoria) {
  tituloCategoria.textContent = categoriaElegida;
}

window.seleccionarGenero = function (genero) {
  if (tituloProductos) {
    tituloProductos.textContent =
      categoriaElegida + " - " + genero;
  }

  if (pasoGenero) {
    pasoGenero.style.display = "none";
  }

  if (pasoProductos) {
    pasoProductos.style.display = "block";
  }

  mostrarProductos(categoriaElegida, genero);
};

window.volverAGeneros = function () {
  if (pasoProductos) {
    pasoProductos.style.display = "none";
  }

  if (pasoGenero) {
    pasoGenero.style.display = "block";
  }
};

function mostrarProductos(categoria, genero) {
  const contenedor =
    document.getElementById("listaCategoriaProductos");

  if (!contenedor) return;

  contenedor.innerHTML = `
    <p>
      Mostrando productos de
      <strong>${categoria}</strong>
      para
      <strong>${genero}</strong>.
    </p>
  `;
}