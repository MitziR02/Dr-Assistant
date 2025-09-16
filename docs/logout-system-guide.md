# Sistema de Cierre de Sesión - Dr Asistente

## 📋 Descripción

Este documento describe la implementación del sistema de cierre de sesión en la aplicación Dr Asistente, siguiendo las convenciones y buenas prácticas establecidas en el README del proyecto.

## 🔧 Implementación

### 1. Funciones en `auth.js`

#### `handleLogout()`
- **Propósito**: Maneja el proceso completo de cierre de sesión
- **Características**:
  - Muestra confirmación antes de cerrar sesión
  - Limpia datos de localStorage y sessionStorage
  - Limpia cookies de sesión
  - Muestra mensaje de confirmación
  - Redirige al login después de 1.5 segundos

#### `isUserLoggedIn()`
- **Propósito**: Verifica si hay una sesión activa
- **Retorna**: `boolean` - true si hay sesión activa

#### `getCurrentUser()`
- **Propósito**: Obtiene los datos del usuario actual
- **Retorna**: `Object|null` - Datos del usuario o null si no hay sesión

#### `ModalManager` (Clase)
- **Propósito**: Maneja modales de confirmación personalizados
- **Métodos**:
  - `show(title, message, onConfirm, onCancel)`: Muestra el modal
  - `hide()`: Oculta el modal
  - `createModal()`: Crea el HTML del modal

### 2. Clase `DashboardManager` en `dashboard.js`

#### `checkUserAuthentication()`
- **Propósito**: Verifica la validez de la sesión del usuario
- **Características**:
  - Verifica que exista la sesión en localStorage
  - Valida que la sesión sea auténtica
  - Verifica que la sesión no haya expirado (24 horas)
  - Limpia automáticamente sesiones expiradas

#### `handleLogout()`
- **Propósito**: Maneja el cierre de sesión desde el dashboard
- **Características**:
  - Muestra confirmación de cierre
  - Utiliza el método `clearUserSession()` para limpiar datos
  - Maneja errores de forma elegante

#### `clearUserSession()`
- **Propósito**: Limpia todos los datos de sesión del usuario
- **Limpia**:
  - localStorage (userSession, userData)
  - sessionStorage completo

#### `redirectToLogin()`
- **Propósito**: Redirige al usuario al login cuando la sesión no es válida
- **Características**:
  - Muestra mensaje informativo
  - Redirige después de 2 segundos

### 3. Clase `AddSymptomsManager` en `add-symptoms.js`

#### `logout()`
- **Propósito**: Maneja el cierre de sesión desde la página de agregar síntomas
- **Características**:
  - Verifica si hay cambios sin guardar
  - Muestra modal de confirmación personalizado
  - Fallback a confirm nativo si es necesario

#### `performLogout()`
- **Propósito**: Ejecuta el proceso de cierre de sesión
- **Características**:
  - Muestra indicador de carga con texto "Cerrando sesión..."
  - Limpia todos los datos de sesión
  - Muestra mensaje de confirmación
  - Redirige al login con delay apropiado
  - Oculta loading en caso de error

#### Métodos de Loading
- **`showLoading()`**: Muestra el overlay de carga
- **`hideLoading()`**: Oculta el overlay de carga
- **`updateLoadingText(text)`**: Actualiza el texto del indicador de carga

**Nota**: El loading overlay está oculto por defecto en add-symptoms y solo se muestra durante el proceso de logout.

## 🔒 Seguridad Implementada

### 1. Limpieza Completa de Datos
- Se eliminan todos los datos de sesión del navegador
- Se limpian tanto localStorage como sessionStorage
- Se eliminan cookies de sesión

### 2. Verificación de Sesión
- Validación de autenticación en cada carga del dashboard
- Verificación de expiración de sesión (24 horas)
- Redirección automática si la sesión no es válida

### 3. Manejo de Errores
- Try-catch en todas las operaciones críticas
- Mensajes de error informativos para el usuario
- Logging de errores en consola para debugging

## 🎨 Experiencia de Usuario

### 1. Modal de Confirmación Personalizado
- **Diseño**: Modal elegante que respeta los estilos de la aplicación
- **Estilos**: Utiliza las variables CSS establecidas (colores, tipografías, espaciado)
- **Botones**: "Cancelar" y "Confirmar" con estilos consistentes
- **Animaciones**: Transiciones suaves de entrada y salida
- **Responsive**: Se adapta a dispositivos móviles y desktop
- **Accesibilidad**: 
  - Botón de cierre con aria-label
  - Navegación por teclado (Escape para cerrar)
  - Foco visible en los botones

