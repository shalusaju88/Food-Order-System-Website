const menuData = [
    { 
        id: 1, 
        name: "Truffle Pasta", 
        price: 34.99, 
        description: "Handmade taglioni pasta swimming in a velvety parmesan cream sauce, generously topped with freshly shaved black truffle.", 
        image: "./assets/truffle_pasta.png" 
    },
    { 
        id: 2, 
        name: "Wagyu Signature Burger", 
        price: 29.50, 
        description: "A decadent half-pound A5 Wagyu patty, caramelized onions, aged gruyère, and truffle aioli on a toasted brioche bun.", 
        image: "./assets/wagyu_burger.png" 
    },
    { 
        id: 3, 
        name: "Maine Lobster Bisque", 
        price: 22.00, 
        description: "A luxuriously rich and smooth seafood soup, infused with cognac and brimming with tender, fresh Maine lobster chunks.", 
        image: "./assets/lobster_bisque.png" 
    },
    { 
        id: 4, 
        name: "Matcha Tiramisu", 
        price: 16.50, 
        description: "A delicate Japanese twist on the classic Italian dessert. Ceremonial grade matcha layered with rich espresso and mascarpone.", 
        image: "./assets/matcha_tiramisu.png" 
    },
    { 
        id: 5, 
        name: "Seared Scallops", 
        price: 28.00, 
        description: "Pan-seared jumbo scallops served over a bed of creamy parsnip purée and drizzled with a rich brown butter caper sauce.", 
        image: "./assets/seared_scallops.png" 
    },
    { 
        id: 6, 
        name: "Artisan Margherita", 
        price: 24.00, 
        description: "Wood-fired Neapolitan pizza with San Marzano tomato sauce, fresh buffalo mozzarella, and fragrant basil leaves.", 
        image: "./assets/margherita_pizza.png" 
    }
];

let cart = [];

// DOM Elements
const menuGrid = document.getElementById('menu-grid');
const cartToggle = document.getElementById('cart-toggle');
const cartSidebar = document.getElementById('cart-sidebar');
const cartOverlay = document.getElementById('cart-overlay');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const cartCount = document.getElementById('cart-count');
const cartSubtotalEl = document.getElementById('cart-subtotal');
const cartDeliveryEl = document.getElementById('cart-delivery');
const cartTotalEl = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');
const toastContainer = document.getElementById('toast-container');
const productModal = document.getElementById('product-modal');
const modalCloseBtn = document.getElementById('modal-close');
const modalBody = document.getElementById('modal-body');
const mobileToggle = document.getElementById('mobile-toggle');
const closeMenu = document.getElementById('close-menu');
const navLinks = document.getElementById('nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');

// Config
const DELIVERY_FEE = 4.99;
const FREE_DELIVERY_THRESHOLD = 50.00;

document.addEventListener('DOMContentLoaded', () => {
    renderMenu();
    updateCartUI();

    // Event Listeners for Cart Opening/Closing
    cartToggle.addEventListener('click', () => toggleCart(true));
    closeCartBtn.addEventListener('click', () => toggleCart(false));
    cartOverlay.addEventListener('click', () => toggleCart(false));

    checkoutBtn.addEventListener('click', handleCheckout);

    modalCloseBtn.addEventListener('click', closeProductModal);
    productModal.addEventListener('click', (e) => {
        if (e.target === productModal) closeProductModal();
    });

    if(mobileToggle) mobileToggle.addEventListener('click', () => { navLinks.classList.add('open'); document.body.style.overflow = 'hidden'; });
    if(closeMenu) closeMenu.addEventListener('click', () => { navLinks.classList.remove('open'); document.body.style.overflow = ''; });
    navLinksItems.forEach(item => {
        item.addEventListener('click', () => { navLinks.classList.remove('open'); document.body.style.overflow = ''; });
    });
});

