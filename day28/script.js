const PRODUCT = {
  id: 1,
  name: "Wireless Bluetooth Headphones",
  price: 149.99,
  image:
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800"
};

const mainImage = document.getElementById("mainProductImage");
const thumbnails = document.querySelectorAll(".thumbnail");

const colorButtons = document.querySelectorAll(".color-option");
const sizeButtons = document.querySelectorAll(".size-option");

const quantityDisplay = document.getElementById("quantity");
const increaseBtn = document.getElementById("increaseBtn");
const decreaseBtn = document.getElementById("decreaseBtn");

const addToCartBtn = document.getElementById("addToCartBtn");
const notification = document.getElementById("notification");

const cartBtn = document.getElementById("cartBtn");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const closeCartBtn = document.getElementById("closeCartBtn");

const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");
const cartSubtotal = document.getElementById("cartSubtotal");
const checkoutBtn = document.getElementById("checkoutBtn");

let quantity = 1;
let selectedColor = "Black";
let selectedSize = "Standard";

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem("shopeaseCart"));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

let cart = loadCart();

function saveCart() {
  try {
    localStorage.setItem("shopeaseCart", JSON.stringify(cart));
  } catch (error) {
    console.warn("Unable to save cart:", error);
  }
}

function formatPrice(amount) {
  return "$" + amount.toFixed(2);
}

/* Product Gallery */

thumbnails.forEach(thumbnail => {
  thumbnail.addEventListener("click", () => {
    thumbnails.forEach(item => {
      item.classList.remove("active");
    });

    thumbnail.classList.add("active");
    mainImage.src = thumbnail.dataset.image;
  });
});

/* Color Selection */

colorButtons.forEach(button => {
  button.addEventListener("click", () => {
    colorButtons.forEach(item => {
      item.classList.remove("selected");
    });

    button.classList.add("selected");
    selectedColor = button.dataset.color;

    document.getElementById("selectedColor").textContent =
      selectedColor;
  });
});

/* Size Selection */

sizeButtons.forEach(button => {
  button.addEventListener("click", () => {
    sizeButtons.forEach(item => {
      item.classList.remove("selected");
    });

    button.classList.add("selected");
    selectedSize = button.dataset.size;
  });
});

/* Quantity Selection */

increaseBtn.addEventListener("click", () => {
  if (quantity < 99) {
    quantity++;
    quantityDisplay.textContent = quantity;
  }
});

decreaseBtn.addEventListener("click", () => {
  if (quantity > 1) {
    quantity--;
    quantityDisplay.textContent = quantity;
  }
});

/* Add Product to Cart */

function addToCart() {
  const existingItem = cart.find(item =>
    item.id === PRODUCT.id &&
    item.color === selectedColor &&
    item.size === selectedSize
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: PRODUCT.id,
      name: PRODUCT.name,
      price: PRODUCT.price,
      image: PRODUCT.image,
      color: selectedColor,
      size: selectedSize,
      quantity: quantity
    });
  }

  saveCart();
  renderCart();

  notification.textContent =
    "✓ Product successfully added to your cart!";

  setTimeout(() => {
    notification.textContent = "";
  }, 3000);

  openCart();
}

addToCartBtn.addEventListener("click", addToCart);

/* Render Shopping Cart */

function renderCart() {
  cartItems.replaceChildren();

  if (cart.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.textContent = "Your cart is empty.";
    cartItems.appendChild(emptyMessage);
  }

  let total = 0;
  let count = 0;

  cart.forEach((item, index) => {
    total += item.price * item.quantity;
    count += item.quantity;

    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";

    const image = document.createElement("img");
    image.src = item.image;
    image.alt = item.name;

    const info = document.createElement("div");
    info.className = "cart-item-info";

    const name = document.createElement("h4");
    name.textContent = item.name;

    const details = document.createElement("p");
    details.textContent =
      `${item.color} / ${item.size} / Qty: ${item.quantity}`;

    const price = document.createElement("strong");
    price.textContent = formatPrice(
      item.price * item.quantity
    );

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-btn";
    removeBtn.textContent = "Remove";

    removeBtn.addEventListener("click", () => {
      removeFromCart(index);
    });

    info.append(name, details, price, removeBtn);
    cartItem.append(image, info);
    cartItems.appendChild(cartItem);
  });

  cartCount.textContent = count;
  cartSubtotal.textContent = formatPrice(total);
  checkoutBtn.disabled = cart.length === 0;
}

function removeFromCart(index) {
  cart.splice(index, 1);
  saveCart();
  renderCart();
}

/* Cart Drawer */

function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.classList.add("show");
  document.body.classList.add("cart-open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.classList.remove("show");
  document.body.classList.remove("cart-open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

cartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);

document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    closeCart();
  }
});

/* Demo Checkout */

checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) return;

  alert(
    "Checkout Demo\n\n" +
    "Total: " + cartSubtotal.textContent +
    "\n\nPayment processing is not yet connected."
  );
});

/* Initialize */

renderCart();