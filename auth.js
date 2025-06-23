/**
 * Authentication functionality for Civic Complaint Management System
 * Handles login and registration
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (loggedInUser) {
      redirectToDashboard(loggedInUser.role);
    }
    
    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(button => {
      button.addEventListener('click', function() {
        const passwordInput = this.previousElementSibling;
        const icon = this.querySelector('i');
        
        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          passwordInput.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      });
    });
    
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset error messages
        document.getElementById('loginEmailError').textContent = '';
        document.getElementById('loginPasswordError').textContent = '';
        const loginMsg = document.getElementById('loginMsg');
        loginMsg.textContent = '';
        loginMsg.classList.add('d-none');
        
        // Get form values
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        
        // Validate form
        let valid = true;
        
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          document.getElementById('loginEmailError').textContent = 'Please enter a valid email address';
          valid = false;
        }
        
        if (!password) {
          document.getElementById('loginPasswordError').textContent = 'Please enter your password';
          valid = false;
        }
        
        if (!valid) return;
        
        try {
          // Show loading state
          const submitBtn = loginForm.querySelector('button[type="submit"]');
          const originalBtnText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
          
          // Authenticate user
          const isAuthenticated = await ApiService.login(email, password);
          
          if (isAuthenticated) {
            // Get user details
            const user = await ApiService.getUserByEmail(email);
            
            // Store user in session storage
            sessionStorage.setItem('loggedInUser', JSON.stringify(user));
            
            // Redirect to appropriate dashboard
            redirectToDashboard(user.role);
          } else {
            loginMsg.textContent = 'Invalid email or password';
            loginMsg.classList.remove('d-none');
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
        } catch (error) {
          loginMsg.textContent = error.message || 'An error occurred. Please try again.';
          loginMsg.classList.remove('d-none');
          
          // Reset button
          const submitBtn = loginForm.querySelector('button[type="submit"]');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-sign-in-alt me-2"></i>Login';
        }
      });
    }
    
    // Registration form submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset error messages
        document.getElementById('roleError').textContent = '';
        document.getElementById('usernameError').textContent = '';
        document.getElementById('emailError').textContent = '';
        document.getElementById('phoneError').textContent = '';
        document.getElementById('passwordError').textContent = '';
        const registerMsg = document.getElementById('registerMsg');
        registerMsg.textContent = '';
        registerMsg.classList.add('d-none');
        
        // Get form values
        const role = document.getElementById('registerRole').value;
        const username = document.getElementById('registerUsername').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const phone = document.getElementById('registerPhone').value.trim();
        const password = document.getElementById('registerPassword').value.trim();
        
        // Validate form
        let valid = true;
        
        if (!role) {
          document.getElementById('roleError').textContent = 'Please select a role';
          valid = false;
        }
        
        if (!username) {
          document.getElementById('usernameError').textContent = 'Please enter your full name';
          valid = false;
        }
        
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
          document.getElementById('emailError').textContent = 'Please enter a valid email address';
          valid = false;
        }
        
        if (!phone || !/^\d{10}$/.test(phone)) {
          document.getElementById('phoneError').textContent = 'Please enter a valid 10-digit phone number';
          valid = false;
        }
        
        if (!password || password.length < 5) {
          document.getElementById('passwordError').textContent = 'Password must be at least 5 characters';
          valid = false;
        }
        
        if (!valid) return;
        
        try {
          // Show loading state
          const submitBtn = registerForm.querySelector('button[type="submit"]');
          const originalBtnText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Registering...';
          
          // Register user
          await ApiService.register({
            username,
            email,
            password,
            phone,
            role
          });
          
          // Show success message using SweetAlert if available, otherwise use alert
          if (typeof Swal !== 'undefined') {
            Swal.fire({
              icon: 'success',
              title: 'Registration Successful!',
              text: 'You can now login with your credentials.',
              confirmButtonColor: '#3498db'
            }).then(() => {
              // Switch to login tab
              const loginTab = document.getElementById('login-tab');
              if (loginTab) {
                const tabInstance = new bootstrap.Tab(loginTab);
                tabInstance.show();
              }
              
              // Clear registration form
              registerForm.reset();
              
              // Reset button
              submitBtn.disabled = false;
              submitBtn.innerHTML = originalBtnText;
            });
          } else {
            alert('Registration successful! Please login.');
            
            // Switch to login tab
            const loginTab = document.getElementById('login-tab');
            if (loginTab) {
              const tabInstance = new bootstrap.Tab(loginTab);
              tabInstance.show();
            }
            
            // Clear registration form
            registerForm.reset();
            
            // Reset button
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
        } catch (error) {
          registerMsg.textContent = error.message || 'An error occurred. Please try again.';
          registerMsg.classList.remove('d-none');
          
          // Reset button
          const submitBtn = registerForm.querySelector('button[type="submit"]');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-user-plus me-2"></i>Register';
        }
      });
    }
  });
  
  /**
   * Redirect to appropriate dashboard based on user role
   * @param {string} role - User role (admin or user)
   */
  function redirectToDashboard(role) {
    if (role === 'admin') {
      window.location.href = 'admin-dashboard.html';
    } else {
      window.location.href = 'user-dashboard.html';
    }
  }
  