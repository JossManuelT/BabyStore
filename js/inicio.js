/* Interacciones de index.html */

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

document.addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape') {
    cerrarModalCompra();
  }
});

const supabaseClient = supabase.createClient(
  window.BABY_STORE_SUPABASE.url,
  window.BABY_STORE_SUPABASE.anonKey
);

function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function obtenerStockInicio(producto) {
  
  if (producto.stock === undefined || producto.stock === null || producto.stock === '') return null;
  const numero = Number(producto.stock);
  return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

const ESTILOS_CONFIG = {
  y2k: {
    keywords: ['y2k', 'dosmilero', '2000', 'brillos', 'pedreria', 'mariposa', 'crop'],
    overlay: 'linear-gradient(135deg, rgba(255, 227, 241, .72), rgba(255, 79, 163, .38))'
  },
  grunge: {
    keywords: ['grunge', 'alternativo', 'rasgado', 'cuadros', 'oversize', 'denim', 'pedreria'],
    overlay: 'linear-gradient(135deg, rgba(20, 15, 20, .58), rgba(184, 116, 148, .38))'
  },
  gotico: {
    keywords: ['gotico', 'gothic', 'dark', 'negro', 'cruz', 'calavera', 'encaje', 'vamp'],
    overlay: 'linear-gradient(135deg, rgba(17, 17, 17, .62), rgba(143, 79, 111, .38))'
  }
};

function configurarEstilosDesdeBD(todosLosProductos) {
  const tarjetasEstilo = document.querySelectorAll('.categoria-preview[data-estilo]');
  if (!tarjetasEstilo.length) return;

  const lista = Array.isArray(todosLosProductos) ? todosLosProductos : [];
  const usadasComoPortada = new Set();

  tarjetasEstilo.forEach((tarjetaEstilo) => {
    const estiloClave = normalizarTexto(tarjetaEstilo.dataset.estilo).trim();
    const config = ESTILOS_CONFIG[estiloClave] || {
      keywords: [estiloClave],
      overlay: 'linear-gradient(135deg, rgba(20, 15, 20, .55), rgba(184, 116, 148, .35))'
    };

    const coincidencias = lista.filter((p) => {
      const texto = normalizarTexto(`${p.Categoria || p.categoria || ''} ${p.nombre || ''} ${p.descripcion || ''}`);
      return config.keywords.some((kw) => texto.includes(kw));
    });

    // Elige foto de portada de la base de datos
    const candidata =
      coincidencias.find((p) => p.imagen_url && !usadasComoPortada.has(p.imagen_url)) ||
      coincidencias.find((p) => p.imagen_url) ||
      lista.find((p) => p.imagen_url && !usadasComoPortada.has(p.imagen_url));

    if (candidata && candidata.imagen_url) {
      usadasComoPortada.add(candidata.imagen_url);
      tarjetaEstilo.style.backgroundImage = `${config.overlay}, url('${candidata.imagen_url}')`;
    }

    // Muestra elconteo solo si hay prendas reales encontradas 
    let badgeConteo = tarjetaEstilo.querySelector('.categoria-conteo');
    if (coincidencias.length > 0) {
      if (!badgeConteo) {
        badgeConteo = document.createElement('span');
        badgeConteo.className = 'categoria-conteo';
        const topRow = tarjetaEstilo.querySelector('.categoria-preview-top');
        if (topRow) topRow.appendChild(badgeConteo);
      }
      badgeConteo.textContent =
        coincidencias.length === 1 ? '1 prenda' : `${coincidencias.length} prendas`;
    } else if (badgeConteo) {
      badgeConteo.remove();
    }

    tarjetaEstilo.classList.add('es-interactivo');
    tarjetaEstilo.setAttribute('role', 'button');
    tarjetaEstilo.setAttribute('tabindex', '0');

    const irAEstilo = () => {
      window.location.href = `coleccion.html?estilo=${encodeURIComponent(estiloClave)}`;
    };

    tarjetaEstilo.addEventListener('click', irAEstilo);
    tarjetaEstilo.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        irAEstilo();
      }
    });
  });
}

async function mostrarProductosDesdeSupabase() {
  const { data, error } = await supabaseClient
    .from('productos')
    .select('*');

  if (error) {
    console.error(error);
    configurarEstilosDesdeBD([]);
    return;
  }

  const todos = Array.isArray(data) ? data : [];
  configurarEstilosDesdeBD(todos);

  // muestra productos destacados de bd
  const destacados = todos
    .filter((producto) => producto.destacado === true)
    .slice(0, 6);
  const contenedor = document.getElementById('productosDestacados');
  if (!contenedor) return;

  contenedor.replaceChildren();

  destacados.forEach((producto) => {
    const stock = obtenerStockInicio(producto);
    const disponible = producto.disponible !== false && (stock === null || stock > 0);
    const tarjeta = document.createElement('article');
    tarjeta.classList.add('card');
    if (!disponible) tarjeta.classList.add('producto-agotado');

    tarjeta.dataset.id = producto.id ?? '';
    tarjeta.dataset.codigo = producto.id !== undefined && producto.id !== null ? `BS-${String(producto.id)}` : 'SIN-CODIGO';
    tarjeta.dataset.descripcion = producto.descripcion || '';
    tarjeta.dataset.disponible = String(disponible);
    if (stock !== null) tarjeta.dataset.stock = String(stock);

    const etiqueta = document.createElement('span');
    etiqueta.classList.add('tag');
    etiqueta.textContent = producto.Categoria ?? producto.categoria ?? 'Vintage';

    const estadoBadge = document.createElement('span');
    estadoBadge.classList.add('producto-estado');
    if (!disponible) estadoBadge.classList.add('agotado');
    estadoBadge.textContent = disponible ? 'DISPONIBLE' : 'AGOTADO';

    const imagen = document.createElement('img');
    imagen.src = producto.imagen_url;
    imagen.alt = producto.nombre;

    const nombre = document.createElement('h3');
    nombre.textContent = producto.nombre;

    const precio = document.createElement('p');
    precio.classList.add('price');
    precio.textContent = `S/${producto.precio}`;

    const descripcionVisible = [
      producto.descripcion || '',
      stock !== null ? (stock > 0 ? `Stock: ${stock}` : 'Sin stock') : ''
    ].filter(Boolean).join(' · ');
    if (descripcionVisible) {
      tarjeta.dataset.descripcion = producto.descripcion || '';
      const descripcion = document.createElement('p');
      descripcion.className = 'card-subdesc';
      descripcion.textContent = descripcionVisible;
      tarjeta.appendChild(descripcion);
    }

    const enlace = document.createElement('a');
    enlace.className = 'btn btn-la-quiero';
    enlace.href = '#contacto';
    if (!disponible) {
      enlace.setAttribute('aria-disabled', 'true');
    }
    if (producto.id !== undefined && producto.id !== null) {
      enlace.dataset.id = String(producto.id);
    }

    const icono = document.createElement('img');
    icono.className = 'ico';
    icono.src = 'img/coraz.png';
    icono.alt = '';

    enlace.append(icono, document.createTextNode('La quiero'));

    tarjeta.prepend(etiqueta, estadoBadge, imagen, nombre, precio);
    tarjeta.append(enlace);

    contenedor.appendChild(tarjeta);
  });
}

mostrarProductosDesdeSupabase();
