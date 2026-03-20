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

---

*(Nota: En etapas posteriores se documentarán aquí los endpoints de Workspaces (`/api/workspaces`), Categorías (`/api/categorias`), Beneficiarios (`/api/beneficiarios`) y Transacciones (`/api/transactions`), extraídos del API Docs).*
