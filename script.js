document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // Admin Authentication System
    // ======================

    const AdminAuth = {
        // Configuration - CHANGE THIS TO YOUR SECURE PASSWORD
        config: {
            adminPassword: "YourSecurePassword123!", // Change this to your own strong password
            sessionTimeout: 30 * 60 * 1000 // 30 minutes
        },

        // State
        state: {
            isAuthenticated: false,
            sessionTimer: null
        },

        // DOM Elements
        elements: {
            loginModal: document.getElementById('admin-login-modal'),
            loginForm: document.getElementById('admin-login-form'),
            passwordInput: document.getElementById('admin-password'),
            loginBtn: document.getElementById('login-btn'),
            logoutBtn: document.getElementById('logout-btn'),
            adminControls: document.querySelectorAll('.admin-control')
        },

        // Initialize
        init() {
            this.checkSession();
            this.setupEventListeners();
        },

        // Check for existing session
        checkSession() {
            const session = localStorage.getItem('adminSession');
            if (session && session === this.config.adminPassword) {
                this.authenticate();
            }
        },

        // Setup event listeners
        setupEventListeners() {
            if (this.elements.loginForm) {
                this.elements.loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleLogin();
                });
            }

            if (this.elements.logoutBtn) {
                this.elements.logoutBtn.addEventListener('click', () => {
                    this.handleLogout();
                });
            }
        },

        // Handle login
        handleLogin() {
            const enteredPassword = this.elements.passwordInput.value;
            
            if (enteredPassword === this.config.adminPassword) {
                this.authenticate();
                localStorage.setItem('adminSession', this.config.adminPassword);
                this.startSessionTimer();
                this.closeModal();
                this.showToast('Admin access granted!', 'success');
            } else {
                this.showToast('Incorrect password!', 'error');
            }
        },

        // Handle logout
        handleLogout() {
            this.state.isAuthenticated = false;
            localStorage.removeItem('adminSession');
            clearTimeout(this.state.sessionTimer);
            this.toggleAdminControls();
            this.showToast('Logged out successfully', 'success');
        },

        // Authenticate user
        authenticate() {
            this.state.isAuthenticated = true;
            this.toggleAdminControls();
        },

        // Start session timer
        startSessionTimer() {
            clearTimeout(this.state.sessionTimer);
            this.state.sessionTimer = setTimeout(() => {
                this.handleLogout();
                this.showToast('Session expired. Please login again.', 'info');
            }, this.config.sessionTimeout);
        },

        // Toggle admin controls visibility
        toggleAdminControls() {
            this.elements.adminControls.forEach(control => {
                control.style.display = this.state.isAuthenticated ? 'block' : 'none';
            });
        },

        // Show modal
        showModal() {
            if (this.elements.loginModal) {
                this.elements.loginModal.style.display = 'block';
                this.elements.passwordInput.focus();
            }
        },

        // Close modal
        closeModal() {
            if (this.elements.loginModal) {
                this.elements.loginModal.style.display = 'none';
                this.elements.passwordInput.value = '';
            }
        },

        // Show toast notification
        showToast(message, type = 'success') {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => toast.classList.add('show'), 10);
            
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => document.body.removeChild(toast), 300);
            }, 3000);
        }
    };

    // ======================
    // Posts Management System (with Admin Authentication)
    // ======================

    const PostsManager = {
        // DOM Elements
        elements: {
            postsContainer: document.getElementById('posts-container'),
            addPostForm: document.getElementById('add-post-form'),
            toggleFormBtn: document.getElementById('toggle-form-btn'),
            saveDraftBtn: document.getElementById('save-draft-btn'),
            publishPostBtn: document.getElementById('publish-post-btn'),
            cancelPostBtn: document.getElementById('cancel-post-btn'),
            filterPosts: document.getElementById('filter-posts'),
            loadMoreBtn: document.getElementById('load-more-btn'),
            postTitle: document.getElementById('post-title'),
            postContent: document.getElementById('post-content'),
            postImage: document.getElementById('post-image'),
            postTags: document.getElementById('post-tags'),
            postPublished: document.getElementById('post-published'),
            contentPreview: document.getElementById('content-preview'),
            adminAccessBtn: document.getElementById('admin-access-btn')
        },

        // State
        state: {
            posts: [],
            currentPage: 1,
            postsPerPage: 6,
            filter: 'all',
            editingPostId: null
        },

        // Initialize
        init() {
            this.loadPosts();
            this.setupEventListeners();
            this.renderPosts();
            this.checkAdminStatus();
        },

        // Check admin status and adjust UI
        checkAdminStatus() {
            if (AdminAuth.state.isAuthenticated) {
                this.elements.adminAccessBtn.style.display = 'none';
                this.elements.toggleFormBtn.style.display = 'inline-block';
            } else {
                this.elements.adminAccessBtn.style.display = 'inline-block';
                this.elements.toggleFormBtn.style.display = 'none';
                this.elements.addPostForm.style.display = 'none';
            }
        },

        // Load posts from localStorage
        loadPosts() {
            const savedPosts = localStorage.getItem('portfolioPosts');
            this.state.posts = savedPosts ? JSON.parse(savedPosts) : this.getDefaultPosts();
        },

        // Default sample posts
        getDefaultPosts() {
            return [
                {
                    id: '1',
                    title: "The Intersection of Chemistry and Cloud Computing",
                    date: new Date().toISOString(),
                    content: "Exploring how cloud technologies are revolutionizing chemical research and data analysis in modern laboratories.\n\n## Key Benefits\n- **Scalability** for large datasets\n- *Collaboration* across research teams\n- Cost-effective solutions",
                    excerpt: "Exploring how cloud technologies are revolutionizing chemical research and data analysis.",
                    image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                    tags: ["chemistry", "cloud computing"],
                    published: true
                },
                {
                    id: '2',
                    title: "My Journey from Chemistry to Tech",
                    date: new Date().toISOString(),
                    content: "Sharing my personal experience transitioning from a chemistry background to the world of cloud computing.\n\n## Challenges Faced\n1. Learning new technical skills\n2. Adapting to different workflows\n3. Building a professional network",
                    excerpt: "Sharing my personal experience transitioning from chemistry to cloud computing.",
                    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80",
                    tags: ["career", "transition"],
                    published: true
                }
            ];
        },

        // Set up event listeners
        setupEventListeners() {
            // Form toggling
            this.elements.toggleFormBtn?.addEventListener('click', () => this.togglePostForm());
            this.elements.cancelPostBtn?.addEventListener('click', () => this.cancelEditing());
            this.elements.adminAccessBtn?.addEventListener('click', () => AdminAuth.showModal());

            // Form submission
            this.elements.saveDraftBtn?.addEventListener('click', (e) => this.savePost(e, false));
            this.elements.publishPostBtn?.addEventListener('click', (e) => this.savePost(e, true));

            // Filtering
            this.elements.filterPosts?.addEventListener('change', (e) => {
                this.state.filter = e.target.value;
                this.state.currentPage = 1;
                this.renderPosts();
            });

            // Load more
            this.elements.loadMoreBtn?.addEventListener('click', () => {
                this.state.currentPage++;
                this.renderPosts();
            });

            // Content preview
            this.elements.postContent?.addEventListener('input', () => this.updateContentPreview());
        },

        // Toggle post form visibility
        togglePostForm() {
            if (!AdminAuth.state.isAuthenticated) {
                AdminAuth.showModal();
                return;
            }

            this.elements.addPostForm.classList.toggle('active');
            this.elements.toggleFormBtn.innerHTML = this.elements.addPostForm.classList.contains('active') 
                ? '<i class="fas fa-times"></i> Cancel' 
                : '<i class="fas fa-plus"></i> Create New Post';
            
            if (!this.elements.addPostForm.classList.contains('active')) {
                this.cancelEditing();
            }
        },

        // Save post (draft or published)
        savePost(e, publish) {
            e.preventDefault();
            
            if (!AdminAuth.state.isAuthenticated) {
                AdminAuth.showModal();
                return;
            }

            const title = this.elements.postTitle.value.trim();
            const content = this.elements.postContent.value.trim();
            
            if (!title || !content) {
                AdminAuth.showToast('Title and content are required!', 'error');
                return;
            }
            
            const newPost = {
                id: this.state.editingPostId || Date.now().toString(),
                title,
                content,
                excerpt: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
                image: this.elements.postImage.value.trim() || 'https://via.placeholder.com/600x400?text=No+Image',
                tags: this.elements.postTags.value.split(',').map(tag => tag.trim()).filter(tag => tag),
                published: publish,
                date: new Date().toISOString()
            };
            
            if (this.state.editingPostId) {
                // Update existing post
                const index = this.state.posts.findIndex(p => p.id === this.state.editingPostId);
                if (index !== -1) this.state.posts[index] = newPost;
            } else {
                // Add new post
                this.state.posts.unshift(newPost);
            }
            
            this.saveToLocalStorage();
            this.renderPosts();
            this.resetForm();
            this.togglePostForm();
            AdminAuth.showToast(`Post ${publish ? 'published' : 'saved as draft'} successfully!`);
        },

        // ... [Rest of the PostsManager methods remain the same as previous implementation]
        // (cancelEditing, resetForm, renderPosts, createPostCard, etc.)
                // Cancel editing and reset form
        cancelEditing() {
            this.resetForm();
            this.state.editingPostId = null;
        },

        // Reset form fields
        resetForm() {
            this.elements.postTitle.value = '';
            this.elements.postContent.value = '';
            this.elements.postImage.value = '';
            this.elements.postTags.value = '';
            this.elements.postPublished.checked = false;
            this.elements.contentPreview.innerHTML = '';
        },

        // Render posts based on current filter and page
        renderPosts() {
            const filteredPosts = this.getFilteredPosts();
            const postsToShow = filteredPosts.slice(0, this.state.currentPage * this.state.postsPerPage);
            
            this.elements.postsContainer.innerHTML = postsToShow.map(post => this.createPostCard(post)).join('');
            
            // Add event listeners to action buttons
            document.querySelectorAll('.edit-post').forEach(btn => {
                btn.addEventListener('click', () => this.editPost(btn.dataset.id));
            });
            
            document.querySelectorAll('.delete-post').forEach(btn => {
                btn.addEventListener('click', () => this.deletePost(btn.dataset.id));
            });
            
            // Show/hide load more button
            this.elements.loadMoreBtn.style.display = 
                filteredPosts.length > this.state.currentPage * this.state.postsPerPage ? 'block' : 'none';
        },

    };

    // Initialize Admin Authentication
    AdminAuth.init();

    // Initialize Posts Manager
    PostsManager.init();

    // ======================
    // General Site Functions
    // ======================

    // [Rest of your general site functions (contact form, resume, etc.)]
});
