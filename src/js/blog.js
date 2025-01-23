// Import styles
import '../css/style.css';

document.addEventListener('DOMContentLoaded', () => {
    // Blog search functionality
    const searchInput = document.getElementById('blogSearch');
    const blogPosts = document.querySelectorAll('.blog-post');

    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const searchTerm = searchInput.value.toLowerCase();

            blogPosts.forEach(post => {
                const title = post.querySelector('h2').textContent.toLowerCase();
                const content = post.querySelector('p').textContent.toLowerCase();

                if (title.includes(searchTerm) || content.includes(searchTerm)) {
                    post.style.display = 'block';
                } else {
                    post.style.display = 'none';
                }
            });
        });
    }

    // Newsletter subscription
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = newsletterForm.querySelector('input[type="email"]').value;
            
            // Here you would typically send this to your backend
            console.log('Newsletter subscription for:', email);
            
            // Show success message
            const successMessage = document.createElement('div');
            successMessage.className = 'bg-green-100 text-green-700 p-4 rounded mt-4';
            successMessage.textContent = 'Thank you for subscribing to our newsletter!';
            
            newsletterForm.insertAdjacentElement('afterend', successMessage);
            newsletterForm.reset();
            
            // Remove success message after 3 seconds
            setTimeout(() => {
                successMessage.remove();
            }, 3000);
        });
    }
});
