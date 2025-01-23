import { register } from './utils/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        try {
            await register({
                name,
                email,
                password,
                role: 'user'
            });
            alert('Registration successful! Please login.');
            window.location.href = '/login.html';
        } catch (error) {
            alert('Registration failed. Please try again.');
        }
    });
});
