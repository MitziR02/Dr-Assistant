/**
 * Funcionalidad para la página de agregar síntomas
 * Maneja el formulario de padecimientos y síntomas con calificación de intensidad
 */

class AddSymptomsManager {
    constructor() {
        this.symptomCounter = 0;
        this.symptomTemplate = document.getElementById('symptomTemplate');
        this.symptomsContainer = document.getElementById('symptomsContainer');
        this.conditionForm = document.getElementById('conditionForm');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setDefaultDate();
    }

    setupEventListeners() {
        // Botón para agregar síntomas
        document.getElementById('addSymptomBtn').addEventListener('click', () => {
            this.addSymptom();
        });

        // Formulario principal
        this.conditionForm.addEventListener('submit', (e) => {
            this.handleFormSubmit(e);
        });

        // Botón cancelar
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.handleCancel();
        });

        // Navegación
        this.setupNavigation();
    }

    setupNavigation() {
        // Botón home
        document.querySelector('a[href="dashboard.html"]').addEventListener('click', (e) => {
            if (this.hasUnsavedChanges()) {
                e.preventDefault();
                this.showConfirmDialog('¿Estás seguro? Tienes cambios sin guardar.', () => {
                    window.location.href = 'dashboard.html';
                });
            }
        });

        // Botón exit
        document.querySelector('.nav-icon[alt="Exit"]').addEventListener('click', () => {
            if (this.hasUnsavedChanges()) {
                this.showConfirmDialog('¿Estás seguro? Tienes cambios sin guardar.', () => {
                    this.logout();
                });
            } else {
                this.logout();
            }
        });
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('startDate').value = today;
    }

    addFirstSymptom() {
        this.addSymptom();
    }

    addSymptom() {
        this.symptomCounter++;
        
        // Clonar el template
        const symptomElement = this.symptomTemplate.content.cloneNode(true);
        const symptomCard = symptomElement.querySelector('.symptom-card');
        
        // Configurar el índice del síntoma
        symptomCard.setAttribute('data-symptom-index', this.symptomCounter);
        symptomCard.querySelector('.symptom-number').textContent = this.symptomCounter;
        
        // Configurar nombres únicos para los inputs
        this.setupSymptomInputs(symptomCard);
        
        // Agregar event listeners para este síntoma
        this.setupSymptomEventListeners(symptomCard);
        
        // Agregar al contenedor
        this.symptomsContainer.appendChild(symptomElement);
        
        // Scroll suave al nuevo síntoma
        symptomCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Enfocar el primer input del nuevo síntoma
        setTimeout(() => {
            symptomCard.querySelector('input[name="symptomName"]').focus();
        }, 300);
    }

    setupSymptomInputs(symptomCard) {
        const index = symptomCard.getAttribute('data-symptom-index');
        
        // Configurar nombres únicos
        symptomCard.querySelector('input[name="symptomName"]').name = `symptomName_${index}`;
        symptomCard.querySelector('textarea[name="symptomDescription"]').name = `symptomDescription_${index}`;
        symptomCard.querySelector('input[name="symptomIntensity"]').name = `symptomIntensity_${index}`;
        symptomCard.querySelector('textarea[name="symptomNotes"]').name = `symptomNotes_${index}`;
    }

    setupSymptomEventListeners(symptomCard) {
        const index = symptomCard.getAttribute('data-symptom-index');
        
        // Botón eliminar síntoma
        symptomCard.querySelector('.remove-symptom-btn').addEventListener('click', () => {
            this.removeSymptom(symptomCard);
        });

        // Slider de intensidad
        const intensitySlider = symptomCard.querySelector('.intensity-slider');
        const intensityValue = symptomCard.querySelector('.intensity-value');
        
        intensitySlider.addEventListener('input', (e) => {
            intensityValue.textContent = e.target.value;
            this.updateIntensityColor(e.target);
        });

        // Validación en tiempo real
        const inputs = symptomCard.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
        });
    }

    updateIntensityColor(slider) {
        const value = parseInt(slider.value);
        const thumb = slider;
        
        // Remover clases de color anteriores
        thumb.classList.remove('intensity-1', 'intensity-2', 'intensity-3', 'intensity-4', 'intensity-5');
        
        // Agregar clase según el valor
        if (value <= 2) {
            thumb.classList.add('intensity-1');
        } else if (value <= 4) {
            thumb.classList.add('intensity-2');
        } else if (value <= 6) {
            thumb.classList.add('intensity-3');
        } else if (value <= 8) {
            thumb.classList.add('intensity-4');
        } else {
            thumb.classList.add('intensity-5');
        }
    }

    removeSymptom(symptomCard) {
        const totalSymptoms = this.symptomsContainer.children.length;
        
        if (totalSymptoms <= 1) {
            this.showMessage('Debe haber al menos un síntoma', 'error');
            return;
        }

        // Animación de salida
        symptomCard.style.animation = 'slideOut 0.3s ease-in';
        
        setTimeout(() => {
            symptomCard.remove();
            this.renumberSymptoms();
        }, 300);
    }

    renumberSymptoms() {
        const symptoms = this.symptomsContainer.querySelectorAll('.symptom-card');
        symptoms.forEach((symptom, index) => {
            const newIndex = index + 1;
            symptom.setAttribute('data-symptom-index', newIndex);
            symptom.querySelector('.symptom-number').textContent = newIndex;
            
            // Actualizar nombres de inputs
            this.setupSymptomInputs(symptom);
        });
    }

    validateInput(input) {
        const value = input.value.trim();
        const isRequired = input.hasAttribute('required');
        
        if (isRequired && !value) {
            this.showInputError(input, 'Este campo es obligatorio');
            return false;
        }
        
        this.clearInputError(input);
        return true;
    }

    showInputError(input, message) {
        this.clearInputError(input);
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        input.parentNode.appendChild(errorDiv);
        input.style.borderColor = '#ff6b6b';
    }

    clearInputError(input) {
        const existingError = input.parentNode.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }
        input.style.borderColor = '';
    }

    validateForm() {
        let isValid = true;
        
        // Validar información del padecimiento
        const conditionName = document.getElementById('conditionName');
        const startDate = document.getElementById('startDate');
        
        if (!this.validateInput(conditionName)) isValid = false;
        if (!this.validateInput(startDate)) isValid = false;
        
        // Validar síntomas
        const symptoms = this.symptomsContainer.querySelectorAll('.symptom-card');
        if (symptoms.length === 0) {
            this.showMessage('Debe agregar al menos un síntoma', 'error');
            isValid = false;
        }
        
        symptoms.forEach(symptom => {
            const nameInput = symptom.querySelector('input[name*="symptomName"]');
            const intensityInput = symptom.querySelector('input[name*="symptomIntensity"]');
            
            if (!this.validateInput(nameInput)) isValid = false;
            if (!this.validateInput(intensityInput)) isValid = false;
        });
        
        return isValid;
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        if (!this.validateForm()) {
            this.showMessage('Por favor, completa todos los campos obligatorios', 'error');
            return;
        }
        
        const formData = this.collectFormData();
        this.saveCondition(formData);
    }

    collectFormData() {
        const formData = {
            condition: {
                name: document.getElementById('conditionName').value.trim(),
                description: document.getElementById('conditionDescription').value.trim(),
                startDate: document.getElementById('startDate').value,
                createdAt: new Date().toISOString()
            },
            symptoms: []
        };
        
        // Recopilar síntomas
        const symptoms = this.symptomsContainer.querySelectorAll('.symptom-card');
        symptoms.forEach(symptom => {
            const symptomData = {
                name: symptom.querySelector('input[name*="symptomName"]').value.trim(),
                description: symptom.querySelector('textarea[name*="symptomDescription"]').value.trim(),
                intensity: parseInt(symptom.querySelector('input[name*="symptomIntensity"]').value),
                notes: symptom.querySelector('textarea[name*="symptomNotes"]').value.trim(),
                createdAt: new Date().toISOString()
            };
            
            formData.symptoms.push(symptomData);
        });
        
        return formData;
    }

    async saveCondition(formData) {
        try {
            this.showMessage('Guardando padecimiento...', 'info');
            
            // Simular guardado (en una implementación real, esto sería una llamada a la API)
            await this.simulateSave(formData);
            
            this.showMessage('¡Padecimiento guardado exitosamente!', 'success');
            
            // Limpiar formulario después de un breve delay
            setTimeout(() => {
                this.resetForm();
                window.location.href = 'dashboard.html';
            }, 2000);
            
        } catch (error) {
            console.error('Error al guardar:', error);
            this.showMessage('Error al guardar el padecimiento. Inténtalo de nuevo.', 'error');
        }
    }

    async simulateSave(formData) {
        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Usar DataManager para guardar los datos
        try {
            const newCondition = await dataManager.saveCondition(formData);
            console.log('Condición guardada exitosamente:', newCondition);
            return newCondition;
        } catch (error) {
            console.error('Error guardando condición:', error);
            throw error;
        }
    }

    resetForm() {
        this.conditionForm.reset();
        this.setDefaultDate();
        this.symptomsContainer.innerHTML = '';
        this.symptomCounter = 0;
        this.addFirstSymptom();
    }

    handleCancel() {
        if (this.hasUnsavedChanges()) {
            this.showConfirmDialog('¿Estás seguro? Se perderán los cambios no guardados.', () => {
                window.location.href = 'dashboard.html';
            });
        } else {
            window.location.href = 'dashboard.html';
        }
    }

    hasUnsavedChanges() {
        const conditionName = document.getElementById('conditionName').value.trim();
        const conditionDescription = document.getElementById('conditionDescription').value.trim();
        
        if (conditionName || conditionDescription) {
            return true;
        }
        
        const symptoms = this.symptomsContainer.querySelectorAll('.symptom-card');
        for (let symptom of symptoms) {
            const name = symptom.querySelector('input[name*="symptomName"]').value.trim();
            const description = symptom.querySelector('textarea[name*="symptomDescription"]').value.trim();
            const notes = symptom.querySelector('textarea[name*="symptomNotes"]').value.trim();
            
            if (name || description || notes) {
                return true;
            }
        }
        
        return false;
    }

    showConfirmDialog(message, onConfirm) {
        if (confirm(message)) {
            onConfirm();
        }
    }

    showMessage(message, type = 'info') {
        const messageContainer = document.getElementById('messageContainer');
        
        // Limpiar mensajes anteriores
        messageContainer.innerHTML = '';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message message-${type}`;
        messageDiv.textContent = message;
        
        messageContainer.appendChild(messageDiv);
        
        // Auto-remover después de 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
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

    logout() {
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
            localStorage.removeItem('userSession');
            localStorage.removeItem('userData');
            localStorage.removeItem('currentUser');
            sessionStorage.clear();
            
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
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new AddSymptomsManager();
});

// Agregar estilos para animación de salida
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
    
    .message {
        padding: 1rem;
        border-radius: 0.5rem;
        margin: 1rem 0;
        font-family: var(--font-text);
        animation: slideIn 0.3s ease-out;
    }
    
    .message-success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .message-error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .message-info {
        background: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
    }
`;
document.head.appendChild(style);
