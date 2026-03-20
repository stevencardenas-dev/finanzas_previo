import { loginUser } from './api.js';
import { showToast } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const btnSubmit = loginForm.querySelector('button[type="submit"]');

            if (!email || !password) {
                showToast('Por favor, completa todos los campos.', 'error');
                return;
            }

            try {
                // Deshabilitar botón durante la petición
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Iniciando sesión...';

                await loginUser(email, password);
                
                showToast('Inicio de sesión exitoso. Redirigiendo...', 'success');
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                
            } catch (error) {
                showToast(error.message, 'error');
                // Restaurar el botón en caso de error
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Entrar';
            }
        });
    }
});
