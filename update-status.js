document.addEventListener('DOMContentLoaded', async function() {
  // Check if user is logged in and has admin role
  const user = checkAdminRole();
  if (!user) return;

  // Set user name in header
  document.getElementById('userName').textContent = user.username;

  // Initialize variables for complaints
  let allComplaints = [];
  let currentPage = 1;
  const pageSize = 10;

  try {
    // Show loading indicator
    showLoading('complaintsTableBody');

    // Get all complaints
    allComplaints = await ApiService.getAllComplaints();

    // Display complaints
    displayComplaints(allComplaints, currentPage, pageSize);

    // Initialize status filters
    initializeStatusFilters();
  } catch (error) {
    console.error('Error loading complaints:', error);
    showError('complaintsTableBody', 'Failed to load complaints. Please try again later.');
  }

  function initializeStatusFilters() {
    const statusFilters = document.querySelectorAll('input[name="statusFilter"]');
    statusFilters.forEach(filter => {
      filter.addEventListener('change', function() {
        currentPage = 1;
        filterComplaints();
      });
    });
  }

  function filterComplaints() {
    const statusValue = document.querySelector('input[name="statusFilter"]:checked').value;
    const filteredComplaints = statusValue 
      ? allComplaints.filter(complaint => complaint.status === statusValue)
      : allComplaints;
    displayComplaints(filteredComplaints, currentPage, pageSize);
  }

  function displayComplaints(complaints, page, size) {
    const tableBody = document.getElementById('complaintsTableBody');
    const noComplaints = document.getElementById('noComplaints');
    const pagination = document.getElementById('pagination');

    if (complaints.length === 0) {
      tableBody.innerHTML = '';
      noComplaints.classList.remove('d-none');
      pagination.innerHTML = '';
      return;
    }

    noComplaints.classList.add('d-none');

    const sortedComplaints = [...complaints].sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled));
    const totalPages = Math.ceil(sortedComplaints.length / size);
    const start = (page - 1) * size;
    const end = Math.min(start + size, sortedComplaints.length);
    const paginatedComplaints = sortedComplaints.slice(start, end);

    tableBody.innerHTML = paginatedComplaints.map(complaint => `
      <tr>
        <td>${complaint.id}</td>
        <td>${complaint.type}</td>
        <td>${complaint.department}</td>
        <td>
          <span class="badge ${getSeverityBadgeClass(complaint.severity)}">${complaint.severity}</span>
        </td>
        <td>${formatDate(complaint.dateFiled)}</td>
        <td>${getStatusBadge(complaint.status)}</td>
        <td>
          <div class="btn-group" role="group">
            <button type="button" class="btn btn-sm ${complaint.status === 'Pending' ? 'btn-warning active' : 'btn-outline-warning'}" 
              onclick="updateComplaintStatus(${complaint.id}, 'Pending')" 
              ${complaint.status === 'Pending' ? 'disabled' : ''}>
              Pending
            </button>
            <button type="button" class="btn btn-sm ${complaint.status === 'In Progress' ? 'btn-primary active' : 'btn-outline-primary'}" 
              onclick="updateComplaintStatus(${complaint.id}, 'In Progress')" 
              ${complaint.status === 'In Progress' ? 'disabled' : ''}>
              In Progress
            </button>
            <button type="button" class="btn btn-sm ${complaint.status === 'Resolved' ? 'btn-success active' : 'btn-outline-success'}" 
              onclick="updateComplaintStatus(${complaint.id}, 'Resolved')" 
              ${complaint.status === 'Resolved' ? 'disabled' : ''}>
              Resolved
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    generatePagination(page, totalPages);
  }

  function generatePagination(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }
    let paginationHTML = '';
    paginationHTML += `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>
    `;
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <li class="page-item ${i === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `;
    }
    paginationHTML += `
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
          <span aria-hidden="true">&raquo;</span>
        </a>
      </li>
    `;
    pagination.innerHTML = paginationHTML;
    document.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const page = parseInt(this.getAttribute('data-page'));
        if (page >= 1 && page <= totalPages) {
          currentPage = page;
          filterComplaints();
        }
      });
    });
  }

  function getSeverityBadgeClass(severity) {
    switch (severity) {
      case 'High':
        return 'bg-danger';
      case 'Medium':
        return 'bg-warning';
      case 'Low':
        return 'bg-success';
      default:
        return 'bg-secondary';
    }
  }
});

// Update complaint status (called from HTML)
async function updateComplaintStatus(id, newStatus) {
  const statusUpdateMessage = document.getElementById('statusUpdateMessage');
  try {
    statusUpdateMessage.innerHTML = `
      <div class="alert alert-info">
        <div class="d-flex align-items-center">
          <div class="spinner-border spinner-border-sm me-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <div>Updating complaint #${id} status to ${newStatus}...</div>
        </div>
      </div>
    `;
    await ApiService.updateComplaintStatus(id, newStatus);
    statusUpdateMessage.innerHTML = `
      <div class="alert alert-success">
        <i class="fas fa-check-circle me-2"></i>
        Complaint #${id} status updated successfully to ${newStatus}.
      </div>
    `;
    setTimeout(() => {
      location.reload();
    }, 1000);
  } catch (error) {
    console.error('Error updating status:', error);
    statusUpdateMessage.innerHTML = `
      <div class="alert alert-danger">
        <i class="fas fa-exclamation-circle me-2"></i>
        Failed to update status: ${error.message || 'Unknown error'}
      </div>
    `;
  }
}
