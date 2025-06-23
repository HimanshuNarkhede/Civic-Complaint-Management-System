/**
 * Admin Dashboard functionality
 * Displays system-wide complaint statistics and recent activity
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in and has admin role
    const user = checkAdminRole();
    if (!user) return;
    
    // Set user name in header
    document.getElementById('userName').textContent = user.username;
    document.getElementById('adminWelcome').textContent = user.username;
    
    try {
      // Show loading indicators
      showLoading('recentComplaintsTable');
      
      // Get all complaints
      const complaints = await ApiService.getAllComplaints();
      
      // Update statistics
      updateStatistics(complaints);
      
      // Create charts
      createStatusChart(complaints);
      createDepartmentChart(complaints);
      createSeverityChart(complaints);
      createTrendChart(complaints);
      
      // Show recent complaints
      showRecentComplaints(complaints);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      showError('recentComplaintsTable', 'Failed to load dashboard data. Please try again later.');
    }
  });
  
  /**
   * Update dashboard statistics
   * @param {Array} complaints - All complaints
   */
  function updateStatistics(complaints) {
    const totalCount = complaints.length;
    const pendingCount = complaints.filter(c => c.status === 'Pending').length;
    const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
    const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
    const rejectedCount = complaints.filter(c => c.status === 'Rejected').length;
    
    document.getElementById('totalComplaints').textContent = totalCount;
    document.getElementById('pendingComplaints').textContent = pendingCount;
    document.getElementById('inProgressComplaints').textContent = inProgressCount;
    document.getElementById('resolvedComplaints').textContent = resolvedCount;
    
    // Calculate resolution rate
    const resolutionRate = totalCount > 0 ? Math.round((resolvedCount / totalCount) * 100) : 0;
    document.getElementById('resolutionRate').textContent = `${resolutionRate}%`;
  }
  
  /**
   * Create status distribution chart
   * @param {Array} complaints - All complaints
   */
  function createStatusChart(complaints) {
    const pendingCount = complaints.filter(c => c.status === 'Pending').length;
    const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
    const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
    const rejectedCount = complaints.filter(c => c.status === 'Rejected').length;
    
    const ctx = document.getElementById('statusChart');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'In Progress', 'Resolved', 'Rejected'],
        datasets: [{
          data: [pendingCount, inProgressCount, resolvedCount, rejectedCount],
          backgroundColor: ['#f39c12', '#3498db', '#2ecc71', '#e74c3c'],
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
  
  /**
   * Create department distribution chart
   * @param {Array} complaints - All complaints
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
   * Create severity distribution chart
   * @param {Array} complaints - All complaints
   */
  function createSeverityChart(complaints) {
    const highCount = complaints.filter(c => c.severity === 'High').length;
    const mediumCount = complaints.filter(c => c.severity === 'Medium').length;
    const lowCount = complaints.filter(c => c.severity === 'Low').length;
    
    const ctx = document.getElementById('severityChart');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
          data: [highCount, mediumCount, lowCount],
          backgroundColor: ['#e74c3c', '#f39c12', '#2ecc71'],
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
  
  /**
   * Create trend chart
   * @param {Array} complaints - All complaints
   */
  function createTrendChart(complaints) {
    // Get last 6 months
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push(month);
    }
    
    // Count complaints by month
    const monthlyCounts = months.map(month => {
      const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
      const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);
      
      return complaints.filter(complaint => {
        const complaintDate = new Date(complaint.dateFiled);
        return complaintDate >= monthStart && complaintDate <= monthEnd;
      }).length;
    });
    
    // Format month labels
    const monthLabels = months.map(month => {
      return month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;
    
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: monthLabels,
        datasets: [{
          label: 'Complaints Filed',
          data: monthlyCounts,
          borderColor: '#3498db',
          backgroundColor: 'rgba(52, 152, 219, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
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
   * @param {Array} complaints - All complaints
   */
  function showRecentComplaints(complaints) {
    const tableBody = document.getElementById('recentComplaintsTable');
    
    if (complaints.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center">No complaints found</td>
        </tr>
      `;
      return;
    }
    
    // Sort complaints by date (newest first) and take top 5
    const recentComplaints = [...complaints]
      .sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled))
      .slice(0, 5);
    
    tableBody.innerHTML = recentComplaints.map(complaint => `
      <tr>
        <td>${complaint.id}</td>
        <td>${complaint.email || 'N/A'}</td>
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
  