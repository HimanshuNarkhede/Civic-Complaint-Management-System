document.addEventListener('DOMContentLoaded', async function() {
  // Check if user is logged in and has admin role
  const user = checkAdminRole();
  if (!user) return;

  // Set user name in header
  document.getElementById('userName').textContent = user.username;

  // Initialize variables for complaints and departments
  let allComplaints = [];
  let allDepartments = [];
  let currentPage = 1;
  const pageSize = 10;

  try {
    // Show loading indicator
    showLoading('complaintsTableBody');

    // Get all complaints
    allComplaints = await ApiService.getAllComplaints();

    // Get all departments for filter
    allDepartments = await ApiService.getAllDepartments();

    // Populate department filter
    populateDepartmentFilter(allDepartments);

    // Display complaints
    displayComplaints(allComplaints, currentPage, pageSize);

    // Initialize search and filters
    initializeSearchAndFilters();
  } catch (error) {
    console.error('Error loading complaints:', error);
    showError('complaintsTableBody', 'Failed to load complaints. Please try again later.');
  }

  function populateDepartmentFilter(departments) {
    const departmentFilter = document.getElementById('departmentFilter');
    if (departments.length === 0) {
      const defaultDepartments = [
        { id: 1, name: "Water Department" },
        { id: 2, name: "Sanitation Department" },
        { id: 3, name: "Electricity Department" },
        { id: 4, name: "Roads & Infrastructure" },
        { id: 5, name: "Public Health" },
        { id: 6, name: "Municipal Administration" },
        { id: 7, name: "Parks & Recreation" },
        { id: 8, name: "Traffic Management" }
      ];
      defaultDepartments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.name;
        option.textContent = dept.name;
        departmentFilter.appendChild(option);
      });
    } else {
      departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept.name;
        option.textContent = dept.name;
        departmentFilter.appendChild(option);
      });
    }
  }

  function initializeSearchAndFilters() {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const departmentFilter = document.getElementById('departmentFilter');
    const statusFilter = document.getElementById('statusFilter');
    const severityFilter = document.getElementById('severityFilter');

    searchButton.addEventListener('click', function() {
      currentPage = 1;
      filterComplaints();
    });

    searchInput.addEventListener('keyup', function(e) {
      if (e.key === 'Enter') {
        currentPage = 1;
        filterComplaints();
      }
    });

    departmentFilter.addEventListener('change', function() {
      currentPage = 1;
      filterComplaints();
    });

    statusFilter.addEventListener('change', function() {
      currentPage = 1;
      filterComplaints();
    });

    severityFilter.addEventListener('change', function() {
      currentPage = 1;
      filterComplaints();
    });
  }

  function filterComplaints() {
    const searchValue = document.getElementById('searchInput').value.toLowerCase();
    const departmentValue = document.getElementById('departmentFilter').value;
    const statusValue = document.getElementById('statusFilter').value;
    const severityValue = document.getElementById('severityFilter').value;

    const filteredComplaints = allComplaints.filter(complaint => {
      const matchesSearch = !searchValue ||
        complaint.type.toLowerCase().includes(searchValue) ||
        complaint.department.toLowerCase().includes(searchValue) ||
        (complaint.description && complaint.description.toLowerCase().includes(searchValue)) ||
        (complaint.email && complaint.email.toLowerCase().includes(searchValue));

      const matchesDepartment = !departmentValue || complaint.department === departmentValue;
      const matchesStatus = !statusValue || complaint.status === statusValue;
      const matchesSeverity = !severityValue || complaint.severity === severityValue;

      return matchesSearch && matchesDepartment && matchesStatus && matchesSeverity;
    });

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
        <td>${complaint.email || 'N/A'}</td>
        <td>${complaint.type}</td>
        <td>${complaint.department}</td>
        <td>
          <span class="badge ${getSeverityBadgeClass(complaint.severity)}">${complaint.severity}</span>
        </td>
        <td>${formatDate(complaint.dateFiled)}</td>
        <td>${getStatusBadge(complaint.status)}</td>
        <td>
          <div class="actions">
            <a href="complaint-details.html?id=${complaint.id}" class="btn btn-sm btn-primary" data-bs-toggle="tooltip" title="View Details">
              <i class="fas fa-eye"></i>
            </a>
            <button class="btn btn-sm btn-info" onclick="updateStatus(${complaint.id}, '${complaint.status}')" data-bs-toggle="tooltip" title="Update Status">
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    generatePagination(page, totalPages);
    initTooltips();
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

// Update status modal logic remains unchanged (if you have it in your code)
