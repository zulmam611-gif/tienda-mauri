import { initializeApp } from "https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";


/*
==================================================
CONFIGURACIÓN DE FIREBASE
==================================================

Más adelante reemplazaremos estos datos por los
que aparecen en tu proyecto Urban Style.
*/
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5jlbrRUbLzfIrk1BySrNQW5qNYrh4IHM",
  authDomain: "urban-style-501d5.firebaseapp.com",
  projectId: "urban-style-501d5",
  storageBucket: "urban-style-501d5.firebasestorage.app",
  messagingSenderId: "401559108584",
  appId: "1:401559108584:web:9cc8b008b8f289b15e825d",
  measurementId: "G-C6JCRW03CG"
};



const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


/*
==================================================
CONFIGURACIÓN DE LA TIENDA
==================================================
*/

const WHATSAPP = "5950982766005";

const IMAGEN_PREDETERMINADA =
  "https://placehold.co/700x800?text=Producto";


/*
==================================================
VARIABLES
==================================================
*/

let productos = [];

let carrito =
  JSON.parse(
    localStorage.getItem("carritoUrbanStyleV2")
  ) || [];

let usuarioAdministrador = null;


/*
==================================================
ELEMENTOS DEL HTML
==================================================
*/

const listaProductos =
  document.getElementById("listaProductos");

const estadoProductos =
  document.getElementById("estadoProductos");

const busquedaProducto =
  document.getElementById("busquedaProducto");

const filtroGenero =
  document.getElementById("filtroGenero");

const filtroCategoria =
  document.getElementById("filtroCategoria");

const ordenProductos =
  document.getElementById("ordenProductos");

const botonModaMujer =
  document.getElementById("botonModaMujer");

const botonModaHombre =
  document.getElementById("botonModaHombre");


const botonCarrito =
  document.getElementById("botonCarrito");

const panelCarrito =
  document.getElementById("panelCarrito");

const cerrarCarrito =
  document.getElementById("cerrarCarrito");

const contenidoCarrito =
  document.getElementById("contenidoCarrito");

const contadorCarrito =
  document.getElementById("contadorCarrito");

const totalCarrito =
  document.getElementById("totalCarrito");

const nombreCliente =
  document.getElementById("nombreCliente");

const direccionCliente =
  document.getElementById("direccionCliente");

const enviarPedido =
  document.getElementById("enviarPedido");

const vaciarCarrito =
  document.getElementById("vaciarCarrito");


const botonAdministrador =
  document.getElementById("botonAdministrador");

const panelAdministrador =
  document.getElementById("panelAdministrador");

const cerrarAdministrador =
  document.getElementById("cerrarAdministrador");

const formularioProducto =
  document.getElementById("formularioProducto");

const productoId =
  document.getElementById("productoId");

const nombreProducto =
  document.getElementById("nombreProducto");

const precioProducto =
  document.getElementById("precioProducto");

const generoProducto =
  document.getElementById("generoProducto");

const categoriaProducto =
  document.getElementById("categoriaProducto");

const descripcionProducto =
  document.getElementById("descripcionProducto");

const imagenProducto =
  document.getElementById("imagenProducto");

const vistaPreviaProducto =
  document.getElementById("vistaPreviaProducto");

const limpiarFormulario =
  document.getElementById("limpiarFormulario");

const listaProductosAdmin =
  document.getElementById("listaProductosAdmin");

const cantidadProductosAdmin =
  document.getElementById("cantidadProductosAdmin");


const fondoPanel =
  document.getElementById("fondoPanel");


const modalLogin =
  document.getElementById("modalLogin");

const cerrarLogin =
  document.getElementById("cerrarLogin");
const abrirLoginAdmin = document.getElementById("abrirLoginAdmin");

abrirLoginAdmin.addEventListener("click", () => {
    modalLogin.style.display = "flex";
});

cerrarLogin.addEventListener("click", () => {
    modalLogin.style.display = "none";
});
const emailAdministrador =
  document.getElementById("emailAdministrador");

const claveAdministrador =
  document.getElementById("claveAdministrador");

