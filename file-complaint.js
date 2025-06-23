/**
 * File Complaint functionality
 * Allows users to submit new complaints
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
    
    try {
      // Load complaint types
      const complaintTypes = await ApiService.getAllComplaintTypes();
      const complaintTypeSelect = document.getElementById('complaintType');
      
      if (complaintTypes.length === 0) {
        complaintTypeSelect.innerHTML = '<option value="">No complaint types available</option>';
      } else {
        complaintTypeSelect.innerHTML = '<option value="">Select Complaint Type</option>';
        
        // Add predefined complaint types if none exist in the database
        if (complaintTypes.length < 5) {
          const defaultTypes = [
            { id: 1, complaintType: "Water Supply Issue", severity: "Medium" },
            { id: 2, complaintType: "Garbage Collection", severity: "Medium" },
            { id: 3, complaintType: "Street Light Failure", severity: "Medium" },
            { id: 4, complaintType: "Road Damage", severity: "High" },
            { id: 5, complaintType: "Sewage Overflow", severity: "High" },
            { id: 6, complaintType: "Illegal Construction", severity: "Medium" },
            { id: 7, complaintType: "Noise Pollution", severity: "Low" },
            { id: 8, complaintType: "Public Property Damage", severity: "Medium" },
            { id: 9, complaintType: "Tree Fallen", severity: "High" },
            { id: 10, complaintType: "Stray Animals", severity: "Medium" }
          ];
          
          defaultTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.complaintType;
            complaintTypeSelect.appendChild(option);
          });
        } else {
          complaintTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.id;
            option.textContent = type.complaintType;
            complaintTypeSelect.appendChild(option);
          });
        }
      }
      
      // Load departments
      const departments = await ApiService.getAllDepartments();
      const departmentSelect = document.getElementById('department');
      
      if (departments.length === 0) {
        departmentSelect.innerHTML = '<option value="">No departments available</option>';
      } else {
        departmentSelect.innerHTML = '<option value="">Select Department</option>';
        
        // Add predefined departments if none exist in the database
        if (departments.length < 5) {
          const defaultDepartments = [
            { id: 1, name: "Water Department", contact: "water@civic.gov" },
            { id: 2, name: "Sanitation Department", contact: "sanitation@civic.gov" },
            { id: 3, name: "Electricity Department", contact: "electricity@civic.gov" },
            { id: 4, name: "Roads & Infrastructure", contact: "roads@civic.gov" },
            { id: 5, name: "Public Health", contact: "health@civic.gov" },
            { id: 6, name: "Municipal Administration", contact: "admin@civic.gov" },
            { id: 7, name: "Parks & Recreation", contact: "parks@civic.gov" },
            { id: 8, name: "Traffic Management", contact: "traffic@civic.gov" }
          ];
          
          defaultDepartments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            departmentSelect.appendChild(option);
          });
        } else {
          departments.forEach(dept => {
            const option = document.createElement('option');
            option.value = dept.id;
            option.textContent = dept.name;
            departmentSelect.appendChild(option);
          });
        }
      }
      
      // Handle form submission
      const complaintForm = document.getElementById('complaintForm');
      complaintForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Reset error messages
        document.getElementById('typeError').textContent = '';
        document.getElementById('departmentError').textContent = '';
        document.getElementById('severityError').textContent = '';
        document.getElementById('locationError').textContent = '';
        document.getElementById('descriptionError').textContent = '';
        
        const complaintMsg = document.getElementById('complaintMsg');
        const complaintSuccess = document.getElementById('complaintSuccess');
        
        complaintMsg.classList.add('d-none');
        complaintSuccess.classList.add('d-none');
        
        // Get form values
        const complaintTypeId = document.getElementById('complaintType').value;
        const departmentId = document.getElementById('department').value;
        const severity = document.getElementById('severity').value;
        const location = document.getElementById('location').value.trim();
        const description = document.getElementById('description').value.trim();
        
        // Validate form
        let valid = true;
        
        if (!complaintTypeId) {
          document.getElementById('typeError').textContent = 'Please select a complaint type';
          valid = false;
        }
        
        if (!departmentId) {
          document.getElementById('departmentError').textContent = 'Please select a department';
          valid = false;
        }
        
        if (!severity) {
          document.getElementById('severityError').textContent = 'Please select severity';
          valid = false;
        }
        
        if (!location) {
          document.getElementById('locationError').textContent = 'Please enter the location';
          valid = false;
        }
        
        if (!description || description.length < 10) {
          document.getElementById('descriptionError').textContent = 'Description must be at least 10 characters';
          valid = false;
        }
        
        if (!valid) return;
        
        try {
          // Show loading state
          const submitBtn = complaintForm.querySelector('button[type="submit"]');
          const originalBtnText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
          
          // Submit complaint
          await ApiService.createComplaint({
            userId: user.id,
            complaintTypeId: parseInt(complaintTypeId),
            departmentId: parseInt(departmentId),
            severity,
            description: `${location}: ${description}`,
            status: 'Pending'
          });
          
          // Show success message
          complaintSuccess.textContent = 'Complaint submitted successfully!';
          complaintSuccess.classList.remove('d-none');
          
          // Reset form
          complaintForm.reset();
          
          // Reset button
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          
          // Redirect to my complaints page after 2 seconds
          setTimeout(() => {
            window.location.href = 'my-complaints.html';
          }, 2000);
        } catch (error) {
          complaintMsg.textContent = error.message || 'Failed to submit complaint. Please try again.';
          complaintMsg.classList.remove('d-none');
          
          // Reset button
          const submitBtn = complaintForm.querySelector('button[type="submit"]');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Submit Complaint';
        }
      });
    } catch (error) {
      console.error('Error loading form data:', error);
      const complaintMsg = document.getElementById('complaintMsg');
      complaintMsg.textContent = 'Failed to load form data. Please try again later.';
      complaintMsg.classList.remove('d-none');
    }
  });
  