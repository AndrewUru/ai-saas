/** Runs inside the existing widget closure. Product text is inserted only with DOM APIs. */
export const STORE_SCRIPT = String.raw`
      if (fullConfig.nativeStoreEnabled) {
        const es = String(fullConfig.language || document.documentElement.lang).startsWith('es');
        const tr = (a, b) => es ? a : b;
        const host = chatBox.parentElement;
        const nav = document.createElement('nav');
        nav.className = 'ai-store-nav';
        nav.setAttribute('aria-label', tr('Navegación de la tienda', 'Store navigation'));
        const panel = document.createElement('section');
        panel.className = 'ai-store-panel';
        panel.hidden = true;
        panel.setAttribute('aria-label', tr('Tienda', 'Store'));
        const status = document.createElement('div');
        status.className = 'ai-store-status';
        status.setAttribute('role', 'status');
        status.setAttribute('aria-live', 'polite');
        const style = document.createElement('style');
        style.textContent = [
          '#ai-saas-anchor .ai-store-grid .ai-store-card{position:relative}',
          '#ai-saas-anchor .ai-store-open::after{content:"";position:absolute;inset:0;border-radius:14px;cursor:pointer}',
          '#ai-saas-anchor .ai-store-grid .ai-store-primary{position:relative;z-index:1}',
          '#ai-saas-anchor .ai-store-open:focus-visible::after{outline:2px solid var(--ai-bot-text);outline-offset:2px}',
          '#ai-saas-anchor .ai-store-nav,#ai-saas-anchor .ai-store-panel,#ai-saas-anchor .ai-store-status{width:100%;align-self:stretch}',
          '#ai-saas-anchor.ai-format-assistant[data-store-view=store] .ai-assistant-stage,#ai-saas-anchor.ai-format-assistant[data-store-view=cart] .ai-assistant-stage{gap:0;padding:0;align-items:stretch}',
          '#ai-saas-anchor [hidden]{display:none!important}',
          '#ai-saas-anchor .ai-store-nav{display:flex;flex-shrink:0;gap:6px;padding:10px;background:var(--ai-bot-bg);border-top:1px solid var(--ai-border)}',
          '#ai-saas-anchor .ai-store-nav button{flex:1;border:0;border-radius:10px;padding:12px 5px;background:transparent;color:var(--ai-bot-text);font:inherit;font-size:13px;cursor:pointer}',
          '#ai-saas-anchor .ai-store-nav button[aria-current=page]{background:var(--ai-user-bg);color:var(--ai-user-text);font-weight:700}',
          '#ai-saas-anchor .ai-store-panel{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;padding:18px;background:var(--ai-chat-bg);color:var(--ai-bot-text)}',
          '#ai-saas-anchor[data-store-view=store] #ai-saas-chat-box,#ai-saas-anchor[data-store-view=cart] #ai-saas-chat-box,#ai-saas-anchor[data-store-view=store] #ai-saas-form,#ai-saas-anchor[data-store-view=cart] #ai-saas-form,#ai-saas-anchor[data-store-view=store] .ai-assistant-composer,#ai-saas-anchor[data-store-view=cart] .ai-assistant-composer{display:none}',
          '#ai-saas-anchor .ai-store-panel h2{font-size:22px;margin:0 0 14px;color:inherit}',
          '#ai-saas-anchor .ai-store-panel p{font-size:14px;line-height:1.5;white-space:pre-wrap}',
          '#ai-saas-anchor .ai-store-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}',
          '#ai-saas-anchor .ai-store-card{display:flex;flex-direction:column;gap:8px;padding:12px;background:var(--ai-bot-bg);border:1px solid var(--ai-border);border-radius:14px;min-width:0}',
          '#ai-saas-anchor .ai-store-card h3{font-size:14px;margin:0;overflow-wrap:anywhere;color:inherit}',
          '#ai-saas-anchor .ai-store-image{width:100%;aspect-ratio:1;object-fit:contain;background:white;border-radius:10px}',
          '#ai-saas-anchor .ai-store-placeholder{display:grid;place-items:center;background:var(--ai-bot-bg);border:1px solid var(--ai-border);font-size:32px;color:var(--ai-bot-text)}',
          '#ai-saas-anchor .ai-store-button{border:1px solid var(--ai-border);border-radius:10px;padding:10px 12px;min-height:42px;background:var(--ai-bot-bg);color:var(--ai-bot-text);font:inherit;font-size:13px;cursor:pointer}',
          '#ai-saas-anchor .ai-store-primary{background:var(--ai-user-bg);color:var(--ai-user-text);font-weight:600}',
          '#ai-saas-anchor .ai-store-button:disabled{opacity:.5;cursor:not-allowed}',
          '#ai-saas-anchor .ai-store-panel input,#ai-saas-anchor .ai-store-panel select{width:100%;border:1px solid var(--ai-border);border-radius:10px;padding:11px;background:var(--ai-bot-bg);color:var(--ai-bot-text);font:inherit;font-size:14px}',
          '#ai-saas-anchor .ai-store-filters{display:grid;gap:8px}',
          '#ai-saas-anchor .ai-store-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:10px 0}',
          '#ai-saas-anchor .ai-store-status{padding:0 16px;font-size:12px;background:var(--ai-bot-bg);color:var(--ai-bot-text)}',
          '#ai-saas-anchor .ai-store-status:not(:empty){padding:10px 16px}',
          '#ai-saas-anchor .ai-store-detail{display:grid;gap:12px}',
          '#ai-saas-anchor .ai-store-detail .ai-store-image{max-height:240px}',
          '#ai-saas-anchor .ai-store-button:focus-visible,#ai-saas-anchor .ai-store-nav button:focus-visible{outline:2px solid var(--ai-bot-text);outline-offset:2px}',
          '@media(max-width:600px){#ai-saas-anchor.open:has(.ai-store-nav) #ai-saas-widget{position:fixed;inset:0;width:100vw;max-width:100vw;height:100dvh;max-height:100dvh;border-radius:0}#ai-saas-anchor .ai-store-nav{padding-bottom:max(10px,env(safe-area-inset-bottom))}}'
        ].join('\n');
        anchor.appendChild(style);
        host.insertBefore(panel, chatBox);
        const powered = host.querySelector(':scope > .ai-saas-powered');
        host.insertBefore(status, powered);
        host.insertBefore(nav, powered);
        let store = null;
        let products = [];
        let cart = [];
        let view = 'chat';
        let loading = false;
        let failed = false;
        let currency = null;
        let search = '';
        let category = '';
        const tabs = {};
        const el = (tag, text, cls) => {
          const node = document.createElement(tag);
          if (text !== undefined) node.textContent = text;
          if (cls) node.className = cls;
          return node;
        };
        const button = (label, fn, primary) => {
          const node = el('button', label, 'ai-store-button' + (primary ? ' ai-store-primary' : ''));
          node.type = 'button'; node.addEventListener('click', fn); return node;
        };
        const money = cents => new Intl.NumberFormat(es ? 'es-ES' : 'en-US', { style: 'currency', currency: store.currency }).format(cents / 100);
        const cartKey = () => 'ai-store-cart:v1:' + store.id;
        const save = () => {
          try { localStorage.setItem(cartKey(), JSON.stringify({ v: 1, currency: store.currency, items: cart })); } catch {}
          tabs.cart.textContent = tr('Carrito', 'Cart') + ' (' + cart.reduce((sum, line) => sum + line.quantity, 0) + ')';
        };
        const reconcile = () => {
          const previous = JSON.stringify(cart);
          cart = cart.flatMap(line => {
            const product = products.find(p => p.id === line.id);
            if (!product || product.stock <= 0 || !Number.isInteger(line.quantity) || line.quantity < 1) return [];
            return [{ id: product.id, quantity: Math.min(line.quantity, product.stock, 99) }];
          });
          if (previous !== JSON.stringify(cart)) status.textContent = tr('El carrito se ha actualizado según la disponibilidad.', 'Your cart was updated to match availability.');
          save();
        };
        const image = product => {
          const src = sanitizeUrl(product.image_url);
          const fallback = () => el('div', product.name.charAt(0), 'ai-store-image ai-store-placeholder');
          if (!src) return fallback();
          const img = document.createElement('img'); img.src = src; img.alt = product.name;
          img.className = 'ai-store-image'; img.loading = 'lazy'; img.referrerPolicy = 'no-referrer';
          img.addEventListener('error', () => img.replaceWith(fallback()), { once: true }); return img;
        };
        const add = (product, quantity) => {
          const current = cart.find(line => line.id === product.id);
          const total = (current?.quantity || 0) + quantity;
          if (!Number.isInteger(quantity) || quantity < 1 || total > Math.min(product.stock, 99)) {
            status.textContent = tr('No hay suficientes unidades disponibles (máximo 99 por producto).', 'Not enough units available (maximum 99 per product).'); return;
          }
          if (current) current.quantity = total; else cart.push({ id: product.id, quantity });
          save(); status.replaceChildren(document.createTextNode(tr('Añadido: ', 'Added: ') + product.name + ' '));
          status.appendChild(button(tr('Deshacer', 'Undo'), () => {
            const line = cart.find(item => item.id === product.id);
            if (line) line.quantity -= quantity;
            cart = cart.filter(item => item.quantity > 0); save(); status.textContent = '';
            if (view === 'cart') render();
          }));
        };
        const detail = product => {
          switchView('store'); panel.replaceChildren();
          const section = el('div', undefined, 'ai-store-detail');
          section.append(button(tr('← Volver al catálogo', '← Back to catalog'), render), image(product), el('h2', product.name), el('strong', money(product.price_cents)), el('p', product.description));
          section.appendChild(el('p', product.stock > 0
            ? tr('Disponible · ', 'In stock · ') + product.stock + tr(' unidades', ' units')
            : tr('Agotado', 'Sold out')));
          const label = el('label', tr('Cantidad', 'Quantity'));
          const quantity = document.createElement('input'); quantity.type = 'number'; quantity.min = '1'; quantity.max = String(Math.min(99, product.stock)); quantity.value = '1'; quantity.step = '1';
          if (product.stock <= 0) { quantity.disabled = true; quantity.min = '0'; quantity.value = '0'; }
          label.appendChild(quantity); section.appendChild(label);
          const buy = button(product.stock > 0 ? tr('Añadir al carrito', 'Add to cart') : tr('Agotado', 'Sold out'), () => add(product, Number(quantity.value)), true);
          buy.disabled = product.stock <= 0; section.appendChild(buy);
          section.appendChild(button(tr('Preguntar al asistente', 'Ask the assistant'), () => { switchView('chat'); input.value = tr('Háblame de ', 'Tell me about ') + product.name; input.dispatchEvent(new Event('input')); input.focus(); }));
          panel.appendChild(section); panel.scrollTop = 0;
        };
        const renderCatalog = () => {
          panel.appendChild(el('h2', store.name));
          const filters = el('div', undefined, 'ai-store-filters');
          const searchInput = document.createElement('input'); searchInput.type = 'search'; searchInput.placeholder = tr('Buscar productos…', 'Search products…'); searchInput.setAttribute('aria-label', searchInput.placeholder); searchInput.value = search;
          const select = document.createElement('select'); select.setAttribute('aria-label', tr('Categoría', 'Category'));
          const all = el('option', tr('Todas las categorías', 'All categories')); all.value = ''; select.appendChild(all);
          [...new Set(products.map(p => p.category).filter(Boolean))].sort().forEach(name => { const option = el('option', name); option.value = name; select.appendChild(option); }); select.value = category;
          filters.append(searchInput, select); panel.appendChild(filters);
          const grid = el('div', undefined, 'ai-store-grid'); panel.appendChild(grid);
          const draw = () => {
            grid.replaceChildren();
            const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const words = normalize(search).split(/\s+/).filter(Boolean);
            const matches = products.filter(p => (!category || p.category === category) && words.every(word => normalize(p.name + ' ' + p.description + ' ' + p.category).includes(word)));
            if (!matches.length) grid.appendChild(el('p', tr('No hay productos disponibles para esta búsqueda.', 'No products match your search.')));
            matches.forEach(product => {
              const card = el('article', undefined, 'ai-store-card');
              const open = button(tr('Ver detalles', 'View details'), () => detail(product));
              open.classList.add('ai-store-open');
              open.setAttribute('aria-label', tr('Ver ', 'View ') + product.name);
              const buy = button(product.stock > 0 ? tr('Añadir', 'Add') : tr('Agotado', 'Sold out'), () => add(product, 1), true); buy.disabled = product.stock <= 0;
              card.append(image(product), el('h3', product.name), el('strong', money(product.price_cents)), open, buy); grid.appendChild(card);
            });
          };
          searchInput.addEventListener('input', () => { search = searchInput.value; draw(); });
          select.addEventListener('change', () => { category = select.value; draw(); }); draw();
        };
        const renderCart = () => {
          panel.appendChild(el('h2', tr('Tu carrito', 'Your cart')));
          if (!cart.length) { panel.append(el('p', tr('Tu carrito está vacío.', 'Your cart is empty.')), button(tr('Explorar productos', 'Browse products'), () => switchView('store'), true)); return; }
          let total = 0;
          cart.forEach(line => {
            const product = products.find(p => p.id === line.id); if (!product) return;
            total += product.price_cents * line.quantity;
            const row = el('article', undefined, 'ai-store-card');
            row.append(el('h3', product.name), el('strong', money(product.price_cents * line.quantity)));
            const controls = el('div', undefined, 'ai-store-row');
            const less = button('−', () => { line.quantity--; cart = cart.filter(item => item.quantity > 0); save(); render(); }); less.setAttribute('aria-label', tr('Quitar una unidad de ', 'Remove one ') + product.name);
            const more = button('+', () => { add(product, 1); render(); }); more.setAttribute('aria-label', tr('Añadir una unidad de ', 'Add one ') + product.name); more.disabled = line.quantity >= Math.min(99, product.stock);
            controls.append(less, el('span', String(line.quantity)), more, button(tr('Eliminar', 'Remove'), () => { cart = cart.filter(item => item.id !== line.id); save(); render(); }));
            row.appendChild(controls); panel.appendChild(row);
          });
          panel.appendChild(el('h3', tr('Subtotal: ', 'Subtotal: ') + money(total)));
          panel.appendChild(el('p', tr('Los gastos de envío y los impuestos se confirmarán al habilitar el checkout.', 'Shipping and taxes will be confirmed when checkout is enabled.')));
          const checkout = button(tr('Checkout pendiente de activación', 'Checkout awaiting activation'), () => {}, true); checkout.disabled = true; panel.appendChild(checkout);
          panel.appendChild(el('p', tr('Esta tienda todavía no acepta pagos. Puedes seguir explorando su catálogo.', 'This store does not accept payments yet. You can keep browsing its catalog.')));
          panel.appendChild(button(tr('Actualizar precios y disponibilidad', 'Refresh prices and availability'), () => load()));
        };
        const render = () => {
          if (view === 'chat') return;
          panel.replaceChildren();
          if (loading) { panel.appendChild(el('p', tr('Cargando tienda…', 'Loading store…'))); return; }
          if (failed) { panel.append(el('p', tr('No se pudo cargar la tienda.', 'Could not load the store.')), button(tr('Reintentar', 'Retry'), () => load())); return; }
          if (!store) { panel.appendChild(el('p', tr('La tienda no está publicada.', 'The store is not published.'))); return; }
          if (view === 'store') renderCatalog(); else renderCart();
        };
        const switchView = next => {
          view = next; anchor.dataset.storeView = next; panel.hidden = next === 'chat';
          Object.entries(tabs).forEach(([key, tab]) => { if (key === next) tab.setAttribute('aria-current', 'page'); else tab.removeAttribute('aria-current'); }); render();
        };
        [['chat', 'Chat'], ['store', tr('Tienda', 'Store')], ['cart', tr('Carrito', 'Cart') + ' (0)']].forEach(([key, label]) => {
          tabs[key] = button(label, () => switchView(key)); nav.appendChild(tabs[key]);
        });
        const load = async () => {
          if (loading) return;
          loading = true; failed = false; render();
          try {
            const response = await fetch(API_BASE + '/api/widget/store?key=' + encodeURIComponent(CONFIG_KEY), { cache: 'no-store' });
            if (!response.ok) throw new Error('Store unavailable');
            const data = await response.json();
            while (data.nextOffset !== null && data.nextOffset !== undefined) {
              const more = await fetch(API_BASE + '/api/widget/store?key=' + encodeURIComponent(CONFIG_KEY) + '&offset=' + data.nextOffset, { cache: 'no-store' });
              if (!more.ok) throw new Error('Catalog unavailable');
              const page = await more.json();
              if (!page.store || page.store.id !== data.store.id || page.store.currency !== data.store.currency) throw new Error('Catalog changed');
              data.products.push(...page.products); data.nextOffset = page.nextOffset;
            }
            if (!data.store) { store = null; products = []; cart = []; tabs.cart.textContent = tr('Carrito', 'Cart') + ' (0)'; return; }
            const firstLoad = !store; store = data.store; products = data.products;
            if (firstLoad) {
              try {
                const saved = JSON.parse(localStorage.getItem(cartKey()) || 'null');
                if (saved?.v === 1 && saved.currency === store.currency && Array.isArray(saved.items)) {
                  const seen = new Set();
                  cart = saved.items.slice(0, 500).filter(line => line && typeof line.id === 'string' && !seen.has(line.id) && seen.add(line.id));
                }
              } catch { cart = []; }
            } else if (currency !== store.currency) { cart = []; status.textContent = tr('La moneda ha cambiado. Revisa los precios y vuelve a añadir los productos.', 'Currency changed. Review prices and add your products again.'); }
            currency = store.currency; reconcile();
          } catch { failed = true; } finally { loading = false; render(); }
        };
        anchor.addEventListener('click', event => {
          const target = event.target instanceof Element ? event.target.closest('[data-native-product]') : null;
          if (!target) return;
          const product = products.find(item => item.id === target.getAttribute('data-native-product'));
          if (product && !failed) detail(product);
          else { switchView('store'); void load(); }
        });
        switchView('chat'); void load();
      }
`;
