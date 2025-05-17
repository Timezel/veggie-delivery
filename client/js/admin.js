document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const adminTabs = document.querySelectorAll('.admin-tab');
  const adminContents = document.querySelectorAll('.admin-content');
  const addRestaurantBtn = document.getElementById('add-restaurant-btn');
  const addFoodItemBtn = document.getElementById('add-food-item-btn');
  const restaurantModal = document.getElementById('restaurant-modal');
  const foodItemModal = document.getElementById('food-item-modal');
  const orderModal = document.getElementById('order-modal');
  const userModal = document.getElementById('user-modal');
  const closeModalBtns = document.querySelectorAll('.close-modal, .cancel-modal');
  const restaurantForm = document.getElementById('restaurant-form');
  const foodItemForm = document.getElementById('food-item-form');
  const updateOrderStatusBtn = document.getElementById('update-order-status');
  const updateUserBtn = document.getElementById('update-user');
  const orderStatusSelect = document.getElementById('order-status-select');
  const userIsAdminCheckbox = document.getElementById('user-is-admin');
  
  // Current selected items
  let currentRestaurantId = null;
  let currentFoodItemId = null;
  let currentOrderId = null;
  let currentUserId = null;
  
  // Check admin status on page load
  checkAdminStatus();
  
  // Event Listeners
  adminTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      switchTab(tabId);
    });
  });
  
  addRestaurantBtn.addEventListener('click', () => {
    currentRestaurantId = null;
    document.getElementById('restaurant-modal-title').textContent = 'Добавить ресторан';
    document.getElementById('restaurant-id').value = '';
    restaurantForm.reset();
    restaurantModal.style.display = 'block';
  });
  
  addFoodItemBtn.addEventListener('click', async () => {
    currentFoodItemId = null;
    document.getElementById('food-item-modal-title').textContent = 'Добавить блюдо';
    document.getElementById('food-item-id').value = '';
    foodItemForm.reset();
    
    // Load restaurants for dropdown
    try {
      const response = await fetch('/restaurants');
      const restaurants = await response.json();
      
      const restaurantSelect = document.getElementById('food-item-restaurant');
      restaurantSelect.innerHTML = '';
      
      restaurants.forEach(restaurant => {
        const option = document.createElement('option');
        option.value = restaurant._id;
        option.textContent = restaurant.name;
        restaurantSelect.appendChild(option);
      });
    } catch (err) {
      console.error('Error loading restaurants:', err);
    }
    
    foodItemModal.style.display = 'block';
  });
  
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      restaurantModal.style.display = 'none';
      foodItemModal.style.display = 'none';
      orderModal.style.display = 'none';
      userModal.style.display = 'none';
    });
  });
  
  window.addEventListener('click', (e) => {
    if (e.target === restaurantModal) restaurantModal.style.display = 'none';
    if (e.target === foodItemModal) foodItemModal.style.display = 'none';
    if (e.target === orderModal) orderModal.style.display = 'none';
    if (e.target === userModal) userModal.style.display = 'none';
  });
  
  restaurantForm.addEventListener('submit', handleRestaurantSubmit);
  foodItemForm.addEventListener('submit', handleFoodItemSubmit);
  updateOrderStatusBtn.addEventListener('click', updateOrderStatus);
  updateUserBtn.addEventListener('click', updateUser);
  
  // Load initial data
  loadRestaurants();
  
  // Functions
  async function checkAdminStatus() {
    try {
      const response = await fetch('/user', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const user = await response.json();
        if (!user.isAdmin) {
          window.location.href = 'index.html';
        }
      } else {
        window.location.href = 'login.html';
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  }
  
  function switchTab(tabId) {
    adminTabs.forEach(tab => {
      tab.classList.remove('active');
      if (tab.getAttribute('data-tab') === tabId) {
        tab.classList.add('active');
      }
    });
    
    adminContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === `${tabId}-tab`) {
        content.classList.add('active');
        
        // Load data when tab is activated
        switch(tabId) {
          case 'restaurants':
            loadRestaurants();
            break;
          case 'food-items':
            loadFoodItems();
            break;
          case 'orders':
            loadOrders();
            break;
          case 'users':
            loadUsers();
            break;
        }
      }
    });
  }
  
  async function loadRestaurants() {
    try {
      const response = await fetch('/restaurants');
      const restaurants = await response.json();
      
      const tableBody = document.getElementById('restaurants-table-body');
      tableBody.innerHTML = '';
      
      restaurants.forEach(restaurant => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${restaurant.name}</td>
          <td>${restaurant.city}</td>
          <td>${restaurant.rating || '-'}</td>
          <td>
            <button class="btn btn-outline edit-restaurant" data-id="${restaurant._id}">Редактировать</button>
            <button class="btn btn-danger delete-restaurant" data-id="${restaurant._id}">Удалить</button>
          </td>
        `;
        
        tableBody.appendChild(row);
      });
      
      // Add event listeners to edit/delete buttons
      document.querySelectorAll('.edit-restaurant').forEach(btn => {
        btn.addEventListener('click', editRestaurant);
      });
      
      document.querySelectorAll('.delete-restaurant').forEach(btn => {
        btn.addEventListener('click', deleteRestaurant);
      });
    } catch (err) {
      console.error('Error loading restaurants:', err);
    }
  }
  
  async function editRestaurant(e) {
    const restaurantId = e.target.dataset.id;
    currentRestaurantId = restaurantId;
    
    try {
      const response = await fetch(`/restaurants/${restaurantId}`);
      const restaurant = await response.json();
      
      document.getElementById('restaurant-modal-title').textContent = 'Редактировать ресторан';
      document.getElementById('restaurant-id').value = restaurant._id;
      document.getElementById('restaurant-name').value = restaurant.name;
      document.getElementById('restaurant-description').value = restaurant.description || '';
      document.getElementById('restaurant-city').value = restaurant.city;
      document.getElementById('restaurant-image').value = restaurant.image || '';
      document.getElementById('restaurant-rating').value = restaurant.rating || '';
      document.getElementById('restaurant-delivery-time').value = restaurant.deliveryTime || '';
      document.getElementById('restaurant-delivery-fee').value = restaurant.deliveryFee || '';
      
      restaurantModal.style.display = 'block';
    } catch (err) {
      console.error('Error loading restaurant:', err);
    }
  }
  
  async function deleteRestaurant(e) {
    if (!confirm('Вы уверены, что хотите удалить этот ресторан?')) return;
    
    const restaurantId = e.target.dataset.id;
    
    try {
      const response = await fetch(`/restaurants/${restaurantId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        loadRestaurants();
      }
    } catch (err) {
      console.error('Error deleting restaurant:', err);
    }
  }
  
  async function handleRestaurantSubmit(e) {
    e.preventDefault();
    
    const restaurantData = {
      name: document.getElementById('restaurant-name').value,
      description: document.getElementById('restaurant-description').value,
      city: document.getElementById('restaurant-city').value,
      image: document.getElementById('restaurant-image').value,
      rating: document.getElementById('restaurant-rating').value || 0,
      deliveryTime: document.getElementById('restaurant-delivery-time').value,
      deliveryFee: document.getElementById('restaurant-delivery-fee').value || 0
    };
    
    try {
      const url = currentRestaurantId ? 
        `/restaurants/${currentRestaurantId}` : '/restaurants';
      const method = currentRestaurantId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(restaurantData)
      });
      
      if (response.ok) {
        restaurantModal.style.display = 'none';
        loadRestaurants();
      }
    } catch (err) {
      console.error('Error saving restaurant:', err);
    }
  }
  
  async function loadFoodItems() {
    try {
      const response = await fetch('/food-items');
      const foodItems = await response.json();
      
      const tableBody = document.getElementById('food-items-table-body');
      tableBody.innerHTML = '';
      
      foodItems.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.name}</td>
          <td>${item.restaurant.name}</td>
          <td>${item.category}</td>
          <td>${item.price} ₽</td>
          <td>
            <button class="btn btn-outline edit-food-item" data-id="${item._id}">Редактировать</button>
            <button class="btn btn-danger delete-food-item" data-id="${item._id}">Удалить</button>
          </td>
        `;
        
        tableBody.appendChild(row);
      });
      
      // Add event listeners to edit/delete buttons
      document.querySelectorAll('.edit-food-item').forEach(btn => {
        btn.addEventListener('click', editFoodItem);
      });
      
      document.querySelectorAll('.delete-food-item').forEach(btn => {
        btn.addEventListener('click', deleteFoodItem);
      });
    } catch (err) {
      console.error('Error loading food items:', err);
    }
  }
  
  async function editFoodItem(e) {
    const foodItemId = e.target.dataset.id;
    currentFoodItemId = foodItemId;
    
    try {
      const response = await fetch(`/food-items/${foodItemId}`);
      const foodItem = await response.json();
      
      // Load restaurants for dropdown
      const restaurantsResponse = await fetch('/restaurants');
      const restaurants = await restaurantsResponse.json();
      
      const restaurantSelect = document.getElementById('food-item-restaurant');
      restaurantSelect.innerHTML = '';
      
      restaurants.forEach(restaurant => {
        const option = document.createElement('option');
        option.value = restaurant._id;
        option.textContent = restaurant.name;
        option.selected = restaurant._id === foodItem.restaurant._id;
        restaurantSelect.appendChild(option);
      });
      
      document.getElementById('food-item-modal-title').textContent = 'Редактировать блюдо';
      document.getElementById('food-item-id').value = foodItem._id;
      document.getElementById('food-item-name').value = foodItem.name;
      document.getElementById('food-item-description').value = foodItem.description || '';
      document.getElementById('food-item-price').value = foodItem.price;
      document.getElementById('food-item-category').value = foodItem.category;
      document.getElementById('food-item-image').value = foodItem.image || '';
      document.getElementById('food-item-ingredients').value = foodItem.ingredients ? foodItem.ingredients.join(', ') : '';
      document.getElementById('food-item-vegetarian').checked = foodItem.isVegetarian;
      document.getElementById('food-item-vegan').checked = foodItem.isVegan;
      
      foodItemModal.style.display = 'block';
    } catch (err) {
      console.error('Error loading food item:', err);
    }
  }
  
  async function deleteFoodItem(e) {
    if (!confirm('Вы уверены, что хотите удалить это блюдо?')) return;
    
    const foodItemId = e.target.dataset.id;
    
    try {
      const response = await fetch(`/food-items/${foodItemId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      if (response.ok) {
        loadFoodItems();
      }
    } catch (err) {
      console.error('Error deleting food item:', err);
    }
  }
  
  async function handleFoodItemSubmit(e) {
    e.preventDefault();
    
    const foodItemData = {
      name: document.getElementById('food-item-name').value,
      restaurant: document.getElementById('food-item-restaurant').value,
      description: document.getElementById('food-item-description').value,
      price: document.getElementById('food-item-price').value,
      category: document.getElementById('food-item-category').value,
      image: document.getElementById('food-item-image').value,
      ingredients: document.getElementById('food-item-ingredients').value.split(',').map(i => i.trim()),
      isVegetarian: document.getElementById('food-item-vegetarian').checked,
      isVegan: document.getElementById('food-item-vegan').checked
    };
    
    try {
      const url = currentFoodItemId ? 
        `/food-items/${currentFoodItemId}` : '/food-items';
      const method = currentFoodItemId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(foodItemData)
      });
      
      if (response.ok) {
        foodItemModal.style.display = 'none';
        loadFoodItems();
      }
    } catch (err) {
      console.error('Error saving food item:', err);
    }
  }
  
  async function loadOrders() {
    try {
      const response = await fetch('/orders');
      const orders = await response.json();
      
      const tableBody = document.getElementById('orders-table-body');
      tableBody.innerHTML = '';
      
      orders.forEach(order => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${order._id.substring(0, 8)}...</td>
          <td>${order.user.username}</td>
          <td>${order.totalPrice} ₽</td>
          <td>${order.status}</td>
          <td>${new Date(order.createdAt).toLocaleDateString()}</td>
          <td>
            <button class="btn btn-outline view-order" data-id="${order._id}">Просмотр</button>
          </td>
        `;
        
        tableBody.appendChild(row);
      });
      
      // Add event listeners to view buttons
      document.querySelectorAll('.view-order').forEach(btn => {
        btn.addEventListener('click', viewOrder);
      });
    } catch (err) {
      console.error('Error loading orders:', err);
    }
  }
  
  async function viewOrder(e) {
    const orderId = e.target.dataset.id;
    currentOrderId = orderId;
    
    try {
      const response = await fetch(`/orders/${orderId}`);
      const order = await response.json();
      
      document.getElementById('order-id').textContent = order._id.substring(0, 8);
      document.getElementById('order-user').textContent = order.user.username;
      document.getElementById('order-address').textContent = order.deliveryAddress;
      document.getElementById('order-phone').textContent = order.phone || '-';
      document.getElementById('order-payment').textContent = order.paymentMethod === 'cash' ? 
        'Наличными при получении' : 'Картой онлайн';
      document.getElementById('order-status').textContent = order.status;
      document.getElementById('order-date').textContent = new Date(order.createdAt).toLocaleString();
      document.getElementById('order-total').textContent = `${order.totalPrice} ₽`;
      
      orderStatusSelect.value = order.status;
      
      const itemsBody = document.getElementById('order-items-body');
      itemsBody.innerHTML = '';
      
      order.items.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${item.foodItem.name}</td>
          <td>${item.quantity}</td>
          <td>${item.price} ₽</td>
          <td>${item.price * item.quantity} ₽</td>
        `;
        itemsBody.appendChild(row);
      });
      
      orderModal.style.display = 'block';
    } catch (err) {
      console.error('Error loading order:', err);
    }
  }
  
  async function updateOrderStatus() {
    try {
      const response = await fetch(`/orders/${currentOrderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: orderStatusSelect.value })
      });
      
      if (response.ok) {
        orderModal.style.display = 'none';
        loadOrders();
      }
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  }
  
  async function loadUsers() {
    try {
      const response = await fetch('/users');
      const users = await response.json();
      
      const tableBody = document.getElementById('users-table-body');
      tableBody.innerHTML = '';
      
      users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${user.username}</td>
          <td>${user.email}</td>
          <td>${user.isAdmin ? 'Да' : 'Нет'}</td>
          <td>
            <button class="btn btn-outline view-user" data-id="${user._id}">Просмотр</button>
          </td>
        `;
        
        tableBody.appendChild(row);
      });
      
      // Add event listeners to view buttons
      document.querySelectorAll('.view-user').forEach(btn => {
        btn.addEventListener('click', viewUser);
      });
    } catch (err) {
      console.error('Error loading users:', err);
    }
  }
  
  async function viewUser(e) {
    const userId = e.target.dataset.id;
    currentUserId = userId;
    
    try {
      const response = await fetch(`/users/${userId}`);
      const user = await response.json();
      
      document.getElementById('user-username').textContent = user.username;
      document.getElementById('user-email').textContent = user.email;
      document.getElementById('user-address').textContent = user.address || '-';
      document.getElementById('user-phone').textContent = user.phone || '-';
      document.getElementById('user-created').textContent = new Date(user.createdAt).toLocaleDateString();
      
      userIsAdminCheckbox.checked = user.isAdmin;
      
      userModal.style.display = 'block';
    } catch (err) {
      console.error('Error loading user:', err);
    }
  }
  
  async function updateUser() {
    try {
      const response = await fetch(`/users/${currentUserId}/admin`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ isAdmin: userIsAdminCheckbox.checked })
      });
      
      if (response.ok) {
        userModal.style.display = 'none';
        loadUsers();
      }
    } catch (err) {
      console.error('Error updating user:', err);
    }
  }
});