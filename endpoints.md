# Endpoints de la API

Base URL: `https://finanzas-api.ubunifusoft.digital`

En este documento se registran los endpoints que se utilizarán para la aplicación web de gestión de finanzas, derivados de la especificación OpenAPI.

## Módulo de Autenticación
Controla el acceso y creación de cuentas de usuario.

### 1. Registrar Nuevo Usuario
- **Ruta:** `POST /api/auth/registro`
- **Uso:** En `js/registro.js`
- **Cuerpo (JSON):**
  ```json
  {
    "nombre": "string",
    "email": "string",
    "password": "string (mínimo 6 caracteres)"
  }
  ```
- **Respuesta Esperada (200 OK):**
  ```json
  {
    "mensaje": "string",
    "status": 200,
    "data": {
      "token": "string (JWT)",
      "email": "string",
      "nombre": "string",
      "workspaces": [ { "id": 1, "nombre": "Workspace 1"} ]
    }
  }
  ```

### 2. Iniciar Sesión (Login)
- **Ruta:** `POST /api/auth/login`
- **Uso:** En `js/login.js`
- **Cuerpo (JSON):**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Respuesta Esperada (200 OK):** *(Idéntico a Registro, retorna el token y los workspaces).*

## Módulo de Workspaces
### 3. Obtener Workspaces
- **Ruta:** `GET /api/workspaces?usuarioId={id}`
- **Respuesta Esperada:** Lista de workspaces que posee el usuario y sus roles.

## Módulo de Categorías
### 4. Listar Categorías
- **Ruta:** `GET /api/categorias?workspaceId={id}`
### 5. Crear Categoría
- **Ruta:** `POST /api/categorias`
- **Cuerpo:** `{ "workspaceId": 1, "nombre": "string", "tipo": "string" }`

## Módulo de Beneficiarios
### 6. Listar Beneficiarios
- **Ruta:** `GET /api/beneficiarios?workspaceId={id}`
### 7. Crear Beneficiario
- **Ruta:** `POST /api/beneficiarios`
- **Cuerpo:** `{ "workspaceId": 1, "nombre": "string" }`

## Módulo de Transacciones
### 8. Listar Historial
- **Ruta:** `GET /api/transactions?workspaceId={id}`
### 9. Crear Transacción
- **Ruta:** `POST /api/transactions`
- **Cuerpo Mínimo:** `{ "workspaceId": 1, "tipo": "string", "categoriaId": 1, "beneficiarioId": 1, "fecha": "YYYY-MM-DD", "monto": 0.0, "descripcion": "string" }`

## Módulo Dashboard Analytics
### 10. Resumen Mensual
- **Ruta:** `GET /api/dashboard/resumen-mensual?workspaceId={id}&anio={yyyy}&mes={mm}`
- **Respuesta Esperada:** Objeto con `totalIngresos`, `totalGastos`, `balanceNeto`.
