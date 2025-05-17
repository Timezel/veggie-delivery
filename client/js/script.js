document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
  const citySelect = document.getElementById('city-select');
  const findRestaurantsBtn = document.getElementById('find-restaurants');
  const restaurantsContainer = document.getElementById('restaurants-container');
  const popularItemsContainer = document.getElementById('popular-items-container');
  const foodModal = document.getElementById('food-modal');
  const closeModal = document.querySelector('.close-modal');
  const foodModalBody = document.getElementById('food-modal-body');
  const categoryCards = document.querySelectorAll('.category-card');
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const authButtons = document.querySelector('.auth-buttons');
  const userProfile = document.querySelector('.user-profile');
  const usernameDisplay = document.getElementById('username-display');
  const adminLink = document.querySelector('.admin-link');
  
  // Check user authentication on page load
  checkAuth();
  
  // Event Listeners
  if (loginBtn) loginBtn.addEventListener('click', () => window.location.href = 'login.html');
  if (registerBtn) registerBtn.addEventListener('click', () => window.location.href = 'register.html');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);
  
  findRestaurantsBtn.addEventListener('click', loadRestaurants);
  closeModal.addEventListener('click', () => foodModal.style.display = 'none');
  window.addEventListener('click', (e) => {
    if (e.target === foodModal) foodModal.style.display = 'none';
  });
  
  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const category = card.getAttribute('data-category');
      loadFoodItemsByCategory(category);
    });
  });
  
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
  }
  
  // Load popular items by default
  loadPopularItems();
  
  // Functions
  async function checkAuth() {
    try {
      const response = await fetch('/user', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const user = await response.json();
        authButtons.style.display = 'none';
        userProfile.style.display = 'flex';
        usernameDisplay.textContent = user.username;
        
        if (user.isAdmin) {
          adminLink.style.display = 'inline-block';
        }
      } else {
        authButtons.style.display = 'block';
        userProfile.style.display = 'none';
      }
    } catch (err) {
      console.error('Error checking auth:', err);
    }
  }
  
  async function logout() {
    try {
      const response = await fetch('/logout', {
        method: 'GET',
        credentials: 'include'
      });
      
      if (response.ok) {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Error logging out:', err);
    }
  }
  
  async function loadRestaurants() {
    const city = citySelect.value;
    if (!city) {
      alert('Пожалуйста, выберите город');
      return;
    }
    
    try {
      const response = await fetch(`/restaurants?city=${city}`);
      const restaurants = await response.json();
      
      restaurantsContainer.innerHTML = '';
      
      if (restaurants.length === 0) {
        restaurantsContainer.innerHTML = '<p>В вашем городе пока нет ресторанов</p>';
        return;
      }
      
      restaurants.forEach(restaurant => {
        const restaurantCard = document.createElement('div');
        restaurantCard.className = 'restaurant-card';
        restaurantCard.innerHTML = `
          <div class="restaurant-image">
            <img src="${restaurant.image || 'images/restaurant-placeholder.jpg'}" alt="${restaurant.name}">
          </div>
          <div class="restaurant-info">
            <h3>${restaurant.name}</h3>
            <p>${restaurant.description || 'Вегетарианская кухня'}</p>
            <div class="restaurant-meta">
              <span class="rating">★ ${restaurant.rating || '4.5'}</span>
              <span class="delivery-time">${restaurant.deliveryTime || '30-40 мин'}</span>
            </div>
          </div>
        `;
        
        restaurantCard.addEventListener('click', () => {
          loadFoodItemsByRestaurant(restaurant._id);
        });
        
        restaurantsContainer.appendChild(restaurantCard);
      });
      
      // Scroll to restaurants section
      document.getElementById('restaurants').scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
      console.error('Error loading restaurants:', err);
      restaurantsContainer.innerHTML = '<p>Ошибка загрузки ресторанов</p>';
    }
  }
  
  async function loadFoodItemsByRestaurant(restaurantId) {
    try {
      const response = await fetch(`/restaurants/${restaurantId}/food-items`);
      const foodItems = await response.json();
      
      showFoodItems(foodItems);
    } catch (err) {
      console.error('Error loading food items:', err);
    }
  }
  
  async function loadFoodItemsByCategory(category) {
    try {
      const response = await fetch(`/food-items?category=${category}`);
      const foodItems = await response.json();
      
      showFoodItems(foodItems);
    } catch (err) {
      console.error('Error loading food items by category:', err);
    }
  }
  
  async function loadPopularItems() {
    try {
      const response = await fetch('/food-items/popular');
      const foodItems = await response.json();
      
      popularItemsContainer.innerHTML = '';
      
      foodItems.forEach(item => {
        const foodItemCard = document.createElement('div');
        foodItemCard.className = 'food-item-card';
        foodItemCard.innerHTML = `
          <div class="food-item-image">
            <img src="${item.image || 'images/food-placeholder.jpg'}" alt="${item.name}">
          </div>
          <div class="food-item-info">
            <h3>${item.name}</h3>
            <p>${item.description || 'Вкусное вегетарианское блюдо'}</p>
            <div class="food-item-meta">
              <span class="food-item-price">${item.price} ₽</span>
              <button class="add-to-cart" data-id="${item._id}">В корзину</button>
            </div>
          </div>
        `;
        
        foodItemCard.addEventListener('click', (e) => {
          if (!e.target.classList.contains('add-to-cart')) {
            showFoodItemDetails(item._id);
          }
        });
        
        popularItemsContainer.appendChild(foodItemCard);
      });
      
      // Add event listeners to "Add to cart" buttons
      document.querySelectorAll('.add-to-cart').forEach(btn => {
        btn.addEventListener('click', addToCart);
      });
    } catch (err) {
      console.error('Error loading popular items:', err);
    }
  }
  
  async function showFoodItems(foodItems) {
    restaurantsContainer.innerHTML = '';
    
    if (foodItems.length === 0) {
      restaurantsContainer.innerHTML = '<p>Блюда не найдены</p>';
      return;
    }
    
    foodItems.forEach(item => {
      const foodItemCard = document.createElement('div');
      foodItemCard.className = 'food-item-card';
      foodItemCard.innerHTML = `
        <div class="food-item-image">
          <img src="${item.image || 'images/food-placeholder.jpg'}" alt="${item.name}">
        </div>
        <div class="food-item-info">
          <h3>${item.name}</h3>
          <p>${item.description || 'Вкусное вегетарианское блюдо'}</p>
          <div class="food-item-meta">
            <span class="food-item-price">${item.price} ₽</span>
            <button class="add-to-cart" data-id="${item._id}">В корзину</button>
          </div>
        </div>
      `;
      
      foodItemCard.addEventListener('click', (e) => {
        if (!e.target.classList.contains('add-to-cart')) {
          showFoodItemDetails(item._id);
        }
      });
      
      restaurantsContainer.appendChild(foodItemCard);
    });
    
    // Add event listeners to "Add to cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(btn => {
      btn.addEventListener('click', addToCart);
    });
    
    // Scroll to restaurants section
    document.getElementById('restaurants').scrollIntoView({ behavior: 'smooth' });
  }
  
  async function showFoodItemDetails(foodItemId) {
    try {
      const response = await fetch(`/food-items/${foodItemId}`);
      const foodItem = await response.json();
      
      foodModalBody.innerHTML = `
        <div class="modal-image">
          <img src="${foodItem.image || 'images/food-placeholder.jpg'}" alt="${foodItem.name}">
        </div>
        <div class="modal-info">
          <h2>${foodItem.name}</h2>
          <p>${foodItem.description || 'Вкусное вегетарианское блюдо'}</p>
          ${foodItem.ingredients && foodItem.ingredients.length > 0 ? 
            `<p><strong>Ингредиенты:</strong> ${foodItem.ingredients.join(', ')}</p>` : ''}
          ${foodItem.isVegan ? '<p><strong>Веганское блюдо</strong></p>' : ''}
          <div class="modal-price">${foodItem.price} ₽</div>
          <div class="modal-actions">
            <div class="quantity-selector">
              <button class="decrease-qty">-</button>
              <input type="number" value="1" min="1" class="qty-input">
              <button class="increase-qty">+</button>
            </div>
            <button class="add-to-cart-modal" data-id="${foodItem._id}">Добавить в корзину</button>
          </div>
        </div>
      `;
      
      // Add event listeners to quantity buttons
      const decreaseBtn = foodModalBody.querySelector('.decrease-qty');
      const increaseBtn = foodModalBody.querySelector('.increase-qty');
      const qtyInput = foodModalBody.querySelector('.qty-input');
      
      decreaseBtn.addEventListener('click', () => {
        if (qtyInput.value > 1) qtyInput.value--;
      });
      
      increaseBtn.addEventListener('click', () => {
        qtyInput.value++;
      });
      
      // Add event listener to "Add to cart" button
      foodModalBody.querySelector('.add-to-cart-modal').addEventListener('click', () => {
        addToCart({
          target: {
            dataset: { id: foodItem._id },
            parentNode: {
              querySelector: () => ({ value: qtyInput.value })
            }
          }
        });
        foodModal.style.display = 'none';
      });
      
      foodModal.style.display = 'block';
    } catch (err) {
      console.error('Error loading food item details:', err);
    }
  }
  
  async function addToCart(e) {
    try {
      const foodItemId = e.target.dataset.id;
      const quantity = e.target.parentNode.querySelector('.qty-input')?.value || 1;
      
      const response = await fetch('/orders/add-to-cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ foodItemId, quantity })
      });
      
      if (response.ok) {
        alert('Товар добавлен в корзину');
      } else {
        alert('Пожалуйста, войдите в систему, чтобы добавить товар в корзину');
        window.location.href = 'login.html';
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
    }
  }
});