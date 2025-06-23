/**
 * User Dashboard functionality
 * Displays user's complaint statistics and recent activity
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in and has user role
    const user = checkAuth();
    if (!user) return;
    
    if (user.role !== 'user') {
      window.location.href = 'admin-dashboard.html';
      return;
    }
    
    // Set welcome message
    document.getElementById('userWelcome').textContent = user.username;
    document.getElementById('userName').textContent = user.username;
    
    try {
      // Show loading indicators
      showLoading('recentComplaintsTable');
      
      // Get user's complaints
      const complaints = await ApiService.getComplaintsByUserId(user.id);
      
      // Update statistics
      updateStatistics(complaints);
      
      // Create charts
      createStatusChart(complaints);
      createDepartmentChart(complaints);
      
      // Show recent complaints
      showRecentComplaints(complaints);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('recentComplaintsTable', 'Failed to load dashboard data. Please try again later.');
    }
  });
  
  /**
   * Update dashboard statistics
   * @param {Array} complaints - User's complaints
   */
  function updateStatistics(complaints) {
    const totalCount = complaints.length;
    const pendingCount = complaints.filter(c => c.status === 'Pending').length;
    const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
    const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
    
    document.getElementById('totalUserComplaints').textContent = totalCount;
    document.getElementById('pendingUserComplaints').textContent = pendingCount;
    document.getElementById('inProgressUserComplaints').textContent = inProgressCount;
    document.getElementById('resolvedUserComplaints').textContent = resolvedCount;
  }
  
  /**
   * Create status distribution chart
   * @param {Array} complaints - User's complaints
   */
  function createStatusChart(complaints) {
    const pendingCount = complaints.filter(c => c.status === 'Pending').length;
    const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
    const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
    const rejectedCount = complaints.filter(c => c.status === 'Rejected').length;
    
    createStatusChart('statusChart', pendingCount, inProgressCount, resolvedCount, rejectedCount);
  }
  
  /**
   * Create department distribution chart
   * @param {Array} complaints - User's complaints
   */
  function createDepartmentChart(complaints) {
    // Count complaints by department
    const departmentCounts = {};
    complaints.forEach(complaint => {
      if (!departmentCounts[complaint.department]) {
        departmentCounts[complaint.department] = 0;
      }
      departmentCounts[complaint.department]++;
    });
    
    const departments = Object.keys(departmentCounts);
    const counts = departments.map(dept => departmentCounts[dept]);
    
    const ctx = document.getElementById('departmentChart');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: departments,
        datasets: [{
          label: 'Number of Complaints',
          data: counts,
          backgroundColor: '#3498db',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0
            }
          }
        }
      }
    });
  }
  
  /**
   * Show recent complaints
   * @param {Array} complaints - User's complaints
   */
  function showRecentComplaints(complaints) {
    const tableBody = document.getElementById('recentComplaintsTable');
    const noComplaints = document.getElementById('noRecentComplaints');
    
    if (complaints.length === 0) {
      tableBody.innerHTML = '';
      noComplaints.classList.remove('d-none');
      return;
    }
    
    noComplaints.classList.add('d-none');
    
    // Sort complaints by date (newest first) and take top 5
    const recentComplaints = [...complaints]
      .sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled))
      .slice(0, 5);
    
    tableBody.innerHTML = recentComplaints.map(complaint => `
      <tr>
        <td>${complaint.id}</td>
        <td>${complaint.type}</td>
        <td>${complaint.department}</td>
        <td>${formatDate(complaint.dateFiled)}</td>
        <td>${getStatusBadge(complaint.status)}</td>
        <td>
          <a href="complaint-details.html?id=${complaint.id}" class="btn btn-sm btn-primary">
            <i class="fas fa-eye"></i> View
          </a>
        </td>
      </tr>
    `).join('');
  }
  