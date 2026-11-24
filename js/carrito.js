(() => {
  'use strict';

  const CLAVE_CARRITO = 'babyStoreCarrito';
  const CLAVE_COMPRA_DIRECTA = 'babyStoreCompraDirecta';
  const NUMERO_WA = '51928042196';

  const listaEl = document.getElementById('listaCarrito');
  const vacioEl = document.getElementById('carritoVacio');
  const totalPrendasEl = document.getElementById('totalPrendas');
  const totalMontoEl = document.getElementById('totalMonto');
  const montoSeparacionEl = document.getElementById('montoSeparacion');
  const aceptoEticasEl = document.getElementById('aceptoReglasEticas');
  const avisoEticoEl = document.getElementById('avisoEtico');
  const btnComprarEl = document.getElementById('btnRealizarCompra');
  const panelEl = document.querySelector('.carrito-panel');

  function leerCarrito() {
    try {
      const datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO) || '[]');
      return Array.isArray(datos) ? datos : [];
    } catch {
      return [];
    }
  }

  function guardarCarrito(items) {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(items));
  }

  function leerCompraDirecta() {
    try {
      const dato = JSON.parse(localStorage.getItem(CLAVE_COMPRA_DIRECTA) || 'null');
      return dato && typeof dato === 'object' ? dato : null;
    } catch {
      return null;
    }
  }

  let compraDirectaActiva = leerCompraDirecta();
  if (compraDirectaActiva) {
    const itemsActuales = leerCarrito();
    const yaEsta = itemsActuales.some((it) => String(it.id) === String(compraDirectaActiva.id));
    if (!yaEsta) {
      itemsActuales.unshift({
        id: String(compraDirectaActiva.id),
        codigo: compraDirectaActiva.codigo || `BS-${String(compraDirectaActiva.id)}`,
        stock: compraDirectaActiva.stock ?? null,
        nombre: compraDirectaActiva.nombre,
        categoria: compraDirectaActiva.categoria,
        precioTexto: compraDirectaActiva.precioTexto || compraDirectaActiva.precio || 'S/ 0.00',
        imagen: compraDirectaActiva.imagen
      });
      guardarCarrito(itemsActuales);
    }
  }

  function extraerNumeroPrecio(item) {
    const candidatos = [
      item && item.precioTexto,
      item && item.precio,
      item && item.monto
    ];

    for (const valor of candidatos) {
      if (typeof valor === 'number' && !Number.isNaN(valor) && valor > 0) {
        return valor;
      }
      if (typeof valor === 'string') {
        const normalizado = valor.replace(/\s+/g, ' ').trim();
        const coincidencia = normalizado.match(/(\d+(?:[.,]\d{1,2})?)/);
        if (coincidencia) {
          const num = Number(coincidencia[1].replace(',', '.'));
          if (!Number.isNaN(num)) {
            return num;
          }
        }
      }
    }
    return 0;
  }

  function formatearSoles(numero) {
    return `S/ ${Number(numero || 0).toFixed(2)}`;
  }

  function obtenerCodigoItem(item) {
  if (!item) return 'SIN-CODIGO';

  const id = String(item.id ?? '');

  if (/^\d+$/.test(id)) {
    return `BS-${id}`;
  }

  return 'SIN-CODIGO';
}

  function actualizarBadgeCarrito(cantidad) {
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

  function actualizarResumen(items) {
    const total = items.reduce((acc, item) => acc + extraerNumeroPrecio(item), 0);
    const separacion = total * 0.5;

    if (totalPrendasEl) totalPrendasEl.textContent = String(items.length);
    if (totalMontoEl) totalMontoEl.textContent = formatearSoles(total);
    if (montoSeparacionEl) montoSeparacionEl.textContent = formatearSoles(separacion);
    actualizarBadgeCarrito(items.length);
  }

  function renderizar() {
    if (!listaEl) return;
    const items = leerCarrito();
    listaEl.replaceChildren();
    actualizarResumen(items);

    const avisoPrevioDirecta = document.getElementById('avisoCompraDirecta');
    if (avisoPrevioDirecta) avisoPrevioDirecta.remove();

    if (!items.length) {
      if (vacioEl) vacioEl.hidden = false;
      if (btnComprarEl) btnComprarEl.disabled = true;
      return;
    }

    if (vacioEl) vacioEl.hidden = true;
    if (btnComprarEl) btnComprarEl.disabled = false;

    if (compraDirectaActiva && listaEl.parentElement) {
      const bannerDirecta = document.createElement('p');
      bannerDirecta.id = 'avisoCompraDirecta';
      bannerDirecta.className = 'aviso-compra-directa';
      bannerDirecta.textContent = `✦ Compra directa lista: "${compraDirectaActiva.nombre}" (${obtenerCodigoItem(compraDirectaActiva)}). Elige tu modalidad de pago, acepta las reglas y envía por WhatsApp.`;
      listaEl.parentElement.insertBefore(bannerDirecta, listaEl);
    }

    items.forEach((item, indice) => {
      const esDirecta =
        compraDirectaActiva && String(item.id) === String(compraDirectaActiva.id);

      const fila = document.createElement('article');
      fila.className = 'carrito-item';
      if (esDirecta) fila.classList.add('es-compra-directa');

      const img = document.createElement('img');
      img.src = item.imagen || 'img/logo.png';
      img.alt = item.nombre || 'Prenda';

      const info = document.createElement('div');
      const cat = document.createElement('p');
      cat.className = 'carrito-item-cat';
      cat.textContent = `${item.categoria || 'Vintage'} · ${obtenerCodigoItem(item)}`;

      if (esDirecta) {
        const badgeDir = document.createElement('span');
        badgeDir.className = 'badge-compra-directa';
        badgeDir.textContent = 'COMPRA DIRECTA';
        cat.appendChild(badgeDir);
      }

      const titulo = document.createElement('h3');
      titulo.textContent = item.nombre || 'Prenda';

      const montoItem = extraerNumeroPrecio(item);
      const precio = document.createElement('p');
      precio.className = 'carrito-item-precio';
      precio.textContent = montoItem > 0 ? formatearSoles(montoItem) : (item.precioTexto || 'S/ 0.00');

      info.append(cat, titulo, precio);

      // Muestra el stock guardado al agregar la prenda al carrito
      if (item.stock !== null && item.stock !== undefined && item.stock !== '') {
        const stockNumero = Number(item.stock);
        if (Number.isFinite(stockNumero) && stockNumero >= 0) {
          const stockInfo = document.createElement('p');
          stockInfo.className = 'carrito-item-stock';
          stockInfo.textContent = stockNumero > 0
            ? `Stock registrado: ${stockNumero} unidad(es)`
            : 'Sin stock disponible';
          info.appendChild(stockInfo);
        }
      }

      const btnQuitar = document.createElement('button');
      btnQuitar.type = 'button';
      btnQuitar.className = 'btn-quitar';
      btnQuitar.textContent = 'Quitar';
      btnQuitar.addEventListener('click', () => {
        if (esDirecta) {
          compraDirectaActiva = null;
          localStorage.removeItem(CLAVE_COMPRA_DIRECTA);
        }
        const actualizados = leerCarrito().filter((_, i) => i !== indice);
        guardarCarrito(actualizados);
        renderizar();
      });

      fila.append(img, info, btnQuitar);
      listaEl.appendChild(fila);
    });
  }

  if (btnComprarEl) {
    btnComprarEl.addEventListener('click', () => {
      const items = leerCarrito();
      if (!items.length) {
        if (avisoEticoEl) avisoEticoEl.textContent = 'Agrega al menos una prenda antes de continuar.';
        return;
      }

      if (!aceptoEticasEl || !aceptoEticasEl.checked) {
        if (avisoEticoEl) {
          avisoEticoEl.textContent = 'Por ética con las prendas únicas y otros compradores, marca la casilla de confirmación antes de continuar.';
        }
        if (aceptoEticasEl) aceptoEticasEl.focus();
        return;
      }

      if (avisoEticoEl) avisoEticoEl.textContent = '';

      const metodo = document.querySelector('input[name="metodoPago"]:checked')?.value || 'Yape';
      const modalidad = document.querySelector('input[name="tipoPago"]:checked')?.value || 'Pago total (100%)';
      const total = items.reduce((acc, item) => acc + extraerNumeroPrecio(item), 0);

      const detallePrendas = items
        .map((item, idx) => {
          const monto = extraerNumeroPrecio(item);
          const etiquetaPrecio = monto > 0 ? formatearSoles(monto) : (item.precioTexto || 'S/ 0.00');
          return `${idx + 1}. [${obtenerCodigoItem(item)}] ${item.nombre} (${etiquetaPrecio})`;
        })
        .join('\n');

      const codigosResumen = items.map((item) => obtenerCodigoItem(item)).join(', ');

      const mensaje = [
        'Hola Baby Store, escribo "yo" porque estoy segur@ de comprar estas prendas únicas:',
        '',
        detallePrendas,
        '',
        `Códigos para control: ${codigosResumen}`,
        `Total estimado: ${formatearSoles(total)}`,
        `Separación (50%): ${formatearSoles(total * 0.5)}`,
        `Modalidad de pago: ${metodo}`,
        `Condición elegida: ${modalidad}`,
        'Acepto las reglas: primer pago confirmado se lleva la prenda, 3 min para pagar al coordinar, 50% de separación y saldo en máx. 2 días, envíos a todo el Perú, sin cambios ni devoluciones.'
      ].join('\n');

      localStorage.removeItem(CLAVE_COMPRA_DIRECTA);
      const url = `https://wa.me/${NUMERO_WA}?text=${encodeURIComponent(mensaje)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  }

  renderizar();

  if (compraDirectaActiva && panelEl) {
    setTimeout(() => {
      panelEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 250);
  }
})();

