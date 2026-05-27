import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCartStore = defineStore('cart', () => {

  // ── State ─────────────────────────────────────────────────────────────────
  const items = ref((() => {
    try { return JSON.parse(localStorage.getItem('patitas_cart') || '[]'); }
    catch { return []; }
  })());

  /**
   * Todos los pedidos (registrados y de invitado) se guardan en el mismo array.
   * Cada pedido tiene { userId: string|null }.
   * - Usuario logueado → userId = authStore.user.id  (ej: "42")
   * - Invitado         → userId = null
   *
   * SuperAdmin puede ver TODOS.
   * Un usuario logueado solo ve los suyos (filtro por userId).
   * Un invitado solo puede buscar por código (getOrder).
   */
  const orders = ref((() => {
    try { return JSON.parse(localStorage.getItem('patitas_orders') || '[]'); }
    catch { return []; }
  })());

  // ── Persistencia ──────────────────────────────────────────────────────────
  const saveCart   = () => localStorage.setItem('patitas_cart',   JSON.stringify(items.value));
  const saveOrders = () => localStorage.setItem('patitas_orders', JSON.stringify(orders.value));

  // ── Getters carrito ───────────────────────────────────────────────────────
  const totalItems = computed(() => items.value.reduce((a, i) => a + i.quantity, 0));
  const totalPrice = computed(() => items.value.reduce((a, i) => a + i.product.price * i.quantity, 0));

  // ── Getters pedidos ───────────────────────────────────────────────────────
  /** Pedidos del usuario concreto (por su id de string). Solo los suyos. */
  function getOrdersByUser(userId) {
    if (!userId) return [];
    return orders.value.filter(o => String(o.userId) === String(userId));
  }

  /** Todos los pedidos (para SuperAdmin). */
  const allOrders = computed(() => orders.value);

  /**
   * Busca un pedido por código (PT-XXXXX).
   * Accesible a cualquiera (invitado o logueado) → lo usa el código-gate.
   */
  function getOrder(orderId) {
    return orders.value.find(o => o.id === orderId) || null;
  }

  /**
   * Todos los productos únicos comprados por un usuario, aplanados de sus pedidos.
   * Se usa en DevolucionesPage para elegir por producto en vez de por pedido.
   * Devuelve array de { productId, name, image, price, orderId, orderDate, orderStatus }
   */
  function getProductsByUser(userId) {
    const userOrders = getOrdersByUser(userId);
    const seen = new Set();
    const result = [];
    userOrders.forEach(order => {
      order.items.forEach(item => {
        const key = `${item.productId}-${order.id}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push({
            ...item,
            orderId:     order.id,
            orderDate:   order.createdAt,
            orderStatus: order.status,
          });
        }
      });
    });
    return result;
  }

  // ── Actions carrito ───────────────────────────────────────────────────────
  function addItem(product, quantity = 1) {
    if (!product || !product.inStock) return false;
    const existing = items.value.find(i => i.product.id === product.id);
    if (existing) { existing.quantity += quantity; }
    else { items.value.push({ product, quantity }); }
    saveCart();
    return true;
  }

  function removeItem(productId) {
    items.value = items.value.filter(i => i.product.id !== productId);
    saveCart();
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find(i => i.product.id === productId);
    if (item) { item.quantity = Math.max(1, quantity); saveCart(); }
  }

  function clearCart() { items.value = []; saveCart(); }

  // ── Actions pedidos ───────────────────────────────────────────────────────
  /**
   * Crea un pedido desde el carrito actual.
   * @param {{ shippingInfo, paymentMethod, userId: string|null }} param
   */
  function placeOrder({ shippingInfo, paymentMethod, userId = null }) {
    const orderId = 'PT-' + Math.floor(10000 + Math.random() * 89999);
    const now = new Date();

    // +4 días laborales
    let estimated = new Date(now);
    let added = 0;
    while (added < 4) {
      estimated.setDate(estimated.getDate() + 1);
      const d = estimated.getDay();
      if (d !== 0 && d !== 6) added++;
    }

    const order = {
      id:               orderId,
      createdAt:        now.toISOString(),
      estimatedDelivery: estimated.toISOString(),
      status:           'preparing',
      shippingInfo,
      paymentMethod,
      userId:           userId ? String(userId) : null,   // ← siempre string o null
      items: items.value.map(i => ({
        productId: i.product.id,
        name:      i.product.name,
        image:     i.product.image,
        price:     i.product.price,
        quantity:  i.quantity,
        subtotal:  +(i.product.price * i.quantity).toFixed(2),
      })),
      total: +totalPrice.value.toFixed(2),
    };

    orders.value.unshift(order);
    saveOrders();
    clearCart();
    return order;
  }

  // Expose saveOrders for in-place mutations (cancel order, etc.)
  function saveOrdersPublic() { saveOrders(); }

  return {
    // state
    items, orders,
    // getters carrito
    totalItems, totalPrice,
    // getters pedidos
    allOrders, getOrder, getOrdersByUser, getProductsByUser,
    // actions
    addItem, removeItem, updateQuantity, clearCart, placeOrder,
    saveOrdersPublic,
  };
});
