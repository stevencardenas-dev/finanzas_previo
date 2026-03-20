import { isAuthenticated, logout, getWorkspaceId, getTransacciones, createTransaccion, getCategorias, getBeneficiarios, getCuentas, createCuenta, getCreditCards } from './api.js';
import { showToast } from './ui.js';

let categoriasGlobal = [];
let beneficiariosGlobal = [];
let cuentasGlobal = [];
let tarjetasGlobal = [];
let transaccionesGlobal = [];

document.addEventListener('DOMContentLoaded', async () => {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }

    const userInfo = JSON.parse(localStorage.getItem('finanzas_user') || '{}');
    if (userInfo.nombre) {
        const usernameDisp = document.getElementById('user-name-display');
        const avatarDisp = document.querySelector('.avatar');
        if(usernameDisp) usernameDisp.textContent = `Hola, ${userInfo.nombre}`;
        if(avatarDisp) avatarDisp.textContent = userInfo.nombre.charAt(0).toUpperCase();
    }

    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    if(menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => { sidebar.classList.toggle('open'); });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => { logout(); window.location.href = 'login.html'; });
    }

    const workspaceId = getWorkspaceId();
    if(!workspaceId) {
        showToast('Error de Workspace, sesión inválida', 'error'); return;
    }

    // === Modal ===
    const modal = document.getElementById('modal-transaccion');
    const btnNueva = document.getElementById('btn-nueva-transaccion');
    const btnClose = document.getElementById('close-modal-trans');
    const formTrans = document.getElementById('form-transaccion');

    if (btnNueva) {
        btnNueva.addEventListener('click', () => {
             populateSelects();
             modal.classList.add('active');
        });
    }
    if (btnClose) btnClose.addEventListener('click', () => modal.classList.remove('active'));
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('active');
    });

    if (formTrans) {
        formTrans.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tipo = document.getElementById('trans-tipo').value;
            const fecha = document.getElementById('trans-fecha').value;
            const monto = parseFloat(document.getElementById('trans-monto').value);
            const descripcion = document.getElementById('trans-desc').value;
            const categoriaId = parseInt(document.getElementById('trans-categoria').value);
            const beneficiarioId = parseInt(document.getElementById('trans-beneficiario').value);
            const selCuenta = document.getElementById('trans-cuenta');
            const medioPago = document.getElementById('trans-mediodepago').value;
            const selTarjeta = document.getElementById('trans-tarjeta');
            
            const btnSubmit = formTrans.querySelector('button[type="submit"]');

            // Determinar qué ID enviar según el medio de pago
            let finalCuentaId = (medioPago === 'CREDITO') ? null : (selCuenta ? parseInt(selCuenta.value) : null);
            let finalTarjetaId = (medioPago === 'CREDITO') ? (selTarjeta ? parseInt(selTarjeta.value) : null) : null;

            if (medioPago === 'CREDITO' && (!finalTarjetaId || isNaN(finalTarjetaId))) {
               showToast('Debes seleccionar una Tarjeta de Crédito válida.', 'error'); return;
            }
            if (medioPago !== 'CREDITO' && (!finalCuentaId || isNaN(finalCuentaId))) {
               showToast('Debes seleccionar una Fuente de Pago (Cuenta) válida.', 'error'); return;
            }

            try {
                btnSubmit.disabled = true;
                btnSubmit.textContent = 'Guardando...';

                await createTransaccion({
                    workspaceId: parseInt(workspaceId),
                    tipo: tipo.toUpperCase(), 
                    categoriaId, 
                    beneficiarioId, 
                    cuentaId: finalCuentaId,
                    tarjetaCreditoId: finalTarjetaId,
                    fecha, 
                    monto, 
                    descripcion,
                    medioPago: medioPago.toUpperCase()
                });

                showToast(`Transacción registrada con éxito`, 'success');
                modal.classList.remove('active');
                formTrans.reset();
                
                await loadTransacciones(workspaceId);
            } catch (error) {
                showToast(error.message, 'error');
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Guardar Transacción';
            }
        });
    }

    // Filtros locales
    const filtroTipo = document.getElementById('filtro-tipo');
    const filtroCategoria = document.getElementById('filtro-categoria');
    
    const applyFilters = () => {
        renderTransacciones(transaccionesGlobal, filtroTipo.value, filtroCategoria.value);
    };

    if (filtroTipo) filtroTipo.addEventListener('change', applyFilters);
    if (filtroCategoria) filtroCategoria.addEventListener('change', applyFilters);

    // initial data fetch
    await preloadOptions(workspaceId);
    await loadTransacciones(workspaceId);

    // Evento para alternar entre Cuenta y Tarjeta según el medio de pago
    const selMedio = document.getElementById('trans-mediodepago');
    const groupCuenta = document.getElementById('group-cuenta');
    const groupTarjeta = document.getElementById('group-tarjeta');
    
    if (selMedio) {
        selMedio.addEventListener('change', () => {
            if (selMedio.value === 'CREDITO') {
                groupCuenta.style.display = 'none';
                groupTarjeta.style.display = 'block';
            } else {
                groupCuenta.style.display = 'block';
                groupTarjeta.style.display = 'none';
            }
        });
    }
});

