# Tienda nativa dentro del widget

## Entrega actual

- `/dashboard/store`: una tienda por usuario; moneda EUR, USD o GBP; catálogo en borrador o publicado.
- Crear, editar, ocultar y eliminar productos con nombre, descripción, categoría, imagen HTTPS, precio en céntimos y stock.
- Vincular la tienda a agentes del mismo propietario. La tienda nativa tiene prioridad sobre WooCommerce/Shopify para los agentes vinculados; desvincular restaura el comportamiento anterior.
- Widget clásico y asistente: navegación Chat / Tienda / Carrito, búsqueda, categorías, ficha, cantidades y carrito persistente por tienda y origen del sitio anfitrión.
- Recomendaciones del agente con fichas de productos nativos que se abren dentro del widget.
- Los precios y el stock del carrito se actualizan al cargar o al solicitar una actualización; añadir al carrito no reserva unidades.
- Vendedor IA: el comprador puede pedir en el chat «añade dos», «pon tres de la camiseta roja» o «quita ese producto». Un cambio por mensaje; el widget lo muestra con opción de deshacer.
  - El widget envía solo su carrito, la ficha abierta y las últimas recomendaciones; el agente no ve conversaciones de otros visitantes.
  - El servidor valida producto, tienda, moneda, visibilidad y stock (máximo 99). Los nombres deben coincidir con el nombre o la categoría (singular o plural); si coinciden varios productos o solo la descripción, pregunta en vez de elegir.
  - El widget aplica el cambio solo si el carrito no ha cambiado mientras el agente respondía (revisión del carrito).

## Activación

1. Aplicar `supabase/migrations/20261021000000_native_widget_store.sql` al proyecto de Supabase correspondiente antes de usar el panel de tienda.
2. Abrir **Mi tienda**, crear la tienda y añadir productos con visibilidad activada.
3. Vincular un agente propio y publicar el catálogo.
4. Abrir su widget en un dominio permitido. Los widgets ya cargados deben recargarse para detectar la vinculación.

El API público solo devuelve catálogos publicados y productos activos de agentes activos. Aplica las restricciones de dominio existentes. No devuelve datos de propietario ni credenciales. Las políticas RLS aíslan las tiendas y los productos por usuario; una clave foránea compuesta impide vincular agentes a tiendas de otro propietario.

## Pendiente: checkout y pedidos

Esta entrega **no procesa pagos ni crea pedidos**. El widget lo indica expresamente y no presenta un botón de cobro operativo.

- Stripe: la instalación de la integración sandbox en Vercel se detuvo solicitando aceptación de términos. No se ha completado ni habilitado Stripe Connect.
- PayPal: las credenciales existentes pertenecen al cobro del SaaS; falta habilitar y conectar el producto de pagos para vendedores.
- Implementar onboarding por vendedor, checkout, reservas de stock atómicas, precios calculados en servidor, transporte/impuestos para el mercado inicial, pedidos con líneas inmutables, webhooks verificados e idempotentes, cancelaciones y reembolsos.
- Las imágenes se configuran por URL; la subida de archivos queda pendiente.

No reutilizar las credenciales PayPal del SaaS como cuenta receptora de ventas de todos los comercios. No marcar un pedido como pagado a partir de una redirección del navegador.

## Verificación

`node --test scripts/native-store.test.mjs` comprueba importes, validación de productos, sintaxis del JavaScript generado y la resolución de cambios de carrito del vendedor IA con una base de datos simulada. Completar con lint, TypeScript y pruebas de navegador del widget.

`scripts/native-store.browser.mjs` usa Playwright y Edge en modo headless para probar ambos formatos del widget con respuestas controladas. Requiere `playwright` disponible como módulo, o la variable `PLAYWRIGHT_MODULE_PATH` apuntando a su instalación.

`scripts/native-store.e2e.mjs` prueba el panel, las acciones de servidor, el API y el widget contra Supabase real. **Crea un usuario temporal y lo elimina al terminar**; requiere `.env.local` y un servidor local en el puerto 3011 (se puede cambiar con `STORE_TEST_BASE_URL`). No envía correo ni procesa pagos.

`scripts/native-store.rls.sql` valida aislamiento por usuario y vinculación de agentes. Ejecutar siempre dentro de una transacción y terminar con `ROLLBACK`, ya que contiene datos temporales.
