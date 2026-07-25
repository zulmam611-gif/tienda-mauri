const parametros = new URLSearchParams(window.location.search);
const categoriaElegida = parametros.get("categoria") || "";

const tituloCategoria =
  document.getElementById("tituloCategoria");

const pasoGenero =
  document.getElementById("pasoGenero");

const pasoProductos =
  document.getElementById("pasoProductos");

const tituloProductos =
  document.getElementById("tituloProductos");

const listaProductos =
  document.getElementById("listaCategoriaProductos");

let productosFirebase = [];

if (tituloCategoria) {
  tituloCategoria.textContent =
    categoriaElegida || "Elegí una categoría";
}

async function cargarProductosFirebase() {
  if (!listaProductos) return;

  listaProductos.innerHTML =
    "<p>Cargando productos...</p>";

  try {
    const respuesta = await fetch(
      "https://firestore.googleapis.com/v1/projects/urban-style-501d5/databases/(default)/documents/productos",
      { cache: "no-store" }
    );

    if (!respuesta.ok) {
      throw new Error(
        "Error al descargar productos: " +
        respuesta.status
      );
    }

    const datos = await respuesta.json();

    productosFirebase = (datos.documents || []).map(
      (documento) => {
        const campos = documento.fields || {};

        return {
          id:
            documento.name?.split("/").pop() || "",

          nombre:
            campos.nombre?.stringValue || "Producto",

          descripcion:
            campos.descripcion?.stringValue || "",

          categoria:
            campos.categoria?.stringValue || "",

          genero:
            campos.genero?.stringValue || "",

          imagen:
            campos.imagen?.stringValue ||
            campos.imagenURL?.stringValue ||
            campos.imageUrl?.stringValue ||
            campos.urlImagen?.stringValue ||
            "",

          precio: Number(
            campos.precio?.integerValue ||
            campos.precio?.doubleValue ||
            0
          )
        };
      }
    );

    console.log(
      "Productos descargados:",
      productosFirebase
    );
  } catch (error) {
    console.error(error);

    listaProductos.innerHTML =
      "<p>No se pudieron cargar los productos.</p>";

    throw error;
  }
}

window.seleccionarGenero =
  async function (generoElegido) {

    if (pasoGenero) {
      pasoGenero.style.display = "none";
    }

    if (pasoProductos) {
      pasoProductos.style.display = "block";
    }

    if (tituloProductos) {
      tituloProductos.textContent =
        categoriaElegida + " - " + generoElegido;
    }

    try {
      await cargarProductosFirebase();

      mostrarProductos(
        categoriaElegida,
        generoElegido
      );
    } catch (error) {
      console.error(
        "No fue posible mostrar productos:",
        error
      );
    }
  };

function mostrarProductos(categoria, genero) {
  if (!listaProductos) return;

  const categoriaNormalizada =
    normalizarTexto(categoria);

  const generoNormalizado =
    normalizarTexto(genero);

  const productosFiltrados =
    productosFirebase.filter((producto) => {
      return (
        normalizarTexto(producto.categoria) ===
          categoriaNormalizada &&
        normalizarTexto(producto.genero) ===
          generoNormalizado
      );
    });

  console.log(
    "Productos filtrados:",
    productosFiltrados
  );

  if (productosFiltrados.length === 0) {
    listaProductos.innerHTML = `
      <div class="sin-productos">
        <h3>No hay productos disponibles</h3>
        <p>
          No hay productos de
          <strong>${escaparHTML(categoria)}</strong>
          para
          <strong>${escaparHTML(genero)}</strong>.
        </p>
      </div>
    `;

    return;
  }

  listaProductos.innerHTML =
    productosFiltrados
      .map(crearTarjetaProducto)
      .join("");
}

function crearTarjetaProducto(producto) {
  return `
    <article class="producto-card">

      ${
        producto.imagen
          ? `
            <img
              src="${escaparHTML(producto.imagen)}"
              alt="${escaparHTML(producto.nombre)}"
              loading="lazy"
            >
          `
          : `
            <div class="producto-sin-imagen">
              Sin imagen
            </div>
          `
      }

      <div class="producto-contenido">

        <h3>
          ${escaparHTML(producto.nombre)}
        </h3>

        ${
          producto.descripcion
            ? `
              <p>
                ${escaparHTML(producto.descripcion)}
              </p>
            `
            : ""
        }

        <strong class="producto-precio">
          ${formatearGuaranies(producto.precio)}
        </strong>

      </div>

    </article>
  `;
}

window.volverAGeneros = function () {
  if (pasoProductos) {
    pasoProductos.style.display = "none";
  }

  if (pasoGenero) {
    pasoGenero.style.display = "block";
  }

  if (listaProductos) {
    listaProductos.innerHTML = "";
  }
};

function normalizarTexto(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatearGuaranies(numero) {
  const valor = Number(numero) || 0;

  return (
    "Gs. " +
    valor.toLocaleString("es-PY")
  );
}

function escaparHTML(texto) {
  const elemento =
    document.createElement("div");

  elemento.textContent = texto ?? "";

  return elemento.innerHTML;
}