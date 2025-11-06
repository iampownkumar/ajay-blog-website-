// Admin Panel JavaScript
const API_BASE = '/api';

let authToken = localStorage.getItem('adminToken');
let currentPage = 1;
let currentFilter = { category: '', status: '' };

// DOM Elements
const loginContainer = document.getElementById('loginContainer');
const dashboardContainer = document.getElementById('dashboardContainer');
const loginForm = document.getElementById('loginForm');
const logoutBtn = document.getElementById('logoutBtn');
const navLinks = document.querySelectorAll('.nav-link');
const contentSections = document.querySelectorAll('.content-section');
const pageTitle = document.getElementById('pageTitle');

// Check authentication on load
document.addEventListener('DOMContentLoaded', () => {
    if (authToken) {
        showDashboard();
        
        // Restore sidebar state from localStorage
        const sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';
        if (sidebarCollapsed) {
            const sidebar = document.querySelector('.sidebar');
            const content = document.querySelector('.content');
            sidebar.classList.add('collapsed');
            content.classList.add('expanded');
        }
    } else {
        showLogin();
    }
});

// Login Form Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const loginData = {
        username: formData.get('username'),
        password: formData.get('password')
    };
    
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            authToken = result.token;
            localStorage.setItem('adminToken', authToken);
            showNotification('Login successful!', 'success');
            showDashboard();
        } else {
            showNotification(result.message || 'Login failed', 'error');
        }
    } catch (error) {
        showNotification('Network error. Please try again.', 'error');
    }
});

// Logout Handler
logoutBtn.addEventListener('click', () => {
    authToken = null;
    localStorage.removeItem('adminToken');
    showLogin();
    showNotification('Logged out successfully', 'info');
});

// Navigation Handler
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.currentTarget.dataset.section;
        showSection(section);
        
        // Update active nav
        navLinks.forEach(l => l.classList.remove('active'));
        e.currentTarget.classList.add('active');
    });
});

// Show/Hide Functions
function showLogin() {
    loginContainer.style.display = 'flex';
    dashboardContainer.style.display = 'none';
}

function showDashboard() {
    loginContainer.style.display = 'none';
    dashboardContainer.style.display = 'flex';
    loadDashboardData();
}

function showSection(sectionName) {
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
        pageTitle.textContent = sectionName.charAt(0).toUpperCase() + sectionName.slice(1).replace('-', ' ');
    }
    
    // Load section-specific data
    switch(sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'posts':
            loadPosts();
            break;
        case 'categories':
            loadCategories();
            break;
    }
}

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        }
    };
    
    const config = { ...defaultOptions, ...options };
    
    // Handle FormData for file uploads
    if (config.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }
    
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        
        if (response.status === 401 || response.status === 403) {
            showNotification('Session expired. Please login again.', 'error');
            authToken = null;
            localStorage.removeItem('adminToken');
            showLogin();
            return null;
        }
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Request failed');
        }
        
        return data;
    } catch (error) {
        showNotification(error.message, 'error');
        return null;
    }
}

// Dashboard Functions
let dashboardCurrentPage = 1;
let dashboardTotalPages = 1;