async function preloadOptions(workspaceId) {
    try {
        const [cats, bens, accs, cards] = await Promise.all([
            getCategorias(workspaceId),
            getBeneficiarios(workspaceId),
            getCuentas(workspaceId),
            getCreditCards(workspaceId)
        ]);
        categoriasGlobal = cats;
        beneficiariosGlobal = bens;
        cuentasGlobal = accs;
        tarjetasGlobal = cards;

        // Si no hay cuenta, intentar crear una por defecto 'Efectivo'
        if (accs.length === 0) {
            try {
                const defaultAcc = await createCuenta(workspaceId, 'Efectivo (Default)', 'AHORROS', 'COP', 0);
                cuentasGlobal = [defaultAcc];
                console.log("Cuenta por defecto creada automáticamente");
            } catch(e) {
                console.error("Error creando cuenta por defecto", e);
            }
        }

        const filtroCategoria = document.getElementById('filtro-categoria');
        if(filtroCategoria) {
            filtroCategoria.innerHTML = '<option value="todas">Todas las Categorías</option>';
            cats.forEach(c => {
                filtroCategoria.innerHTML += `<option value="${c.nombre}">${c.nombre}</option>`;
            });
        }
    } catch(err) {
        console.error("Error cargando opciones", err);
    }
}

function populateSelects() {
    const selCat = document.getElementById('trans-categoria');
    const selBen = document.getElementById('trans-beneficiario');
    const selAcc = document.getElementById('trans-cuenta');
    
    if(selCat) {
        selCat.innerHTML = '<option value="" disabled selected>Seleccione...</option>';
        categoriasGlobal.forEach(c => {
            selCat.innerHTML += `<option value="${c.id}">${c.nombre}</option>`;
        });
    }
    
    if(selBen) {
        selBen.innerHTML = '<option value="" disabled selected>Seleccione...</option>';
        beneficiariosGlobal.forEach(b => {
             selBen.innerHTML += `<option value="${b.id}">${b.nombre}</option>`;
        });
    }

    if(selAcc) {
        selAcc.innerHTML = '<option value="" disabled selected>Seleccione la cuenta...</option>';
        cuentasGlobal.forEach(a => {
            selAcc.innerHTML += `<option value="${a.id}">${a.nombre} (${a.moneda})</option>`;
        });
    }

    const selCard = document.getElementById('trans-tarjeta');
    if(selCard) {
        selCard.innerHTML = '<option value="" disabled selected>Seleccione la tarjeta...</option>';
        tarjetasGlobal.forEach(c => {
            selCard.innerHTML += `<option value="${c.id}">${c.nombre} (${c.moneda})</option>`;
        });
    }
}

async function loadTransacciones(workspaceId) {
    const listArea = document.getElementById('transacciones-list');
    if (!listArea) return;
    
    listArea.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 2rem;">Cargando historial...</td></tr>';

    try {
        const transacciones = await getTransacciones(workspaceId);
        transaccionesGlobal = transacciones.reverse(); // Más nuevas primero
        
        const fTipo = document.getElementById('filtro-tipo')?.value || 'todos';
        const fCat = document.getElementById('filtro-categoria')?.value || 'todas';
        
        renderTransacciones(transaccionesGlobal, fTipo, fCat);
        
    } catch (error) {
        showToast(error.message, 'error');
        listArea.innerHTML = `<tr><td colspan="7" class="text-center text-danger" style="padding: 2rem;">Error al cargar: ${error.message}</td></tr>`;
    }
}

function renderTransacciones(transacciones, filtroTipo = 'todos', filtroCategoria = 'todas') {
    const listArea = document.getElementById('transacciones-list');
    
    let html = '';
    
    // Aplicar filtros locales simples
    const filtradas = transacciones.filter(t => {
        const rawTipo = (t.tipo || '').toLowerCase();
        let matchTipo = (filtroTipo === 'todos' || rawTipo === filtroTipo.toLowerCase());
        let matchCat = (filtroCategoria === 'todas' || t.categoriaNombre === filtroCategoria);
        return matchTipo && matchCat;
    });

    if (filtradas.length === 0) {
        listArea.innerHTML = '<tr><td colspan="7" class="text-center" style="padding: 2rem;">No hay transacciones que coincidan.</td></tr>';
        return;
    }

    filtradas.forEach(t => {
        const rawTipo = (t.tipo || '').toLowerCase();
        const isIngreso = rawTipo === 'ingreso';
        html += `
            <tr>
                <td>${t.fecha}</td>
                <td style="font-weight: 500;">${t.descripcion}</td>
                <td><span class="badge category">${t.categoriaNombre || 'N/A'}</span></td>
                <td>${t.beneficiarioNombre || 'N/A'}</td>
                <td style="color: ${isIngreso ? 'var(--success-color)' : 'var(--danger-color)'}; font-weight: 600;">
                    ${isIngreso ? '+' : '-'}$${parseFloat(t.monto).toFixed(2)}
                </td>
                <td><span class="badge ${rawTipo}">${rawTipo.charAt(0).toUpperCase() + rawTipo.slice(1)}</span></td>
                <td>
                    <button class="btn-icon" title="Opciones" style="margin: 0 auto;"><i class="fas fa-ellipsis-v"></i></button>
                </td>
            </tr>
        `;
    });

    listArea.innerHTML = html;
}