function renderMenu() {
    menuGrid.innerHTML = menuData.map(item => `
        <div class="menu-card">
            <div class="menu-img-wrap" onclick="openProductDetails(${item.id})" style="cursor: pointer;">
                <img src="${item.image}" alt="${item.name}" class="menu-img" loading="lazy">
            </div>
            <div class="menu-info">
                <h3 onclick="openProductDetails(${item.id})" style="cursor: pointer; transition: color 0.3s;" onmouseover="this.style.color='var(--primary)'" onmouseout="this.style.color=''"> ${item.name}</h3>
                <p class="menu-desc">${item.description}</p>
                <div class="menu-footer">
                    <div class="menu-price"><span>$</span>${item.price.toFixed(2)}</div>
                    <button class="btn-add" onclick="addToCart(${item.id})" aria-label="Add to cart">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Ensure function is exposed globally
window.addToCart = function(productId) {
    const product = menuData.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartUI();
    showToast(`Added ${product.name} to cart`);
    
    // Add micro-animation to cart icon
    cartToggle.style.transform = 'scale(1.2)';
    setTimeout(() => cartToggle.style.transform = 'scale(1)', 200);
}

window.updateQuantity = function(productId, delta) {
    const itemIndex = cart.findIndex(item => item.id === productId);
    if (itemIndex > -1) {
        cart[itemIndex].quantity += delta;
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        updateCartUI();
    }
}

window.removeFromCart = function(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

function updateCartUI() {
    // Update Badge
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    if(totalItems > 0) {
        cartCount.style.transform = "scale(1.2)";
        setTimeout(() => cartCount.style.transform = "scale(1)", 200);
    }

    // Render Items
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                <h3>Your cart is empty</h3>
                <p>Looks like you haven't added any delicious items yet.</p>
            </div>
        `;
        cartSubtotalEl.textContent = '$0.00';
        cartDeliveryEl.textContent = '$0.00';
        cartTotalEl.textContent = '$0.00';
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.5';
        checkoutBtn.style.cursor = 'not-allowed';
        return;
    }

    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = '1';
    checkoutBtn.style.cursor = 'pointer';

    cartItemsContainer.innerHTML = cart.map((item, index) => `
        <div class="cart-item" style="animation-delay: ${index * 0.05}s">
            <img src="${item.image}" alt="${item.name}" class="cart-item-img">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="cart-item-actions">
                <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                <span class="qty-val">${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Remove item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
        </div>
    `).join('');

    // Update Totals
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
    const total = subtotal + delivery;

    cartSubtotalEl.textContent = `$${subtotal.toFixed(2)}`;
    cartDeliveryEl.textContent = delivery === 0 ? 'Free' : `$${delivery.toFixed(2)}`;
    cartTotalEl.textContent = `$${total.toFixed(2)}`;
}

function toggleCart(isOpen) {
    if (isOpen) {
        cartSidebar.classList.add('open');
        cartOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
    } else {
        cartSidebar.classList.remove('open');
        cartOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }
}

function handleCheckout() {
    if (cart.length === 0) return;
    
    // Simple Checkout Animation
    checkoutBtn.innerHTML = '<span style="display:inline-block; animation: rotate 1s infinite linear;">↻</span> Processing...';
    checkoutBtn.disabled = true;
    
    setTimeout(() => {
        cart = [];
        updateCartUI();
        toggleCart(false);
        checkoutBtn.innerHTML = 'Complete Order';
        checkoutBtn.disabled = false;
        showToast('Order placed successfully! Preparing your meal.');
    }, 1500);
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
        ${message}
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideUpToast 0.4s reverse forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

let currentModalProductId = null;
let currentModalQty = 1;

window.openProductDetails = function(productId) {
    const product = menuData.find(p => p.id === productId);
    if (!product) return;
    
    currentModalProductId = productId;
    currentModalQty = 1;
    
    const prepTime = Math.floor(Math.random() * 15) + 10;
    const calories = Math.floor(Math.random() * 400) + 300;
    
    modalBody.innerHTML = `
        <div class="modal-img-container">
            <img src="${product.image}" alt="${product.name}" class="modal-img">
        </div>
        <div class="modal-info">
            <h2 class="modal-title">${product.name}</h2>
            <div class="modal-price">$${product.price.toFixed(2)}</div>
            <p class="modal-desc">${product.description}</p>
            
            <div class="modal-meta">
                <div class="meta-item"><span>⏱️</span> ${prepTime} mins</div>
                <div class="meta-item"><span>🔥</span> ${calories} kcal</div>
                <div class="meta-item"><span>⭐</span> 4.9 (1.2k)</div>
            </div>
            
            <div class="modal-footer">
                <div class="modal-qty">
                    <button class="modal-qty-btn" onclick="updateModalQty(-1)">-</button>
                    <span class="modal-qty-val" id="modal-qty-val">1</span>
                    <button class="modal-qty-btn" onclick="updateModalQty(1)">+</button>
                </div>
                <button class="btn-primary modal-add-btn" onclick="addModalItemToCart()">
                    Add to Cart - $<span id="modal-total-btn">${product.price.toFixed(2)}</span>
                </button>
            </div>
        </div>
    `;
    
    productModal.classList.add('open');
    document.body.style.overflow = 'hidden';
};

window.updateModalQty = function(delta) {
    if (currentModalQty + delta > 0) {
        currentModalQty += delta;
        document.getElementById('modal-qty-val').textContent = currentModalQty;
        const product = menuData.find(p => p.id === currentModalProductId);
        document.getElementById('modal-total-btn').textContent = (product.price * currentModalQty).toFixed(2);
    }
};

window.addModalItemToCart = function() {
    const product = menuData.find(p => p.id === currentModalProductId);
    const existingItem = cart.find(item => item.id === currentModalProductId);

    if (existingItem) {
        existingItem.quantity += currentModalQty;
    } else {
        cart.push({ ...product, quantity: currentModalQty });
    }

    updateCartUI();
    closeProductModal();
    showToast(`Added ${currentModalQty}x ${product.name} to cart`);
    
    cartToggle.style.transform = 'scale(1.2)';
    setTimeout(() => cartToggle.style.transform = 'scale(1)', 200);
};

window.closeProductModal = function() {
    productModal.classList.remove('open');
    document.body.style.overflow = '';
};
