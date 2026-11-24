
let productosDestacados = [];

async function cargarProductosDestacados() {
  const config = window.BABY_STORE_SUPABASE;
  if (config == null) {
    console.error("No se cargo supabase-config.js");
    return;
  }
  if (!config.url) {
    console.error("Falta la URL de Supabase");
    return;
  }
  if (!config.anonKey) {
    console.error("Falta la clave publica de Supabase");
    return;
  }
  try {
    const parametros = new URLSearchParams({
      select: "nombre,categoria,precio,imagen_url,disponible",
      disponible: "eq.true",
      order: "fecha_ingreso.desc",
      limit: "8"
    });
    const urlConsulta = config.url.replace(/\/$/, "") + "/rest/v1/productos?" + parametros.toString();
    const respuesta = await fetch(urlConsulta, {
      headers: {
        apikey: config.anonKey,
        Authorization: "Bearer " + config.anonKey,
        Accept: "application/json"
      },
      cache: "no-store"
    });
    if (!respuesta.ok) {
      throw new Error("Error HTTP " + respuesta.status + " al consultar Supabase");
    }
    const datos = await respuesta.json();
    if (!Array.isArray(datos)) {
      throw new Error("Supabase no devolvio una lista de productos");
    }
    productosDestacados = datos.map(function (producto) {
      return {
        nombre: producto.nombre,
        imagen: producto.imagen_url ? producto.imagen_url : "img/logo.png",
        precio: "S/" + Number(producto.precio).toFixed(2),
        etiqueta: producto.categoria ? producto.categoria : "Vintage",
        disponible: producto.disponible
      };
    });
    mostrarProductos();
    console.info("Baby Store: productos cargados:", productosDestacados.length);
  } catch (error) {
    console.error("Error cargando productos:", error);
  }
}

// SEMANA 13: crear las tarjetas de productos mediante el DOM.
function mostrarProductos() {
  const contenedor = document.getElementById('productosDestacados');
  if (!contenedor) return;

  contenedor.replaceChildren();

  // SEMANA 12: recorrer el arreglo.
  productosDestacados.forEach((producto) => {
    const tarjeta = document.createElement('article');
    tarjeta.classList.add('card');

    const estado = document.createElement('span');
    estado.classList.add('producto-estado');
    estado.textContent = producto.disponible ? 'DISPONIBLE' : 'AGOTADO';

    if (!producto.disponible) {
      tarjeta.classList.add('producto-agotado');
      estado.classList.add('agotado');
    }

    const etiqueta = document.createElement('span');
    etiqueta.classList.add('tag');
    etiqueta.textContent = producto.etiqueta;

    const imagen = document.createElement('img');
    imagen.src = producto.imagen;
    imagen.alt = producto.nombre;
    imagen.loading = 'lazy';

    const nombre = document.createElement('h3');
    nombre.textContent = producto.nombre;

    const precio = document.createElement('p');
    precio.classList.add('price');
    precio.textContent = producto.precio;

    tarjeta.append(estado, etiqueta, imagen, nombre, precio);
    contenedor.appendChild(tarjeta);
  });
}

// SEMANA 14: menú móvil. El mismo botón alterna entre abrir y cerrar.
// También se puede cerrar con la X del panel, el fondo, Escape o un enlace.
const botonMenu = document.getElementById('menuToggle');
const menuPrincipal = document.getElementById('menuPrincipal');
const botonCerrarMenu = document.getElementById('cerrarMenu');
const fondoMenu = document.getElementById('menuBackdrop');

function abrirMenu() {
  if (!botonMenu || !menuPrincipal) return;

  menuPrincipal.classList.add('is-active');
  menuPrincipal.setAttribute('aria-hidden', 'false');
  botonMenu.setAttribute('aria-expanded', 'true');
  botonMenu.setAttribute('aria-label', 'Cerrar menú');

  if (fondoMenu) {
    fondoMenu.hidden = false;
    fondoMenu.classList.add('is-visible');
  }

  document.body.classList.add('menu-abierto');
}

function cerrarMenu() {
  if (!botonMenu || !menuPrincipal) return;

  menuPrincipal.classList.remove('is-active');
  menuPrincipal.setAttribute('aria-hidden', 'true');
  botonMenu.setAttribute('aria-expanded', 'false');
  botonMenu.setAttribute('aria-label', 'Abrir menú');

  if (fondoMenu) {
    fondoMenu.classList.remove('is-visible');
    fondoMenu.hidden = true;
  }

  document.body.classList.remove('menu-abierto');
}

function alternarMenu() {
  if (!menuPrincipal) return;
  if (menuPrincipal.classList.contains('is-active')) {
    cerrarMenu();
  } else {
    abrirMenu();
  }
}

if (botonMenu && menuPrincipal) {
  botonMenu.addEventListener('click', alternarMenu);
}

if (botonCerrarMenu) {
  botonCerrarMenu.addEventListener('click', cerrarMenu);
}

if (fondoMenu) {
  fondoMenu.addEventListener('click', cerrarMenu);
}

if (menuPrincipal) {
  menuPrincipal.querySelectorAll('a').forEach((enlace) => {
    enlace.addEventListener('click', (evento) => {
      // Categorías aún no tiene destino; evita que el enlace # salte arriba.
      if (enlace.getAttribute('aria-disabled') === 'true') {
        evento.preventDefault();
        return;
      }
      cerrarMenu();
    });
  });
}

// SEMANA 14: ventana modal "Cómo comprar".
const modalCompra = document.getElementById('modalCompra');
const botonAbrirModal = document.getElementById('abrirModal');
const botonCerrarModal = document.getElementById('cerrarModal');
const botonEntendido = document.getElementById('entendidoModal');

function abrirModalCompra() {
  if (!modalCompra) return;
  modalCompra.classList.add('is-visible');
  modalCompra.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-abierto');
  if (botonCerrarModal) botonCerrarModal.focus();
}

function cerrarModalCompra() {
  if (!modalCompra) return;
  modalCompra.classList.remove('is-visible');
  modalCompra.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('modal-abierto');
  if (botonAbrirModal) botonAbrirModal.focus();
}

if (botonAbrirModal) botonAbrirModal.addEventListener('click', abrirModalCompra);
if (botonCerrarModal) botonCerrarModal.addEventListener('click', cerrarModalCompra);
if (botonEntendido) botonEntendido.addEventListener('click', cerrarModalCompra);

if (modalCompra) {
  modalCompra.addEventListener('click', (evento) => {
    if (evento.target === modalCompra) cerrarModalCompra();
  });
}

// SEMANA 11: el formulario crea un mensaje y abre WhatsApp.
const formularioContacto = document.getElementById('formularioContacto');
const numeroWhatsApp = '51928042196';

if (formularioContacto) {
  formularioContacto.addEventListener('submit', (evento) => {
    evento.preventDefault();

    if (!formularioContacto.reportValidity()) return;

    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('email').value.trim();
    const mensaje = document.getElementById('mensaje').value.trim();

    const texto = [
      'Hola, Baby Store. Quisiera realizar una consulta.',
      '',
      `Nombre: ${nombre}`,
      correo ? `Correo: ${correo}` : '',
      `Mensaje: ${mensaje}`
    ].filter(Boolean).join('\n');

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(texto)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
}

// SEMANA 14: Escape cierra el modal o el menú si están abiertos.
document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape') {
    cerrarModalCompra();
    cerrarMenu();
  }
});

// SEMANA 13: mostrar tarjetas cuando el documento ya está listo.
cargarProductosDestacados();