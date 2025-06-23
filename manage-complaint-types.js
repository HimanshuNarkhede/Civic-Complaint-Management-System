/**
 * Manage Complaint Types functionality
 * Allows admins to add, edit, and delete complaint types
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in and has admin role
    const user = checkAdminRole();
    if (!user) return;
    
    // Set user name in header
    document.getElementById('userName').textContent = user.username;
    
    // Initialize variables
    let complaintTypes = [];
    
    try {
      // Show loading indicator
      showLoading('complaintTypesTable');
      
      // Get all complaint types
      complaintTypes = await ApiService.getAllComplaintTypes();
      
      // Display complaint types
      displayComplaintTypes(complaintTypes);
      
      // Initialize add type form
      initializeAddTypeForm();
      
      // Initialize bulk add button
      document.getElementById('bulkAddTypes').addEventListener('click', bulkAddDefaultTypes);
    } catch (error) {
      console.error('Error loading complaint types:', error);
      showError('complaintTypesTable', 'Failed to load complaint types. Please try again later.');
    }
    
    /**
     * Display complaint types in the table
     * @param {Array} types - Complaint types to display
     */
    function displayComplaintTypes(types) {
      const tableBody = document.getElementById('complaintTypesTable');
      const noComplaintTypes = document.getElementById('noComplaintTypes');
      
      if (types.length === 0) {
        tableBody.innerHTML = '';
        noComplaintTypes.classList.remove('d-none');
        return;
      }
      
      noComplaintTypes.classList.add('d-none');
      
      // Sort types alphabetically
      const sortedTypes = [...types].sort((a, b) => a.complaintType.localeCompare(b.complaintType));
      
      tableBody.innerHTML = sortedTypes.map(type => `
        <tr>
          <td>${type.id}</td>
          <td>${type.complaintType}</td>
          <td>
            <span class="badge ${getSeverityBadgeClass(type.severity)}">${type.severity}</span>
          </td>
          <td>
            <div class="actions">
              <button class="btn btn-sm btn-primary" onclick="editComplaintType(${type.id}, '${type.complaintType}', '${type.severity}')" data-bs-toggle="tooltip" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteComplaintType(${type.id}, '${type.complaintType}')" data-bs-toggle="tooltip" title="Delete">
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
     * Initialize add type form
     */
    function initializeAddTypeForm() {
      const addTypeForm = document.getElementById('addTypeForm');
      
      addTypeForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Reset error messages
        document.getElementById('typeNameError').textContent = '';
        document.getElementById('typeSeverityError').textContent = '';
        
        const typeFormMsg = document.getElementById('typeFormMsg');
        const typeFormSuccess = document.getElementById('typeFormSuccess');
        
        typeFormMsg.classList.add('d-none');
        typeFormSuccess.classList.add('d-none');
        
        // Get form values
        const complaintType = document.getElementById('complaintTypeName').value.trim();
        const severity = document.getElementById('complaintTypeSeverity').value;
        
        // Validate form
        let valid = true;
        
        if (!complaintType) {
          document.getElementById('typeNameError').textContent = 'Please enter a complaint type name';
          valid = false;
        }
        
        if (!severity) {
          document.getElementById('typeSeverityError').textContent = 'Please select a severity level';
          valid = false;
        }
        
        if (!valid) return;
        
        try {
          // Show loading state
          const submitBtn = addTypeForm.querySelector('button[type="submit"]');
          const originalBtnText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Adding...';
          
          // Add complaint type
          await ApiService.createComplaintType({
            complaintType,
            severity
          });
          
          // Show success message
          typeFormSuccess.textContent = 'Complaint type added successfully!';
          typeFormSuccess.classList.remove('d-none');
          
          // Reset form
          addTypeForm.reset();
          
          // Reset button
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          
          // Refresh complaint types
          complaintTypes = await ApiService.getAllComplaintTypes();
          displayComplaintTypes(complaintTypes);
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            typeFormSuccess.classList.add('d-none');
          }, 3000);
        } catch (error) {
          console.error('Error adding complaint type:', error);
          
          // Show error message
          typeFormMsg.textContent = error.message || 'Failed to add complaint type. Please try again.';
          typeFormMsg.classList.remove('d-none');
          
          // Reset button
          const submitBtn = addTypeForm.querySelector('button[type="submit"]');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-plus-circle me-2"></i>Add Complaint Type';
        }
      });
    }
    
    /**
     * Get severity badge class
     * @param {string} severity - Severity level
     * @returns {string} - Badge class
     */
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
    
    /**
     * Bulk add default complaint types
     */
    async function bulkAddDefaultTypes() {
      try {
        // Show confirmation dialog
        if (!confirm('This will add a set of default complaint types. Continue?')) {
          return;
        }
        
        // Default complaint types
        const defaultTypes = [
          { complaintType: "Water Supply Issue", severity: "Medium" },
          { complaintType: "Garbage Collection", severity: "Medium" },
          { complaintType: "Street Light Failure", severity: "Medium" },
          { complaintType: "Road Damage", severity: "High" },
          { complaintType: "Sewage Overflow", severity: "High" },
          { complaintType: "Illegal Construction", severity: "Medium" },
          { complaintType: "Noise Pollution", severity: "Low" },
          { complaintType: "Public Property Damage", severity: "Medium" },
          { complaintType: "Tree Fallen", severity: "High" },
          { complaintType: "Stray Animals", severity: "Medium" }
        ];
        
        // Show loading message
        const typeFormSuccess = document.getElementById('typeFormSuccess');
        typeFormSuccess.textContent = 'Adding default complaint types...';
        typeFormSuccess.classList.remove('d-none');
        
        // Add each type
        for (const type of defaultTypes) {
          // Check if type already exists
          const exists = complaintTypes.some(t => 
            t.complaintType.toLowerCase() === type.complaintType.toLowerCase()
          );
          
          if (!exists) {
            await ApiService.createComplaintType(type);
          }
        }
        
        // Refresh complaint types
        complaintTypes = await ApiService.getAllComplaintTypes();
        displayComplaintTypes(complaintTypes);
        
        // Show success message
        typeFormSuccess.textContent = 'Default complaint types added successfully!';
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          typeFormSuccess.classList.add('d-none');
        }, 3000);
      } catch (error) {
        console.error('Error adding default types:', error);
        
        // Show error message
        const typeFormMsg = document.getElementById('typeFormMsg');
        typeFormMsg.textContent = error.message || 'Failed to add default complaint types. Please try again.';
        typeFormMsg.classList.remove('d-none');
      }
    }
  });
  
  /**
   * Edit complaint type (called from HTML)
   * @param {number} id - Complaint type ID
   * @param {string} typeName - Complaint type name
   * @param {string} severity - Severity level
   */
  function editComplaintType(id, typeName, severity) {
    // Create modal HTML
    const modalId = 'editTypeModal';
    let modalHTML = `
      <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="${modalId}Label">Edit Complaint Type</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form id="editTypeForm">
                <div class="mb-3">
                  <label for="editTypeName" class="form-label">Complaint Type Name</label>
                  <input type="text" class="form-control" id="editTypeName" value="${typeName}" required>
                  <div id="editTypeNameError" class="form-text text-danger"></div>
                </div>
                
                <div class="mb-3">
                  <label for="editTypeSeverity" class="form-label">Default Severity</label>
                  <select class="form-select" id="editTypeSeverity" required>
                    <option value="Low" ${severity === 'Low' ? 'selected' : ''}>Low</option>
                    <option value="Medium" ${severity === 'Medium' ? 'selected' : ''}>Medium</option>
                    <option value="High" ${severity === 'High' ? 'selected' : ''}>High</option>
                  </select>
                  <div id="editTypeSeverityError" class="form-text text-danger"></div>
                </div>
                
                <div id="editTypeMsg"></div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="button" class="btn btn-primary" id="updateTypeBtn">Update</button>
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
    document.getElementById('updateTypeBtn').addEventListener('click', async function() {
      // Reset error messages
      document.getElementById('editTypeNameError').textContent = '';
      document.getElementById('editTypeSeverityError').textContent = '';
      
      const editTypeMsg = document.getElementById('editTypeMsg');
      editTypeMsg.innerHTML = '';
      
      // Get form values
      const newTypeName = document.getElementById('editTypeName').value.trim();
      const newSeverity = document.getElementById('editTypeSeverity').value;
      
      // Validate form
      let valid = true;
      
      if (!newTypeName) {
        document.getElementById('editTypeNameError').textContent = 'Please enter a complaint type name';
        valid = false;
      }
      
      if (!newSeverity) {
        document.getElementById('editTypeSeverityError').textContent = 'Please select a severity level';
        valid = false;
      }
      
      if (!valid) return;
      
      try {
        // Show loading state
        const updateBtn = this;
        const originalBtnText = updateBtn.innerHTML;
        updateBtn.disabled = true;
        updateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Updating...';
        
        // Update complaint type
        await ApiService.updateComplaintType(id, {
          complaintType: newTypeName,
          severity: newSeverity
        });
        
        // Show success message
        editTypeMsg.innerHTML = `
          <div class="alert alert-success mt-3">
            <i class="fas fa-check-circle me-2"></i>
            Complaint type updated successfully!
          </div>
        `;
        
        // Reset button
        updateBtn.disabled = false;
        updateBtn.innerHTML = originalBtnText;
        
        // Close modal and refresh complaint types after 1 second
        setTimeout(() => {
          modal.hide();
          document.body.removeChild(modalContainer);
          location.reload();
        }, 1000);
      } catch (error) {
        console.error('Error updating complaint type:', error);
        
        // Show error message
        editTypeMsg.innerHTML = `
          <div class="alert alert-danger mt-3">
            <i class="fas fa-exclamation-circle me-2"></i>
            ${error.message || 'Failed to update complaint type. Please try again.'}
          </div>
        `;
        
        // Reset button
        const updateBtn = document.getElementById('updateTypeBtn');
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
   * Delete complaint type (called from HTML)
   * @param {number} id - Complaint type ID
   * @param {string} typeName - Complaint type name
   */
  async function deleteComplaintType(id, typeName) {
    try {
      // Show confirmation dialog
      if (!confirm(`Are you sure you want to delete the complaint type "${typeName}"?`)) {
        return;
      }
      
      // Delete complaint type
      await ApiService.deleteComplaintType(id);
      
      // Show success message
      alert('Complaint type deleted successfully!');
      
      // Refresh page
      location.reload();
    } catch (error) {
      console.error('Error deleting complaint type:', error);
      alert(error.message || 'Failed to delete complaint type. Please try again.');
    }
  }
  