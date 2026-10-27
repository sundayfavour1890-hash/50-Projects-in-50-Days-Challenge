const products = [
  {
    id: 1,
    name: "Wireless Headphones",
    category: "Electronics",
    price: 149.99,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"
  },
  {
    id: 2,
    name: "Smart Watch",
    category: "Accessories",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500"
  },
  {
    id: 3,
    name: "Wireless Earbuds",
    category: "Electronics",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=500"
  },
  {
    id: 4,
    name: "Digital Camera",
    category: "Electronics",
    price: 399.99,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500"
  },
  {
    id: 5,
    name: "Fashion Sneakers",
    category: "Fashion",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500"
  },
  {
    id: 6,
    name: "Laptop Computer",
    category: "Computers",
    price: 899.99,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500"
  }
];

const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const emptyCart = document.getElementById("emptyCart");

const cartCount = document.getElementById("cartCount");
const subtotalElement = document.getElementById("subtotal");
const shippingElement = document.getElementById("shipping");
const discountElement = document.getElementById("discount");
const totalElement = document.getElementById("total");

const couponInput = document.getElementById("couponInput");
const applyCouponBtn = document.getElementById("applyCouponBtn");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");
const toast = document.getElementById("toast");

let toastTimer;

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("shopcartItems"));
    if (!Array.isArray(saved)) return [];

    return saved.filter(item =>
      products.some(product => product.id === item.id) &&
      Number.isInteger(item.quantity) &&
      item.quantity > 0
    );
  } catch {
    return [];
  }
}

let cart = loadCart();
let couponApplied =
  localStorage.getItem("shopcartCoupon") === "SAVE10";

function saveCart() {
  try {
    localStorage.setItem("shopcartItems", JSON.stringify(cart));
    localStorage.setItem(
      "shopcartCoupon",
      couponApplied ? "SAVE10" : ""
    );
  } catch (error) {
    console.warn("Storage unavailable:", error);
  }
}

function formatMoney(amount) {
  return "$" + amount.toFixed(2);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* Display Products */

function renderProducts() {
  productGrid.replaceChildren();

  document.getElementById("productCount").textContent =
    `${products.length} Products`;

  products.forEach(product => {
    const card = document.createElement("article");
    card.className = "product-card";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;
    image.loading = "lazy";

    const info = document.createElement("div");
    info.className = "product-info";

    const category = document.createElement("span");
    category.className = "product-category";
    category.textContent = product.category;

    const name = document.createElement("h3");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.className = "product-price";
    price.textContent = formatMoney(product.price);

    const button = document.createElement("button");
    button.className = "add-btn";
    button.textContent = "🛒 Add to Cart";

    button.addEventListener("click", () => {
      addToCart(product.id);
    });

    info.append(category, name, price, button);
    card.append(image, info);
    productGrid.appendChild(card);
  });
}

/* Add to Cart */

function addToCart(productId) {
  const existing = cart.find(item => item.id === productId);

  if (existing) {
    if (existing.quantity >= 99) {
      showToast("Maximum quantity is 99.");
      return;
    }

    existing.quantity++;
  } else {
    cart.push({
      id: productId,
      quantity: 1
    });
  }

  saveCart();
  renderCart();
  showToast("Product added to cart!");
}

/* Update Quantity */

function updateQuantity(productId, change) {
  const item = cart.find(item => item.id === productId);

  if (!item) return;

  item.quantity += change;

  if (item.quantity <= 0) {
    cart = cart.filter(item => item.id !== productId);
  } else if (item.quantity > 99) {
    item.quantity = 99;
  }

  saveCart();
  renderCart();
}

/* Remove Product */

function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);

  saveCart();
  renderCart();
  showToast("Product removed from cart.");
}

/* Render Shopping Cart */

function renderCart() {
  cartItems.replaceChildren();

  emptyCart.style.display =
    cart.length === 0 ? "block" : "none";

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);

    if (!product) return;

    const row = document.createElement("div");
    row.className = "cart-item";

    const image = document.createElement("img");
    image.src = product.image;
    image.alt = product.name;

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const name = document.createElement("h3");
    name.textContent = product.name;

    const price = document.createElement("p");
    price.textContent = formatMoney(
      product.price * item.quantity
    );

    const controls = document.createElement("div");
    controls.className = "cart-controls";

    const decrease = document.createElement("button");
    decrease.className = "qty-btn";
    decrease.textContent = "−";
    decrease.setAttribute("aria-label", "Decrease quantity");
    decrease.addEventListener("click", () => {
      updateQuantity(item.id, -1);
    });

    const quantity = document.createElement("span");
    quantity.className = "qty-number";
    quantity.textContent = item.quantity;

    const increase = document.createElement("button");
    increase.className = "qty-btn";
    increase.textContent = "+";
    increase.setAttribute("aria-label", "Increase quantity");
    increase.addEventListener("click", () => {
      updateQuantity(item.id, 1);
    });

    const remove = document.createElement("button");
    remove.className = "remove-btn";
    remove.textContent = "Remove";
    remove.addEventListener("click", () => {
      removeFromCart(item.id);
    });

    controls.append(decrease, quantity, increase, remove);
    info.append(name, price, controls);
    row.append(image, info);

    cartItems.appendChild(row);
  });

  calculateTotals();
}

/* Calculate Totals */

function calculateTotals() {
  let subtotal = 0;
  let itemCount = 0;

  cart.forEach(item => {
    const product = products.find(p => p.id === item.id);

    if (!product) return;

    subtotal += product.price * item.quantity;
    itemCount += item.quantity;
  });

  // Free shipping for orders of $100 or more.
  const shipping =
    subtotal === 0 || subtotal >= 100 ? 0 : 10;

  const discount = couponApplied
    ? subtotal * 0.10
    : 0;

  const total = Math.max(
    0,
    subtotal + shipping - discount
  );

  cartCount.textContent = itemCount;
  subtotalElement.textContent = formatMoney(subtotal);

  shippingElement.textContent =
    shipping === 0 ? "FREE" : formatMoney(shipping);

  discountElement.textContent =
    "-" + formatMoney(discount);

  totalElement.textContent = formatMoney(total);

  checkoutBtn.disabled = cart.length === 0;
  clearCartBtn.disabled = cart.length === 0;
}

/* Coupon Code */

applyCouponBtn.addEventListener("click", () => {
  const code = couponInput.value.trim().toUpperCase();

  if (cart.length === 0) {
    showToast("Add products before applying a coupon.");
    return;
  }

  if (code === "SAVE10") {
    couponApplied = true;
    saveCart();
    calculateTotals();
    showToast("10% discount applied!");
  } else {
    showToast("Invalid coupon code.");
  }
});

/* Clear Cart */

clearCartBtn.addEventListener("click", () => {
  if (cart.length === 0) return;

  if (!confirm("Are you sure you want to clear your cart?")) {
    return;
  }

  cart = [];
  couponApplied = false;
  couponInput.value = "";

  saveCart();
  renderCart();
  showToast("Shopping cart cleared.");
});

/* Demo Checkout */

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;

  alert(
    "ShopCart Demo Checkout\n\n" +
    "Total: " + totalElement.textContent +
    "\n\nThis is a frontend demo." +
    "\nNo real payment will be processed."
  );
});

/* Initialize Application */

renderProducts();
renderCart();