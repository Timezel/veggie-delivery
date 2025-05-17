document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const cartItemsContainer = document.getElementById('cart-items-container');
  const subtotalElement = document.getElementById('subtotal');
  const deliveryFeeElement = document.getElementById('delivery-fee');
  const totalElement = document.getElementById('total');
  const checkoutBtn = document.getElementById('checkout-btn');
  const checkoutModal = document.getElementById('checkout-modal');
  const closeModal = document.querySelector('.close-modal');
  const checkoutForm = document.getElementById('checkout-form');
  const emptyCartMessage = document.querySelector('.empty-cart-message');
  
  // Load cart items on page load
  loadCart();
  
  // Event Listeners
  checkoutBtn.addEventListener('click', () => {
    checkoutModal.style.display = 'block';
  });
  
  closeModal.addEventListener('click', () => {
    checkoutModal.style.display = 'none';
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
      checkoutModal.style.display = 'none';
    }
  });
  
  checkoutForm.addEventListener('submit', placeOrder);
  
  // Functions
  async function loadCart() {
    try {
      const response = await fetch('/orders/cart', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const cart = await response.json();
        displayCartItems(cart);
      } else if (response.status === 401) {
        window.location.href = 'login.html';
      } else {
        console.error('Error loading cart');
      }
    } catch (err) {
      console.error('Error loading cart:', err);
    }
  }
  
  function displayCartItems(cart) {
    if (!cart.items || cart.items.length === 0) {
      emptyCartMessage.style.display = 'block';
      checkoutBtn.disabled = true;
      return;
    }
    
    emptyCartMessage.style.display = 'none';
    checkoutBtn.disabled = false;
    
    cartItemsContainer.innerHTML = '';
    
    cart.items.forEach(item => {
      const cartItemElement = document.createElement('div');
      cartItemElement.className = 'cart-item';
      cartItemElement.innerHTML = `
        <div class="cart-item-image">
          <img src="${item.foodItem.image || 'images/food-placeholder.jpg'}" alt="${item.foodItem.name}">
        </div>
        <div class="cart-item-info">
          <h3>${item.foodItem.name}</h3>
          <p>${item.foodItem.restaurant.name}</p>
          <div class="cart-item-price">${item.price} ₽</div>
        </div>
        <div class="cart-item-actions">
          <div class="quantity-selector">
            <button class="decrease-qty" data-id="${item.foodItem._id}">-</button>
            <span class="qty">${item.quantity}</span>
            <button class="increase-qty" data-id="${item.foodItem._id}">+</button>
          </div>
          <button class="remove-item" data-id="${item.foodItem._id}">Удалить</button>
        </div>
      `;
      
      cartItemsContainer.appendChild(cartItemElement);
    });
    
    // Update totals
    subtotalElement.textContent = `${cart.subtotal} ₽`;
    deliveryFeeElement.textContent = `${cart.deliveryFee || 0} ₽`;
    totalElement.textContent = `${cart.total} ₽`;
    
    // Add event listeners to quantity and remove buttons
    document.querySelectorAll('.decrease-qty').forEach(btn => {
      btn.addEventListener('click', updateCartItemQuantity);
    });
    
    document.querySelectorAll('.increase-qty').forEach(btn => {
      btn.addEventListener('click', updateCartItemQuantity);
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
      btn.addEventListener('click', removeCartItem);
    });
  }
  
  async function updateCartItemQuantity(e) {
    const foodItemId = e.target.dataset.id;
    const isIncrease = e.target.classList.contains('increase-qty');
    const qtyElement = e.target.parentNode.querySelector('.qty');
    let newQty = parseInt(qtyElement.textContent);
    
    if (isIncrease) {
      newQty++;
    } else {
      if (newQty > 1) newQty--;
      else return;
    }
    
    try {
      const response = await fetch('/orders/update-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ foodItemId, quantity: newQty })
      });
      
      if (response.ok) {
        loadCart();
      }
    } catch (err) {
      console.error('Error updating cart item:', err);
    }
  }
  
  async function removeCartItem(e) {
    const foodItemId = e.target.dataset.id;
    
    try {
      const response = await fetch('/orders/remove-from-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ foodItemId })
      });
      
      if (response.ok) {
        loadCart();
      }
    } catch (err) {
      console.error('Error removing cart item:', err);
    }
  }
  
  async function placeOrder(e) {
    e.preventDefault();
    
    const deliveryAddress = document.getElementById('delivery-address').value;
    const phone = document.getElementById('phone').value;
    const paymentMethod = document.getElementById('payment-method').value;
    
    try {
      const response = await fetch('/orders/place-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ deliveryAddress, phone, paymentMethod })
      });
      
      if (response.ok) {
        alert('Ваш заказ успешно оформлен!');
        window.location.href = 'index.html';
      } else {
        const error = await response.json();
        alert(error.error || 'Ошибка оформления заказа');
      }
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Ошибка оформления заказа');
    }
  }
});