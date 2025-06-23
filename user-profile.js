document.addEventListener('DOMContentLoaded', async function() {
  // Check if user is logged in
  const user = checkAuth();
  if (!user) return;

  // Set user name in header
  document.getElementById('userName').textContent = user.username;

  // Initialize variables
  let userComplaints = [];

  try {
    // Load user profile
    displayUserProfile(user);

    // Get user's complaints
    userComplaints = await ApiService.getComplaintsByUserId(user.id);

    // Update activity summary
    updateActivitySummary(userComplaints);

    // Initialize edit profile button
    document.getElementById('editProfileBtn').addEventListener('click', function() {
      showProfileForm(user);
    });

    // Initialize cancel edit button
    document.getElementById('cancelEditBtn').addEventListener('click', function() {
      hideProfileForm();
    });

    // Initialize profile form
    initializeProfileForm(user);
  } catch (error) {
    console.error('Error loading profile data:', error);
    showError('profileForm', 'Failed to load profile data. Please try again later.');
  }

  function displayUserProfile(user) {
    document.getElementById('profileName').textContent = user.username;
    document.getElementById('profileRole').textContent = user.role === 'admin' ? 'Administrator' : 'Citizen';
    document.getElementById('profileId').textContent = user.id;
    document.getElementById('profileEmail').textContent = user.email;
    document.getElementById('profilePhone').textContent = user.phone || 'Not provided';
  }

  function showProfileForm(user) {
    const profileForm = document.getElementById('profileForm');
    profileForm.classList.remove('d-none');
    document.getElementById('profileUsername').value = user.username;
    document.getElementById('profileEmailInput').value = user.email;
    document.getElementById('profilePhoneInput').value = user.phone || '';
    profileForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function hideProfileForm() {
    document.getElementById('profileForm').classList.add('d-none');
  }

  function initializeProfileForm(user) {
    const profileForm = document.getElementById('profileForm');
    profileForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      document.getElementById('usernameError').textContent = '';
      document.getElementById('emailError').textContent = '';
      document.getElementById('phoneError').textContent = '';
      const profileMsg = document.getElementById('profileMsg');
      const profileSuccess = document.getElementById('profileSuccess');
      profileMsg.classList.add('d-none');
      profileSuccess.classList.add('d-none');
      const username = document.getElementById('profileUsername').value.trim();
      const email = document.getElementById('profileEmailInput').value.trim();
      const phone = document.getElementById('profilePhoneInput').value.trim();
      let valid = true;
      if (!username) {
        document.getElementById('usernameError').textContent = 'Please enter your full name';
        valid = false;
      }
      if (!email || !/\S+@\S+\.\S+/.test(email)) {
        document.getElementById('emailError').textContent = 'Please enter a valid email address';
        valid = false;
      }
      if (phone && !/^\d{10}$/.test(phone)) {
        document.getElementById('phoneError').textContent = 'Please enter a valid 10-digit phone number';
        valid = false;
      }
      if (!valid) return;
      try {
        const submitBtn = profileForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Saving...';
        const updatedUser = await ApiService.updateUser(user.id, {
          username,
          email,
          phone,
          role: user.role
        });
        user.username = updatedUser.username;
        user.email = updatedUser.email;
        user.phone = updatedUser.phone;
        sessionStorage.setItem('loggedInUser', JSON.stringify(user));
        displayUserProfile(user);
        profileSuccess.textContent = 'Profile updated successfully!';
        profileSuccess.classList.remove('d-none');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
        setTimeout(() => {
          hideProfileForm();
          profileSuccess.classList.add('d-none');
        }, 2000);
      } catch (error) {
        console.error('Error updating profile:', error);
        profileMsg.textContent = error.message || 'Failed to update profile. Please try again.';
        profileMsg.classList.remove('d-none');
        const submitBtn = profileForm.querySelector('button[type="submit"]');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save me-2"></i>Save Changes';
      }
    });
  }

  function updateActivitySummary(complaints) {
    const totalCount = complaints.length;
    const pendingCount = complaints.filter(c => c.status === 'Pending').length;
    const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
    const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
    document.getElementById('totalComplaints').textContent = totalCount;
    document.getElementById('pendingComplaints').textContent = pendingCount + inProgressCount;
    document.getElementById('resolvedComplaints').textContent = resolvedCount;
    const recentActivity = document.getElementById('recentActivity');
    if (complaints.length === 0) {
      recentActivity.innerHTML = `
        <div class="text-center py-3">
          <p class="text-muted mb-0">No activity yet. File your first complaint to get started.</p>
        </div>
      `;
      return;
    }
    const recentComplaints = [...complaints]
      .sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled))
      .slice(0, 3);
    recentActivity.innerHTML = `
      <div class="list-group">
        ${recentComplaints.map(complaint => `
          <a href="complaint-details.html?id=${complaint.id}" class="list-group-item list-group-item-action">
            <div class="d-flex w-100 justify-content-between">
              <h6 class="mb-1">${complaint.type}</h6>
              <small>${formatDate(complaint.dateFiled)}</small>
            </div>
            <p class="mb-1 text-truncate">${complaint.description}</p>
            <small>${getStatusBadge(complaint.status)}</small>
          </a>
        `).join('')}
      </div>
      <div class="text-center mt-3">
        <a href="my-complaints.html" class="btn btn-sm btn-outline-primary">View All Complaints</a>
      </div>
    `;
  }
});
