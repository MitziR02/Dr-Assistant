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
        // Guardar sesión de usuario (simulando token de autenticación)
        const userSession = {
            userId: DEMO_USER.id,
            email: email,
            loginTime: new Date().toISOString(),
            isAuthenticated: true
        };
        
        try {
            // Guardar en localStorage (en producción sería un token JWT seguro)
            localStorage.setItem('userSession', JSON.stringify(userSession));
            
            showMessage('¡Bienvenido! Redirigiendo...', 'success');
            
            // Redirigir a la página principal
            setTimeout(() => {
                console.log('Usuario autenticado:', email);
                window.location.href = 'src/pages/dashboard.html';
            }, 1500);
            
        } catch (error) {
            console.error('Error guardando sesión:', error);
            showMessage('Error al iniciar sesión. Intenta nuevamente.', 'error');
        }
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

/**
 * Maneja el cierre de sesión del usuario
 * Limpia datos de sesión y redirige al login
 */
function handleLogout() {
    // Mostrar modal de confirmación personalizado
    modalManager.show(
        'Cerrar Sesión',
        '¿Estás seguro de que quieres cerrar sesión? Todos los datos no guardados se perderán.',
        () => {
            // Función de confirmación
            performLogout();
        },
        () => {
            // Función de cancelación (no hacer nada)
            console.log('Cierre de sesión cancelado');
        }
    );
}

/**
 * Ejecuta el proceso de cierre de sesión
 */
function performLogout() {
    try {
        // Limpiar datos de sesión del localStorage (si los hay)
        localStorage.removeItem('userSession');
        localStorage.removeItem('userData');
        sessionStorage.clear();
        
        // Limpiar cookies de sesión (si las hay)
        document.cookie = 'userSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Mostrar mensaje de confirmación
        showMessage('Sesión cerrada correctamente', 'success');
        
        // Redirigir al login después de un breve delay
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 1500);
        
    } catch (error) {
        console.error('Error durante el cierre de sesión:', error);
        showMessage('Error al cerrar sesión. Intenta nuevamente.', 'error');
    }
}

/**
 * Verifica si hay una sesión activa
 * @returns {boolean} - true si hay sesión activa
 */
function isUserLoggedIn() {
    // En un entorno real, esto verificaría tokens válidos
    // Por ahora, solo verificamos si hay datos en localStorage
    return localStorage.getItem('userSession') !== null;
}

/**
 * Obtiene los datos del usuario actual
 * @returns {Object|null} - Datos del usuario o null si no hay sesión
 */
function getCurrentUser() {
    try {
        const userSession = localStorage.getItem('userSession');
        return userSession ? JSON.parse(userSession) : null;
    } catch (error) {
        console.error('Error obteniendo datos del usuario:', error);
        return null;
    }
}

/**
 * Clase para manejar modales de confirmación
 */
class ModalManager {
    constructor() {
        this.modal = null;
        this.isVisible = false;
    }

    /**
     * Crea el HTML del modal
     * @param {string} title - Título del modal
     * @param {string} message - Mensaje del modal
     * @param {Function} onConfirm - Función a ejecutar al confirmar
     * @param {Function} onCancel - Función a ejecutar al cancelar
     * @returns {HTMLElement} - Elemento del modal
     */
    createModal(title, message, onConfirm, onCancel) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close" type="button" aria-label="Cerrar">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="modal-message">${message}</p>
                    <div class="modal-actions">
                        <button class="modal-btn modal-btn-cancel" type="button">Cancelar</button>
                        <button class="modal-btn modal-btn-confirm" type="button">Confirmar</button>
                    </div>
                </div>
            </div>
        `;

        // Event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-btn-cancel');
        const confirmBtn = modal.querySelector('.modal-btn-confirm');

        closeBtn.addEventListener('click', () => {
            this.hide();
            if (onCancel) onCancel();
        });

        cancelBtn.addEventListener('click', () => {
            this.hide();
            if (onCancel) onCancel();
        });

        confirmBtn.addEventListener('click', () => {
            this.hide();
            if (onConfirm) onConfirm();
        });

        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hide();
                if (onCancel) onCancel();
            }
        });

        // Cerrar con tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
                if (onCancel) onCancel();
            }
        });

        return modal;
    }

    /**
     * Muestra el modal de confirmación
     * @param {string} title - Título del modal
     * @param {string} message - Mensaje del modal
     * @param {Function} onConfirm - Función a ejecutar al confirmar
     * @param {Function} onCancel - Función a ejecutar al cancelar
     */
    show(title, message, onConfirm, onCancel) {
        // Remover modal existente si hay uno
        if (this.modal) {
            this.hide();
        }

        this.modal = this.createModal(title, message, onConfirm, onCancel);
        document.body.appendChild(this.modal);

        // Mostrar con animación
        setTimeout(() => {
            this.modal.classList.add('show');
            this.isVisible = true;
        }, 10);
    }

    /**
     * Oculta el modal
     */
    hide() {
        if (this.modal) {
            this.modal.classList.remove('show');
            this.isVisible = false;
            
            // Remover del DOM después de la animación
            setTimeout(() => {
                if (this.modal && this.modal.parentNode) {
                    this.modal.parentNode.removeChild(this.modal);
                }
                this.modal = null;
            }, 300);
        }
    }
}

// Instancia global del modal manager
const modalManager = new ModalManager();