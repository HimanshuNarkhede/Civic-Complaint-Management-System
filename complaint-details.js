/**
 * Complaint Details functionality
 * Displays detailed information about a specific complaint
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in
    const user = checkAuth();
    if (!user) return;
    
    // Set user name in header
    document.getElementById('userName').textContent = user.username;
    
    // Get complaint ID from URL
    const complaintId = getUrlParameter('id');
    if (!complaintId) {
      showError('complaintDetails', 'No complaint ID specified.');
      return;
    }
    
    // Add appropriate sidebar based on user role
    addSidebar(user.role);
    
    // Show admin actions if user is admin
    if (user.role === 'admin') {
      document.getElementById('adminActions').classList.remove('d-none');
    }
    
    try {
      // Get complaint details
      const complaint = await ApiService.getComplaintById(complaintId);
      
      // Update page title
      document.title = `Complaint #${complaint.id} - Civic Complaint Management System`;
      
      // Display complaint details
      displayComplaintDetails(complaint);
      
      // Display status timeline
      displayStatusTimeline(complaint);
      
      // Display department information
      displayDepartmentInfo(complaint);
      
      // Set up status update form for admins
      if (user.role === 'admin') {
        setupStatusUpdateForm(complaint);
      }
      
      // Set up back button
      document.getElementById('backButton').addEventListener('click', function() {
        if (user.role === 'admin') {
          window.location.href = 'all-complaints.html';
        } else {
          window.location.href = 'my-complaints.html';
        }
      });
      
      // Set up print button
      document.getElementById('printButton').addEventListener('click', function() {
        window.print();
      });
    } catch (error) {
      console.error('Error loading complaint details:', error);
      showError('complaintDetails', 'Failed to load complaint details. Please try again later.');
    }
    
    /**
     * Add appropriate sidebar based on user role
     * @param {string} role - User role (admin or user)
     */
    function addSidebar(role) {
      const sidebarContainer = document.getElementById('sidebarContainer');
      
      if (role === 'admin') {
        sidebarContainer.innerHTML = `
          <div class="sidebar">
            <div class="sidebar-header">
              <a href="admin-dashboard.html" class="sidebar-brand">
                <i class="fas fa-city"></i>
                <span>CMS Admin</span>
              </a>
            </div>
            
            <ul class="sidebar-menu">
              <li>
                <a href="admin-dashboard.html">
                  <i class="fas fa-tachometer-alt"></i>
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="all-complaints.html">
                  <i class="fas fa-list-alt"></i>
                  <span>All Complaints</span>
                </a>
              </li>
              <li>
                <a href="update-status.html">
                  <i class="fas fa-tasks"></i>
                  <span>Update Status</span>
                </a>
              </li>
              <li>
                <a href="reports.html">
                  <i class="fas fa-chart-bar"></i>
                  <span>Reports</span>
                </a>
              </li>
              <li>
                <a href="manage-complaint-types.html">
                  <i class="fas fa-tags"></i>
                  <span>Complaint Types</span>
                </a>
              </li>
              <li>
                <a href="manage-departments.html">
                  <i class="fas fa-building"></i>
                  <span>Departments</span>
                </a>
              </li>
              <li>
                <a href="view-feedback.html">
                  <i class="fas fa-comment-alt"></i>
                  <span>View Feedback</span>
                </a>
              </li>
              
              <div class="sidebar-divider"></div>
              
              <li>
                <a href="#" onclick="logout()">
                  <i class="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </a>
              </li>
            </ul>
            
            <div class="sidebar-footer">
              <span>Admin Control Panel</span>
            </div>
          </div>
        `;
      } else {
        sidebarContainer.innerHTML = `
          <div class="sidebar">
            <div class="sidebar-header">
              <a href="user-dashboard.html" class="sidebar-brand">
                <i class="fas fa-city"></i>
                <span>CMS Portal</span>
              </a>
            </div>
            
            <ul class="sidebar-menu">
              <li>
                <a href="user-dashboard.html">
                  <i class="fas fa-tachometer-alt"></i>
                  <span>Dashboard</span>
                </a>
              </li>
              <li>
                <a href="file-complaint.html">
                  <i class="fas fa-file-alt"></i>
                  <span>File Complaint</span>
                </a>
              </li>
              <li>
                <a href="my-complaints.html">
                  <i class="fas fa-list-alt"></i>
                  <span>My Complaints</span>
                </a>
              </li>
              <li>
                <a href="feedback.html">
                  <i class="fas fa-comment-alt"></i>
                  <span>Submit Feedback</span>
                </a>
              </li>
              <li>
                <a href="user-profile.html">
                  <i class="fas fa-user-circle"></i>
                  <span>My Profile</span>
                </a>
              </li>
              
              <div class="sidebar-divider"></div>
              
              <li>
                <a href="#" onclick="logout()">
                  <i class="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </a>
              </li>
            </ul>
            
            <div class="sidebar-footer">
              <span>Civic Complaint Management System</span>
            </div>
          </div>
        `;
      }
    }
    
    /**
     * Display complaint details
     * @param {Object} complaint - Complaint object
     */
    function displayComplaintDetails(complaint) {
      // Set complaint ID badge
      document.getElementById('complaintIdBadge').textContent = `ID: ${complaint.id}`;
      
      // Parse location from description if available
      let location = 'Not specified';
      let description = complaint.description;
      
      if (description && description.includes(':')) {
        const parts = description.split(':');
        location = parts[0].trim();
        description = parts.slice(1).join(':').trim();
      }
      
      // Create complaint details HTML
      const detailsHtml = `
        <div class="row mb-4">
          <div class="col-md-6">
            <h6 class="text-muted mb-1">Complaint Type</h6>
            <p class="mb-0 fw-bold">${complaint.type}</p>
          </div>
          <div class="col-md-6">
            <h6 class="text-muted mb-1">Department</h6>
            <p class="mb-0 fw-bold">${complaint.department}</p>
          </div>
        </div>
        
        <div class="row mb-4">
          <div class="col-md-6">
            <h6 class="text-muted mb-1">Status</h6>
            <p class="mb-0">${getStatusBadge(complaint.status)}</p>
          </div>
          <div class="col-md-6">
            <h6 class="text-muted mb-1">Date Filed</h6>
            <p class="mb-0 fw-bold">${formatDate(complaint.dateFiled)}</p>
          </div>
        </div>
        
        <div class="row mb-4">
          <div class="col-md-6">
            <h6 class="text-muted mb-1">Severity</h6>
            <p class="mb-0 fw-bold">${complaint.severity}</p>
          </div>
          <div class="col-md-6">
            <h6 class="text-muted mb-1">Location</h6>
            <p class="mb-0 fw-bold">${location}</p>
          </div>
        </div>
        
        <div class="row">
          <div class="col-12">
            <h6 class="text-muted mb-2">Description</h6>
            <div class="p-3 bg-light rounded">
              ${description || 'No description provided.'}
            </div>
          </div>
        </div>
      `;
      
      document.getElementById('complaintDetails').innerHTML = detailsHtml;
    }
    
    /**
     * Display status timeline
     * @param {Object} complaint - Complaint object
     */
    function displayStatusTimeline(complaint) {
      // Create a simple timeline based on status
      let timelineHtml = '<ul class="list-group list-group-flush">';
      
      // Filed status (always present)
      timelineHtml += `
        <li class="list-group-item">
          <div class="d-flex">
            <div class="me-3">
              <div class="timeline-icon bg-primary">
                <i class="fas fa-file-alt"></i>
              </div>
            </div>
            <div>
              <h6 class="mb-1">Complaint Filed</h6>
              <small class="text-muted">${formatDate(complaint.dateFiled)}</small>
            </div>
          </div>
        </li>
      `;
      
      // In Progress status (if applicable)
      if (complaint.status === 'In Progress' || complaint.status === 'Resolved' || complaint.status === 'Rejected') {
        timelineHtml += `
          <li class="list-group-item">
            <div class="d-flex">
              <div class="me-3">
                <div class="timeline-icon bg-info">
                  <i class="fas fa-spinner"></i>
                </div>
              </div>
              <div>
                <h6 class="mb-1">In Progress</h6>
                <small class="text-muted">Complaint is being processed</small>
              </div>
            </div>
          </li>
        `;
      }
      
      // Resolved status (if applicable)
      if (complaint.status === 'Resolved') {
        timelineHtml += `
          <li class="list-group-item">
            <div class="d-flex">
              <div class="me-3">
                <div class="timeline-icon bg-success">
                  <i class="fas fa-check-circle"></i>
                </div>
              </div>
              <div>
                <h6 class="mb-1">Resolved</h6>
                <small class="text-muted">Complaint has been resolved</small>
              </div>
            </div>
          </li>
        `;
      }
      
      // Rejected status (if applicable)
      if (complaint.status === 'Rejected') {
        timelineHtml += `
          <li class="list-group-item">
            <div class="d-flex">
              <div class="me-3">
                <div class="timeline-icon bg-danger">
                  <i class="fas fa-times-circle"></i>
                </div>
              </div>
              <div>
                <h6 class="mb-1">Rejected</h6>
                <small class="text-muted">Complaint has been rejected</small>
              </div>
            </div>
          </li>
        `;
      }
      
      timelineHtml += '</ul>';
      
      // Add CSS for timeline
      const style = document.createElement('style');
      style.textContent = `
        .timeline-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }
      `;
      document.head.appendChild(style);
      
      document.getElementById('statusTimeline').innerHTML = timelineHtml;
    }
    
    /**
     * Display department information
     * @param {Object} complaint - Complaint object
     */
    function displayDepartmentInfo(complaint) {
      // Create department info HTML
      const departmentHtml = `
        <div class="d-flex align-items-center mb-3">
          <div class="me-3">
            <div class="bg-light rounded-circle p-3">
              <i class="fas fa-building fa-2x text-primary"></i>
            </div>
          </div>
          <div>
            <h5 class="mb-0">${complaint.department}</h5>
            <p class="text-muted mb-0">Responsible Department</p>
          </div>
        </div>
        
        <hr>
        
        <p><strong>Contact Information:</strong></p>
        <p><i class="fas fa-envelope me-2 text-primary"></i> ${complaint.department.toLowerCase().replace(/\s+/g, '')}@civic.gov</p>
        <p><i class="fas fa-phone me-2 text-primary"></i> +1 (555) 123-4567</p>
        
        <div class="alert alert-info mt-3">
          <i class="fas fa-info-circle me-2"></i>
          For urgent matters, please contact the department directly.
        </div>
      `;
      
      document.getElementById('departmentInfo').innerHTML = departmentHtml;
    }
    
    /**
     * Set up status update form for admins
     * @param {Object} complaint - Complaint object
     */
    function setupStatusUpdateForm(complaint) {
      const statusSelect = document.getElementById('statusSelect');
      const updateStatusForm = document.getElementById('updateStatusForm');
      
      // Set current status
      statusSelect.value = complaint.status;
      
      // Handle form submission
      updateStatusForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const newStatus = statusSelect.value;
        const statusUpdateMsg = document.getElementById('statusUpdateMsg');
        
        // Don't update if status hasn't changed
        if (newStatus === complaint.status) {
          statusUpdateMsg.innerHTML = `
            <div class="alert alert-info">
              <i class="fas fa-info-circle me-2"></i>
              Status is already set to ${newStatus}.
            </div>
          `;
          return;
        }
        
        try {
          // Show loading state
          const submitBtn = updateStatusForm.querySelector('button[type="submit"]');
          const originalBtnText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...';
          
          // Update complaint status
          await ApiService.updateComplaintStatus(complaint.id, newStatus);
          
          // Show success message
          statusUpdateMsg.innerHTML = `
            <div class="alert alert-success">
              <i class="fas fa-check-circle me-2"></i>
              Status updated successfully to ${newStatus}.
            </div>
          `;
          
          // Update complaint object
          complaint.status = newStatus;
          
          // Update status in complaint details
          const statusElement = document.querySelector('#complaintDetails .row:nth-child(2) .col-md-6:first-child p');
          if (statusElement) {
            statusElement.innerHTML = getStatusBadge(newStatus);
          }
          
          // Update status timeline
          displayStatusTimeline(complaint);
          
          // Reset button
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          
          // Clear message after 3 seconds
          setTimeout(() => {
            statusUpdateMsg.innerHTML = '';
          }, 3000);
        } catch (error) {
          console.error('Error updating status:', error);
          
          // Show error message
          statusUpdateMsg.innerHTML = `
            <div class="alert alert-danger">
              <i class="fas fa-exclamation-circle me-2"></i>
              Failed to update status: ${error.message || 'Unknown error'}
            </div>
          `;
          
          // Reset button
          const submitBtn = updateStatusForm.querySelector('button[type="submit"]');
          submitBtn.disabled = false;
          submitBtn.innerHTML = 'Update Status';
        }
      });
    }
  });
  