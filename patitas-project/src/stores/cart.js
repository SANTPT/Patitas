import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useCartStore = defineStore('cart', () => {
  // State
  const items = ref((() => {
    try {
      const saved = localStorage.getItem('patitas_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  })());

  // Helper function to sync with localStorage
  const saveToLocalStorage = () => {
    localStorage.setItem('patitas_cart', JSON.stringify(items.value));
  };

  // Getters
  const totalItems = computed(() => {
    return items.value.reduce((acc, item) => acc + item.quantity, 0);
  });

  const totalPrice = computed(() => {
    return items.value.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  });

  // Actions
  function addItem(product, quantity = 1) {
    if (!product || !product.inStock) return false;

    const existingItem = items.value.find(item => item.product.id === product.id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.value.push({ product, quantity });
    }
    saveToLocalStorage();
    return true;
  }

  function removeItem(productId) {
    items.value = items.value.filter(item => item.product.id !== productId);
    saveToLocalStorage();
  }

  function updateQuantity(productId, quantity) {
    const item = items.value.find(item => item.product.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      saveToLocalStorage();
    }
  }

  function clearCart() {
    items.value = [];
    saveToLocalStorage();
  }

  return {
    items,
    totalItems,
    totalPrice,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };
});
