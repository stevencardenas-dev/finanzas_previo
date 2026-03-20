document.addEventListener('DOMContentLoaded', () => {
    // Menu mobile toggle
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
        });
    }

    // Modal logic
    const modal = document.getElementById('modal-categoria');
    const btnNueva = document.getElementById('btn-nueva-categoria');
    const btnClose = document.getElementById('close-modal');
    const formCategoria = document.getElementById('form-categoria');

    if (btnNueva) {
        btnNueva.addEventListener('click', () => {
            modal.classList.add('active');
        });
    }

    if (btnClose) {
        btnClose.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }

    // Close modal gently when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    if (formCategoria) {
        formCategoria.addEventListener('submit', (e) => {
            e.preventDefault();
            const nombre = document.getElementById('cat-nombre').value;
            const tipo = document.getElementById('cat-tipo').value;

            console.log('Crear categoría:', { nombre, tipo });
            alert(`Categoría "${nombre}" creada existosamente (Simulado)`);
            
            modal.classList.remove('active');
            formCategoria.reset();
            
            // Recargar datos (En el futuro, esto hará un fetch GET a la API)
            loadMockCategorias();
        });
    }

    // Cargar datos iniciales
    loadMockCategorias();
});

function loadMockCategorias() {
    const categoriasGrid = document.getElementById('categorias-grid');
    if (!categoriasGrid) return;

    // Datos de prueba (Reemplazables con fetch a la API real)
    const categorias = [
        { id: 1, nombre: 'Alimentación', tipo: 'gasto', icono: 'fa-utensils' },
        { id: 2, nombre: 'Transporte', tipo: 'gasto', icono: 'fa-car' },
        { id: 3, nombre: 'Salario', tipo: 'ingreso', icono: 'fa-money-bill-wave' },
        { id: 4, nombre: 'Servicios', tipo: 'gasto', icono: 'fa-bolt' },
        { id: 5, nombre: 'Ocio', tipo: 'gasto', icono: 'fa-film' }
    ];

    let html = '';
    categorias.forEach(cat => {
        const typeClass = cat.tipo === 'ingreso' ? 'income' : 'expense';
        html += `
            <div class="card" style="display: flex; align-items: center; gap: 1rem; padding: 1.5rem; margin-bottom: 0;">
                <div class="stat-icon ${typeClass}" style="width: 48px; height: 48px; font-size: 1.25rem;">
                    <i class="fas ${cat.icono}"></i>
                </div>
                <div style="flex-grow: 1;">
                    <h4 style="margin: 0 0 0.25rem 0;">${cat.nombre}</h4>
                    <span class="badge ${cat.tipo}">${cat.tipo.charAt(0).toUpperCase() + cat.tipo.slice(1)}</span>
                </div>
                <div>
                    <button class="btn-icon" title="Editar"><i class="fas fa-edit"></i></button>
                    <button class="btn-icon" title="Eliminar" style="color: var(--danger-color);"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `;
    });

    categoriasGrid.innerHTML = html;
}
