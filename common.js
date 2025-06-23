/**
 * Common functionality for Civic Complaint Management System
 * Used across multiple pages
 */

// Check if user is logged in
function checkAuth() {
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (!loggedInUser) {
      window.location.href = 'index.html';
      return null;
    }
    return loggedInUser;
  }
  
  // Check if user has admin role
  function checkAdminRole() {
    const user = checkAuth();
    if (user && user.role !== 'admin') {
      window.location.href = 'user-dashboard.html';
      return false;
    }
    return true;
  }
  
  // Check if user has user role
  function checkUserRole() {
    const user = checkAuth();
    if (user && user.role !== 'user') {
      window.location.href = 'admin-dashboard.html';
      return false;
    }
    return true;
  }
  
  // Logout function
  function logout() {
    // Show confirmation dialog
    if (typeof Swal !== 'undefined') {
      Swal.fire({
        title: 'Logout Confirmation',
        text: 'Are you sure you want to logout?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, logout'
      }).then((result) => {
        if (result.isConfirmed) {
          performLogout();
        }
      });
    } else {
      if (confirm('Are you sure you want to logout?')) {
        performLogout();
      }
    }
  }
  
  // Perform the actual logout
  function performLogout() {
    sessionStorage.removeItem('loggedInUser');
    window.location.href = 'index.html';
  }
  
  // Format date
  function formatDate(dateString) {
    if (!dateString) return 'N/A';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Format date with time
  function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  }
  
  // Get status badge HTML
  function getStatusBadge(status) {
    let badgeClass = '';
    
    switch (status) {
      case 'Pending':
        badgeClass = 'badge-pending';
        break;
      case 'In Progress':
        badgeClass = 'badge-progress';
        break;
      case 'Resolved':
        badgeClass = 'badge-resolved';
        break;
      case 'Rejected':
        badgeClass = 'badge-rejected';
        break;
      default:
        badgeClass = 'bg-secondary';
    }
    
    return `<span class="badge status-badge ${badgeClass}">${status}</span>`;
  }
  
  // Show loading spinner
  function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <div class="d-flex justify-content-center my-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      `;
    }
  }
  
  // Show error message
  function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <div class="alert alert-danger" role="alert">
          <i class="fas fa-exclamation-circle me-2"></i> ${message}
        </div>
      `;
    }
  }
  
  // Show success message
  function showSuccess(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
      element.innerHTML = `
        <div class="alert alert-success" role="alert">
          <i class="fas fa-check-circle me-2"></i> ${message}
        </div>
      `;
    }
  }
  
  // Get URL parameters
  function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }
  
  // Create a chart for status distribution
  function createStatusChart(elementId, pendingCount, inProgressCount, resolvedCount, rejectedCount = 0) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return;
    
    const labels = ['Pending', 'In Progress', 'Resolved'];
    const data = [pendingCount, inProgressCount, resolvedCount];
    const backgroundColor = ['#f39c12', '#3498db', '#2ecc71'];
    
    if (rejectedCount > 0) {
      labels.push('Rejected');
      data.push(rejectedCount);
      backgroundColor.push('#e74c3c');
    }
    
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColor,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
  
  // Initialize sidebar toggle for mobile
  function initSidebar() {
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    
    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-open');
      });
    }
  }
  
  // Initialize tooltips
  function initTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new bootstrap.Tooltip(tooltipTriggerEl);
    });
  }
  
  // Initialize popovers
  function initPopovers() {
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
      return new bootstrap.Popover(popoverTriggerEl);
    });
  }
  
  // Initialize all common components
  function initCommon() {
    initSidebar();
    initTooltips();
    initPopovers();
    
    // Set user info in header if available
    const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
    const userNameElement = document.getElementById('userName');
    if (user && userNameElement) {
      userNameElement.textContent = user.username;
    }
  }
  
  // Document ready
  document.addEventListener('DOMContentLoaded', function() {
    initCommon();
  });
  