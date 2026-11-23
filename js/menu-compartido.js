// MENÚ HAMBURGUESA COMPARTIDO
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
  if (menuPrincipal.classList.contains('is-active')) {
    cerrarMenu();
  } else {
    abrirMenu();
  }
}

// Abrir y cerrar con el botón de menu
if (botonMenu && menuPrincipal) {
  botonMenu.addEventListener('click', alternarMenu);
}

// Cerrar con la X.
if (botonCerrarMenu) {
  botonCerrarMenu.addEventListener('click', cerrarMenu);
}

// Cerrar tocando el fondo oscuro.
if (fondoMenu) {
  fondoMenu.addEventListener('click', cerrarMenu);
}

// Cerrar al seleccionar un enlace.
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

// Cerrar presionando Escape.
document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape') {
    cerrarMenu();
  }
});