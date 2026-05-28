import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../services/api';

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
    // Pedido por defecto en estado "delivered" (entregado) con 4 productos para probar devoluciones
    const defaultDeliveredOrder = {
      id: 'PT-99999',
      userId: '1', // Padre Demo
      status: 'delivered',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedDelivery: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      shippingInfo: {
        fullName: 'Padre Demo',
        email: 'demo@example.com',
        phone: '612345678',
        address: 'Gran Vía 45',
        city: 'Bilbao',
        zip: '48009',
        country: 'España'
      },
      paymentMethod: 'card',
      items: [
        {
          productId: 1,
          name: 'Puzle de Formas de Madera',
          price: 18.50,
          quantity: 1,
          image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23faf5ff'/><rect x='150' y='80' width='100' height='100' rx='8' fill='%23c58cf2' opacity='0.5'/><rect x='80' y='210' width='240' height='16' rx='8' fill='%23c58cf2'/><rect x='130' y='240' width='140' height='12' rx='6' fill='%23c58cf2' opacity='0.7'/></svg>",
          subtotal: 18.50
        },
        {
          productId: 2,
          name: 'Set de Estimulación Sensorial',
          price: 34.00,
          quantity: 1,
          image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23faf5ff'/><rect x='150' y='80' width='100' height='100' rx='8' fill='%23c58cf2' opacity='0.5'/><rect x='80' y='210' width='240' height='16' rx='8' fill='%23c58cf2'/><rect x='130' y='240' width='140' height='12' rx='6' fill='%23c58cf2' opacity='0.7'/></svg>",
          subtotal: 34.00
        },
        {
          productId: 3,
          name: 'Manta Terapéutica Con Peso',
          price: 62.00,
          quantity: 1,
          image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23faf5ff'/><rect x='150' y='80' width='100' height='100' rx='8' fill='%23c58cf2' opacity='0.5'/><rect x='80' y='210' width='240' height='16' rx='8' fill='%23c58cf2'/><rect x='130' y='240' width='140' height='12' rx='6' fill='%23c58cf2' opacity='0.7'/></svg>",
          subtotal: 62.00
        },
        {
          productId: 4,
          name: 'Kit de Pintura con Dedos Inclusivo',
          price: 22.00,
          quantity: 1,
          image: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'><rect width='100%' height='100%' fill='%23faf5ff'/><rect x='150' y='80' width='100' height='100' rx='8' fill='%23c58cf2' opacity='0.5'/><rect x='80' y='210' width='240' height='16' rx='8' fill='%23c58cf2'/><rect x='130' y='240' width='140' height='12' rx='6' fill='%23c58cf2' opacity='0.7'/></svg>",
          subtotal: 22.00
        }
      ],
      total: 136.50
    };

    try {
      const saved = localStorage.getItem('patitas_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const hasDefault = parsed.some(o => o.id === 'PT-99999');
          if (!hasDefault) {
            parsed.push(defaultDeliveredOrder);
            localStorage.setItem('patitas_orders', JSON.stringify(parsed));
          }
          return parsed;
        }
      }
    } catch (_) {}

    const initialOrders = [defaultDeliveredOrder];
    try {
      localStorage.setItem('patitas_orders', JSON.stringify(initialOrders));
    } catch (_) {}
    return initialOrders;
  })());

  // ── Persistencia ──────────────────────────────────────────────────────────
  const saveCart = () => localStorage.setItem('patitas_cart', JSON.stringify(items.value));
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
            orderId: order.id,
            orderDate: order.createdAt,
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
      id: orderId,
      createdAt: now.toISOString(),
      estimatedDelivery: estimated.toISOString(),
      status: 'preparing',
      shippingInfo,
      paymentMethod,
      userId: userId ? String(userId) : null,   // ← siempre string o null
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

  // Expose saveOrders for in-place mutations (cancel order, etc.)
  function saveOrdersPublic() { saveOrders(); }

  async function cancelOrder(orderId) {
    const index = orders.value.findIndex(o => o.id === orderId);
    if (index !== -1) {
      if (orders.value[index].status === 'preparing') {
        try {
          await api.delete(`/pedidos/${orderId}`);
        } catch (err) {
          console.error('Error calling delete API:', err);
        }
        orders.value.splice(index, 1);
        saveOrders();
        return true;
      }
    }
    return false;
  }

  async function cancelOrderItem(orderId, productId) {
    const order = orders.value.find(o => o.id === orderId);
    if (!order || order.status !== 'preparing') return null;

    try {
      await api.delete(`/pedidos/${orderId}/items/${productId}`);
    } catch (err) {
      console.error('Error calling delete item API:', err);
    }

    order.items = order.items.filter(i => i.productId !== productId);
    if (order.items.length === 0) {
      const index = orders.value.indexOf(order);
      if (index !== -1) {
        orders.value.splice(index, 1);
      }
      saveOrders();
      return { deleted: true };
    } else {
      order.total = +order.items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2);
      saveOrders();
      return { deleted: false, order };
    }
  }

  return {
    // state
    items, orders,
    // getters carrito
    totalItems, totalPrice,
    // getters pedidos
    allOrders, getOrder, getOrdersByUser, getProductsByUser,
    // actions
    addItem, removeItem, updateQuantity, clearCart, placeOrder,
    saveOrdersPublic, cancelOrder, cancelOrderItem,
  };
});
