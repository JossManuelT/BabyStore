/* Búsqueda por ?q=, filtrado por ?categoria= y por ?estilo= en coleccion.html */

function normalizarTexto(texto) {
  return String(texto || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Normaliza mayúsculas, tildes y espacios
function normalizarCategoria(texto) {
  return normalizarTexto(texto).replace(/\s+/g, ' ');
}

function obtenerStockProducto(producto) {
  
  if (producto.stock === undefined || producto.stock === null || producto.stock === '') return null;
  const numero = Number(producto.stock);
  return Number.isFinite(numero) && numero >= 0 ? numero : null;
}

const ESTILOS_KEYWORDS = {
  y2k: ['y2k', 'dosmilero', '2000', 'brillos', 'pedreria', 'mariposa', 'crop'],
  grunge: ['grunge', 'alternativo', 'rasgado', 'cuadros', 'oversize', 'denim', 'pedreria'],
  gotico: ['gotico', 'gothic', 'dark', 'negro', 'cruz', 'calavera', 'encaje', 'vamp']
};

const parametrosBusqueda = new URLSearchParams(window.location.search);

let categoriaSeleccionada =
  normalizarCategoria(parametrosBusqueda.get('categoria') || 'all');

let estiloSeleccionado =
  normalizarTexto(parametrosBusqueda.get('estilo') || '').trim();

const supabaseClient = supabase.createClient(
  window.BABY_STORE_SUPABASE.url,
  window.BABY_STORE_SUPABASE.anonKey
);

let terminoBusqueda =
  normalizarTexto(parametrosBusqueda.get('q') || '').trim();

let productosCache = [];

function renderizarColeccion() {
  const contenedor = document.getElementById('contenedorProductos');
  if (!contenedor) return;

  contenedor.innerHTML = '';

  const productosFiltrados = productosCache.filter((producto) => {
    const nombre = normalizarTexto(producto.nombre);
    const categoria = normalizarCategoria(producto.Categoria ?? producto.categoria);
    const descripcion = normalizarTexto(producto.descripcion);
    const textoCompleto = `${nombre} ${categoria} ${descripcion}`;

    const coincideBusqueda =
      !terminoBusqueda || textoCompleto.includes(terminoBusqueda);

    const coincideCategoria =
      categoriaSeleccionada === 'all' ||
      categoria === categoriaSeleccionada;

    const keywordsEstilo = estiloSeleccionado
      ? (ESTILOS_KEYWORDS[estiloSeleccionado] || [estiloSeleccionado])
      : [];

    const coincideEstilo =
      !estiloSeleccionado ||
      keywordsEstilo.some((kw) => textoCompleto.includes(kw));

    return coincideBusqueda && coincideCategoria && coincideEstilo;
  });

  productosFiltrados.forEach((producto) => {
    const stock = obtenerStockProducto(producto);
    const disponible = producto.disponible !== false && (stock === null || stock > 0);
    const categoriaMostrar = producto.Categoria ?? producto.categoria ?? 'Vintage';
    const descripcionVisible = [
      producto.descripcion || '',
      stock !== null ? (stock > 0 ? `Stock: ${stock}` : 'Sin stock') : ''
    ].filter(Boolean).join(' · ');
    const codigo = producto.id !== undefined && producto.id !== null ? `BS-${String(producto.id)}` : 'SIN-CODIGO';
    const tarjeta = document.createElement('article');
    tarjeta.classList.add('card');
    if (!disponible) tarjeta.classList.add('producto-agotado');

    tarjeta.dataset.id = producto.id ?? '';
    tarjeta.dataset.codigo = codigo;
    tarjeta.dataset.descripcion = producto.descripcion || '';
    tarjeta.dataset.disponible = String(disponible);
    if (stock !== null) tarjeta.dataset.stock = String(stock);

    tarjeta.innerHTML = `
      <span class="tag">${categoriaMostrar}</span>
      <span class="producto-estado ${disponible ? '' : 'agotado'}">${disponible ? 'DISPONIBLE' : 'AGOTADO'}</span>
      <img src="${producto.imagen_url}" alt="${producto.nombre}">
      <h3>${producto.nombre}</h3>
      <p class="price">S/${producto.precio}</p>
      ${descripcionVisible ? `<p class="card-subdesc">${descripcionVisible}</p>` : ''}
      <a class="btn btn-la-quiero" href="#contacto" ${disponible ? '' : 'aria-disabled="true"'}>
        <img class="ico" src="img/coraz.png" alt="">
        La quiero
      </a>
    `;

    contenedor.appendChild(tarjeta);
  });

  const seccion = document.querySelector('main section');
  if (seccion) {
    const mensajePrevio = seccion.querySelector('.resultado-busqueda');
    if (mensajePrevio) mensajePrevio.remove();

    if (terminoBusqueda || categoriaSeleccionada !== 'all' || estiloSeleccionado) {
      const mensaje = document.createElement('p');
      mensaje.className = 'resultado-busqueda';
      const partes = [];
      if (estiloSeleccionado) partes.push(`estilo "${estiloSeleccionado.toUpperCase()}"`);
      if (terminoBusqueda) partes.push(`búsqueda "${terminoBusqueda}"`);
      if (categoriaSeleccionada !== 'all') partes.push(`categoría "${categoriaSeleccionada}"`);

      mensaje.textContent = productosFiltrados.length
        ? `Mostrando ${productosFiltrados.length} prenda(s) para ${partes.join(' y ')}.`
        : `No encontramos prendas para ${partes.join(' y ')}.`;

      seccion.insertBefore(mensaje, contenedor);
    }
  }
}

async function cargarProductos() {
  const { data, error } = await supabaseClient
    .from('productos')
    .select('*');

  if (error) {
    console.error(error);
    return;
  }

  productosCache = Array.isArray(data) ? data : [];
  renderizarColeccion();
}

window.BABY_STORE_BUSCAR_COLECCION = (nuevoTermino) => {
  terminoBusqueda = normalizarTexto(nuevoTermino);
  renderizarColeccion();
};

cargarProductos();

document.querySelectorAll('[data-categoria]').forEach((enlace) => {
  enlace.addEventListener('click', (e) => {
    e.preventDefault();
    categoriaSeleccionada = normalizarCategoria(enlace.dataset.categoria || 'all');
    estiloSeleccionado = '';
    renderizarColeccion();
  });
});
