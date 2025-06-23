/**
 * Feedback functionality
 * Allows users to submit feedback
 */
document.addEventListener('DOMContentLoaded', async function() {
    // Check if user is logged in and has user role
    const user = checkAuth();
    if (!user) return;
    
    // Set user name in header
    document.getElementById('userName').textContent = user.username;
    
    // Initialize feedback form
    initializeFeedbackForm(user);
    
    /**
     * Initialize feedback form
     * @param {Object} user - Current user
     */
    function initializeFeedbackForm(user) {
      const feedbackForm = document.getElementById('feedbackForm');
      
      feedbackForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Reset error messages
        document.getElementById('subjectError').textContent = '';
        document.getElementById('messageError').textContent = '';
        
        const feedbackMsg = document.getElementById('feedbackMsg');
        const feedbackSuccess = document.getElementById('feedbackSuccess');
        
        feedbackMsg.classList.add('d-none');
        feedbackSuccess.classList.add('d-none');
        
        // Get form values
        const subject = document.getElementById('feedbackSubject').value.trim();
        const message = document.getElementById('feedbackMessage').value.trim();
        
        // Validate form
        let valid = true;
        
        if (!subject) {
          document.getElementById('subjectError').textContent = 'Please enter a subject';
          valid = false;
        }
        
        if (!message || message.length < 10) {
          document.getElementById('messageError').textContent = 'Please enter a message with at least 10 characters';
          valid = false;
        }
        
        if (!valid) return;
        
        try {
          // Show loading state
          const submitBtn = feedbackForm.querySelector('button[type="submit"]');
          const originalBtnText = submitBtn.innerHTML;
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Submitting...';
          
          // Create feedback object
          const feedbackData = {
            userId: user.id,
            name: user.username,
            email: user.email,
            subject,
            message
          };
          
          // Submit feedback
          await ApiService.createFeedback(feedbackData);
          
          // Show success message
          feedbackSuccess.textContent = 'Thank you for your feedback! Your input helps us improve our services.';
          feedbackSuccess.classList.remove('d-none');
          
          // Reset form
          feedbackForm.reset();
          
          // Reset button
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
          
          // Scroll to success message
          feedbackSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } catch (error) {
          console.error('Error submitting feedback:', error);
          
          // Show error message
          feedbackMsg.textContent = error.message || 'Failed to submit feedback. Please try again.';
          feedbackMsg.classList.remove('d-none');
          
          // Reset button
          const submitBtn = feedbackForm.querySelector('button[type="submit"]');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<i class="fas fa-paper-plane me-2"></i>Submit Feedback';
          
          // Scroll to error message
          feedbackMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      });
    }
  });
  