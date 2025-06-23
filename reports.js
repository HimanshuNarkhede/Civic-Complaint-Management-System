document.addEventListener('DOMContentLoaded', async function() {
  const user = checkAdminRole();
  if (!user) return;
  document.getElementById('userName').textContent = user.username;

  let allComplaints = [];
  let statusChart = null;
  let complaintTypesChart = null;
  let severityChart = null;
  let monthlyChart = null;

  try {
    showLoading('departmentReportTable');
    allComplaints = await ApiService.getAllComplaints();
    createStatusChart(allComplaints);
    createMonthlyComplaintsChart(allComplaints);
    createComplaintTypesChart(allComplaints);
    createSeverityChart(allComplaints);
    createDepartmentReport(allComplaints);
  } catch (error) {
    console.error('Error loading reports data:', error);
    showError('departmentReportTable', 'Failed to load reports data. Please try again later.');
  }

  function createStatusChart(complaints) {
    const ctx = document.getElementById('statusOverviewChart');
    if (!ctx) return;
    if (statusChart) { statusChart.destroy(); }
    const pending = complaints.filter(c => c.status === 'Pending').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolved = complaints.filter(c => c.status === 'Resolved').length;
    statusChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Pending', 'In Progress', 'Resolved'],
        datasets: [{
          data: [pending, inProgress, resolved],
          backgroundColor: ['#f39c12', '#3498db', '#2ecc71']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'right',
            labels: {
              boxWidth: 15,
              padding: 10
            }
          }
        }
      }
    });
  }

  function createMonthlyComplaintsChart(complaints) {
    const ctx = document.getElementById('monthlyComplaintsChart');
    if (!ctx) return;
    if (monthlyChart) { monthlyChart.destroy(); }
    
    // Get the last 6 months
    const monthsData = {};
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
      const month = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthName = month.toLocaleString('en-US', { month: 'short' });
      monthsData[monthName] = 0;
    }
    
    // Count complaints by month
    complaints.forEach(complaint => {
      const complaintDate = new Date(complaint.dateFiled);
      const monthName = complaintDate.toLocaleString('en-US', { month: 'short' });
      if (monthsData.hasOwnProperty(monthName)) {
        monthsData[monthName]++;
      }
    });
    
    // Create chart
    monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(monthsData),
        datasets: [{
          label: 'Number of Complaints',
          data: Object.values(monthsData),
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
        },
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Complaints by Month',
            font: {
              size: 14
            }
          }
        }
      }
    });
  }

  function createComplaintTypesChart(complaints) {
    const ctx = document.getElementById('complaintTypesChart');
    if (!ctx) return;
    if (complaintTypesChart) { complaintTypesChart.destroy(); }
    const typeCounts = {};
    complaints.forEach(c => {
      typeCounts[c.type] = (typeCounts[c.type] || 0) + 1;
    });
    
    // Sort by count and get top 5
    const sortedTypes = Object.entries(typeCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
    
    const types = sortedTypes.map(item => item[0]);
    const counts = sortedTypes.map(item => item[1]);
    const backgroundColors = types.map((_, i) => {
      const r = Math.floor(Math.random() * 200);
      const g = Math.floor(Math.random() * 200);
      const b = Math.floor(Math.random() * 200);
      return `rgba(${r},${g},${b},0.7)`;
    });
    
    complaintTypesChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: types,
        datasets: [{
          data: counts,
          backgroundColor: backgroundColors
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'right',
            labels: {
              boxWidth: 15,
              padding: 10
            }
          }
        }
      }
    });
  }

  function createSeverityChart(complaints) {
    const ctx = document.getElementById('severityChart');
    if (!ctx) return;
    if (severityChart) { severityChart.destroy(); }
    const high = complaints.filter(c => c.severity === 'High').length;
    const medium = complaints.filter(c => c.severity === 'Medium').length;
    const low = complaints.filter(c => c.severity === 'Low').length;
    severityChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['High', 'Medium', 'Low'],
        datasets: [{
          data: [high, medium, low],
          backgroundColor: ['#e74c3c', '#f39c12', '#2ecc71']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { 
            position: 'right',
            labels: {
              boxWidth: 15,
              padding: 10
            }
          }
        }
      }
    });
  }

  function createDepartmentReport(complaints) {
    const tableBody = document.getElementById('departmentReportTable');
    const departmentData = {};
    complaints.forEach(c => {
      if (!departmentData[c.department]) {
        departmentData[c.department] = { total: 0, pending: 0, inProgress: 0, resolved: 0 };
      }
      departmentData[c.department].total++;
      if (c.status === 'Pending') departmentData[c.department].pending++;
      if (c.status === 'In Progress') departmentData[c.department].inProgress++;
      if (c.status === 'Resolved') departmentData[c.department].resolved++;
    });
    tableBody.innerHTML = Object.entries(departmentData).map(([dept, data]) => `
      <tr>
        <td>${dept}</td>
        <td>${data.total}</td>
        <td>${data.pending}</td>
        <td>${data.inProgress}</td>
        <td>${data.resolved}</td>
      </tr>
    `).join('');
  }
});
