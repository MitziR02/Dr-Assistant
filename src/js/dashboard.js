/**
 * Dashboard JavaScript - Dr Asistente
 * Maneja la carga dinámica de datos y simulación de API
 */

class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.conditionsData = null;
        this.symptomsData = null;
        this.recordsData = null;
        this.loadingOverlay = null;
        
        this.init();
    }

    /**
     * Inicializa el dashboard
     */
    async init() {
        try {
            // Obtener referencia al overlay de carga
            this.loadingOverlay = document.getElementById('loadingOverlay');
            
            // Mostrar icono de carga
            this.showLoading();
            
            // Verificar si el usuario está autenticado
            if (!this.checkUserAuthentication()) {
                this.hideLoading();
                this.redirectToLogin();
                return;
            }

            this.updateLoadingText('Inicializando datos...');
            await dataManager.initializeDefaultData();
            
            this.updateLoadingText('Cargando datos de usuario...');
            await this.loadUserData();
            
            this.updateLoadingText('Cargando condiciones médicas...');
            await this.loadConditionsData();
            
            this.updateLoadingText('Cargando síntomas...');
            await this.loadSymptomsData();
            
            this.updateLoadingText('Cargando registros...');
            await this.loadRecordsData();
            
            this.renderDashboard();
            this.setupEventListeners();
            
            // Ocultar icono de carga después de cargar todo
            this.hideLoading();
            
        } catch (error) {
            console.error('Error inicializando dashboard:', error);
            this.hideLoading();
            this.showMessage('Error al cargar los datos del dashboard', 'error');
        }
    }

    /**
     * Carga datos de usuario usando DataManager
     */
    async loadUserData() {
        try {
            // Simula delay de API
            await this.simulateApiDelay();
            
            this.currentUser = await dataManager.getCurrentUser();
            this.userData = await dataManager.loadData();
            
        } catch (error) {
            console.error('Error cargando datos de usuario:', error);
            throw error;
        }
    }

    /**
     * Carga datos de condiciones usando DataManager
     */
    async loadConditionsData() {
        try {
            await this.simulateApiDelay();
            this.conditionsData = await dataManager.getConditions();
        } catch (error) {
            console.error('Error cargando condiciones:', error);
            throw error;
        }
    }

    /**
     * Carga datos de síntomas usando DataManager
     */
    async loadSymptomsData() {
        try {
            await this.simulateApiDelay();
            this.symptomsData = await dataManager.getAllSymptoms();
        } catch (error) {
            console.error('Error cargando síntomas:', error);
            throw error;
        }
    }

    /**
     * Carga datos de registros usando DataManager
     */
    async loadRecordsData() {
        try {
            await this.simulateApiDelay();
            this.recordsData = await dataManager.getSymptomRecords();
        } catch (error) {
            console.error('Error cargando registros:', error);
            throw error;
        }
    }

    /**
     * Simula delay de API (1-2 segundos)
     */
    simulateApiDelay() {
        return new Promise(resolve => {
            setTimeout(resolve, Math.random() * 1000 + 500);
        });
    }

    /**
     * Muestra el icono de carga
     */
    showLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.remove('hidden');
        }
    }

    /**
     * Oculta el icono de carga
     */
    hideLoading() {
        if (this.loadingOverlay) {
            this.loadingOverlay.classList.add('hidden');
        }
    }

    /**
     * Actualiza el texto del icono de carga
     */
    updateLoadingText(text) {
        const loadingText = this.loadingOverlay?.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    /**
     * Verifica si el usuario está autenticado
     * @returns {boolean} - true si está autenticado
     */
    checkUserAuthentication() {
        try {
            const userSession = localStorage.getItem('userSession');
            if (!userSession) {
                return false;
            }

            const session = JSON.parse(userSession);
            
            // Verificar que la sesión sea válida
            if (!session.isAuthenticated || !session.userId) {
                return false;
            }

            // Verificar que la sesión no haya expirado (24 horas)
            const loginTime = new Date(session.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            if (hoursDiff > 24) {
                // Sesión expirada, limpiar datos
                this.clearUserSession();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            return false;
        }
    }

    /**
     * Redirige al usuario al login
     */
    redirectToLogin() {
        this.showMessage('Sesión no válida. Redirigiendo al login...', 'error');
        setTimeout(() => {
            window.location.href = '../../index.html';
        }, 2000);
    }

    /**
     * Limpia la sesión del usuario
     */
    clearUserSession() {
        localStorage.removeItem('userSession');
        localStorage.removeItem('userData');
        sessionStorage.clear();
    }

    /**
     * Renderiza el dashboard con los datos cargados
     */
    renderDashboard() {
        this.renderWelcomeMessage();
        this.renderChronicReminders();
        this.renderLatestRecords();
    }

    /**
     * Renderiza el mensaje de bienvenida con el nombre del usuario
     */
    renderWelcomeMessage() {
        const welcomeElement = document.getElementById('welcomeMessage');
        if (this.currentUser && welcomeElement) {
            const firstName = this.currentUser.name.split(' ')[0];
            welcomeElement.textContent = `¡Bienvenido, ${firstName}!`;
        }
    }

    /**
     * Renderiza los recordatorios para condiciones crónicas
     */
    renderChronicReminders() {
        const remindersContainer = document.getElementById('chronicReminders');
        if (!remindersContainer || !this.currentUser) return;

        const chronicConditions = this.currentUser.profile.chronicConditions;
        
        if (chronicConditions.length === 0) {
            remindersContainer.innerHTML = `
                <div class="reminder-card no-reminders">
                    <p>No tienes condiciones crónicas registradas</p>
                </div>
            `;
            return;
        }

        const remindersHTML = chronicConditions.map(condition => {
            return this.generateReminderCard(condition);
        }).join('');

        remindersContainer.innerHTML = remindersHTML;
    }

    /**
     * Genera HTML para una tarjeta de recordatorio
     */
    generateReminderCard(condition) {
        const tips = this.getConditionTips(condition);
        
        return `
            <div class="reminder-card">
                <div class="reminder-header">
                    <h4>${condition}</h4>
                </div>
                <div class="reminder-content">
                    <div class="medication-reminder">
                        <strong>Medicación:</strong>
                        <p>${tips.medication}</p>
                    </div>
                    <div class="nutrition-tips">
                        <strong>Alimentación:</strong>
                        <p>${tips.nutrition}</p>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Obtiene tips específicos para cada condición
     */
    getConditionTips(condition) {
        const tipsMap = {
            'Hipertensión': {
                medication: 'Toma tu medicamento antihipertensivo según prescripción médica',
                nutrition: 'Reduce el consumo de sodio, aumenta potasio y mantén una dieta DASH'
            },
            'Diabetes': {
                medication: 'Monitorea tu glucosa y toma tu medicamento según indicación',
                nutrition: 'Controla carbohidratos, consume fibra y mantén horarios regulares'
            },
            'Asma': {
                medication: 'Ten siempre tu inhalador de rescate disponible',
                nutrition: 'Evita alimentos que puedan desencadenar alergias'
            }
        };

        return tipsMap[condition] || {
            medication: 'Sigue las indicaciones de tu médico',
            nutrition: 'Mantén una dieta balanceada y saludable'
        };
    }

    /**
     * Renderiza los últimos registros de síntomas
     */
    renderLatestRecords() {
        const recordsContainer = document.getElementById('latestRecords');
        if (!recordsContainer || !this.recordsData) return;

        // Obtiene los últimos 3 registros ordenados por fecha
        const latestRecords = this.recordsData
            .sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate))
            .slice(0, 3);

        if (latestRecords.length === 0) {
            recordsContainer.innerHTML = `
                <div class="record-card no-records">
                    <p>No hay registros de síntomas disponibles</p>
                </div>
            `;
            return;
        }

        const recordsHTML = latestRecords.map(record => {
            return this.generateRecordCard(record);
        }).join('');

        recordsContainer.innerHTML = recordsHTML;
    }

    /**
     * Genera HTML para una tarjeta de registro
     */
    generateRecordCard(record) {
        const symptom = this.symptomsData.find(s => s.id === record.symptomId);
        const condition = this.conditionsData.find(c => c.id === symptom?.conditionId);
        
        const intensityColor = this.getIntensityColor(record.intensity);
        const formattedDate = this.formatDate(record.recordDate);
        
        return `
            <div class="record-card">
                <div class="record-header">
                    <h4>${symptom?.name || 'Síntoma desconocido'}</h4>
                    <span class="intensity-badge ${intensityColor}">${record.intensity}/10</span>
                </div>
                <div class="record-details">
                    <p class="condition-name">${condition?.name || 'Condición no especificada'}</p>
                    <p class="record-date">${formattedDate}</p>
                    ${record.notes ? `<p class="record-notes">${record.notes}</p>` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Obtiene el color según la intensidad del síntoma
     */
    getIntensityColor(intensity) {
        if (intensity <= 3) return 'intensity-low';
        if (intensity <= 6) return 'intensity-medium';
        return 'intensity-high';
    }

    /**
     * Formatea la fecha para mostrar
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Botón de registro de síntoma
        const registerSymptomBtn = document.getElementById('registerSymptomBtn');
        if (registerSymptomBtn) {
            registerSymptomBtn.addEventListener('click', () => {
                this.handleRegisterSymptom();
            });
        }

        // Botón de nueva condición
        const newConditionBtn = document.getElementById('newConditionBtn');
        if (newConditionBtn) {
            newConditionBtn.addEventListener('click', () => {
                this.handleNewCondition();
            });
        }

        // Botón de ver todos los registros
        const viewAllRecordsBtn = document.getElementById('viewAllRecordsBtn');
        if (viewAllRecordsBtn) {
            viewAllRecordsBtn.addEventListener('click', () => {
                this.handleViewAllRecords();
            });
        }

        // Botón de cierre de sesión
        const logoutBtn = document.querySelector('.nav-icon[alt="Exit"]');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }
    }

    /**
     * Maneja el clic en registrar síntoma
     */
    handleRegisterSymptom() {
        this.showMessage('Funcionalidad de registro de síntomas en desarrollo', 'info');
        // TODO: Implementar navegación a página de registro de síntomas
    }

    /**
     * Maneja el clic en nueva condición
     */
    handleNewCondition() {
        this.updateLoadingText('Navegando a registro de síntomas...');
        this.showLoading();
        setTimeout(() => {
            window.location.href = 'add-symptoms.html';
        }, 500);
    }

    /**
     * Maneja el clic en ver todos los registros
     */
    handleViewAllRecords() {
        this.showMessage('Funcionalidad de historial completo en desarrollo', 'info');
        // TODO: Implementar navegación a página de historial
    }

    /**
     * Maneja el cierre de sesión
     */
    handleLogout() {
        // Verificar si modalManager está disponible (desde auth.js)
        if (typeof modalManager !== 'undefined') {
            // Usar modal personalizado
            modalManager.show(
                'Cerrar Sesión',
                '¿Estás seguro de que quieres cerrar sesión? Todos los datos no guardados se perderán.',
                () => {
                    // Función de confirmación
                    this.performLogout();
                },
                () => {
                    // Función de cancelación (no hacer nada)
                    console.log('Cierre de sesión cancelado');
                }
            );
        } else {
            // Fallback a confirm nativo si modalManager no está disponible
            const confirmLogout = confirm('¿Estás seguro de que quieres cerrar sesión?');
            if (confirmLogout) {
                this.performLogout();
            }
        }
    }

    /**
     * Ejecuta el proceso de cierre de sesión
     */
    performLogout() {
        try {
            this.updateLoadingText('Cerrando sesión...');
            this.showLoading();
            
            // Limpiar datos de sesión
            this.clearUserSession();
            
            // Limpiar cookies de sesión (si las hay)
            document.cookie = 'userSession=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            
            // Mostrar mensaje de confirmación
            this.showMessage('Sesión cerrada correctamente', 'success');
            
            // Redirigir al login después de un breve delay
            setTimeout(() => {
                window.location.href = '../../index.html';
            }, 1500);
            
        } catch (error) {
            console.error('Error durante el cierre de sesión:', error);
            this.hideLoading();
            this.showMessage('Error al cerrar sesión. Intenta nuevamente.', 'error');
        }
    }

    /**
     * Muestra mensajes al usuario
     */
    showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('messageContainer');
        if (!messageContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message message-${type}`;
        messageElement.textContent = message;

        messageContainer.innerHTML = '';
        messageContainer.appendChild(messageElement);

        // Auto-remove después de 5 segundos
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.parentNode.removeChild(messageElement);
            }
        }, 5000);
    }
}

// Inicializa el dashboard cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});
