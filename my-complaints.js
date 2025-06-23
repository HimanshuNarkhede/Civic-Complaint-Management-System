/**
 * My Complaints functionality
 * Displays user's complaints with filtering and search
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in and has user role
    const user = checkAuth();
    if (!user) return;
    
    if (user.role !== 'user') {
      window.location.href = 'admin-dashboard.html';
      return;
    }
    
    // Set user name in header
    document.getElementById('userName').textContent = user.username;
    
    // Initialize variables for complaints and departments
    let allComplaints = [];
    let allDepartments = [];
    
    try {
      // Show loading indicator
      showLoading('complaintsTableBody');
      
      // Get user's complaints
      allComplaints = await ApiService.getComplaintsByUserId(user.id);
      
      // Get all departments for filter
      allDepartments = await ApiService.getAllDepartments();
      
      // Populate department filter
      populateDepartmentFilter(allDepartments);
      
      // Display complaints
      displayComplaints(allComplaints);
      
      // Initialize search and filters
      initializeSearchAndFilters();
    } catch (error) {
      console.error('Error loading complaints:', error);
      showError('complaintsTableBody', 'Failed to load complaints. Please try again later.');
    }
    
    /**
     * Populate department filter dropdown
     * @param {Array} departments - All departments
     */
    function populateDepartmentFilter(departments) {
      const departmentFilter = document.getElementById('departmentFilter');
      
      // If no departments from API, add default departments
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
        // Add departments from API
        departments.forEach(dept => {
          const option = document.createElement('option');
          option.value = dept.name;
          option.textContent = dept.name;
          departmentFilter.appendChild(option);
        });
      }
    }
    
    /**
     * Initialize search and filter functionality
     */
    function initializeSearchAndFilters() {
      const searchInput = document.getElementById('searchInput');
      const searchButton = document.getElementById('searchButton');
      const departmentFilter = document.getElementById('departmentFilter');
      const statusFilter = document.getElementById('statusFilter');
      
      // Search button click
      searchButton.addEventListener('click', filterComplaints);
      
      // Search input enter key
      searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
          filterComplaints();
        }
      });
      
      // Department filter change
      departmentFilter.addEventListener('change', filterComplaints);
      
      // Status filter change
      statusFilter.addEventListener('change', filterComplaints);
    }
    
    /**
     * Filter complaints based on search and filter values
     */
    function filterComplaints() {
      const searchValue = document.getElementById('searchInput').value.toLowerCase();
      const departmentValue = document.getElementById('departmentFilter').value;
      const statusValue = document.getElementById('statusFilter').value;
      
      // Apply filters
      const filteredComplaints = allComplaints.filter(complaint => {
        // Search filter (check in type, department, and description)
        const matchesSearch = !searchValue || 
          complaint.type.toLowerCase().includes(searchValue) || 
          complaint.department.toLowerCase().includes(searchValue) || 
          (complaint.description && complaint.description.toLowerCase().includes(searchValue));
        
        // Department filter
        const matchesDepartment = !departmentValue || complaint.department === departmentValue;
        
        // Status filter
        const matchesStatus = !statusValue || complaint.status === statusValue;
        
        return matchesSearch && matchesDepartment && matchesStatus;
      });
      
      // Display filtered complaints
      displayComplaints(filteredComplaints);
    }
    
    /**
     * Display complaints in the table
     * @param {Array} complaints - Complaints to display
     */
    function displayComplaints(complaints) {
      const tableBody = document.getElementById('complaintsTableBody');
      const noComplaints = document.getElementById('noComplaints');
      
      if (complaints.length === 0) {
        tableBody.innerHTML = '';
        noComplaints.classList.remove('d-none');
        return;
      }
      
      noComplaints.classList.add('d-none');
      
      // Sort complaints by date (newest first)
      const sortedComplaints = [...complaints].sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled));
      
      tableBody.innerHTML = sortedComplaints.map(complaint => `
        <tr>
          <td>${complaint.id}</td>
          <td>${complaint.type}</td>
          <td>${complaint.department}</td>
          <td>${formatDate(complaint.dateFiled)}</td>
          <td>${getStatusBadge(complaint.status)}</td>
          <td>
            <div class="actions">
              <a href="complaint-details.html?id=${complaint.id}" class="btn btn-sm btn-primary" data-bs-toggle="tooltip" title="View Details">
                <i class="fas fa-eye"></i>
              </a>
            </div>
          </td>
        </tr>
      `).join('');
      
      // Initialize tooltips
      initTooltips();
    }
  });
  