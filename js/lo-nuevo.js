(() => {
  'use strict';
  const contenedor = document.getElementById('lista-novedades');
  const estado = document.getElementById('estado-novedades');
  const actualizar = document.getElementById('actualizar-novedades');
  const configuracion = window.BABY_STORE_SUPABASE || {};
  const url = String(configuracion.url || '').replace(/\/$/, '');
  const clave = String(configuracion.anonKey || '');

  const mensaje = (texto) => { estado.textContent = texto; };
  const crear = (tag, clase, texto) => {
    const nodo = document.createElement(tag);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
  };
  const precio = (valor) => 'S/ ' + Number(valor).toFixed(2);

  function tarjeta(producto) {
    const articulo = crear('article', 'card');
    articulo.append(crear('span', 'tag', producto.categoria || 'Vintage'));
    const imagen = crear('img');
    // Solo se aceptan rutas locales o URLs HTTPS guardadas en la base de datos.
    const ruta = String(producto.imagen_url || '');
    if (/^https:\/\//i.test(ruta) || /^img\/[a-z0-9_.-]+$/i.test(ruta)) {
      imagen.src = ruta;
    } else {
      imagen.src = 'img/logo.png';
    }
    imagen.alt = producto.nombre || 'Prenda vintage';
    imagen.loading = 'lazy';
    imagen.addEventListener('error', () => { imagen.onerror = null; imagen.src = 'img/logo.png'; }, { once: true });
    articulo.append(imagen);
    articulo.append(crear('h3', '', producto.nombre));
    articulo.append(crear('p', 'price', precio(producto.precio)));
    if (producto.descripcion) articulo.append(crear('p', 'novedades-descripcion', producto.descripcion));
    const fecha = new Date(producto.fecha_ingreso);
    if (!Number.isNaN(fecha.getTime())) {
      articulo.append(crear('p', 'novedades-fecha', `Ingresó: ${new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Lima' }).format(fecha)}`));
    }
    const enlace = crear('a', 'btn', '♡ La quiero');
    enlace.href = '#contacto'; // Se conserva el contacto original; no se implemento el carrito.
    articulo.append(enlace);
    return articulo;
  }

  async function obtenerNovedades() {
    contenedor.replaceChildren();
    if (!url.startsWith('https://') || !clave || clave.includes('REEMPLAZAR') || url.includes('REEMPLAZAR')) {
      mensaje('Falta conectar Supabase.');
      return;
    }
    actualizar.disabled = true;
    mensaje('Cargando prendas nuevas...');
    try {
      const parametros = new URLSearchParams({
        select: 'id,nombre,categoria,descripcion,precio,imagen_url,fecha_ingreso',
        disponible: 'eq.true',
        order: 'fecha_ingreso.desc,id.desc',
        limit: '24'
      });
      const respuesta = await fetch(`${url}/rest/v1/productos?${parametros}`, {
        headers: { 'apikey': clave, 'Authorization': `Bearer ${clave}`, 'Accept': 'application/json' },
        cache: 'no-store'
      });
      if (!respuesta.ok) throw new Error(`Error HTTP ${respuesta.status}`);
      const productos = await respuesta.json();
      if (!Array.isArray(productos)) throw new Error('La base de datos no devolvió una lista.');
      if (!productos.length) { mensaje('Aún no hay prendas nuevas disponibles. ¡Vuelve pronto!'); return; }
      const fragmento = document.createDocumentFragment();
      productos.forEach((producto) => fragmento.append(tarjeta(producto)));
      contenedor.append(fragmento);
      mensaje(`Mostrando ${productos.length} prenda(s), de la más reciente a la más antigua.`);
    } catch (error) {
      console.error('Error al consultar productos:', error);
      mensaje('No fue posible cargar las novedades. Verifica la conexión y la configuración de Supabase.');
    } finally {
      actualizar.disabled = false;
    }
  }

  actualizar.addEventListener('click', obtenerNovedades);
  obtenerNovedades();
})();