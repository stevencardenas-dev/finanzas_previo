const BASE_URL = 'https://finanzas-api.ubunifusoft.digital/api';

/** Helper genérico para obtener Headers de Autenticación Módulo Core */
function authHeaders() {
    const token = localStorage.getItem('finanzas_token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

/** Check authentication */
export function isAuthenticated() {
    return !!localStorage.getItem('finanzas_token');
}

/** Obtener workspace actual */
export function getWorkspaceId() {
    return localStorage.getItem('finanzas_workspace_id');
}

// ==== MÓDULO AUTH ====

export async function registerUser(nombre, email, password) {
    try {
        const response = await fetch(`${BASE_URL}/auth/registro`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.mensaje || 'Error en el registro');

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
        console.error('Error registerUser:', error); throw error;
    }
}

export async function loginUser(email, password) {
    try {
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        
        if (!response.ok) throw new Error(data.mensaje || 'Credenciales incorrectas');

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
        console.error('Error loginUser:', error); throw error;
    }
}

export function logout() {
    localStorage.removeItem('finanzas_token');
    localStorage.removeItem('finanzas_user');
    localStorage.removeItem('finanzas_workspace_id');
}


// ==== MÓDULO DASHBOARD ====

export async function getDashboardSummary(workspaceId, anio, mes) {
    const res = await fetch(`${BASE_URL}/dashboard/resumen-mensual?workspaceId=${workspaceId}&anio=${anio}&mes=${mes}`, {
        headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error obteniendo dashboard');
    return data.data; // { totalIngresos, totalGastos, balanceNeto }
}


// ==== MÓDULO CATEGORÍAS ====

export async function getCategorias(workspaceId) {
    const res = await fetch(`${BASE_URL}/categorias?workspaceId=${workspaceId}`, {
        headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error obteniendo categorías');
    return data.data;
}

export async function createCategoria(workspaceId, nombre, tipo) {
    const res = await fetch(`${BASE_URL}/categorias`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ workspaceId, nombre, tipo }) // CamelCase
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error creando categoría');
    return data.data;
}


// ==== MÓDULO BENEFICIARIOS ====

export async function getBeneficiarios(workspaceId) {
    const res = await fetch(`${BASE_URL}/beneficiarios?workspaceId=${workspaceId}`, {
        headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error obteniendo beneficiarios');
    return data.data; 
}

export async function createBeneficiario(workspaceId, nombre) {
    const res = await fetch(`${BASE_URL}/beneficiarios`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ workspaceId, nombre })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error creando beneficiario');
    return data.data;
}


// ==== MÓDULO TRANSACCIONES ====

export async function getTransacciones(workspaceId) {
    const res = await fetch(`${BASE_URL}/transactions?workspaceId=${workspaceId}`, {
        headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error obteniendo transacciones');
    return data.data;
}

export async function createTransaccion(payload) {
    // Volvemos a CamelCase (mapeo estándar Spring) pero aseguramos que los IDs no lleguen nulos
    const body = {
        workspaceId: payload.workspaceId,
        tipo: payload.tipo,
        categoriaId: payload.categoriaId,
        beneficiarioId: payload.beneficiarioId,
        fecha: payload.fecha,
        monto: payload.monto,
        descripcion: payload.descripcion,
        medioPago: payload.medioPago,
        cuentaId: payload.cuentaId,
        tarjetaCreditoId: payload.tarjetaCreditoId
    };

    const res = await fetch(`${BASE_URL}/transactions`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error creando transacción');
    return data.data;
}
// ==== MÓDULO CUENTAS ====

export async function getCuentas(workspaceId) {
    const res = await fetch(`${BASE_URL}/cuentas?workspaceId=${workspaceId}`, {
        headers: authHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error obteniendo cuentas');
    return data.data; // Lista de CuentaDTO
}

export async function createCuenta(workspaceId, nombre, tipo, moneda = 'COP', saldoInicial = 0) {
    const res = await fetch(`${BASE_URL}/cuentas`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ workspaceId, nombre, tipo, moneda, saldoInicial })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || 'Error creando cuenta');
    return data.data;
}
