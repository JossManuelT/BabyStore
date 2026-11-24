(() => {
  'use strict';

  const contenedor = document.getElementById('lista-novedades');
  const estado = document.getElementById('estado-novedades');
  const actualizar = document.getElementById('actualizar-novedades');

  const configuracion = window.BABY_STORE_SUPABASE || {};
  const supabaseClient =
    window.supabase && configuracion.url && configuracion.anonKey
      ? window.supabase.createClient(configuracion.url, configuracion.anonKey)
      : null;

  function mensaje(texto) {
    if (estado) estado.textContent = texto;
  }

  function crear(tag, clase, texto) {
    const nodo = document.createElement(tag);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
  }

  function formatearPrecio(valor) {
    const numero = Number(valor);
    return Number.isNaN(numero) ? `S/${valor}` : `S/ ${numero.toFixed(2)}`;
  }

  function obtenerStock(producto) {
    
    if (producto.stock === undefined || producto.stock === null || producto.stock === '') return null;
    const numero = Number(producto.stock);
    return Number.isFinite(numero) && numero >= 0 ? numero : null;
  }

  function obtenerCodigo(producto) {
    return producto.id !== undefined && producto.id !== null
      ? `BS-${String(producto.id)}`
      : 'SIN-CODIGO';
  }

  function crearTarjeta(producto) {
    const stock = obtenerStock(producto);
    const disponible = producto.disponible !== false && (stock === null || stock > 0);
    const articulo = crear('article', 'card');
    if (!disponible) articulo.classList.add('producto-agotado');

    articulo.dataset.id = producto.id ?? '';
    articulo.dataset.codigo = obtenerCodigo(producto);
    articulo.dataset.descripcion = producto.descripcion || '';
    articulo.dataset.disponible = String(disponible);
    if (stock !== null) articulo.dataset.stock = String(stock);

    const etiqueta = crear('span', 'tag', producto.Categoria || producto.categoria || 'Vintage');
    const badgeEstado = crear(
      'span',
      `producto-estado ${disponible ? '' : 'agotado'}`.trim(),
      disponible ? 'DISPONIBLE' : 'AGOTADO'
    );
    articulo.append(etiqueta, badgeEstado);

    const imagen = crear('img');
    imagen.src = producto.imagen_url || 'img/logo.png';
    imagen.alt = producto.nombre || 'Prenda vintage';
    imagen.loading = 'lazy';
    imagen.addEventListener(
      'error',
      () => {
        imagen.onerror = null;
        imagen.src = 'img/logo.png';
      },
      { once: true }
    );
    articulo.append(imagen);

    articulo.append(crear('h3', '', producto.nombre || 'Prenda sin nombre'));
    articulo.append(crear('p', 'price', formatearPrecio(producto.precio)));

    const descripcionVisible = [
      producto.descripcion || '',
      stock !== null ? (stock > 0 ? `Stock: ${stock}` : 'Sin stock') : ''
    ].filter(Boolean).join(' · ');

    if (descripcionVisible) {
      articulo.dataset.descripcion = producto.descripcion || '';
      articulo.append(crear('p', 'novedades-descripcion', descripcionVisible));
    }

    const fechaRaw = producto.fecha_ingreso || producto.created_at;
    if (fechaRaw) {
      const fecha = new Date(fechaRaw);
      if (!Number.isNaN(fecha.getTime())) {
        articulo.append(
          crear(
            'p',
            'novedades-fecha',
            `Ingresó: ${new Intl.DateTimeFormat('es-PE', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              timeZone: 'America/Lima'
            }).format(fecha)}`
          )
        );
      }
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
    articulo.append(enlace);
    return articulo;
  }

  async function obtenerNovedades() {
    if (!contenedor) return;
    contenedor.replaceChildren();

    if (!supabaseClient) {
      mensaje('Falta conectar Supabase.');
      return;
    }

    if (actualizar) actualizar.disabled = true;
    mensaje('Cargando las últimas prendas...');

    try {
      // ordenar por fecha y luego por ID 
      let resultado = await supabaseClient
        .from('productos')
        .select('*')
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(24);

      // si no tiene created_at se usa el ID descendente
      if (resultado.error) {
        resultado = await supabaseClient
          .from('productos')
          .select('*')
          .order('id', { ascending: false })
          .limit(24);
      }

      const { data, error } = resultado;
      if (error) throw error;

      const productos = Array.isArray(data) ? data : [];
      if (!productos.length) {
        mensaje('Aún no hay prendas nuevas disponibles. ¡Vuelve pronto!');
        return;
      }

      const fragmento = document.createDocumentFragment();
      productos.forEach((producto) => fragmento.append(crearTarjeta(producto)));
      contenedor.append(fragmento);

      mensaje(`Mostrando las ${productos.length} prendas más recientes.`);
    } catch (error) {
      console.error('Error al consultar novedades en Supabase:', error);
      mensaje('No fue posible cargar las novedades. Revisa la consola o tu tabla en Supabase.');
    } finally {
      if (actualizar) actualizar.disabled = false;
    }
  }

  if (actualizar) {
    actualizar.addEventListener('click', obtenerNovedades);
  }

  obtenerNovedades();
})();
