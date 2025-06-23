/**
 * Manage Departments functionality
 * Allows admins to add, edit, and delete departments
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in and has admin role
    const user = checkAdminRole();
    if (!user) return;
    
    // Set user name in header
    document.getElementById('userName').textContent = user.username;
    
    // Initialize variables
    let departments = [];
    
    try {
      // Show loading indicator
      showLoading('departmentsTable');
      
      // Get all departments
      departments = await ApiService.getAllDepartments();
      
      // Display departments
      displayDepartments(departments);
      
      // Initialize add department form
      initializeAddDepartmentForm();
      
      // Initialize bulk add button
      document.getElementById('bulkAddDepartments').addEventListener('click', bulkAddDefaultDepartments);
    } catch (error) {
      console.error('Error loading departments:', error);
      showError('departmentsTable', 'Failed to load departments. Please try again later.');
    }
    
    /**
     * Display departments in the table
     * @param {Array} depts - Departments to display
     */
    function displayDepartments(depts) {
      const tableBody = document.getElementById('departmentsTable');
      const noDepartments = document.getElementById('noDepartments');
      
      if (depts.length === 0) {
        tableBody.innerHTML = '';
        noDepartments.classList.remove('d-none');
        return;
      }
      
      noDepartments.classList.add('d-none');
      
      // Sort departments alphabetically
      const sortedDepts = [...depts].sort((a, b) => a.name.localeCompare(b.name));
      
      tableBody.innerHTML = sortedDepts.map(dept => `
        <tr>
          <td>${dept.id}</td>
          <td>${dept.name}</td>
          <td>${dept.contact}</td>
          <td>
            <div class="actions">
              <button class="btn btn-sm btn-primary" onclick="editDepartment(${dept.id}, '${dept.name}', '${dept.contact}')" data-bs-toggle="tooltip" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteDepartment(${dept.id}, '${dept.name}')" data-bs-toggle="tooltip" title="Delete">
                <i class="fas fa-trash-alt"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
      
      // Initialize tooltips
      initTooltips();
    }
    
    /**
     * Initialize add department form
     */
    function initializeAddDepartmentForm() {
      const addDepartmentForm = document.getElementById('addDepartmentForm');
      
      addDepartmentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Reset error messages
        document.getElementById('departmentNameError').textContent = '';
        document.getElementById('departmentContactError').textContent = '';
        
        const departmentFormMsg = document.getElementById('departmentFormMsg');
        const departmentFormSuccess = document.getElementById('departmentFormSuccess');
        
        departmentFormMsg.classList.add('d-none');
        departmentFormSuccess.classList.add('d-none');
        
        // Get form values
        const name = document.getElementById('departmentName').value.trim();
        const contact = document.getElementById('departmentContact').value.trim();
        
        // Validate form
        let valid = true;
        
        if (!name) {
          document.getElementById('departmentNameError').textContent = 'Please enter a department name';
          valid = false;
        }
        
        if (!contact || !/\S+@\S+\.\S+/.test(contact)) {
          document.getElementById('departmentContactError').textContent = 'Please enter a valid email address';
          valid = false;
        }
        
        if (!valid) return;
        
        try {
          // Show loading state
          const submitBtn = addDepartmentForm.querySelector('button[type="submit"]');
          const originalBtnText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...';
          
          // Add department
          await ApiService.createDepartment({
            name,
            contact
          });
          
          // Show success message
          departmentFormSuccess.textContent = 'Department added successfully!';
          departmentFormSuccess.classList.remove('d-none');
          
          // Reset form
          addDepartmentForm.reset();
          
          // Reset button
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          
          // Refresh departments
          departments = await ApiService.getAllDepartments();
          displayDepartments(departments);
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            departmentFormSuccess.classList.add('d-none');
          }, 3000);
        } catch (error) {
          console.error('Error adding department:', error);
          
          // Show error message
          departmentFormMsg.textContent = error.message || 'Failed to add department. Please try again.';
          departmentFormMsg.classList.remove('d-none');
          
          // Reset button
          const submitBtn = addDepartmentForm.querySelector('button[type="submit"]');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-plus-circle me-2"></i>Add Department';
        }
      });
    }
    
    /**
     * Bulk add default departments
     */
    async function bulkAddDefaultDepartments() {
      try {
        // Show confirmation dialog
        if (!confirm('This will add a set of default departments. Continue?')) {
          return;
        }
        
        // Default departments
        const defaultDepartments = [
          { name: "Water Department", contact: "water@civic.gov" },
          { name: "Sanitation Department", contact: "sanitation@civic.gov" },
          { name: "Electricity Department", contact: "electricity@civic.gov" },
          { name: "Roads & Infrastructure", contact: "roads@civic.gov" },
          { name: "Public Health", contact: "health@civic.gov" },
          { name: "Municipal Administration", contact: "admin@civic.gov" },
          { name: "Parks & Recreation", contact: "parks@civic.gov" },
          { name: "Traffic Management", contact: "traffic@civic.gov" }
        ];
        
        // Show loading message
        const departmentFormSuccess = document.getElementById('departmentFormSuccess');
        departmentFormSuccess.textContent = 'Adding default departments...';
        departmentFormSuccess.classList.remove('d-none');
        
        // Add each department
        for (const dept of defaultDepartments) {
          // Check if department already exists
          const exists = departments.some(d => 
            d.name.toLowerCase() === dept.name.toLowerCase()
          );
          
          if (!exists) {
            await ApiService.createDepartment(dept);
          }
        }
        
        // Refresh departments
        departments = await ApiService.getAllDepartments();
        displayDepartments(departments);
        
        // Show success message
        departmentFormSuccess.textContent = 'Default departments added successfully!';
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          departmentFormSuccess.classList.add('d-none');
        }, 3000);
      } catch (error) {
        console.error('Error adding default departments:', error);
        
        // Show error message
        const departmentFormMsg = document.getElementById('departmentFormMsg');
        departmentFormMsg.textContent = error.message || 'Failed to add default departments. Please try again.';
        departmentFormMsg.classList.remove('d-none');
      }
    }
  });
  
  /**
   * Edit department (called from HTML)
   * @param {number} id - Department ID
   * @param {string} name - Department name
   * @param {string} contact - Department contact
   */
  function editDepartment(id, name, contact) {
    // Create modal HTML
    const modalId = 'editDepartmentModal';
    let modalHTML = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="${modalId}Label">Edit Department</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="editDepartmentForm">
                <div class="mb-3">
                  <label for="editDepartmentName" class="form-label">Department Name</label>
                  <input type="text" class="form-control" id="editDepartmentName" value="${name}" required>
                  <div id="editDepartmentNameError" class="form-text text-danger"></div>
                </div>
                
                <div class="mb-3">
                  <label for="editDepartmentContact" class="form-label">Contact Email</label>
                  <input type="email" class="form-control" id="editDepartmentContact" value="${contact}" required>
                  <div id="editDepartmentContactError" class="form-text text-danger"></div>
                </div>
                
                <div id="editDepartmentMsg"></div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="updateDepartmentBtn">Update</button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Add modal to body
    const modalContainer = document.createElement('div');
    modalContainer.innerHTML = modalHTML;
    document.body.appendChild(modalContainer);
    
    // Initialize modal
    const modal = new bootstrap.Modal(document.getElementById(modalId));
    modal.show();
    
    // Handle update button click
    document.getElementById('updateDepartmentBtn').addEventListener('click', async function() {
      // Reset error messages
      document.getElementById('editDepartmentNameError').textContent = '';
      document.getElementById('editDepartmentContactError').textContent = '';
      
      const editDepartmentMsg = document.getElementById('editDepartmentMsg');
      editDepartmentMsg.innerHTML = '';
      
      // Get form values
      const newName = document.getElementById('editDepartmentName').value.trim();
      const newContact = document.getElementById('editDepartmentContact').value.trim();
      
      // Validate form
      let valid = true;
      
      if (!newName) {
        document.getElementById('editDepartmentNameError').textContent = 'Please enter a department name';
        valid = false;
      }
      
      if (!newContact || !/\S+@\S+\.\S+/.test(newContact)) {
        document.getElementById('editDepartmentContactError').textContent = 'Please enter a valid email address';
        valid = false;
      }
      
      if (!valid) return;
      
      try {
        // Show loading state
        const updateBtn = this;
        const originalBtnText = updateBtn.innerHTML;
        updateBtn.disabled = true;
        updateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...';
        
        // Update department
        await ApiService.updateDepartment(id, {
          name: newName,
          contact: newContact
        });
        
        // Show success message
        editDepartmentMsg.innerHTML = `
          <div class="alert alert-success mt-3">
            <i class="fas fa-check-circle me-2"></i>
            Department updated successfully!
          </div>
        `;
        
        // Reset button
        updateBtn.disabled = false;
        updateBtn.innerHTML = originalBtnText;
        
        // Close modal and refresh departments after 1 second
        setTimeout(() => {
          modal.hide();
          document.body.removeChild(modalContainer);
          location.reload();
        }, 1000);
      } catch (error) {
        console.error('Error updating department:', error);
        
        // Show error message
        editDepartmentMsg.innerHTML = `
          <div class="alert alert-danger mt-3">
            <i class="fas fa-exclamation-circle me-2"></i>
            ${error.message || 'Failed to update department. Please try again.'}
          </div>
        `;
        
        // Reset button
        const updateBtn = document.getElementById('updateDepartmentBtn');
        updateBtn.disabled = false;
        updateBtn.innerHTML = 'Update';
      }
    });
    
    // Remove modal from DOM when hidden
    document.getElementById(modalId).addEventListener('hidden.bs.modal', function() {
      document.body.removeChild(modalContainer);
    });
  }
  
  /**
   * Delete department (called from HTML)
   * @param {number} id - Department ID
   * @param {string} name - Department name
   */
  async function deleteDepartment(id, name) {
    try {
      // Show confirmation dialog
      if (!confirm(`Are you sure you want to delete the department "${name}"?`)) {
        return;
      }
      
      // Delete department
      await ApiService.deleteDepartment(id);
      
      // Show success message
      alert('Department deleted successfully!');
      
      // Refresh page
      location.reload();
    } catch (error) {
      console.error('Error deleting department:', error);
      alert(error.message || 'Failed to delete department. Please try again.');
    }
  }
  