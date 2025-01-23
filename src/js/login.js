import { login, isAuthenticated, isAdmin } from './utils/auth.js';

document.addEventListener('DOMContentLoaded', () => {
    // Redirect if already logged in
    if (isAuthenticated()) {
        window.location.href = isAdmin() ? '/admin/dashboard.html' : '/index.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const data = await login(email, password);
            if (data.user.role === 'admin') {
                window.location.href = '/admin/dashboard.html';
            } else {
                window.location.href = '/index.html';
            }
        } catch (error) {
            alert('Login failed. Please check your credentials.');
        }
    });
});
