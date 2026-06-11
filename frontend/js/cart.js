// cart.js – Gestion du panier client (localStorage)

const CART_KEY = 'familleCart';

const Cart = {

  /**
   * Récupère le panier actuel
   * @returns {Array} [{ product_id, name, price, quantity }]
   */
  get() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch (e) {
      return [];
    }
  },

  /**
   * Sauvegarde le panier dans le localStorage
   */
  save(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  },

  /**
   * Ajoute un produit au panier (ou augmente la quantité)
   * @param {object} product - { product_id, name, price, stock }
   * @param {number} [quantity=1]
   */
  add(product, quantity = 1) {
    const cart = this.get();
    const existing = cart.find(item => item.product_id === product.product_id);
    const maxStock = product.stock || 99;

    if (existing) {
      const newQty = existing.quantity + quantity;
      existing.quantity = Math.min(newQty, maxStock);
    } else {
      cart.push({
        product_id: product.product_id,
        name: product.name,
        price: product.price,
        quantity: Math.min(quantity, maxStock)
      });
    }

    this.save(cart);
    return cart;
  },

  /**
   * Retire un produit du panier
   * @param {string} productId
   */
  remove(productId) {
    let cart = this.get();
    cart = cart.filter(item => item.product_id !== productId);
    this.save(cart);
    return cart;
  },

  /**
   * Change la quantité d'un produit
   * @param {string} productId
   * @param {number} delta - positif ou négatif
   */
  changeQty(productId, delta) {
    const cart = this.get();
    const item = cart.find(i => i.product_id === productId);
    if (!item) return cart;

    item.quantity += delta;
    if (item.quantity < 1) {
      return this.remove(productId);
    }
    this.save(cart);
    return cart;
  },

  /**
   * Calcule le nombre total d'articles
   * @returns {number}
   */
  count() {
    return this.get().reduce((sum, item) => sum + item.quantity, 0);
  },

  /**
   * Calcule le montant total du panier
   * @returns {number}
   */
  total() {
    return this.get().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  /**
   * Vide entièrement le panier
   */
  clear() {
    localStorage.removeItem(CART_KEY);
  },

  /**
   * Prépare les items pour l'API (tableau de { product_id, quantity })
   * @returns {Array}
   */
  toOrderItems() {
    return this.get().map(item => ({
      product_id: item.product_id,
      quantity: item.quantity
    }));
  }
};