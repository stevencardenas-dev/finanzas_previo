const BASE_URL = 'https://finanzas-api.ubunifusoft.digital/api';

/**
 * Registra un nuevo usuario
 * @param {string} nombre 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} Respuesta de la API
 */
export async function registerUser(nombre, email, password) {
    try {
        const response = await fetch(`${BASE_URL}/auth/registro`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.mensaje || 'Error en el registro');
        }

        // Guardar token y datos en localStorage
        if (data.data && data.data.token) {
            localStorage.setItem('finanzas_token', data.data.token);
            localStorage.setItem('finanzas_user', JSON.stringify({
                nombre: data.data.nombre,
                email: data.data.email,
                workspaces: data.data.workspaces
            }));

            // Workspace por defecto
            if (data.data.workspaces && data.data.workspaces.length > 0) {
                localStorage.setItem('finanzas_workspace_id', data.data.workspaces[0].id);
            }
        }

        return data; 
    } catch (error) {
        console.error('Error in registerUser:', error);
        throw error;
    }
}

/**
 * Inicia sesión en la plataforma
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} Respuesta de la API, incluye el token
 */
export async function loginUser(email, password) {
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.mensaje || 'Credenciales incorrectas');
        }

        // Guardar token y datos del usuario en localStorage
        if (data.data && data.data.token) {
            localStorage.setItem('finanzas_token', data.data.token);
            localStorage.setItem('finanzas_user', JSON.stringify({
                nombre: data.data.nombre,
                email: data.data.email,
                workspaces: data.data.workspaces
            }));

            if (data.data.workspaces && data.data.workspaces.length > 0) {
                localStorage.setItem('finanzas_workspace_id', data.data.workspaces[0].id);
            }
        }

        return data;
    } catch (error) {
        console.error('Error in loginUser:', error);
        throw error;
    }
}

/**
 * Cierra la sesión eliminando el token y la data local
 */
export function logout() {
    localStorage.removeItem('finanzas_token');
    localStorage.removeItem('finanzas_user');
    localStorage.removeItem('finanzas_workspace_id');
}
