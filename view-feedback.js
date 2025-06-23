/**
 * View Feedback functionality
 * Allows admins to view and manage user feedback
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in and has admin role
    const user = checkAdminRole();
    if (!user) return;
    
    // Set user name in header
    document.getElementById('userName').textContent = user.username;
    
    // Initialize variables
    let allFeedback = [];
    let selectedFeedback = null;
    
    try {
      // Show loading indicator
      showLoading('feedbackTable');
      
      // Get all feedback
      allFeedback = await ApiService.getAllFeedbacks();
      
      // Display feedback
      displayFeedback(allFeedback);
    } catch (error) {
      console.error('Error loading feedback:', error);
      showError('feedbackTable', 'Failed to load feedback. Please try again later.');
    }
    
    /**
     * Display feedback in the table
     * @param {Array} feedback - Feedback to display
     */
    function displayFeedback(feedback) {
      const tableBody = document.getElementById('feedbackTable');
      const noFeedback = document.getElementById('noFeedback');
      
      if (feedback.length === 0) {
        tableBody.innerHTML = '';
        noFeedback.classList.remove('d-none');
        return;
      }
      
      noFeedback.classList.add('d-none');
      
      // Sort feedback by date (newest first)
      const sortedFeedback = [...feedback].sort((a, b) => {
        // If dateFiled is not available, use ID as fallback for sorting
        if (!a.dateFiled || !b.dateFiled) {
          return b.id - a.id;
        }
        return new Date(b.dateFiled) - new Date(a.dateFiled);
      });
      
      tableBody.innerHTML = sortedFeedback.map(item => `
        <tr>
          <td>${item.id}</td>
          <td>${item.name || item.email || 'Anonymous'}</td>
          <td>${item.subject}</td>
          <td>${item.dateFiled ? formatDate(item.dateFiled) : 'N/A'}</td>
          <td>
            <div class="actions">
              <button class="btn btn-sm btn-primary" onclick="viewFeedbackDetails(${item.id})" data-bs-toggle="tooltip" title="View Details">
                <i class="fas fa-eye"></i>
              </button>
              <button class="btn btn-sm btn-danger" onclick="deleteFeedback(${item.id})" data-bs-toggle="tooltip" title="Delete">
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
     * View feedback details
     * @param {number} id - Feedback ID
     */
    window.viewFeedbackDetails = async function(id) {
      try {
        // Show loading indicator
        document.getElementById('feedbackDetails').innerHTML = `
          <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading feedback details...</p>
          </div>
        `;
        
        // Get feedback details
        const feedback = allFeedback.find(f => f.id === id);
        
        if (!feedback) {
          throw new Error('Feedback not found');
        }
        
        selectedFeedback = feedback;
        
        // Display feedback details
        document.getElementById('feedbackDetails').innerHTML = `
          <div class="card">
            <div class="card-header bg-light">
              <div class="d-flex justify-content-between align-items-center">
                <h5 class="mb-0">${feedback.subject}</h5>
                <span class="badge bg-primary">${feedback.dateFiled ? formatDate(feedback.dateFiled) : 'N/A'}</span>
              </div>
            </div>
            <div class="card-body">
              <div class="mb-4">
                <h6 class="text-muted mb-2">From:</h6>
                <p class="mb-0"><strong>${feedback.name || feedback.email || 'Anonymous'}</strong></p>
                <p class="text-muted mb-0">${feedback.email || 'No email provided'}</p>
              </div>
              
              <div>
                <h6 class="text-muted mb-2">Message:</h6>
                <div class="p-3 bg-light rounded">
                  ${feedback.message}
                </div>
              </div>
            </div>
            <div class="card-footer">
              <button class="btn btn-danger" onclick="deleteFeedback(${feedback.id})">
                <i class="fas fa-trash-alt me-2"></i>Delete Feedback
              </button>
            </div>
          </div>
        `;
      } catch (error) {
        console.error('Error loading feedback details:', error);
        document.getElementById('feedbackDetails').innerHTML = `
          <div class="alert alert-danger">
            <i class="fas fa-exclamation-circle me-2"></i>
            Failed to load feedback details: ${error.message || 'Unknown error'}
          </div>
        `;
      }
    };
    
    /**
     * Delete feedback
     * @param {number} id - Feedback ID
     */
    window.deleteFeedback = async function(id) {
      try {
        // Show confirmation dialog
        if (!confirm('Are you sure you want to delete this feedback?')) {
          return;
        }
        
        // Delete feedback
        await ApiService.deleteFeedback(id);
        
        // Show success message
        alert('Feedback deleted successfully!');
        
        // Refresh feedback list
        allFeedback = await ApiService.getAllFeedbacks();
        displayFeedback(allFeedback);
        
        // Clear details if the deleted feedback was selected
        if (selectedFeedback && selectedFeedback.id === id) {
          document.getElementById('feedbackDetails').innerHTML = `
            <div class="text-center py-4">
              <p class="text-muted">Select a feedback from the table above to view details.</p>
            </div>
          `;
          selectedFeedback = null;
        }
      } catch (error) {
        console.error('Error deleting feedback:', error);
        alert(error.message || 'Failed to delete feedback. Please try again.');
      }
    };
  });
  