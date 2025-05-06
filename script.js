document.addEventListener('DOMContentLoaded', function() {
    // ======================
    // General Site Functions
    // ======================

    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function() {
        navbar.classList.toggle('scrolled', window.scrollY > 100);
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ======================
    // Contact Form Handling
    // ======================

    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        const submitBtn = document.getElementById('submitBtn');
        const btnText = document.getElementById('btnText');
        const btnLoader = document.getElementById('btnLoader');
        const formStatus = document.getElementById('formStatus');

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Show loading state
            btnText.textContent = 'Sending...';
            btnLoader.style.display = 'block';
            submitBtn.disabled = true;
            formStatus.style.display = 'none';
            
            try {
                const formData = new FormData(contactForm);
                const response = await fetch('https://formsubmit.co/ajax/akashkumargupta1998@gmail.com', {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: formData
                });
                
                if (!response.ok) throw new Error('Failed to send message');
                
                formStatus.textContent = 'Message sent successfully!';
                formStatus.className = 'form-status success';
                contactForm.reset();
            } catch (error) {
                formStatus.textContent = error.message || 'An error occurred';
                formStatus.className = 'form-status error';
            } finally {
                formStatus.style.display = 'block';
                btnText.textContent = 'Send Message';
                btnLoader.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }

    // ======================
    // Resume Print Functionality
    // ======================

    const printResumeBtn = document.getElementById('print-resume');
    if (printResumeBtn) {
        printResumeBtn.addEventListener('click', function() {
            const pdfFrame = document.getElementById('resume-pdf');
            if (pdfFrame?.contentWindow) {
                pdfFrame.contentWindow.print();
            } else {
                window.open('docs/your-resume.pdf', '_blank');
            }
        });
    }

    // ======================
    // Posts Management System
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
            contentPreview: document.getElementById('content-preview')
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
            this.elements.toggleFormBtn.addEventListener('click', () => this.togglePostForm());
            this.elements.cancelPostBtn.addEventListener('click', () => this.cancelEditing());

            // Form submission
            this.elements.saveDraftBtn.addEventListener('click', (e) => this.savePost(e, false));
            this.elements.publishPostBtn.addEventListener('click', (e) => this.savePost(e, true));

            // Filtering
            this.elements.filterPosts.addEventListener('change', (e) => {
                this.state.filter = e.target.value;
                this.state.currentPage = 1;
                this.renderPosts();
            });

            // Load more
            this.elements.loadMoreBtn.addEventListener('click', () => {
                this.state.currentPage++;
                this.renderPosts();
            });

            // Content preview
            this.elements.postContent.addEventListener('input', () => this.updateContentPreview());
        },

        // Toggle post form visibility
        togglePostForm() {
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
            
            const title = this.elements.postTitle.value.trim();
            const content = this.elements.postContent.value.trim();
            
            if (!title || !content) {
                this.showToast('Title and content are required!', 'error');
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
            this.showToast(`Post ${publish ? 'published' : 'saved as draft'} successfully!`);
        },

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

        // Create HTML for a post card
        createPostCard(post) {
            return `
                <div class="post-card">
                    <span class="post-status ${post.published ? 'published' : 'draft'}">
                        ${post.published ? 'Published' : 'Draft'}
                    </span>
                    <img src="${post.image}" alt="${post.title}" class="post-image" loading="lazy">
                    <div class="post-content">
                        <h3 class="post-title">${post.title}</h3>
                        <span class="post-date">${this.formatDate(post.date)}</span>
                        <p class="post-excerpt">${post.excerpt}</p>
                        <div class="markdown-preview">${this.markdownToHtml(post.content.substring(0, 200))}...</div>
                        <div class="post-tags">
                            ${post.tags.map(tag => `<span class="tag">#${tag}</span>`).join('')}
                        </div>
                        <div class="post-actions">
                            <button class="edit-post" data-id="${post.id}" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="delete-post" data-id="${post.id}" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        // Filter posts based on current filter
        getFilteredPosts() {
            switch(this.state.filter) {
                case 'published': return this.state.posts.filter(post => post.published);
                case 'drafts': return this.state.posts.filter(post => !post.published);
                default: return [...this.state.posts];
            }
        },

        // Edit post
        editPost(postId) {
            const post = this.state.posts.find(p => p.id === postId);
            if (!post) return;
            
            this.state.editingPostId = postId;
            this.elements.postTitle.value = post.title;
            this.elements.postContent.value = post.content;
            this.elements.postImage.value = post.image;
            this.elements.postTags.value = post.tags.join(', ');
            this.elements.postPublished.checked = post.published;
            this.updateContentPreview();
            
            if (!this.elements.addPostForm.classList.contains('active')) {
                this.togglePostForm();
            }
            
            this.elements.addPostForm.scrollIntoView({ behavior: 'smooth' });
        },

        // Delete post
        deletePost(postId) {
            if (confirm('Are you sure you want to delete this post?')) {
                this.state.posts = this.state.posts.filter(post => post.id !== postId);
                this.saveToLocalStorage();
                this.renderPosts();
                this.showToast('Post deleted successfully!');
            }
        },

        // Update content preview
        updateContentPreview() {
            this.elements.contentPreview.innerHTML = this.markdownToHtml(this.elements.postContent.value);
        },

        // Save posts to localStorage
        saveToLocalStorage() {
            localStorage.setItem('portfolioPosts', JSON.stringify(this.state.posts));
        },

        // Format date
        formatDate(isoString) {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(isoString).toLocaleDateString(undefined, options);
        },

        // Simple markdown to HTML conversion
        markdownToHtml(text) {
            return text
                .replace(/^# (.*$)/gm, '<h1>$1</h1>')
                .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1">')
                .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
                .replace(/\n/g, '<br>');
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

    // Initialize Posts Manager
    PostsManager.init();
});