const iniciarSesionAdministrador =
  document.getElementById(
    "iniciarSesionAdministrador"
  );

const mensajeLogin =
  document.getElementById("mensajeLogin");


/*
==================================================
FUNCIONES GENERALES
==================================================
*/

function formatearGuaranies(numero) {

  return (
    "Gs. " +
    Number(numero).toLocaleString("es-PY")
  );

}


function escaparHTML(texto) {

  const elemento =
    document.createElement("div");

  elemento.textContent = texto || "";

  return elemento.innerHTML;

}


function guardarCarrito() {

  localStorage.setItem(
    "carritoUrbanStyleV2",
    JSON.stringify(carrito)
  );

}


function mostrarError(mensaje) {

  console.error(mensaje);

  estadoProductos.textContent =
    "No se pudieron cargar los productos.";

}/*
==================================================
CARGAR PRODUCTOS DESDE FIRESTORE
==================================================
*/

const consultaProductos = query(
  collection(db, "productos"),
  orderBy("creado", "desc")
);


onSnapshot(
  consultaProductos,

  function(snapshot) {

    productos = [];

    snapshot.forEach(function(documento) {

      productos.push({
        id: documento.id,
        ...documento.data()
      });

    });

    estadoProductos.style.display = "none";

    renderizarProductos();

    renderizarProductosAdmin();

  },

  function(error) {

    console.error(error);

    estadoProductos.style.display = "block";

    estadoProductos.textContent =
      "No se pudieron cargar los productos.";

  }
);


/*
==================================================
MOSTRAR PRODUCTOS EN LA TIENDA
==================================================
*/


function renderizarProductos() {

  let resultado = [...productos];


  const textoBusqueda =
    busquedaProducto.value
      .toLowerCase()
      .trim();


  const generoSeleccionado =
    filtroGenero.value;


  const categoriaSeleccionada =
    filtroCategoria.value;
    
    if (
  textoBusqueda === "" &&
  generoSeleccionado === "" &&
  categoriaSeleccionada === ""
) {
  listaProductos.innerHTML = "";
  return;
  }


  resultado = resultado.filter(
    function(producto) {

      const nombre =
        (producto.nombre || "")
          .toLowerCase();


      const descripcion =
        (producto.descripcion || "")
          .toLowerCase();


      const coincideBusqueda =
        nombre.includes(textoBusqueda) ||
        descripcion.includes(textoBusqueda);


      const coincideGenero =
        generoSeleccionado === "" ||
        producto.genero === generoSeleccionado;


      const coincideCategoria =
        categoriaSeleccionada === "" ||
        producto.categoria === categoriaSeleccionada;


      return (
        coincideBusqueda &&
        coincideGenero &&
        coincideCategoria
      );

    }
  );


  if (ordenProductos.value === "menor") {

    resultado.sort(
      function(a, b) {
        return Number(a.precio) - Number(b.precio);
      }
    );

  }


  if (ordenProductos.value === "mayor") {

    resultado.sort(
      function(a, b) {
        return Number(b.precio) - Number(a.precio);
      }
    );

  }


  if (ordenProductos.value === "nombre") {

    resultado.sort(
      function(a, b) {
        return a.nombre.localeCompare(b.nombre);
      }
    );

  }


  if (resultado.length === 0) {

    listaProductos.innerHTML = `

      <div class="estado-productos">

        No hay productos disponibles.

      </div>

    `;

    return;

  }


  listaProductos.innerHTML =
    resultado
      .map(
        function(producto) {

          const imagen =
            producto.imagen ||
            IMAGEN_PREDETERMINADA;


          return `

            <article class="producto">

              <img
                class="producto-imagen"
                src="${imagen}"
                alt="${escaparHTML(producto.nombre)}"
                onerror="
                  this.src =
                  '${IMAGEN_PREDETERMINADA}'
                "
              >


              <div class="producto-info">

                <div class="producto-etiquetas">

                  <span class="producto-etiqueta">

                    ${escaparHTML(producto.genero)}

                  </span>

                  <span class="producto-etiqueta">

                    ${escaparHTML(producto.categoria)}

                  </span>

                </div>


                <h3>

                  ${escaparHTML(producto.nombre)}

                </h3>


                <p class="producto-descripcion">

                  ${
                    escaparHTML(
                      producto.descripcion ||
                      "Consultar disponibilidad."
                    )
                  }

                </p>


                <div class="producto-precio">

                  ${formatearGuaranies(producto.precio)}

                </div>


                <div class="producto-acciones">

                  <button
                    class="boton boton-principal"
                    data-agregar="${producto.id}"
                    type="button"
                  >

                    Agregar

                  </button>


                  <button
                    class="boton boton-secundario"
                    data-consultar="${producto.id}"
                    type="button"
                  >

                    WhatsApp

                  </button>

                </div>

              </div>

            </article>

          `;

        }
      )
      .join("");


  document
    .querySelectorAll("[data-agregar]")
    .forEach(
      function(boton) {

        boton.addEventListener(
          "click",
          function() {

            agregarAlCarrito(
              boton.dataset.agregar
            );

          }
        );

      }
    );


  document
    .querySelectorAll("[data-consultar]")
    .forEach(
      function(boton) {

        boton.addEventListener(
          "click",
          function() {

            consultarPorWhatsApp(
              boton.dataset.consultar
            );

          }
        );

      }
    );

}


