import { registerUser } from './api.js';
import { showToast } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registro-form');

    if (registroForm) {
        registroForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const passwordConfirm = document.getElementById('password_confirm').value;
            const btnSubmit = registroForm.querySelector('button[type="submit"]');

            if (!name || !email || !password || !passwordConfirm) {
                showToast('Por favor, completa todos los campos.', 'error');
                return;
            }

            if (password !== passwordConfirm) {
                showToast('Las contraseñas no coinciden.', 'error');
                return;
            }

            if (password.length < 6) {
                showToast('La contraseña debe tener al menos 6 caracteres.', 'error');
                return;
            }

            try {
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Registrando...';

                await registerUser(name, email, password);
                
                showToast('Usuario registrado exitosamente. Entrando...', 'success');
                setTimeout(() => {
                    // Redirigir la usuario logueado automáticamente al dashboard
                    window.location.href = 'dashboard.html';
                }, 1000);
                
            } catch (error) {
                showToast(error.message, 'error');
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Registrarse';
            }
        });
    }
});
