import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

import {
  initializeFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


/* =========================================
   CONFIGURACIÓN DE FIREBASE
   ========================================= */

const firebaseConfig = {
  apiKey: "AIzaSyB5jLbRRUbLzfirkiBySrNQW5qNYrh4IHM",
  authDomain: "urban-style-501d5.firebaseapp.com",
  projectId: "urban-style-501d5",
  storageBucket: "urban-style-501d5.firebasestorage.app",
  messagingSenderId: "401559108584",
  appId: "1:401559108584:web:9cc8b008b8f289b15e825d",
  measurementId: "G-C6JCRW03CG"
};

const app = initializeApp(firebaseConfig);
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchSreams: false
});


/* =========================================
   ELEMENTOS DE LA PÁGINA
   ========================================= */

const parametros = new URLSearchParams(window.location.search);
const categoriaElegida = parametros.get("categoria") || "";

const tituloCategoria = document.getElementById("tituloCategoria");
const pasoGenero = document.getElementById("pasoGenero");
const pasoProductos = document.getElementById("pasoProductos");
const tituloProductos = document.getElementById("tituloProductos");
const listaProductos = document.getElementById("listaCategoriaProductos");

let productosFirebase = [];


/* =========================================
   MOSTRAR NOMBRE DE LA CATEGORÍA
   ========================================= */

if (tituloCategoria) {
  tituloCategoria.textContent =
    categoriaElegida || "Elegí una categoría";
}


/* =========================================
   CARGAR PRODUCTOS DE FIREBASE
   ========================================= */

async function cargarProductosFirebase() {
  console.log("Intentando cargar Firebase...");
  if (!listaProductos) return;

  listaProductos.innerHTML = `
    <p class="mensaje-productos">
      Cargando productos...
    </p>
  `;

  try {
    const consulta = await getDocs(collection(db, "productos"));

    console.log("Cantidad de productos:",
    consulta.size);

    productosFirebase = consulta.docs.map((documento) => ({
      id: documento.id,
      ...documento.data()
    }));

    console.log("Productos cargados:", productosFirebase);
  } catch (error) {
    console.error("Error al cargar productos:", error);

    listaProductos.innerHTML = `
      <p class="mensaje-productos">
        No se pudieron cargar los productos.
      </p>
    `; 
  }
}


/* =========================================
   ELEGIR GÉNERO
   ========================================= */

window.seleccionarGenero = async function (generoElegido) {
  if (pasoGenero) {
    pasoGenero.style.display = "none";
  }

  if (pasoProductos) {
    pasoProductos.style.display = "block";
  }

  if (tituloProductos) {
    tituloProductos.textContent =
      `${categoriaElegida} - ${generoElegido}`;
  }

  if (productosFirebase.length === 0) {
    await cargarProductosFirebase();
  }

  mostrarProductos(categoriaElegida, generoElegido);
};


/* =========================================
   FILTRAR Y MOSTRAR PRODUCTOS
   ========================================= */

function mostrarProductos(categoria, genero) {
  if (!listaProductos) return;

  const categoriaNormalizada = normalizarTexto(categoria);
  const generoNormalizado = normalizarTexto(genero);

  const productosFiltrados = productosFirebase.filter((producto) => {
    const categoriaProducto = normalizarTexto(
      producto.categoria || producto.category || ""
    );

    const generoProducto = normalizarTexto(
      producto.genero || producto.gender || ""
    );

    return (
      categoriaProducto === categoriaNormalizada &&
      generoProducto === generoNormalizado
    );
  });

  if (productosFiltrados.length === 0) {
    listaProductos.innerHTML = `
      <div class="sin-productos">
        <h3>No hay productos disponibles</h3>
        <p>
          Todavía no hay productos de
          <strong>${escaparHTML(categoria)}</strong>
          para
          <strong>${escaparHTML(genero)}</strong>.
        </p>
      </div>
    `;

    return;
  }

  listaProductos.innerHTML = productosFiltrados
    .map((producto) => crearTarjetaProducto(producto))
    .join("");
}


/* =========================================
   CREAR TARJETA DE PRODUCTO
   ========================================= */

function crearTarjetaProducto(producto) {
  const nombre =
    producto.nombre ||
    producto.name ||
    "Producto";

  const descripcion =
    producto.descripcion ||
    producto.description ||
    "";

  const precio =
    producto.precio ||
    producto.price ||
    0;

  const imagen =
    producto.imagen ||
    producto.imagenURL ||
    producto.imageUrl ||
    producto.urlImagen ||
    "";

  return `
    <article class="producto-card">

      ${
        imagen
          ? `
            <img
              src="${escaparHTML(imagen)}"
              alt="${escaparHTML(nombre)}"
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

        <h3>${escaparHTML(nombre)}</h3>

        ${
          descripcion
            ? `<p>${escaparHTML(descripcion)}</p>`
            : ""
        }

        <strong class="producto-precio">
          ${formatearGuaranies(precio)}
        </strong>

      </div>

    </article>
  `;
}


/* =========================================
   VOLVER A ELEGIR GÉNERO
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

function normalizarTexto(texto) {
  return String(texto)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function formatearGuaranies(numero) {
  const valor = Number(numero) || 0;

  return "Gs. " + valor.toLocaleString("es-PY");
}

function escaparHTML(texto) {
  const elemento = document.createElement("div");
  elemento.textContent = texto ?? "";
  return elemento.innerHTML;
}


/* =========================================
   INICIAR
   ========================================= */

   console.log("categoria.js cargado");
   
cargarProductosFirebase();