async function loadDashboardData() {
    try {
        const [statsResponse, postsResponse] = await Promise.all([
            apiRequest('/blogs?limit=10'),  // Recent posts for dashboard
            apiRequest('/blogs')  // All posts for statistics
        ]);
        
        if (statsResponse && postsResponse) {
            updateDashboardStats(postsResponse);
            updateRecentPosts(statsResponse.blogs);
            updateDashboardPagination(1, Math.ceil(postsResponse.total / 10));
        }
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Load dashboard posts with pagination
async function loadDashboardPosts(page = 1) {
    try {
        console.log(`Loading dashboard posts for page: ${page}`);
        dashboardCurrentPage = page;
        
        // Get paginated posts (API already handles pagination correctly)
        const response = await apiRequest(`/blogs?page=${page}&limit=10`);
        
        console.log('Dashboard posts response:', response);
        
        if (response) {
            updateRecentPosts(response.blogs);
            updateDashboardPagination(response.currentPage, response.totalPages);
        }
    } catch (error) {
        console.error('Error loading dashboard posts:', error);
    }
}

// Update dashboard pagination
function updateDashboardPagination(currentPage, totalPages) {
    // Convert to numbers to ensure proper comparison
    currentPage = parseInt(currentPage);
    totalPages = parseInt(totalPages);
    
    dashboardCurrentPage = currentPage;
    dashboardTotalPages = totalPages;
    
    console.log(`Dashboard pagination: Page ${currentPage} of ${totalPages}`);
    
    const pageInfo = document.getElementById('dashboardPageInfo');
    const prevBtn = document.getElementById('dashboardPrevPage');
    const nextBtn = document.getElementById('dashboardNextPage');
    
    if (pageInfo) pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    if (prevBtn) prevBtn.disabled = currentPage <= 1;
    if (nextBtn) nextBtn.disabled = currentPage >= totalPages;
    
    console.log(`Button states - Previous: ${currentPage <= 1 ? 'disabled' : 'enabled'}, Next: ${currentPage >= totalPages ? 'disabled' : 'enabled'}`);
}

function updateDashboardStats(data) {
    const totalPosts = data.total || 0;
    const publishedPosts = data.blogs.filter(post => post.published).length;
    const draftPosts = totalPosts - publishedPosts;
    
    document.getElementById('totalPosts').textContent = totalPosts;
    document.getElementById('publishedPosts').textContent = publishedPosts;
    document.getElementById('draftPosts').textContent = draftPosts;
    
    // Load categories count
    apiRequest('/categories').then(categories => {
        if (categories) {
            document.getElementById('totalCategories').textContent = categories.length;
        }
    });
}

// Update statistics for the Posts tab
function updatePostsStats(data) {
    const totalPosts = data.total || 0;
    const publishedPosts = data.blogs.filter(post => post.published).length;
    const draftPosts = totalPosts - publishedPosts;
    const categories = [...new Set(data.blogs.map(post => post.category))].length;
    
    // Update posts tab statistics
    const postsStatsContainer = document.getElementById('postsStatsContainer');
    if (postsStatsContainer) {
        postsStatsContainer.innerHTML = `
            <div class="posts-stats">
                <div class="stat-card">
                    <div class="stat-number">${totalPosts}</div>
                    <div class="stat-label">Total Posts</div>
                </div>
                <div class="stat-card published">
                    <div class="stat-number">${publishedPosts}</div>
                    <div class="stat-label">Published</div>
                </div>
                <div class="stat-card draft">
                    <div class="stat-number">${draftPosts}</div>
                    <div class="stat-label">Draft</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">${categories}</div>
                    <div class="stat-label">Categories</div>
                </div>
            </div>
        `;
    }
}

function updateRecentPosts(posts) {
    const container = document.getElementById('recentPostsList');
    
    if (posts.length === 0) {
        container.innerHTML = '<p>No posts found.</p>';
        return;
    }
    
    container.innerHTML = posts.map(post => `
        <div class="post-item">
            <div class="post-item-content">
                ${post.image ? `<div class="post-thumbnail"><img src="${post.image}" alt="${post.title}"></div>` : '<div class="post-thumbnail no-image"><i class="fas fa-image"></i></div>'}
                <div class="post-info">
                    <h4>${post.title}</h4>
                    <p>${post.category} • ${new Date(post.date).toLocaleDateString()}</p>
                    <span class="status-badge ${post.published ? 'status-published' : 'status-draft'}">
                        ${post.published ? '📢 Published' : '📝 Draft'}
                    </span>
                </div>
            </div>
            <div class="post-actions">
                <button class="btn btn-secondary" onclick="editPost('${post._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger" onclick="deletePost('${post._id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Blog Posts Functions
async function loadPosts() {
    try {
        // Load posts for the table
        const queryParams = new URLSearchParams({
            page: currentPage,
            limit: 10  // Set to 10 posts per page
        });
        
        if (currentFilter.category) queryParams.append('category', currentFilter.category);
        if (currentFilter.status !== '') queryParams.append('published', currentFilter.status);
        
        const [postsResponse, statsResponse] = await Promise.all([
            apiRequest(`/blogs?${queryParams}`),
            apiRequest('/blogs')  // Get all posts for statistics
        ]);
        
        if (postsResponse && statsResponse) {
            updatePostsTable(postsResponse.blogs);
            updatePagination(postsResponse.currentPage, postsResponse.totalPages);
            updatePostsStats(statsResponse);  // Add statistics to posts tab
            loadCategoriesForFilter();
        }
    } catch (error) {
        console.error('Error loading posts:', error);
    }
}

function updatePostsTable(posts) {
    const tbody = document.getElementById('postsTableBody');
    
    if (posts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6">No posts found.</td></tr>';
        return;
    }
    
    tbody.innerHTML = posts.map(post => `
        <tr>
            <td>
                <div class="table-post-item">
                    ${post.image ? `<div class="table-thumbnail"><img src="${post.image}" alt="${post.title}"></div>` : '<div class="table-thumbnail no-image"><i class="fas fa-image"></i></div>'}
                    <div class="table-post-info">
                        <strong>${post.title}</strong>
                    </div>
                </div>
            </td>
            <td>${post.category}</td>
            <td>${new Date(post.date).toLocaleDateString()}</td>
            <td>
                <span class="status-badge ${post.published ? 'status-published' : 'status-draft'}">
                    ${post.published ? '📢 Published' : '📝 Draft'}
                </span>
            </td>
            <td>
                <div class="post-actions">
                    <button class="btn btn-secondary" onclick="editPost('${post._id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger" onclick="deletePost('${post._id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function updatePagination(current, total) {
    document.getElementById('pageInfo').textContent = `Page ${current} of ${total}`;
    document.getElementById('prevPage').disabled = current <= 1;
    document.getElementById('nextPage').disabled = current >= total;
}

// Pagination Handlers
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        loadPosts();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    currentPage++;
    loadPosts();
});

// Filter Handlers
document.getElementById('categoryFilter').addEventListener('change', (e) => {
    currentFilter.category = e.target.value;
    currentPage = 1;
    loadPosts();
});

document.getElementById('statusFilter').addEventListener('change', (e) => {
    currentFilter.status = e.target.value;
    currentPage = 1;
    loadPosts();
});

// Blog Form Handler
document.getElementById('blogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    try {
        const response = await apiRequest('/blogs', {
            method: 'POST',
            body: formData
        });
        
        if (response) {
            showNotification('Blog post created successfully!', 'success');
            e.target.reset();
            document.getElementById('imagePreview').innerHTML = '';
            showSection('posts');
            loadPosts();
        }
    } catch (error) {
        console.error('Error creating post:', error);
    }
});

