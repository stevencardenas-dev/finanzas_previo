# Flujo de la Aplicación de Finanzas Personales

Este documento detalla los 6 flujos principales sugeridos para el funcionamiento de la aplicación web, de acuerdo a las reglas de negocio y alcance mínimo establecidos.

## 1. Login y Registro (Autenticación)
- **Registro:** El usuario nuevo ingresa sus credenciales básicas para crear una cuenta en el sistema.
- **Inicio de sesión:** El usuario registrado se autentica enviando sus credenciales a la API REST para recibir un token de sesión/acceso, el cual será usado para autorizar las siguientes operaciones.

## 2. Obtener Workspace (Espacio de trabajo)
- Una vez autenticado, la aplicación solicita a la API los datos del workspace o espacio de trabajo correspondiente al usuario.
- El workspace representa el contenedor principal donde se agrupará toda la información financiera (categorías, beneficiarios, transacciones) de la sesión.

## 3. Crear Categorías
- Permite al usuario definir las categorías en las que clasificará sus finanzas (por ejemplo: "Salud", "Alimentación", "Nómina", etc.).
- Sin categorías configuradas, no es posible organizar adecuadamente el registro de ingresos y gastos.

## 4. Registrar Beneficiarios
- El usuario ingresa la información de los beneficiarios.
- Los beneficiarios son las entidades, empresas o personas a las que se dirigen los pagos o de las cuales provienen los ingresos (p. ej., "Supermercado", "Empresa Empleadora", "Propietario del piso").

## 5. Registrar Ingresos y Gastos
- **Ingresos:** Formularios para documentar la entrada de dinero al workspace, vinculando un monto, fecha, la categoría correspondiente y la fuente de donde proviene.
- **Gastos/Pagos:** Formularios para registrar la salida de dinero, apuntando a qué beneficiario se pagó, el monto, fecha y en qué categoría se clasifica dicho gasto.

## 6. Visualizar Información en el Dashboard
- Pantalla principal o resumen donde la aplicación consume los métodos de lectura de la API para mostrar toda la información almacenada.
- Podría incluir el saldo general, listas de transacciones recientes, distribución de gastos vs ingresos y organización visual por categorías.
