/* ============================================================
   BABY STORE - coleccion-busqueda.js
   SEMANA 12: búsqueda con condicionales.
   SEMANA 13: actualización de la vista mediante el DOM.
   Lee el término ?q= enviado desde el buscador del encabezado.
   ============================================================ */

const parametrosBusqueda = new URLSearchParams(window.location.search);
const terminoBusqueda = (parametrosBusqueda.get('q') || '').trim().toLocaleLowerCase('es');
const tarjetasColeccion = document.querySelectorAll('main .grid .card');

if (terminoBusqueda && tarjetasColeccion.length) {
  let coincidencias = 0;

  tarjetasColeccion.forEach((tarjeta) => {
    const contenido = tarjeta.textContent.toLocaleLowerCase('es');
    const coincide = contenido.includes(terminoBusqueda);

    tarjeta.hidden = !coincide;
    if (coincide) coincidencias++;
  });

  const mensaje = document.createElement('p');
  mensaje.className = 'resultado-busqueda';
  mensaje.setAttribute('role', 'status');
  mensaje.textContent = coincidencias
    ? `Resultados para “${terminoBusqueda}”: ${coincidencias} prenda(s).`
    : `No encontramos prendas para “${terminoBusqueda}”.`;

  const seccion = document.querySelector('main section');
  if (seccion) seccion.insertBefore(mensaje, seccion.querySelector('.grid'));
}
