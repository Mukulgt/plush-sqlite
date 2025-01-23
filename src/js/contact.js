// Import styles
import '../css/style.css';

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            
            try {
                // Here you would typically send this to your backend
                console.log('Form submission:', data);
                
                // Show success message
                const successMessage = document.createElement('div');
                successMessage.className = 'bg-green-100 text-green-700 p-4 rounded mt-4';
                successMessage.textContent = 'Thank you for your message! We will get back to you soon.';
                
                contactForm.insertAdjacentElement('afterend', successMessage);
                contactForm.reset();
                
                // Remove success message after 3 seconds
                setTimeout(() => {
                    successMessage.remove();
                }, 3000);
                
            } catch (error) {
                // Show error message
                const errorMessage = document.createElement('div');
                errorMessage.className = 'bg-red-100 text-red-700 p-4 rounded mt-4';
                errorMessage.textContent = 'Failed to send message. Please try again later.';
                
                contactForm.insertAdjacentElement('afterend', errorMessage);
                
                // Remove error message after 3 seconds
                setTimeout(() => {
                    errorMessage.remove();
                }, 3000);
            }
        });
    }
});
