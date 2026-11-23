/* Interacciones de la página principal. */
// Cambia true a false
const productosDestacados = [
  {
    nombre: 'Abrigo peluche 2000s vintage',
    imagen: 'img/Abrigo_peluche_2000s_vintage.jpeg',
    precio: 'S/150',
    etiqueta: 'Abrigo',
    disponible: true
  },
  {
    nombre: 'Polo Y2K gótico',
    imagen: 'img/Polo_Y2K_gotico.jpeg',
    precio: 'S/80',
    etiqueta: 'Gótico',
    disponible: false
  },
  {
    nombre: 'Jacket 2000s',
    imagen: 'img/Jacket_2000s.jpeg',
    precio: 'S/150',
    etiqueta: 'Abrigo',
    disponible: true
  },
  {
    nombre: 'Polo Y2K',
    imagen: 'img/Polo_Y2K.jpeg',
    precio: 'S/70',
    etiqueta: 'Y2K',
    disponible: true
  },
  {
    nombre: 'Falda grunge con pedrería',
    imagen: 'img/Falda_grunge_con_pedreria.jpeg',
    precio: 'S/95',
    etiqueta: 'Grunge',
    disponible: true
  },
  {
    nombre: 'Top 2000s',
    imagen: 'img/Top_2000s.jpeg',
    precio: 'S/70',
    etiqueta: 'Dosmilero',
    disponible: false
  },
  {
    nombre: 'Blusa dosmilera',
    imagen: 'img/Blusa_dosmilera.jpeg',
    precio: 'S/80',
    etiqueta: 'Dosmilero',
    disponible: true
  },
  {
    nombre: 'Jean a la cadera Y2K',
    imagen: 'img/Jean_a_la_cadera_Y2K.jpeg',
    precio: 'S/110',
    etiqueta: 'Denim',
    disponible: true
  }
];

// tarjetas DOM.
function mostrarProductos() {
  const contenedor = document.getElementById('productosDestacados');
  if (!contenedor) return;

  contenedor.replaceChildren();

  // recorrer arreglo.
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

//menú móvil botón abrir y cerrar.
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
      // Categorías aún no tiene destino.
      if (enlace.getAttribute('aria-disabled') === 'true') {
        evento.preventDefault();
        return;
      }
      cerrarMenu();
    });
  });
}

// ventana modal "Cómo comprar".
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

// el formulario y WhatsApp.
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

// Escape cierra el modal o el menú si están abiertos.
document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape') {
    cerrarModalCompra();
    cerrarMenu();
  }
});

// muestra sugerencia de mensaje al estar listo.
mostrarProductos();

