(() => {
  'use strict';

  const backdrop = document.createElement('div');
  backdrop.className = 'modal-prod-backdrop';
  backdrop.id = 'modalProducto';
  backdrop.setAttribute('aria-hidden', 'true');

  backdrop.innerHTML = `
    <section class="modal-prod-ventana" role="dialog" aria-modal="true" aria-labelledby="modalProdTitulo">
      <button class="modal-prod-cerrar" id="cerrarModalProducto" type="button" aria-label="Cerrar">&times;</button>
      <div class="modal-prod-cuerpo">
        <div class="modal-prod-foto">
          <img id="modalProdImg" src="" alt="">
        </div>
        <div class="modal-prod-info">
          <div class="modal-prod-badges">
            <span class="modal-prod-tag" id="modalProdCategoria"></span>
            <span class="modal-prod-estado" id="modalProdEstado">DISPONIBLE</span>
          </div>
          <h2 id="modalProdTitulo"></h2>
          <p class="modal-prod-precio" id="modalProdPrecio"></p>
          <p class="modal-prod-stock" id="modalProdStock"></p>
          <p class="modal-prod-desc" id="modalProdDesc"></p>
          <div class="modal-prod-acciones">
            <button type="button" class="btn btn-la-quiero-modal" id="modalBtnLaQuiero">
              <img class="ico" src="img/coraz.png" alt="">La quiero
            </button>
            <button type="button" class="btn btn-comprar-directo" id="modalBtnComprar">
              Comprar ahora 
            </button>
          </div>
        </div>
      </div>
    </section>
  `;

  document.body.appendChild(backdrop);

  const btnCerrar = document.getElementById('cerrarModalProducto');
  const imgEl = document.getElementById('modalProdImg');
  const catEl = document.getElementById('modalProdCategoria');
  const estadoEl = document.getElementById('modalProdEstado');
  const tituloEl = document.getElementById('modalProdTitulo');
  const precioEl = document.getElementById('modalProdPrecio');
  const stockEl = document.getElementById('modalProdStock');
  const descEl = document.getElementById('modalProdDesc');
  const btnLaQuiero = document.getElementById('modalBtnLaQuiero');
  const btnComprar = document.getElementById('modalBtnComprar');

  let productoActual = null;

  function abrirModalProducto(datos) {
    const stockConocido =
      datos.stock !== null &&
      datos.stock !== undefined &&
      datos.stock !== '' &&
      Number.isFinite(Number(datos.stock)) &&
      Number(datos.stock) >= 0;
    const cantidadStock = stockConocido ? Number(datos.stock) : null;
    const estaDisponible =
      datos.disponible !== false &&
      (!stockConocido || cantidadStock > 0);

    productoActual = {
      ...datos,
      stock: cantidadStock,
      disponible: estaDisponible
    };

    imgEl.src = datos.imagen;
    imgEl.alt = datos.nombre;
    catEl.textContent = datos.categoria || 'Vintage';

    estadoEl.textContent = estaDisponible ? 'DISPONIBLE' : 'AGOTADO';
    estadoEl.classList.toggle('agotado', !estaDisponible);

    tituloEl.textContent = datos.nombre;
    precioEl.textContent = datos.precio;
    descEl.textContent =
      datos.descripcion ||
      'Prenda vintage única seleccionada por Baby Store. Pieza exclusiva.';

    if (stockEl) {
      if (stockConocido) {
        stockEl.textContent = cantidadStock > 0
          ? `Stock disponible: ${cantidadStock} unidad(es)`
          : 'Sin stock disponible';
      } else {
        stockEl.textContent = 'Stock no registrado';
      }
      stockEl.classList.toggle('agotado', !estaDisponible);
    }

    btnLaQuiero.disabled = !estaDisponible;
    btnComprar.disabled = !estaDisponible;

    backdrop.classList.add('is-visible');
    backdrop.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-abierto');
    btnCerrar.focus();
  }

  function cerrarModalProducto() {
    backdrop.classList.remove('is-visible');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-abierto');
  }

  document.addEventListener('click', (evento) => {
    const img = evento.target.closest('.card > img');
    if (!img) return;

    const card = img.closest('.card');
    if (!card) return;

    const disponibleAttr = card.dataset.disponible;
    const disponible = disponibleAttr === undefined ? true : disponibleAttr !== 'false';
    const id = card.dataset.id || '';
    const stockRaw = card.dataset.stock;
    const stockNumero = stockRaw !== undefined && stockRaw.trim() !== ''
      ? Number(stockRaw)
      : null;
    const stock = Number.isFinite(stockNumero) && stockNumero >= 0
      ? stockNumero
      : null;

    const datos = {
      id,
      codigo: /^\d+$/.test(String(id))
      ? `BS-${String(id)}`
      : 'SIN-CODIGO',
      stock: Number.isFinite(stock) ? stock : null,
      nombre: card.querySelector('h3')?.textContent.trim() || 'Prenda Baby Store',
      categoria: card.querySelector('.tag')?.textContent.trim() || 'Vintage',
      precio: card.querySelector('.price')?.textContent.trim() || '',
      descripcion: card.dataset.descripcion || card.querySelector('.novedades-descripcion, .card-subdesc')?.textContent.trim() || '',
      imagen: img.src,
      disponible
    };

    abrirModalProducto(datos);
  });

  // Botón para guardar en carrito
  btnLaQuiero.addEventListener('click', () => {
    if (!productoActual || productoActual.disponible === false) return;

    if (window.BABY_STORE_CARRITO) {
      window.BABY_STORE_CARRITO.agregar({
        id: productoActual.id,
        codigo: productoActual.codigo,
        stock: productoActual.stock,
        nombre: productoActual.nombre,
        categoria: productoActual.categoria,
        precioTexto: productoActual.precio,
        imagen: productoActual.imagen
      });
    }
    cerrarModalProducto();
  });

  // Boton compra directa
  btnComprar.addEventListener('click', () => {
    if (!productoActual || productoActual.disponible === false) return;

    const payload = {
      id: String(productoActual.id),
      codigo: productoActual.codigo || `BS-${String(productoActual.id)}`,
      stock: productoActual.stock ?? null,
      nombre: productoActual.nombre,
      categoria: productoActual.categoria,
      precioTexto: productoActual.precio,
      imagen: productoActual.imagen
    };

    if (window.BABY_STORE_CARRITO) {
      window.BABY_STORE_CARRITO.agregar(payload, { silencioso: true });
    }
    localStorage.setItem('babyStoreCompraDirecta', JSON.stringify(payload));
    cerrarModalProducto();
    window.location.href = 'carrito.html?directa=1';
  });

  btnCerrar.addEventListener('click', cerrarModalProducto);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) cerrarModalProducto();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('is-visible')) {
      cerrarModalProducto();
    }
  });
})();
