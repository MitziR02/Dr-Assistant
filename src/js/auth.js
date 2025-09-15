/**
 * Sistema de autenticación para Dr Asistente
 * Maneja login y cuenta demo (registro deshabilitado en modo demo)
 */

// Datos de la cuenta demo (simulando la base de datos)
const DEMO_USER = {
    id: "user-001",
    name: "Usuario Demo",
    email: "demo@drasistente.com",
    password: "demo123456"
};

// Elementos del DOM
const loginSwitch = document.getElementById('loginSwitch');
const registerSwitch = document.getElementById('registerSwitch');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const demoLoginBtn = document.getElementById('demoLogin');
const messageContainer = document.getElementById('messageContainer');

// Estado actual del formulario
let currentForm = 'login';

/**
 * Inicializa los event listeners cuando el DOM está listo
 */
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
});

/**
 * Configura todos los event listeners
 */
function initializeEventListeners() {
    // Inicializar estado de los botones
    switchToForm('login');
    
    // Switch entre formularios
    loginSwitch.addEventListener('click', () => switchToForm('login'));
    registerSwitch.addEventListener('click', handleRegisterSwitch);
    
    // Envío de formularios
    loginForm.addEventListener('submit', handleLogin);
    // registerForm no tiene event listener ya que está deshabilitado
    
    // Botón de cuenta demo
    demoLoginBtn.addEventListener('click', handleDemoLogin);
}

/**
 * Maneja el clic en el botón de registro
 * Muestra el formulario deshabilitado y un toast informativo
 */
function handleRegisterSwitch() {
    // Cambiar al formulario de registro
    switchToForm('register');
    
    // Mostrar toast informativo
    showMessage('Usa la cuenta demo para probar la aplicación.', 'info');
}

/**
 * Cambia entre formulario de login y registro
 * @param {string} formType - 'login' o 'register'
 */
function switchToForm(formType) {
    // Actualizar botones del switch
    if (formType === 'login') {
        loginSwitch.classList.add('active');
        registerSwitch.classList.remove('active');
    } else {
        loginSwitch.classList.remove('active');
        registerSwitch.classList.add('active');
    }
    
    // Mostrar/ocultar formularios
    if (formType === 'login') {
        loginForm.classList.remove('inactive');
        loginForm.classList.add('active');
        registerForm.classList.add('inactive');
        registerForm.classList.remove('active');
    } else {
        loginForm.classList.add('inactive');
        loginForm.classList.remove('active');
        registerForm.classList.remove('inactive');
        registerForm.classList.add('active');
    }
    
    // Limpiar mensajes y formularios
    clearMessages();
    clearForms();
    
    currentForm = formType;
}

/**
 * Maneja el envío del formulario de login
 * @param {Event} event - Evento de envío del formulario
 */
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validación básica
    if (!email || !password) {
        showMessage('Por favor, completa todos los campos', 'error');
        return;
    }
    
    // Simular autenticación (en producción esto sería una llamada a la API)
    if (authenticateUser(email, password)) {
        showMessage('¡Bienvenido! Redirigiendo...', 'success');
        // Aquí redirigirías a la página principal
        setTimeout(() => {
            console.log('Usuario autenticado:', email);
            window.location.href = 'src/pages/dashboard.html';
        }, 1500);
    } else {
        showMessage('Credenciales incorrectas. Intenta nuevamente.', 'error');
    }
}


/**
 * Maneja el login con cuenta demo
 */
function handleDemoLogin() {
    // Pre-llenar formulario con datos demo
    document.getElementById('loginEmail').value = DEMO_USER.email;
    document.getElementById('loginPassword').value = DEMO_USER.password;
    
    showMessage('Datos de cuenta demo cargados. Haz clic en "Iniciar Sesión"', 'info');
}

/**
 * Simula la autenticación de usuario
 * @param {string} email - Email del usuario
 * @param {string} password - Contraseña del usuario
 * @returns {boolean} - true si la autenticación es exitosa
 */
function authenticateUser(email, password) {
    // En un entorno real, esto sería una llamada a la API
    // Por ahora, solo validamos la cuenta demo
    return email === DEMO_USER.email && password === DEMO_USER.password;
}



/**
 * Muestra un mensaje al usuario
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de mensaje: 'success', 'error', 'info'
 */
function showMessage(message, type = 'info') {
    messageContainer.innerHTML = `
        <div class="message message-${type}">
            ${message}
        </div>
    `;
    
    // Auto-ocultar mensajes de éxito e info después de 5 segundos
    if (type === 'success' || type === 'info') {
        setTimeout(() => {
            clearMessages();
        }, 5000);
    }
}

/**
 * Limpia los mensajes mostrados
 */
function clearMessages() {
    messageContainer.innerHTML = '';
}

/**
 * Limpia todos los formularios
 */
function clearForms() {
    loginForm.reset();
    // registerForm no se limpia ya que está deshabilitado
    clearMessages();
}
