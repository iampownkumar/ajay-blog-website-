// Main website JavaScript
// Load blog posts from API
async function loadBlogPosts(page = 1, search = '') {
    try {
        console.log(`Loading blog posts - Page: ${page}, Search: "${search}"`);
        let url = `/api/blogs?published=true&limit=9&page=${page}`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        console.log('Blog data received:', data);
        console.log('Number of posts:', data.blogs ? data.blogs.length : 0);
        
        if (data.blogs && data.blogs.length > 0) {
            updateBlogGrid(data.blogs);
            updatePagination(data.currentPage, data.totalPages, search);
        } else {
            // Show no results message
            const blogGrid = document.querySelector('.blog-grid');
            blogGrid.innerHTML = '<div class="no-results"><h3>No posts found</h3><p>Try adjusting your search terms or browse all posts.</p></div>';
            updatePagination(1, 1, search);
        }
    } catch (error) {
        console.error('Error loading blog posts:', error);
        // Show error message
        const blogGrid = document.querySelector('.blog-grid');
        blogGrid.innerHTML = '<div class="no-results"><h3>Error loading posts</h3><p>Please refresh the page and try again.</p></div>';
    }
}

function updateBlogGrid(posts) {
    const blogGrid = document.querySelector('.blog-grid');
    
    console.log('Updating blog grid with posts:', posts);
    console.log('Number of posts to render:', posts.length);
    
    blogGrid.innerHTML = posts.map(post => `
        <article class="blog-card" onclick="window.location.href='post?id=${post._id}'">
            <div class="blog-image">
                ${post.image ? `<img src="${post.image.startsWith('/uploads/') ? post.image : '/uploads/' + post.image}" alt="${post.title}" style="width: 100%; height: 100%; object-fit: cover;">` : '<div class="placeholder-image"></div>'}
            </div>
            <div class="blog-content">
                <div class="blog-meta">
                    <span class="date">${new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    <span class="category">${post.category}</span>
                    <span class="read-time">📖 ${post.readTime || 5} min read</span>
                </div>
                <h3>${post.title}</h3>
                <p>${post.excerpt}</p>
                <a href="post?id=${post._id}" class="read-more" onclick="event.stopPropagation()">Read More →</a>
            </div>
        </article>
    `).join('');
    
    // Re-attach event listeners to new "Read More" links
    attachReadMoreListeners();
}

// Update pagination controls
function updatePagination(currentPage, totalPages, search = '') {
    const paginationContainer = document.querySelector('.blog-pagination');
    
    if (!paginationContainer) {
        // Create pagination container if it doesn't exist
        const blogSection = document.querySelector('.blog-posts');
        const paginationHTML = `
            <div class="blog-pagination">
                <div class="pagination-controls">
                    <button class="pagination-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="loadBlogPosts(${currentPage - 1}, '${search}')">
                        ← Previous
                    </button>
                    <span class="page-info">Page ${currentPage} of ${totalPages}</span>
                    <button class="pagination-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="loadBlogPosts(${currentPage + 1}, '${search}')">
                        Next →
                    </button>
                </div>
            </div>
        `;
        blogSection.insertAdjacentHTML('afterend', paginationHTML);
    } else {
        // Update existing pagination
        paginationContainer.innerHTML = `
            <div class="pagination-controls">
                <button class="pagination-btn prev-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="loadBlogPosts(${currentPage - 1}, '${search}')">
                    ← Previous
                </button>
                <span class="page-info">Page ${currentPage} of ${totalPages}</span>
                <button class="pagination-btn next-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="loadBlogPosts(${currentPage + 1}, '${search}')">
                    Next →
                </button>
            </div>
        `;
    }
}

// Setup search functionality
function setupSearchListeners() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        // Search on button click
        searchBtn.addEventListener('click', performSearch);
        
        // Search on Enter key
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        // Clear search on Escape key
        searchInput.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                clearSearch();
            }
        });
    }
}

// Perform search
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchValue = searchInput.value.trim();
    
    if (searchValue) {
        loadBlogPosts(1, searchValue);
        document.getElementById('clearSearchBtn').style.display = 'flex';
    } else {
        clearSearch();
    }
}

// Clear search
function clearSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.value = '';
    loadBlogPosts(1, '');
    document.getElementById('clearSearchBtn').style.display = 'none';
}

// Initialize the app
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing blog posts...');
    loadBlogPosts();
    setupSearchListeners();
});

// Animation and other utility functions
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing blog posts...');
    loadBlogPosts();
    setupSearchListeners();
    
    const animatedElements = document.querySelectorAll('.blog-card, .about-content, .contact-content');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

function attachReadMoreListeners() {
    document.querySelectorAll('.read-more').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const postId = this.getAttribute('data-post-id');
            console.log('Clicked post ID:', postId);
            console.log('Post ID type:', typeof postId);
            console.log('Post ID length:', postId ? postId.length : 'undefined');
            loadFullPost(postId);
        });
    });
}

async function loadFullPost(postId) {
    console.log('Navigating to post with ID:', postId);
    // Navigate to the blog post page - use both ID and title as fallback
    window.location.href = `/post?id=${encodeURIComponent(postId)}`;
}
