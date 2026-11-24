// Menu hambuerguesa compartido para todas las páginas
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
      if (enlace.getAttribute('aria-disabled') === 'true') {
        evento.preventDefault();
        return;
      }
      cerrarMenu();
    });
  });
}
document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape') {
    cerrarMenu();
  }
});

// Abrir/cerrar menu de categorias
const btnCategorias = document.getElementById('btnCategorias');
const itemCategorias = document.querySelector('.menu-categorias');

if (btnCategorias && itemCategorias) {
  btnCategorias.addEventListener('click', (evento) => {
    evento.stopPropagation();
    const abierto = itemCategorias.classList.toggle('is-open');
    btnCategorias.setAttribute('aria-expanded', String(abierto));
  });

  document.addEventListener('click', (evento) => {
    if (!itemCategorias.contains(evento.target)) {
      itemCategorias.classList.remove('is-open');
      btnCategorias.setAttribute('aria-expanded', 'false');
    }
  });
}

// Formulario de contacto a wsp
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

// CONTADOR DEL CARRITO Y NOTIFICACIon
function refrescarContadorCarrito() {
  let cantidad = 0;
  try {
    const items = JSON.parse(localStorage.getItem('babyStoreCarrito') || '[]');
    cantidad = Array.isArray(items) ? items.length : 0;
  } catch {
    cantidad = 0;
  }

  document.querySelectorAll('.carrito').forEach((enlaceCarrito) => {
    let badge = enlaceCarrito.querySelector('.carrito-contador');
    if (!badge) {
      badge = document.createElement('span');
      badge.className = 'carrito-contador';
      enlaceCarrito.appendChild(badge);
    }
    badge.textContent = String(cantidad);
    badge.hidden = cantidad <= 0;
  });
}

let toastTimer = null;
function mostrarAvisoCarrito(texto) {
  let toast = document.getElementById('toastCarrito');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toastCarrito';
    toast.className = 'toast-carrito';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }

  toast.textContent = texto;
  toast.classList.add('is-visible');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('is-visible');
  }, 2400);
}

function agregarPrendaAlCarrito(datos, opciones = {}) {
  if (!datos) return false;
  const { silencioso = false } = opciones;
  const carrito = JSON.parse(localStorage.getItem('babyStoreCarrito') || '[]');
  const yaExiste = carrito.some((item) => String(item.id) === String(datos.id));

  if (!yaExiste) {
    carrito.push({
      id: String(datos.id),
      codigo: datos.codigo || `BS-${String(datos.id)}`,
      stock: datos.stock ?? null,
      nombre: datos.nombre,
      categoria: datos.categoria,
      precioTexto: datos.precioTexto,
      imagen: datos.imagen
    });
    localStorage.setItem('babyStoreCarrito', JSON.stringify(carrito));
  }

  refrescarContadorCarrito();
  if (!silencioso) {
    mostrarAvisoCarrito(
      yaExiste
        ? `"${datos.nombre}" ya está en tu carrito.`
        : `Agregado al carrito: "${datos.nombre}"`
    );
  }
  return !yaExiste;
}

window.BABY_STORE_CARRITO = {
  agregar: agregarPrendaAlCarrito,
  refrescar: refrescarContadorCarrito,
  aviso: mostrarAvisoCarrito
};

// Guardar producto en carrito
document.addEventListener('click', (evento) => {
  const botonTarjeta = evento.target.closest('.card .btn-la-quiero');
  if (!botonTarjeta) return;

  evento.preventDefault();
  evento.stopPropagation();

  const tarjeta = botonTarjeta.closest('.card');
  if (!tarjeta) return;

  if (tarjeta.dataset.disponible === 'false' || botonTarjeta.getAttribute('aria-disabled') === 'true') {
    mostrarAvisoCarrito('Esta prenda figura como AGOTADA.');
    return;
  }

  const img = tarjeta.querySelector('img');
  const nombre = tarjeta.querySelector('h3')?.textContent.trim() || 'Prenda Baby Store';
  const categoria = tarjeta.querySelector('.tag')?.textContent.trim() || 'Vintage';
  const precioTexto = tarjeta.querySelector('.price')?.textContent.trim() || 'S/ 0.00';
  const id = tarjeta.dataset.id || botonTarjeta.dataset.id || '';

const codigo = /^\d+$/.test(String(id))
  ? `BS-${String(id)}`
  : 'SIN-CODIGO';
  const stock = tarjeta.dataset.stock !== undefined ? Number(tarjeta.dataset.stock) : null;

  agregarPrendaAlCarrito({
    id,
    codigo,
    stock,
    nombre,
    categoria,
    precioTexto,
    imagen: img ? img.src : 'img/logo.png'
  });
});

// Buscador de productos
document.querySelectorAll('form.buscador').forEach((formBuscador) => {
  const inputBuscador = formBuscador.querySelector('input[type="search"]');
  if (!inputBuscador) return;

  const paramsActuales = new URLSearchParams(window.location.search);
  const qInicial = paramsActuales.get('q');
  if (qInicial && !inputBuscador.value) {
    inputBuscador.value = qInicial;
  }

  formBuscador.addEventListener('submit', (evento) => {
    const termino = inputBuscador.value.trim();
    const esColeccion = window.location.pathname.endsWith('coleccion.html');

    if (esColeccion && typeof window.BABY_STORE_BUSCAR_COLECCION === 'function') {
      evento.preventDefault();
      const url = new URL(window.location.href);
      if (termino) {
        url.searchParams.set('q', termino);
      } else {
        url.searchParams.delete('q');
      }
      window.history.replaceState({}, '', url);
      window.BABY_STORE_BUSCAR_COLECCION(termino);
    }
  });
});

refrescarContadorCarrito();
