import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCartStore = defineStore('cart', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const items = ref((() => {
    try {
      const saved = localStorage.getItem('patitas_cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  })());

  const orders = ref((() => {
    try {
      const saved = localStorage.getItem('patitas_orders');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  })());

  // ── Helpers ───────────────────────────────────────────────────────────────
  const saveCart = () => localStorage.setItem('patitas_cart', JSON.stringify(items.value));
  const saveOrders = () => localStorage.setItem('patitas_orders', JSON.stringify(orders.value));

  // ── Getters ───────────────────────────────────────────────────────────────
  const totalItems = computed(() => items.value.reduce((acc, i) => acc + i.quantity, 0));

  const totalPrice = computed(() =>
    items.value.reduce((acc, i) => acc + (i.product.price * i.quantity), 0)
  );

  // ── Actions ───────────────────────────────────────────────────────────────
  function addItem(product, quantity = 1) {
    if (!product || !product.inStock) return false;
    const existing = items.value.find(i => i.product.id === product.id);
    if (existing) {
      existing.quantity += quantity;
    } else {
      items.value.push({ product, quantity });
    }
    saveCart();
    return true;
  }

  function removeItem(productId) {
    items.value = items.value.filter(i => i.product.id !== productId);
    saveCart();
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find(i => i.product.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      saveCart();
    }
  }

  function clearCart() {
    items.value = [];
    saveCart();
  }

  /**
   * Genera un pedido a partir del carrito actual.
   * @param {Object} orderData  { shippingInfo, paymentMethod, userId? }
   * @returns {Object} El pedido creado
   */
  function placeOrder({ shippingInfo, paymentMethod, userId = null }) {
    const orderId = 'PT-' + Math.floor(10000 + Math.random() * 89999);
    const now = new Date();

    // Fecha estimada: +4 días laborales (salta sábado/domingo)
    let estimated = new Date(now);
    let daysAdded = 0;
    while (daysAdded < 4) {
      estimated.setDate(estimated.getDate() + 1);
      const day = estimated.getDay();
      if (day !== 0 && day !== 6) daysAdded++;
    }

    const order = {
      id: orderId,
      createdAt: now.toISOString(),
      estimatedDelivery: estimated.toISOString(),
      status: 'preparing',           // preparing | shipped | delivered
      shippingInfo,
      paymentMethod,
      userId,
      items: items.value.map(i => ({
        productId: i.product.id,
        name: i.product.name,
        image: i.product.image,
        price: i.product.price,
        quantity: i.quantity,
        subtotal: +(i.product.price * i.quantity).toFixed(2),
      })),
      total: +totalPrice.value.toFixed(2),
    };

    orders.value.unshift(order);
    saveOrders();
    clearCart();
    return order;
  }

  /** Obtiene un pedido por ID */
  function getOrder(orderId) {
    return orders.value.find(o => o.id === orderId) || null;
  }

  return {
    items,
    orders,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    placeOrder,
    getOrder,
  };
});
