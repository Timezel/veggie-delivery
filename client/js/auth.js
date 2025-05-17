document.addEventListener('DOMContentLoaded', function() {
  // DOM Elements
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const loginBtn = document.getElementById('login-btn');
  const registerBtn = document.getElementById('register-btn');
  const logoutBtn = document.getElementById('logout-btn');
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
  
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const response = await fetch('/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ email, password })
        });
        
        if (response.ok) {
          window.location.href = 'index.html';
        } else {
          const error = await response.json();
          alert(error.error || 'Ошибка входа');
        }
      } catch (err) {
        console.error('Error logging in:', err);
        alert('Ошибка входа');
      }
    });
  }
  
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm-password').value;
      
      if (password !== confirmPassword) {
        alert('Пароли не совпадают');
        return;
      }
      
      try {
        const response = await fetch('/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ username, email, password })
        });
        
        if (response.ok) {
          window.location.href = 'index.html';
        } else {
          const error = await response.json();
          alert(error.error || 'Ошибка регистрации');
        }
      } catch (err) {
        console.error('Error registering:', err);
        alert('Ошибка регистрации');
      }
    });
  }
  
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
  }
  
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
        
        // If user is logged in and on auth pages, redirect to home
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('register.html')) {
          window.location.href = 'index.html';
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
        window.location.href = 'index.html';
      }
    } catch (err) {
      console.error('Error logging out:', err);
    }
  }
});