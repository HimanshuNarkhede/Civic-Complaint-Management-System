/**
 * API Service for Civic Complaint Management System
 * Handles all API calls to the backend
 */
const API_URL = 'http://localhost:8080/api';

class ApiService {
  /**
   * Make a request to the API
   * @param {string} endpoint - API endpoint
   * @param {string} method - HTTP method
   * @param {object} body - Request body
   * @returns {Promise} - Response from API
   */
  static async request(endpoint, method = 'GET', body = null) {
    const url = `${API_URL}${endpoint}`;
    
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // Add authorization header if user is logged in
    const user = JSON.parse(sessionStorage.getItem('loggedInUser'));
    if (user && user.token) {
      headers['Authorization'] = `Bearer ${user.token}`;
    }
    
    const options = {
      method,
      headers
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    try {
      const response = await fetch(url, options);
      
      // Handle 401 Unauthorized
      if (response.status === 401) {
        sessionStorage.removeItem('loggedInUser');
        window.location.href = 'index.html';
        throw new Error('Session expired. Please login again.');
      }
      
      // Handle 403 Forbidden
      if (response.status === 403) {
        throw new Error('You do not have permission to perform this action.');
      }
      
      // Handle 404 Not Found
      if (response.status === 404) {
        throw new Error('Resource not found.');
      }
      
      // Handle 500 Internal Server Error
      if (response.status === 500) {
        throw new Error('Server error. Please try again later.');
      }
      
      // For other non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'An error occurred.');
      }
      
      // Check if response is empty
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return true;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
  
  // Auth API
  static async login(email, password) {
    return this.request('/users/authenticate', 'POST', { email, password });
  }
  
  static async register(userData) {
    return this.request('/users', 'POST', userData);
  }
  
  // User API
  static async getUserByEmail(email) {
    return this.request(`/users/email/${email}`);
  }
  
  static async getAllUsers() {
    return this.request('/users');
  }
  
  static async getUserById(id) {
    return this.request(`/users/${id}`);
  }
  
  static async updateUser(id, userData) {
    return this.request(`/users/${id}`, 'PUT', userData);
  }
  
  static async deleteUser(id) {
    return this.request(`/users/${id}`, 'DELETE');
  }
  
  // Complaint API
  static async createComplaint(complaintData) {
    return this.request('/complaints', 'POST', complaintData);
  }
  
  static async getAllComplaints() {
    return this.request('/complaints');
  }
  
  static async getComplaintsByUserId(userId) {
    return this.request(`/complaints?userId=${userId}`);
  }
  
  static async getComplaintsByDepartmentId(departmentId) {
    return this.request(`/complaints?departmentId=${departmentId}`);
  }
  
  static async getComplaintsByStatus(status) {
    return this.request(`/complaints?status=${status}`);
  }
  
  static async getComplaintById(id) {
    return this.request(`/complaints/${id}`);
  }
  
  static async updateComplaintStatus(id, status) {
    return this.request(`/complaints/${id}/status?status=${status}`, 'PUT');
  }
  
  static async updateComplaint(id, complaintData) {
    return this.request(`/complaints/${id}`, 'PUT', complaintData);
  }
  
  static async deleteComplaint(id) {
    return this.request(`/complaints/${id}`, 'DELETE');
  }
  
  // Department API
  static async getAllDepartments() {
    return this.request('/departments');
  }
  
  static async getDepartmentById(id) {
    return this.request(`/departments/${id}`);
  }
  
  static async createDepartment(departmentData) {
    return this.request('/departments', 'POST', departmentData);
  }
  
  static async updateDepartment(id, departmentData) {
    return this.request(`/departments/${id}`, 'PUT', departmentData);
  }
  
  static async deleteDepartment(id) {
    return this.request(`/departments/${id}`, 'DELETE');
  }
  
  // Complaint Type API
  static async getAllComplaintTypes() {
    return this.request('/complaint-types');
  }
  
  static async getComplaintTypeById(id) {
    return this.request(`/complaint-types/${id}`);
  }
  
  static async createComplaintType(complaintTypeData) {
    return this.request('/complaint-types', 'POST', complaintTypeData);
  }
  
  static async updateComplaintType(id, complaintTypeData) {
    return this.request(`/complaint-types/${id}`, 'PUT', complaintTypeData);
  }
  
  static async deleteComplaintType(id) {
    return this.request(`/complaint-types/${id}`, 'DELETE');
  }
  
  // Feedback API
  static async getAllFeedbacks() {
    return this.request('/feedbacks');
  }
  
  static async getFeedbacksByUserId(userId) {
    return this.request(`/feedbacks?userId=${userId}`);
  }
  
  static async getFeedbackById(id) {
    return this.request(`/feedbacks/${id}`);
  }
  
  static async createFeedback(feedbackData) {
    return this.request('/feedbacks', 'POST', feedbackData);
  }
  
  static async deleteFeedback(id) {
    return this.request(`/feedbacks/${id}`, 'DELETE');
  }
}
