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


/* =========================================
   MOSTRAR CATEGORÍA
   ========================================= */

if (tituloCategoria) {
  tituloCategoria.textContent =
    categoriaElegida || "Elegí una categoría";
}


/* =========================================
   DESCARGAR PRODUCTOS
   ========================================= */

async function cargarProductosFirebase() {
  if (!listaProductos) return;

  listaProductos.innerHTML = `
    <p class="mensaje-productos">
      Cargando productos...
    </p>
  `;

  try {
    const respuesta = await fetch(
      "https://firestore.googleapis.com/v1/projects/urban-style-501d5/databases/(default)/documents/productos",
      {
        cache: "no-store"
      }
    );

    if (!respuesta.ok) {
      throw new Error(
        "Error al descargar productos: " +
        respuesta.status
      );
    }

    const datos = await respuesta.json();

    productosFirebase =
      (datos.documents || []).map((documento) => {
        const campos = documento.fields || {};

        return {
          id:
            documento.name
              ?.split("/")
              .pop() || "",

          nombre:
            leerCampo(campos.nombre) ||
            "Producto",

          descripcion:
            leerCampo(campos.descripcion) ||
            "",

          categoria:
            leerCampo(campos.categoria) ||
            "",

          genero:
            leerCampo(campos.genero) ||
            "",

          imagen:
            leerCampo(campos.imagen) ||
            leerCampo(campos.imagenURL) ||
            leerCampo(campos.imageUrl) ||
            leerCampo(campos.urlImagen) ||
            "",

          precio: Number(
            leerCampo(campos.precio) || 0
          )
        };
      });

    console.log(
      "Productos cargados:",
      productosFirebase
    );

  } catch (error) {
    console.error(
      "Error al cargar productos:",
      error
    );

    listaProductos.innerHTML = `
      <p class="mensaje-productos">
        No se pudieron cargar los productos.
      </p>
    `;

    throw error;
  }
}


/* =========================================
   ELEGIR GÉNERO
   ========================================= */

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
        categoriaElegida +
        " - " +
        generoElegido;
    }

    try {
      await cargarProductosFirebase();

      mostrarProductos(
        categoriaElegida,
        generoElegido
      );

    } catch (error) {
      console.error(
        "No se pudieron mostrar los productos:",
        error
      );
    }
  };


/* =========================================
   FILTRAR PRODUCTOS
   ========================================= */

function mostrarProductos(categoria, genero) {
  if (!listaProductos) return;

  const categoriaNormalizada =
    normalizarTexto(categoria);

  const generoNormalizado =
    normalizarTexto(genero);

  const productosFiltrados =
    productosFirebase.filter((producto) => {

      const categoriaProducto =
        normalizarTexto(producto.categoria);

      const generoProducto =
        normalizarTexto(producto.genero);

      return (
        categoriaProducto ===
          categoriaNormalizada &&
        generoProducto ===
          generoNormalizado
      );
    });

  if (productosFiltrados.length === 0) {
    listaProductos.innerHTML = `
      <div class="sin-productos">

        <h3>
          No hay productos disponibles
        </h3>

        <p>
          No hay productos de
          <strong>
            ${escaparHTML(categoria)}
          </strong>
          para
          <strong>
            ${escaparHTML(genero)}
          </strong>.
        </p>

      </div>
    `;

    return;
  }

  listaProductos.innerHTML =
    productosFiltrados
      .map(crearTarjetaProducto)
      .join("");

  activarBotonesProductos();
}


/* =========================================
   CREAR TARJETA DEL PRODUCTO
   ========================================= */

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

        <div class="producto-acciones">

          <button
            class="boton boton-principal"
            type="button"
            data-agregar-categoria="${escaparHTML(producto.id)}"
          >
            Agregar al carrito
          </button>

          <button
            class="boton boton-secundario"
            type="button"
            data-consultar-categoria="${escaparHTML(producto.id)}"
          >
            Preguntar por WhatsApp
          </button>

        </div>

      </div>

    </article>
  `;
}


/* =========================================
   ACTIVAR LOS BOTONES
   ========================================= */

function activarBotonesProductos() {

  document
    .querySelectorAll(
      "[data-agregar-categoria]"
    )
    .forEach((boton) => {

      boton.addEventListener(
        "click",
        () => {
          agregarProductoAlCarrito(
            boton.dataset.agregarCategoria
          );
        }
      );

    });

  document
    .querySelectorAll(
      "[data-consultar-categoria]"
    )
    .forEach((boton) => {

      boton.addEventListener(
        "click",
        () => {
          consultarProductoPorWhatsApp(
            boton.dataset.consultarCategoria
          );
        }
      );

    });
}


/* =========================================
   AGREGAR AL CARRITO
   ========================================= */

function agregarProductoAlCarrito(idProducto) {

  const productoEncontrado =
    productosFirebase.find(
      (producto) =>
        producto.id === idProducto
    );

  if (!productoEncontrado) {
    return;
  }

  let carrito = [];

  try {
    carrito =
      JSON.parse(
        localStorage.getItem(
          "carritoUrbanStyleV2"
        )
      ) || [];

  } catch (error) {
    carrito = [];
  }

  const productoEnCarrito =
    carrito.find(
      (producto) =>
        producto.id === idProducto
    );

  if (productoEnCarrito) {

    productoEnCarrito.cantidad += 1;

  } else {

    carrito.push({
      id: productoEncontrado.id,
      nombre: productoEncontrado.nombre,
      precio: Number(
        productoEncontrado.precio
      ),
      imagen:
        productoEncontrado.imagen || "",
      cantidad: 1
    });

  }

  localStorage.setItem(
    "carritoUrbanStyleV2",
    JSON.stringify(carrito)
  );

  alert(
    productoEncontrado.nombre +
    " fue agregado al carrito."
  );
}


/* =========================================
   PREGUNTAR POR WHATSAPP
   ========================================= */

function consultarProductoPorWhatsApp(
  idProducto
) {

  const productoEncontrado =
    productosFirebase.find(
      (producto) =>
        producto.id === idProducto
    );

  if (!productoEncontrado) {
    return;
  }

  const mensaje =
    "Hola, quiero consultar por este producto:\n\n" +
    productoEncontrado.nombre +
    "\nPrecio: " +
    formatearGuaranies(
      productoEncontrado.precio
    );

  const enlace =
    "https://wa.me/5950982766005?text=" +
    encodeURIComponent(mensaje);

  window.open(
    enlace,
    "_blank"
  );
}


/* =========================================
   VOLVER A LOS GÉNEROS
   ========================================= */

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


/* =========================================
   FUNCIONES AUXILIARES
   ========================================= */

function leerCampo(campo) {
  if (!campo) {
    return "";
  }

  return (
    campo.stringValue ??
    campo.integerValue ??
    campo.doubleValue ??
    campo.booleanValue ??
    ""
  );
}

function normalizarTexto(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(
      /[\u0300-\u036f]/g,
      ""
    );
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

  elemento.textContent =
    texto ?? "";

  return elemento.innerHTML;
}