/*
==================================================
FILTROS
==================================================
*/

busquedaProducto.addEventListener(
  "input",
  renderizarProductos
);


filtroGenero.addEventListener(
  "change",
  renderizarProductos
);


filtroCategoria.addEventListener(
  "change",
  renderizarProductos
);


ordenProductos.addEventListener(
  "change",
  renderizarProductos
);


botonModaMujer.addEventListener(
  "click",
  function() {

    filtroGenero.value = "Mujer";

    renderizarProductos();

    document
      .getElementById("productos")
      .scrollIntoView({
        behavior: "smooth"
      });

  }
);


botonModaHombre.addEventListener(
  "click",
  function() {

    filtroGenero.value = "Hombre";

    renderizarProductos();

    document
      .getElementById("productos")
      .scrollIntoView({
        behavior: "smooth"
      });

  }
);/*
==================================================
CARRITO DE COMPRAS
==================================================
*/

function agregarAlCarrito(idProducto) {

  const productoEncontrado =
    productos.find(
      function(producto) {
        return producto.id === idProducto;
      }
    );


  if (!productoEncontrado) {
    return;
  }


  const productoEnCarrito =
    carrito.find(
      function(producto) {
        return producto.id === idProducto;
      }
    );


  if (productoEnCarrito) {

    productoEnCarrito.cantidad += 1;

  } else {

    carrito.push({

      id: productoEncontrado.id,

      nombre: productoEncontrado.nombre,

      precio: Number(productoEncontrado.precio),

      imagen:
        productoEncontrado.imagen ||
        IMAGEN_PREDETERMINADA,

      cantidad: 1

    });

  }


  guardarCarrito();

  actualizarCarrito();

  abrirPanelCarrito();

}


function cambiarCantidad(
  idProducto,
  cambio
) {

  const productoEnCarrito =
    carrito.find(
      function(producto) {
        return producto.id === idProducto;
      }
    );


  if (!productoEnCarrito) {
    return;
  }


  productoEnCarrito.cantidad += cambio;


  if (productoEnCarrito.cantidad <= 0) {

    carrito =
      carrito.filter(
        function(producto) {
          return producto.id !== idProducto;
        }
      );

  }


  guardarCarrito();

  actualizarCarrito();

}


function eliminarDelCarrito(idProducto) {

  carrito =
    carrito.filter(
      function(producto) {
        return producto.id !== idProducto;
      }
    );


  guardarCarrito();

  actualizarCarrito();

}


function calcularTotalCarrito() {

  return carrito.reduce(
    function(total, producto) {

      return (
        total +
        Number(producto.precio) *
        Number(producto.cantidad)
      );

    },
    0
  );

}


