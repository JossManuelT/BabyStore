/* Coleccion: catalogo completo desde Supabase, separado del orden de Lo Nuevo. */
/* Coleccion: catalogo completo desde Supabase, separado del orden de Lo Nuevo. */
(function () {
  'use strict';

  const contenedor = document.getElementById('catalogoProductos');
  const estado = document.getElementById('estadoColeccion');
  const filtros = document.getElementById('filtrosCategorias');
  const ordenControl = document.getElementById('ordenColeccion');
  const campoBusqueda = document.querySelector('form.buscador input[name="q"]');
  const consulta = new URLSearchParams(window.location.search).get('q') || '';
  const config = window.BABY_STORE_SUPABASE;
  let productos = [];
  let categoriaActiva = 'Todas';

  if (!contenedor || !estado || !filtros || !ordenControl) return;
  if (campoBusqueda) campoBusqueda.value = consulta;

  function elemento(etiqueta, clase, contenido) {
    const nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (contenido !== undefined) nodo.textContent = String(contenido);
    return nodo;
  }

  function crearTarjeta(producto) {
    const tarjeta = elemento('article', 'card catalogo-tarjeta');
    const imagenMarco = elemento('div', 'catalogo-imagen');
    const imagen = document.createElement('img');
    const ruta = String(producto.imagen_url || '');
    imagen.src = ruta.startsWith('https://') || /^img\/[a-zA-Z0-9_.-]+$/.test(ruta) ? ruta : 'img/logo.png';
    imagen.alt = producto.nombre || 'Prenda vintage';
    imagen.loading = 'lazy';
    imagen.addEventListener('error', function () {
      if (!imagen.src.endsWith('/img/logo.png')) imagen.src = 'img/logo.png';
    });
    imagenMarco.append(imagen);
    tarjeta.append(imagenMarco);
    tarjeta.append(elemento('span', 'tag', producto.categoria || 'Vintage'));
    tarjeta.append(elemento('h3', '', producto.nombre || 'Prenda vintage'));
    tarjeta.append(elemento('p', 'price', 'S/ ' + Number(producto.precio).toFixed(2)));
    const botonPedido = elemento('button', 'btn', '♡ La quiero');
    botonPedido.type = 'button';
    botonPedido.addEventListener('click', function () { abrirSolicitud(producto); });
    tarjeta.append(botonPedido);
    return tarjeta;
  }

  function actualizarFiltros() {
    const categorias = [...new Set(productos.map(function (producto) {
      return producto.categoria || 'Vintage';
    }))].sort(function (a, b) { return a.localeCompare(b, 'es'); });
    const lista = ['Todas'].concat(categorias);
    filtros.replaceChildren();
    lista.forEach(function (categoria) {
      const total = categoria === 'Todas' ? productos.length :
        productos.filter(function (p) { return (p.categoria || 'Vintage') === categoria; }).length;
      const boton = elemento('button', 'catalogo-categoria', categoria === 'Todas' ? 'Todas las prendas' : categoria);
      boton.type = 'button';
      boton.dataset.categoria = categoria;
      boton.setAttribute('aria-pressed', String(categoria === categoriaActiva));
      if (categoria === categoriaActiva) boton.classList.add('seleccionada');
      boton.append(elemento('span', 'catalogo-numero', String(total)));
      boton.addEventListener('click', function () {
        categoriaActiva = categoria;
        actualizarFiltros();
        renderizar();
      });
      filtros.append(boton);
    });
  }

  function renderizar() {
    const termino = consulta.trim().toLocaleLowerCase('es');
    const visibles = productos.filter(function (p) {
      const coincideCategoria = categoriaActiva === 'Todas' || (p.categoria || 'Vintage') === categoriaActiva;
      const texto = (String(p.nombre || '') + ' ' + String(p.categoria || '')).toLocaleLowerCase('es');
      return coincideCategoria && texto.includes(termino);
    });
    const modo = ordenControl.value;
    visibles.sort(function (a, b) {
      if (modo === 'precio-asc') return Number(a.precio) - Number(b.precio);
      if (modo === 'precio-desc') return Number(b.precio) - Number(a.precio);
      if (modo === 'recientes') return new Date(b.fecha_ingreso) - new Date(a.fecha_ingreso) || Number(b.id) - Number(a.id);
      if (modo === 'nombre') return String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
      const porCategoria = String(a.categoria || 'Vintage').localeCompare(String(b.categoria || 'Vintage'), 'es');
      return porCategoria || String(a.nombre || '').localeCompare(String(b.nombre || ''), 'es');
    });
    const fragmento = document.createDocumentFragment();
    visibles.forEach(function (p) { fragmento.append(crearTarjeta(p)); });
    contenedor.replaceChildren(fragmento);
    estado.textContent = visibles.length ?
      visibles.length + ' prenda(s) encontrada(s)' + (termino ? ' para «' + consulta + '»' : '') + '.' :
      'No se encontraron prendas con estos filtros.';
  }

  async function cargarColeccion() {
    if (!config || !config.url || !config.anonKey) {
      estado.textContent = 'Falta configurar Supabase.';
      return;
    }
    try {
      estado.textContent = 'Cargando colección...';
      const parametros = new URLSearchParams({
        select: 'id,nombre,categoria,precio,imagen_url,disponible,fecha_ingreso',
        disponible: 'eq.true',
        order: 'nombre.asc',
        limit: '500'
      });
      const urlBase = String(config.url).replace(/\/$/, '');
      const respuesta = await fetch(urlBase + '/rest/v1/productos?' + parametros.toString(), {
        headers: {
          apikey: config.anonKey,
          Authorization: 'Bearer ' + config.anonKey,
          Accept: 'application/json'
        },
        cache: 'no-store'
      });
      if (!respuesta.ok) throw new Error('Error HTTP ' + respuesta.status);
      productos = await respuesta.json();
      if (!Array.isArray(productos)) throw new Error('Respuesta inesperada de Supabase');
      actualizarFiltros();
      renderizar();
    } catch (error) {
      console.error('Error al cargar colección:', error);
      estado.textContent = 'No se pudo cargar la colección. Revisa la conexión a Supabase.';
    }
  }

  // Registro de solicitudes de pedido: el servidor valida precio y existencia.
  const dialogo = document.getElementById('dialogoPedido');
  const formularioPedido = document.getElementById('formularioPedido');
  const pedidoTitulo = document.getElementById('pedidoTitulo');
  const pedidoDetalle = document.getElementById('pedidoDetalle');
  const pedidoMensaje = document.getElementById('pedidoMensaje');
  const pedidoEnviar = document.getElementById('pedidoEnviar');
  const pedidoCerrar = document.getElementById('pedidoCerrar');
  let productoSeleccionado = null;

  function abrirSolicitud(producto) {
    if (!dialogo || !formularioPedido) return;
    productoSeleccionado = producto;
    formularioPedido.reset();
    pedidoMensaje.textContent = '';
    pedidoTitulo.textContent = 'Solicitar ' + producto.nombre;
    pedidoDetalle.textContent = 'Precio referencial: S/ ' + Number(producto.precio).toFixed(2) + '. La solicitud no confirma compra ni reserva.';
    dialogo.showModal();
  }

  if (pedidoCerrar) pedidoCerrar.addEventListener('click', function () { dialogo.close(); });
  if (dialogo) dialogo.addEventListener('click', function (evento) {
    if (evento.target === dialogo) dialogo.close();
  });
  if (formularioPedido) formularioPedido.addEventListener('submit', async function (evento) {
    evento.preventDefault();
    if (!productoSeleccionado || !config || !config.url || !config.anonKey) {
      pedidoMensaje.textContent = 'Falta seleccionar un producto o configurar Supabase.';
      return;
    }
    if (!formularioPedido.reportValidity()) return;
    const clienteNombre = document.getElementById('pedidoNombre').value.trim();
    const clienteWhatsApp = document.getElementById('pedidoWhatsApp').value.replace(/\D/g, '');
    if (clienteNombre.length < 2 || clienteNombre.length > 80 || !/^\d{9,15}$/.test(clienteWhatsApp)) {
      pedidoMensaje.textContent = 'Escribe un nombre válido y un teléfono de 9 a 15 dígitos.';
      return;
    }
    pedidoEnviar.disabled = true;
    pedidoMensaje.textContent = 'Registrando solicitud...';
    try {
      const urlBase = String(config.url).replace(/\/$/, '');
      const respuesta = await fetch(urlBase + '/rest/v1/rpc/crear_solicitud_pedido', {
        method: 'POST',
        headers: {
          apikey: config.anonKey,
          Authorization: 'Bearer ' + config.anonKey,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          p_producto_id: Number(productoSeleccionado.id),
          p_cliente_nombre: clienteNombre,
          p_cliente_whatsapp: clienteWhatsApp
        })
      });
      const resultado = await respuesta.json();
      if (!respuesta.ok) {
        const textoError = resultado && resultado.message ? resultado.message : 'No fue posible registrar el pedido';
        throw new Error(textoError);
      }
      const codigo = typeof resultado === 'string' ? resultado : String(resultado);
      formularioPedido.reset();
      pedidoMensaje.textContent = 'Solicitud registrada. Código: ' + codigo + '. Nos comunicaremos contigo para confirmar disponibilidad y pago.';
    } catch (error) {
      console.error('Error al guardar pedido:', error);
      pedidoMensaje.textContent = 'No se pudo registrar la solicitud. Revisa la conexión e intenta nuevamente.';
    } finally {
      pedidoEnviar.disabled = false;
    }
  });

  ordenControl.addEventListener('change', renderizar);
  cargarColeccion();
})();