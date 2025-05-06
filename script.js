document.addEventListener('DOMContentLoaded', function() {
    // Set current year in footer
    document.getElementById('year').textContent = new Date().getFullYear();

    // Mobile Navigation
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
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const navbarHeight = document.getElementById('navbar').offsetHeight;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Contact Form Functionality
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
            
            // Hide previous status messages
            formStatus.style.display = 'none';
            formStatus.className = 'form-status';
            
            try {
                // Using FormSubmit.co service
                const formData = new FormData(contactForm);
                const response = await fetch('https://formsubmit.co/ajax/akashkumargupta1998@gmail.com', {
                    method: 'POST',
                    headers: { 
                        'Accept': 'application/json'
                    },
                    body: formData
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    // Success message
                    formStatus.textContent = 'Message sent successfully!';
                    formStatus.classList.add('success');
                    formStatus.style.display = 'block';
                    
                    // Reset form
                    contactForm.reset();
                } else {
                    throw new Error(result.message || 'Failed to send message');
                }
            } catch (error) {
                // Error message
                formStatus.textContent = error.message;
                formStatus.classList.add('error');
                formStatus.style.display = 'block';
            } finally {
                // Reset button state
                btnText.textContent = 'Send Message';
                btnLoader.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }

    // Resume Print Functionality
    const printResumeBtn = document.getElementById('print-resume');
    if (printResumeBtn) {
        printResumeBtn.addEventListener('click', function() {
            const pdfFrame = document.getElementById('resume-pdf');
            if (pdfFrame && pdfFrame.contentWindow) {
                pdfFrame.contentWindow.print();
            } else {
                window.open('docs/your-resume.pdf', '_blank');
            }
        });