### 2. Características del Modal
- **Backdrop**: Fondo semitransparente con blur
- **Posicionamiento**: Centrado en pantalla
- **Tamaño**: Responsive (90% en móvil, máximo 400px en desktop)
- **Z-index**: 2000 para estar por encima de otros elementos
- **Múltiples formas de cerrar**:
  - Botón "Cancelar"
  - Botón "X" en la esquina superior derecha
  - Tecla Escape
  - Clic fuera del modal

### 3. Feedback Visual
- Mensajes de confirmación al cerrar sesión
- Mensajes de error si algo falla
- Redirección suave con delays apropiados

### 4. Navegación Intuitiva
- Botón de salida claramente identificado en el header
- Cursor pointer para indicar interactividad
- Transiciones suaves

## 📱 Responsive Design

El sistema de logout está integrado con el diseño responsive existente:
- Funciona correctamente en dispositivos móviles
- Mantiene la consistencia visual con el resto de la aplicación
- Utiliza los estilos CSS existentes para los iconos de navegación

## 🔄 Flujo de Cierre de Sesión

### Desde Dashboard (`dashboard.html`)
1. **Usuario hace clic en el botón de salida** (icono de exit)
2. **Sistema muestra modal personalizado** con:
   - Título: "Cerrar Sesión"
   - Mensaje: "¿Estás seguro de que quieres cerrar sesión? Todos los datos no guardados se perderán."
   - Botones: "Cancelar" y "Confirmar"
3. **Si confirma**: Se ejecuta el logout
4. **Si cancela**: El modal se cierra sin acción

### Desde Add Symptoms (`add-symptoms.html`)
1. **Usuario hace clic en el botón de salida** (icono de exit)
2. **Sistema verifica cambios sin guardar**:
   - Si hay cambios: Muestra confirmación adicional
   - Si no hay cambios: Procede directamente al modal de logout
3. **Sistema muestra modal personalizado** (mismo que dashboard)
4. **Si confirma**: Se ejecuta el logout
5. **Si cancela**: El modal se cierra sin acción

### Proceso de Logout (común para ambas páginas)
1. **Indicador de carga**: Se muestra con texto "Cerrando sesión..."
2. **Limpieza de datos**:
   - localStorage (userSession, userData, currentUser)
   - sessionStorage completo
   - Cookies de sesión
3. **Mensaje de confirmación**: "Sesión cerrada correctamente"
4. **Redirección**: Al login después de 1.5 segundos
5. **Manejo de errores**: Si hay error, se oculta el loading y se muestra mensaje de error

### Opciones de cierre del modal
- Botón "Cancelar"
- Botón "X" en la esquina superior derecha
- Tecla Escape
- Clic fuera del modal

## 🛠️ Convenciones Seguidas

### Nomenclatura
- **Funciones**: `camelCase` (ej. `handleLogout`, `checkUserAuthentication`)
- **Variables**: `camelCase` (ej. `userSession`, `confirmLogout`)
- **Métodos de clase**: `camelCase` (ej. `clearUserSession`)

### Documentación
- JSDoc completo para todas las funciones
- Comentarios explicativos en código crítico
- Parámetros y valores de retorno documentados

### Manejo de Errores
- Try-catch en operaciones que pueden fallar
- Logging de errores para debugging
- Mensajes de error amigables para el usuario

## 🚀 Uso

### Para el Usuario
1. Hacer clic en el icono de salida (exit-icon.svg) en el header del dashboard
2. Confirmar el cierre de sesión en el diálogo
3. Ser redirigido automáticamente al login

### Para Desarrolladores
```javascript
// Verificar si hay sesión activa
if (isUserLoggedIn()) {
    // Usuario autenticado
}

// Obtener datos del usuario actual
const currentUser = getCurrentUser();

// Cerrar sesión programáticamente
handleLogout();
```

## 🔮 Consideraciones Futuras

### Para Producción
- Implementar tokens JWT seguros en lugar de localStorage
- Agregar refresh tokens para sesiones más largas
- Implementar logout automático por inactividad
- Agregar logging de eventos de autenticación

### Mejoras de UX
- Implementar modal de confirmación personalizado
- Agregar opción de "Recordar sesión"
- Implementar logout automático con notificación previa