function actualizarCarrito() {

  const cantidadTotal =
    carrito.reduce(
      function(total, producto) {

        return (
          total +
          Number(producto.cantidad)
        );

      },
      0
    );


  contadorCarrito.textContent =
    cantidadTotal;


  totalCarrito.textContent =
    formatearGuaranies(
      calcularTotalCarrito()
    );


  if (carrito.length === 0) {

    contenidoCarrito.innerHTML = `

      <div class="estado-productos">

        Tu carrito está vacío.

      </div>

    `;

    return;

  }


  contenidoCarrito.innerHTML =
    carrito
      .map(
        function(producto) {

          return `

            <div class="item-carrito">

              <img
                src="${producto.imagen}"
                alt="${escaparHTML(producto.nombre)}"
                onerror="
                  this.src =
                  '${IMAGEN_PREDETERMINADA}'
                "
              >


              <div>

                <strong>

                  ${escaparHTML(producto.nombre)}

                </strong>


                <div>

                  ${formatearGuaranies(producto.precio)}

                </div>


                <div class="item-cantidad">

                  <button
                    data-restar="${producto.id}"
                    type="button"
                  >

                    −

                  </button>


                  <span>

                    ${producto.cantidad}

                  </span>


                  <button
                    data-sumar="${producto.id}"
                    type="button"
                  >

                    +

                  </button>

                </div>

              </div>


              <button
                class="boton-cerrar"
                data-eliminar-carrito="${producto.id}"
                type="button"
                title="Eliminar producto"
              >

                ✕

              </button>

            </div>

          `;

        }
      )
      .join("");


  document
    .querySelectorAll("[data-restar]")
    .forEach(
      function(boton) {

        boton.addEventListener(
          "click",
          function() {

            cambiarCantidad(
              boton.dataset.restar,
              -1
            );

          }
        );

      }
    );


  document
    .querySelectorAll("[data-sumar]")
    .forEach(
      function(boton) {

        boton.addEventListener(
          "click",
          function() {

            cambiarCantidad(
              boton.dataset.sumar,
              1
            );

          }
        );

      }
    );


  document
    .querySelectorAll(
      "[data-eliminar-carrito]"
    )
    .forEach(
      function(boton) {

        boton.addEventListener(
          "click",
          function() {

            eliminarDelCarrito(
              boton.dataset.eliminarCarrito
            );

          }
        );

      }
    );

}


vaciarCarrito.addEventListener(
  "click",
  function() {

    if (carrito.length === 0) {
      return;
    }


    const confirmar =
      confirm(
        "¿Querés vaciar todo el carrito?"
      );


    if (!confirmar) {
      return;
    }


    carrito = [];

    guardarCarrito();

    actualizarCarrito();

  }
);


/*
==================================================
WHATSAPP
==================================================
*/