// Edit Blog Form Handler
document.getElementById('editBlogForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const postId = document.getElementById('editPostId').value;
    const formData = new FormData(e.target);
    
    try {
        const response = await apiRequest(`/blogs/${postId}`, {
            method: 'PUT',
            body: formData
        });
        
        if (response) {
            showNotification('Blog post updated successfully!', 'success');
            closeEditModal();
            loadPosts();
        }
    } catch (error) {
        console.error('Error updating post:', error);
    }
});

// Image Preview Handlers
document.getElementById('postImage').addEventListener('change', (e) => {
    previewImage(e.target, 'imagePreview');
});

document.getElementById('editPostImage').addEventListener('change', (e) => {
    previewImage(e.target, 'editImagePreview');
});

function previewImage(input, previewId) {
    const preview = document.getElementById(previewId);
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        };
        
        reader.readAsDataURL(input.files[0]);
    }
}

// Edit Post Functions
async function editPost(postId) {
    try {
        const response = await apiRequest(`/blogs/${postId}`);
        
        if (response) {
            // Populate edit form
            document.getElementById('editPostId').value = response._id;
            document.getElementById('editPostTitle').value = response.title;
            document.getElementById('editPostCategory').value = response.category;
            document.getElementById('editPostExcerpt').value = response.excerpt;
            document.getElementById('editPostContent').value = response.content;
            document.getElementById('editPostTags').value = response.tags.join(', ');
            document.getElementById('editReadTime').value = response.readTime;
            
            // Set the radio button for published status
            const publishedRadio = document.querySelector(`input[name="published"][value="${response.published ? 'true' : 'false'}"]`);
            if (publishedRadio) {
                publishedRadio.checked = true;
            }
            
            // Show current image if exists
            const editPreview = document.getElementById('editImagePreview');
            if (response.image) {
                editPreview.innerHTML = `<img src="${response.image}" alt="Current image">`;
            } else {
                editPreview.innerHTML = '';
            }
            
            // Show modal
            document.getElementById('editModal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading post for edit:', error);
    }
}

function closeEditModal() {
    document.getElementById('editModal').classList.remove('active');
    document.getElementById('editBlogForm').reset();
    document.getElementById('editImagePreview').innerHTML = '';
}

// Delete Post Function
async function deletePost(postId) {
    if (!confirm('Are you sure you want to delete this post?')) {
        return;
    }
    
    try {
        const response = await apiRequest(`/blogs/${postId}`, {
            method: 'DELETE'
        });
        
        if (response) {
            showNotification('Blog post deleted successfully!', 'success');
            loadPosts();
            loadDashboardData();
        }
    } catch (error) {
        console.error('Error deleting post:', error);
    }
}

// Categories Functions
async function loadCategories() {
    try {
        const categories = await apiRequest('/categories');
        
        if (categories) {
            updateCategoriesList(categories);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

async function loadCategoriesForFilter() {
    try {
        const categories = await apiRequest('/categories');
        
        if (categories) {
            const select = document.getElementById('categoryFilter');
            const currentValue = select.value;
            
            select.innerHTML = '<option value="">All Categories</option>' +
                categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
            
            select.value = currentValue;
        }
    } catch (error) {
        console.error('Error loading categories for filter:', error);
    }
}

function updateCategoriesList(categories) {
    const container = document.getElementById('categoriesList');
    
    if (categories.length === 0) {
        container.innerHTML = '<p>No categories found.</p>';
        return;
    }
    
    // Get post count for each category
    Promise.all(categories.map(async category => {
        const response = await apiRequest(`/blogs?category=${category}&limit=100`);
        return {
            name: category,
            count: response ? response.blogs.length : 0
        };
    })).then(categoryStats => {
        container.innerHTML = categoryStats.map(cat => `
            <div class="category-card">
                <h3>${cat.name}</h3>
                <p>${cat.count} posts</p>
            </div>
        `).join('');
    });
}

// Cancel Button Handler
document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('blogForm').reset();
    document.getElementById('imagePreview').innerHTML = '';
    showSection('posts');
});

// Refresh Button Handler
document.getElementById('refreshBtn').addEventListener('click', () => {
    const activeSection = document.querySelector('.content-section.active').id;
    showSection(activeSection);
    showNotification('Data refreshed!', 'info');
});

// Notification Function
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Close modal when clicking outside
document.getElementById('editModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeEditModal();
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape to close modal
    if (e.key === 'Escape') {
        const modal = document.getElementById('editModal');
        if (modal.classList.contains('active')) {
            closeEditModal();
        }
    }
    
    // Ctrl+S to save (when in form)
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const activeForm = document.querySelector('.content-section.active form');
        if (activeForm) {
            activeForm.dispatchEvent(new Event('submit'));
        }
    }
});

// Sidebar Toggle Function
function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');
    
    sidebar.classList.toggle('collapsed');
    content.classList.toggle('expanded');
    
    // Save preference to localStorage
    const isCollapsed = sidebar.classList.contains('collapsed');
    localStorage.setItem('sidebarCollapsed', isCollapsed);
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('active');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const sidebar = document.querySelector('.sidebar');
    const toggle = document.querySelector('.mobile-toggle');
    
    if (window.innerWidth <= 768 && 
        !sidebar.contains(event.target) && 
        !toggle.contains(event.target) && 
        sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
});

// Close mobile menu when navigating to a new section
function showSection(sectionName) {
    // Close mobile menu if open
    const sidebar = document.querySelector('.sidebar');
    if (window.innerWidth <= 768 && sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
    }
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update nav
    document.querySelectorAll('.nav-link').forEach(item => {
        item.classList.remove('active');
    });
    
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
    
    // Load data based on section
    switch (sectionName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'posts':
            loadPosts();
            break;
        case 'categories':
            loadCategories();
            break;
    }
}