function consultarPorWhatsApp(idProducto) {

  const productoEncontrado =
    productos.find(
      function(producto) {
        return producto.id === idProducto;
      }
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

    "https://wa.me/" +

    WHATSAPP +

    "?text=" +

    encodeURIComponent(mensaje);


  window.open(
    enlace,
    "_blank"
  );

}


enviarPedido.addEventListener(
  "click",
  function() {

    if (carrito.length === 0) {

      alert(
        "Agregá al menos un producto al carrito."
      );

      return;

    }


    const nombre =
      nombreCliente.value.trim() ||
      "Sin nombre";


    const direccion =
      direccionCliente.value.trim() ||
      "A coordinar";


    let mensaje =

      "Hola, quiero realizar este pedido:\n\n";


    carrito.forEach(
      function(producto) {

        mensaje +=

          "• " +

          producto.nombre +

          " x" +

          producto.cantidad +

          " - " +

          formatearGuaranies(

            producto.precio *
            producto.cantidad

          ) +

          "\n";

      }
    );


    mensaje +=

      "\nTOTAL: " +

      formatearGuaranies(
        calcularTotalCarrito()
      ) +

      "\n\nCliente: " +

      nombre +

      "\nCiudad o dirección: " +

      direccion;


    const enlace =

      "https://wa.me/" +

      WHATSAPP +

      "?text=" +

      encodeURIComponent(mensaje);


    window.open(
      enlace,
      "_blank"
    );

  }
);


/*
==================================================
ABRIR Y CERRAR PANELES
==================================================
*/

function cerrarPaneles() {

  panelCarrito.classList.remove("activo");

  panelAdministrador.classList.remove("activo");

  fondoPanel.classList.remove("activo");

}


function abrirPanelCarrito() {

  cerrarPaneles();

  panelCarrito.classList.add("activo");

  fondoPanel.classList.add("activo");

}


function abrirPanelAdministrador() {

  cerrarPaneles();

  panelAdministrador.classList.add("activo");

  fondoPanel.classList.add("activo");

}


botonCarrito.addEventListener(
  "click",
  abrirPanelCarrito
);


cerrarCarrito.addEventListener(
  "click",
  cerrarPaneles
);


cerrarAdministrador.addEventListener(
  "click",
  cerrarPaneles
);


fondoPanel.addEventListener(
  "click",
  cerrarPaneles
);/*
==================================================
MOSTRAR PRODUCTOS EN EL PANEL ADMINISTRADOR
==================================================
*/

function renderizarProductosAdmin() {

  cantidadProductosAdmin.textContent =
    productos.length === 1
      ? "1 producto"
      : productos.length + " productos";


  if (productos.length === 0) {

    listaProductosAdmin.innerHTML = `

      <div class="estado-productos">

        Todavía no cargaste productos.

      </div>

    `;

    return;

  }


  listaProductosAdmin.innerHTML =
    productos
      .map(
        function(producto) {

          const imagen =
            producto.imagen ||
            IMAGEN_PREDETERMINADA;


          return `

            <div class="producto-admin">

              <img
                src="${imagen}"
                alt="${escaparHTML(producto.nombre)}"
                onerror="
                  this.src =
                  '${IMAGEN_PREDETERMINADA}'
                "
              >


              <div>

                <strong>

                  ${escaparHTML(producto.nombre)}

                </strong>


                <div>

                  ${formatearGuaranies(producto.precio)}

                </div>


                <small>

                  ${escaparHTML(producto.genero)}
                  ·
                  ${escaparHTML(producto.categoria)}

                </small>

              </div>


              <div class="producto-admin-acciones">

                <button
                  class="boton boton-secundario"
                  data-editar="${producto.id}"
                  type="button"
                >

                  Editar

                </button>


                <button
                  class="boton boton-rojo"
                  data-eliminar="${producto.id}"
                  type="button"
                >

                  Eliminar

                </button>

              </div>

            </div>

          `;

        }
      )
      .join("");


  document
    .querySelectorAll("[data-editar]")
    .forEach(
      function(boton) {

        boton.addEventListener(
          "click",
          function() {

            editarProducto(
              boton.dataset.editar
            );

          }
        );

      }
    );


  document
    .querySelectorAll("[data-eliminar]")
    .forEach(
      function(boton) {

        boton.addEventListener(
          "click",
          function() {

            eliminarProducto(
              boton.dataset.eliminar
            );

          }
        );

      }
    );

}


/*
==================================================
VISTA PREVIA DE LA IMAGEN
==================================================
*/

imagenProducto.addEventListener(
  "input",
  function() {

    const enlace =
      imagenProducto.value.trim();


    vistaPreviaProducto.src =
      enlace ||
      IMAGEN_PREDETERMINADA;

  }
);


vistaPreviaProducto.addEventListener(
  "error",
  function() {

    vistaPreviaProducto.src =
      IMAGEN_PREDETERMINADA;

  }
);


/*
==================================================
LIMPIAR FORMULARIO
==================================================
*/

function limpiarFormularioProducto() {

  formularioProducto.reset();


  productoId.value = "";


  vistaPreviaProducto.src =
    IMAGEN_PREDETERMINADA;


  nombreProducto.focus();

}


limpiarFormulario.addEventListener(
  "click",
  limpiarFormularioProducto
);


/*
==================================================
GUARDAR O ACTUALIZAR PRODUCTO
==================================================
*/

formularioProducto.addEventListener(
  "submit",
  async function(evento) {

    evento.preventDefault();


    if (!usuarioAdministrador) {

      alert(
        "Primero tenés que iniciar sesión como administrador."
      );

      return;

    }


    const nombre =
      nombreProducto.value.trim();


    const precio =
      Number(precioProducto.value);


    const genero =
      generoProducto.value;


    const categoria =
      categoriaProducto.value;


    const descripcion =
      descripcionProducto.value.trim();


    const imagen =
      imagenProducto.value.trim() ||
      IMAGEN_PREDETERMINADA;


    if (nombre === "") {

      alert(
        "Escribí el nombre del producto."
      );

      return;

    }


    if (
      !Number.isFinite(precio) ||
      precio <= 0
    ) {

      alert(
        "Escribí un precio válido."
      );

      return;

    }
let imagenFinal = imagen;

const archivo = archivoImagen.files[0];

if (archivo) {
    const datos = new FormData();

    datos.append("file", archivo);
    datos.append("upload_preset", "tienda_unsigned");

    const respuesta = await fetch(
       "https://api.cloudinary.com/v1_1/jgv2rsqn/image/upload",
        {
            method: "POST",
            body: datos
        }
    );

    const resultado = await respuesta.json();
if (!respuesta.ok) {
    alert(
        "Error al subir la imagen: " +
        (resultado.error?.message || "Error desconocido")
    );
    return;
}
    imagenFinal = resultado.secure_url;
    }
    const datosProducto = {

      nombre: nombre,

      precio: precio,

      genero: genero,

      categoria: categoria,

      descripcion: descripcion,

      imagen: imagenFinal,

      actualizado: serverTimestamp()

    };

const botonGuardar = document.querySelector(
    'button[type="submit"]'
);

    botonGuardar.disabled = true;

    botonGuardar.textContent =
      "Guardando...";


    try {

      if (productoId.value === "") {

        await addDoc(
          collection(db, "productos"),
          {
            ...datosProducto,
            creado: serverTimestamp()
          }
        );

      } else {

        await updateDoc(
          doc(
            db,
            "productos",
            productoId.value
          ),
          datosProducto
        );

      }


      limpiarFormularioProducto();


      alert(
        "Producto guardado correctamente."
      );

    } catch (error) {

      console.error(error);


      alert(
        "No se pudo guardar el producto. Revisaremos la configuración de Firebase."
      );

    } finally {

      botonGuardar.disabled = false;

      botonGuardar.textContent =
        "Guardar producto";

    }

  }
);


/*
==================================================
EDITAR PRODUCTO
==================================================
*/

function editarProducto(idProducto) {

  if (!usuarioAdministrador) {

    alert(
      "No tenés permiso para editar productos."
    );

    return;

  }


  const productoEncontrado =
    productos.find(
      function(producto) {

        return producto.id === idProducto;

      }
    );


  if (!productoEncontrado) {

    return;

  }


  productoId.value =
    productoEncontrado.id;


  nombreProducto.value =
    productoEncontrado.nombre || "";


  precioProducto.value =
    productoEncontrado.precio || "";


  generoProducto.value =
    productoEncontrado.genero || "Unisex";


  categoriaProducto.value =
    productoEncontrado.categoria || "Ropa";


  descripcionProducto.value =
    productoEncontrado.descripcion || "";


  imagenProducto.value =
    productoEncontrado.imagen || "";


  vistaPreviaProducto.src =
    productoEncontrado.imagen ||
    IMAGEN_PREDETERMINADA;


  panelAdministrador.scrollTo({

    top: 0,

    behavior: "smooth"

  });


  nombreProducto.focus();

}


/*
==================================================
ELIMINAR PRODUCTO
==================================================
*/

async function eliminarProducto(idProducto) {

  if (!usuarioAdministrador) {

    alert(
      "No tenés permiso para eliminar productos."
    );

    return;

  }


  const productoEncontrado =
    productos.find(
      function(producto) {

        return producto.id === idProducto;

      }
    );


  if (!productoEncontrado) {

    return;

  }


  const confirmar =
    confirm(

      '¿Querés eliminar "' +

      productoEncontrado.nombre +

      '"?'

    );


  if (!confirmar) {

    return;

  }


  try {

    await deleteDoc(

      doc(
        db,
        "productos",
        idProducto
      )

    );


    carrito =
      carrito.filter(
        function(producto) {

          return producto.id !== idProducto;

        }
      );


    guardarCarrito();

    actualizarCarrito();


    alert(
      "Producto eliminado correctamente."
    );

  } catch (error) {

    console.error(error);


    alert(
      "No se pudo eliminar el producto."
    );

  }

}/*
==================================================
INICIO DE SESIÓN DEL ADMINISTRADOR
==================================================
*/

botonAdministrador.addEventListener(
  "click",
  function() {

    if (usuarioAdministrador) {

      abrirPanelAdministrador();

    } else {

      modalLogin.classList.add("activo");

      emailAdministrador.focus();

    }

  }
);


cerrarLogin.addEventListener(
  "click",
  function() {

    modalLogin.classList.remove("activo");

    mensajeLogin.textContent = "";

  }
);


modalLogin.addEventListener(
  "click",
  function(evento) {

    if (evento.target === modalLogin) {

      modalLogin.classList.remove("activo");

      mensajeLogin.textContent = "";

    }

  }
);


iniciarSesionAdministrador.addEventListener(
  "click",
  iniciarSesion
);


claveAdministrador.addEventListener(
  "keydown",
  function(evento) {

    if (evento.key === "Enter") {

      iniciarSesion();

    }

  }
);


async function iniciarSesion() {

  const email =
    emailAdministrador.value.trim();


  const clave =
    claveAdministrador.value;


  if (
    email === "" ||
    clave === ""
  ) {

    mensajeLogin.textContent =
      "Completá el correo y la contraseña.";

    return;

  }


  iniciarSesionAdministrador.disabled = true;

  iniciarSesionAdministrador.textContent =
    "Ingresando...";


  mensajeLogin.textContent = "";


  try {

    await signInWithEmailAndPassword(
      auth,
      email,
      clave
    );


    modalLogin.classList.remove("activo");

    claveAdministrador.value = "";

    abrirPanelAdministrador();

  } catch (error) {

    console.error(error);


    if (
      error.code === "auth/invalid-credential" ||
      error.code === "auth/wrong-password" ||
      error.code === "auth/user-not-found"
    ) {

      mensajeLogin.textContent =
        "Correo o contraseña incorrectos.";

    } else {

      mensajeLogin.textContent =
        "No se pudo iniciar sesión.";

    }

  } finally {

    iniciarSesionAdministrador.disabled = false;

    iniciarSesionAdministrador.textContent =
      "Entrar";

  }

}


/*
==================================================
ESTADO DEL USUARIO
==================================================
*/

onAuthStateChanged(
  auth,
  function(usuario) {

    usuarioAdministrador = usuario;


    if (usuarioAdministrador) {

      botonAdministrador.textContent =
        "Panel administrador";


      renderizarProductosAdmin();

    } else {

      botonAdministrador.textContent =
        "Administrador";


      cerrarPaneles();

    }

  }
);


/*
==================================================
CERRAR SESIÓN
==================================================
*/

const botonCerrarSesion =
  document.createElement("button");


botonCerrarSesion.type = "button";

botonCerrarSesion.className =
  "boton boton-rojo boton-ancho";

botonCerrarSesion.textContent =
  "Cerrar sesión";

botonCerrarSesion.style.marginTop =
  "20px";


botonCerrarSesion.addEventListener(
  "click",
  async function() {

    try {

      await signOut(auth);

      alert(
        "Sesión cerrada correctamente."
      );

    } catch (error) {

      console.error(error);

      alert(
        "No se pudo cerrar la sesión."
      );

    }

  }
);


panelAdministrador
  .querySelector(".panel-contenido")
  .appendChild(botonCerrarSesion);


/*
==================================================
DATOS VISIBLES DE LA TIENDA
==================================================
*/

document.getElementById(
  "anioActual"
).textContent =
  new Date().getFullYear();


document.getElementById(
  "telefonoVisible"
).textContent =
  "+" + WHATSAPP;


/*
==================================================
INICIAR CARRITO
==================================================
*/

actualizarCarrito();document.getElementById("abrirLoginAdmin")?.addEventListener("click", () => {
  const ventanaLogin = document.getElementById("modalLogin");

  ventanaLogin.classList.add("activo");
  ventanaLogin.style.display = "flex";
  ventanaLogin.style.visibility = "visible";
  ventanaLogin.style.opacity = "1";
  ventanaLogin.style.pointerEvents = "auto";
});

document.getElementById("cerrarLogin")?.addEventListener("click", () => {
  const ventanaLogin = document.getElementById("modalLogin");

  ventanaLogin.classList.remove("activo");
  ventanaLogin.style.display = "none";
});const cerrarPanelCarrito = document.getElementById("cerrarPanelCarrito");

if (cerrarPanelCarrito) {
    cerrarPanelCarrito.addEventListener("click", () => {
        document.getElementById("panelCarrito").classList.remove("activo");
    });
}

const cerrarPanelAdministrador = document.getElementById("cerrarPanelAdministrador");

if (cerrarPanelAdministrador) {
    cerrarPanelAdministrador.addEventListener("click", () => {
        document.getElementById("panelAdministrador").classList.remove("activo");
    });
}
 
let categoriaElegida = "";

window.abrirGeneros = function (categoria) {
  categoriaElegida = categoria;

  const seccionCategorias =
    document.getElementById("seccionCategorias");

  const seccionGeneros =
    document.getElementById("seccionGeneros");

  const titulo =
    document.getElementById("tituloCategoriaGenero");

  titulo.textContent = categoria + ": elegí el género";

  seccionCategorias.style.display = "none";
  seccionGeneros.classList.add("activa");

  seccionGeneros.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
};

window.volverCategorias = function () {
  const seccionCategorias =
    document.getElementById("seccionCategorias");

  const seccionGeneros =
    document.getElementById("seccionGeneros");

  seccionGeneros.classList.remove("activa");
  seccionCategorias.style.display = "block";

  seccionCategorias.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
};

window.elegirGenero = function (genero) {
  filtroCategoria.value = categoriaElegida;
  filtroGenero.value = genero;

  renderizarProductos();

  const seccionGeneros =
    document.getElementById("seccionGeneros");

  seccionGeneros.classList.remove("activa");

  document
    .getElementById("productos")
    .scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
};let categoriaElegida = "";

window.abrirGeneros = function (categoria) {
  categoriaElegida = categoria;

  const seccionCategorias =
    document.getElementById("seccionCategorias");

  const seccionGeneros =
    document.getElementById("seccionGeneros");

  const titulo =
    document.getElementById("tituloCategoriaGenero");

  if (titulo) {
    titulo.textContent = categoria + ": elegí el género";
  }

  if (seccionCategorias) {
    seccionCategorias.style.display = "none";
  }

  if (seccionGeneros) {
    seccionGeneros.classList.add("activa");
    seccionGeneros.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
};

window.volverCategorias = function () {
  const seccionCategorias =
    document.getElementById("seccionCategorias");

  const seccionGeneros =
    document.getElementById("seccionGeneros");

  if (seccionGeneros) {
    seccionGeneros.classList.remove("activa");
  }

  if (seccionCategorias) {
    seccionCategorias.style.display = "block";
    seccionCategorias.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
};

window.elegirGenero = function (genero) {
  filtroCategoria.value = categoriaElegida;
  filtroGenero.value = genero;

  renderizarProductos();

  const seccionGeneros =
    document.getElementById("seccionGeneros");

  if (seccionGeneros) {
    seccionGeneros.classList.remove("activa");
  }

  const productos =
    document.getElementById("productos");

  if (productos) {
    productos.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  }
};