/**
 * Symptoms History JavaScript - Dr Asistente
 * Maneja la visualización del historial de síntomas con línea de tiempo
 */

class SymptomsHistoryManager {
    constructor() {
        this.currentUser = null;
        this.userData = null;
        this.conditionsData = null;
        this.symptomsData = null;
        this.recordsData = null;
        this.filteredData = null;
        this.currentEditingRecord = null;
        this.loadingOverlay = null;
        
        this.init();
    }

    /**
     * Inicializa el historial de síntomas
     */
    async init() {
        try {
            // Obtener referencia al overlay de carga
            this.loadingOverlay = document.getElementById('loadingOverlay');
            
            // Mostrar icono de carga
            this.showLoading();
            
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
            
            this.setupFilters();
            this.renderTimeline();
            this.setupEventListeners();
            
            // Ocultar icono de carga después de cargar todo
            this.hideLoading();
            
        } catch (error) {
            console.error('Error inicializando historial:', error);
            this.hideLoading();
            this.showMessage('Error al cargar el historial de síntomas', 'error');
        }
    }

    /**
     * Carga datos de usuario usando DataManager
     */
    async loadUserData() {
        try {
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
     * Simula delay de API
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
     * Configura los filtros
     */
    setupFilters() {
        this.populateConditionFilter();
        this.setupFilterEventListeners();
    }

    /**
     * Pobla el filtro de condiciones
     */
    populateConditionFilter() {
        const conditionFilter = document.getElementById('conditionFilter');
        if (!conditionFilter) return;

        // Obtiene condiciones activas e inactivas (no curadas)
        const activeConditions = this.conditionsData.filter(condition => 
            !condition.isCured
        );

        // Limpia opciones existentes (excepto "Todas")
        conditionFilter.innerHTML = '<option value="all">Todas las condiciones</option>';

        // Agrega condiciones activas
        activeConditions.forEach(condition => {
            const option = document.createElement('option');
            option.value = condition.id;
            option.textContent = condition.name;
            conditionFilter.appendChild(option);
        });
    }

    /**
     * Configura event listeners de filtros
     */
    setupFilterEventListeners() {
        const conditionFilter = document.getElementById('conditionFilter');
        const dateRangeFilter = document.getElementById('dateRangeFilter');

        if (conditionFilter) {
            conditionFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }

        if (dateRangeFilter) {
            dateRangeFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
    }

    /**
     * Aplica los filtros seleccionados
     */
    applyFilters() {
        const conditionFilter = document.getElementById('conditionFilter');
        const dateRangeFilter = document.getElementById('dateRangeFilter');

        if (!conditionFilter || !dateRangeFilter) return;

        const selectedCondition = conditionFilter.value;
        const selectedDateRange = dateRangeFilter.value;

        // Filtra por condición (activas e inactivas, no curadas)
        let filteredConditions = this.conditionsData.filter(condition => 
            !condition.isCured
        );

        if (selectedCondition !== 'all') {
            filteredConditions = filteredConditions.filter(condition => 
                condition.id === selectedCondition
            );
        }

        // Filtra por rango de fechas
        if (selectedDateRange !== 'all') {
            const cutoffDate = this.getCutoffDate(selectedDateRange);
            filteredConditions = filteredConditions.filter(condition => {
                const conditionDate = new Date(condition.startDate);
                return conditionDate >= cutoffDate;
            });
        }

        this.filteredData = filteredConditions;
        this.renderTimeline();
    }

    /**
     * Obtiene la fecha de corte según el rango seleccionado
     */
    getCutoffDate(range) {
        const now = new Date();
        const cutoff = new Date(now);

        switch (range) {
            case 'week':
                cutoff.setDate(now.getDate() - 7);
                break;
            case 'month':
                cutoff.setMonth(now.getMonth() - 1);
                break;
            case '3months':
                cutoff.setMonth(now.getMonth() - 3);
                break;
            default:
                cutoff.setFullYear(now.getFullYear() - 10); // Muy atrás para incluir todo
        }

        return cutoff;
    }

    /**
     * Renderiza la línea de tiempo
     */
    renderTimeline() {
        const timelineContainer = document.getElementById('timelineContainer');
        const noDataMessage = document.getElementById('noDataMessage');

        if (!timelineContainer || !noDataMessage) return;

        // Usa datos filtrados o todos los datos (activos e inactivos, no curados)
        const dataToRender = this.filteredData || this.conditionsData.filter(condition => 
            !condition.isCured
        );

        if (dataToRender.length === 0) {
            timelineContainer.style.display = 'none';
            noDataMessage.style.display = 'block';
            return;
        }

        timelineContainer.style.display = 'block';
        noDataMessage.style.display = 'none';

        // Ordena por fecha de inicio (más reciente primero)
        const sortedConditions = dataToRender.sort((a, b) => 
            new Date(b.startDate) - new Date(a.startDate)
        );

        const timelineHTML = sortedConditions.map(condition => {
            return this.generateTimelineItem(condition);
        }).join('');

        timelineContainer.innerHTML = timelineHTML;
    }

    /**
     * Genera HTML para un item de la línea de tiempo
     */
    generateTimelineItem(condition) {
        const symptoms = this.symptomsData.filter(symptom => 
            symptom.conditionId === condition.id
        );

        const symptomsHTML = symptoms.map(symptom => {
            return this.generateSymptomItem(symptom);
        }).join('');

        const formattedStartDate = this.formatDate(condition.startDate);
        const formattedUpdateDate = this.formatDate(condition.updatedAt);

        return `
            <div class="timeline-item">
                <div class="condition-card">
                    <div class="condition-header">
                        <div>
                            <h3 class="condition-title">${condition.name}</h3>
                            <p class="condition-date">Iniciado: ${formattedStartDate}</p>
                        </div>
                        <div class="condition-status">
                            <span class="status-badge ${condition.status === 'active' ? 'status-active' : 'status-inactive'} clickable" onclick="symptomsHistory.toggleConditionStatus('${condition.id}')" title="Hacer clic para cambiar estado">${condition.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                        </div>
                    </div>
                    <p class="condition-description">${condition.description}</p>
                    <div class="symptoms-list">
                        ${symptomsHTML}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Genera HTML para un síntoma
     */
    generateSymptomItem(symptom) {
        const records = this.recordsData.filter(record => 
            record.symptomId === symptom.id
        ).sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));

        const recordsHTML = records.map(record => {
            return this.generateRecordItem(record);
        }).join('');

        return `
            <div class="symptom-item">
                <div class="symptom-header">
                    <h4 class="symptom-name">${symptom.name}</h4>
                </div>
                <p class="symptom-description">${symptom.description}</p>
                <div class="symptom-records">
                    ${recordsHTML}
                </div>
            </div>
        `;
    }

    /**
     * Genera HTML para un registro de síntoma
     */
    generateRecordItem(record) {
        const intensityColor = this.getIntensityColor(record.intensity);
        const formattedDate = this.formatDate(record.recordDate);

        return `
            <div class="record-item">
                <div class="record-header">
                    <span class="record-date">${formattedDate}</span>
                    <span class="intensity-badge ${intensityColor}">${record.intensity}/10</span>
                </div>
                ${record.notes ? `<p class="record-notes">${record.notes}</p>` : ''}
                <div class="record-actions">
                    <button class="btn-edit" onclick="symptomsHistory.editRecord('${record.id}')">
                        Editar
                    </button>
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
        // Navegación
        this.setupNavigationListeners();
        
        // Modales
        this.setupModalListeners();
        
        // Botón flotante
        this.setupFloatingButtonListener();
        
        // Formularios
        this.setupFormListeners();
    }

    /**
     * Configura listeners de navegación
     */
    setupNavigationListeners() {
        const homeBtn = document.getElementById('homeBtn');
        const addSymptomBtn = document.getElementById('addSymptomBtn');
        const exitBtn = document.getElementById('exitBtn');

        if (homeBtn) {
            homeBtn.addEventListener('click', () => {
                window.location.href = 'dashboard.html';
            });
        }

        if (addSymptomBtn) {
            addSymptomBtn.addEventListener('click', () => {
                window.location.href = 'add-symptoms.html';
            });
        }

        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                this.handleExit();
            });
        }
    }

    /**
     * Configura listeners de modales
     */
    setupModalListeners() {
        const editModal = document.getElementById('editModal');
        const addRecordModal = document.getElementById('addRecordModal');
        const closeModalBtn = document.getElementById('closeModalBtn');
        const closeAddModalBtn = document.getElementById('closeAddModalBtn');
        const cancelEditBtn = document.getElementById('cancelEditBtn');
        const cancelAddBtn = document.getElementById('cancelAddBtn');

        // Cerrar modales
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', () => {
                this.closeModal('editModal');
            });
        }

        if (closeAddModalBtn) {
            closeAddModalBtn.addEventListener('click', () => {
                this.closeModal('addRecordModal');
            });
        }

        if (cancelEditBtn) {
            cancelEditBtn.addEventListener('click', () => {
                this.closeModal('editModal');
            });
        }

        if (cancelAddBtn) {
            cancelAddBtn.addEventListener('click', () => {
                this.closeModal('addRecordModal');
            });
        }

        // Cerrar al hacer clic fuera del modal
        if (editModal) {
            editModal.addEventListener('click', (e) => {
                if (e.target === editModal) {
                    this.closeModal('editModal');
                }
            });
        }

        if (addRecordModal) {
            addRecordModal.addEventListener('click', (e) => {
                if (e.target === addRecordModal) {
                    this.closeModal('addRecordModal');
                }
            });
        }
    }

    /**
     * Configura listener del botón flotante
     */
    setupFloatingButtonListener() {
        const floatingAddBtn = document.getElementById('floatingAddBtn');
        const addFirstSymptomBtn = document.getElementById('addFirstSymptomBtn');

        if (floatingAddBtn) {
            floatingAddBtn.addEventListener('click', () => {
                this.openAddRecordModal();
            });
        }

        if (addFirstSymptomBtn) {
            addFirstSymptomBtn.addEventListener('click', () => {
                window.location.href = 'add-symptoms.html';
            });
        }
    }

    /**
     * Configura listeners de formularios
     */
    setupFormListeners() {
        const editRecordForm = document.getElementById('editRecordForm');
        const addRecordForm = document.getElementById('addRecordForm');

        if (editRecordForm) {
            editRecordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEditRecord();
            });
        }

        if (addRecordForm) {
            addRecordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddRecord();
            });
        }
    }

    /**
     * Abre el modal de edición
     */
    editRecord(recordId) {
        const record = this.recordsData.find(r => r.id === recordId);
        if (!record) return;

        this.currentEditingRecord = record;
        
        const editIntensity = document.getElementById('editIntensity');
        const editNotes = document.getElementById('editNotes');

        if (editIntensity) editIntensity.value = record.intensity;
        if (editNotes) editNotes.value = record.notes || '';

        this.openModal('editModal');
    }

    /**
     * Abre el modal de agregar registro
     */
    openAddRecordModal() {
        this.populateSymptomSelect();
        this.openModal('addRecordModal');
    }

    /**
     * Pobla el select de síntomas
     */
    populateSymptomSelect() {
        const addSymptomSelect = document.getElementById('addSymptomSelect');
        if (!addSymptomSelect) return;

        // Obtiene síntomas de condiciones activas
        const activeConditionIds = this.conditionsData
            .filter(condition => condition.status === 'active' && !condition.isCured)
            .map(condition => condition.id);

        const activeSymptoms = this.symptomsData.filter(symptom => 
            activeConditionIds.includes(symptom.conditionId)
        );

        addSymptomSelect.innerHTML = '<option value="">Selecciona un síntoma</option>';

        activeSymptoms.forEach(symptom => {
            const condition = this.conditionsData.find(c => c.id === symptom.conditionId);
            const option = document.createElement('option');
            option.value = symptom.id;
            option.textContent = `${symptom.name} (${condition?.name || 'Sin condición'})`;
            addSymptomSelect.appendChild(option);
        });
    }

    /**
     * Abre un modal
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
            // Mostrar con animación
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        }
    }

    /**
     * Cierra un modal
     */
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            // Ocultar después de la animación
            setTimeout(() => {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }, 300);
        }
    }

    /**
     * Maneja la edición de un registro
     */
    async handleEditRecord() {
        if (!this.currentEditingRecord) return;

        const editIntensity = document.getElementById('editIntensity');
        const editNotes = document.getElementById('editNotes');

        if (!editIntensity || !editNotes) return;

        try {
            const newIntensity = parseInt(editIntensity.value);
            const newNotes = editNotes.value.trim();

            // Validación de seguridad
            if (typeof securityConfig !== 'undefined') {
                const validation = securityConfig.validateSymptomRecordData({
                    intensity: newIntensity,
                    notes: newNotes
                });

                if (!validation.isValid) {
                    this.showMessage('Datos inválidos: ' + validation.errors.join(', '), 'error');
                    return;
                }
            }

            // Validación básica
            if (isNaN(newIntensity) || newIntensity < 1 || newIntensity > 10) {
                this.showMessage('La intensidad debe ser un número entre 1 y 10', 'error');
                return;
            }

            // Actualizar registro usando DataManager
            const updatedRecord = {
                ...this.currentEditingRecord,
                intensity: newIntensity,
                notes: securityConfig ? securityConfig.sanitizeText(newNotes) : newNotes,
                recordDate: new Date().toISOString()
            };

            // Guardar usando DataManager
            await dataManager.updateSymptomRecord(updatedRecord);

            // Actualizar datos locales
            const recordIndex = this.recordsData.findIndex(r => r.id === this.currentEditingRecord.id);
            if (recordIndex !== -1) {
                this.recordsData[recordIndex] = updatedRecord;
            }

            this.closeModal('editModal');
            this.renderTimeline();
            this.showMessage('Registro actualizado correctamente', 'success');

            this.currentEditingRecord = null;

        } catch (error) {
            console.error('Error actualizando registro:', error);
            this.showMessage('Error al actualizar el registro. Intenta nuevamente.', 'error');
        }
    }

    /**
     * Maneja la adición de un nuevo registro
     */
    async handleAddRecord() {
        const addSymptomSelect = document.getElementById('addSymptomSelect');
        const addIntensity = document.getElementById('addIntensity');
        const addNotes = document.getElementById('addNotes');

        if (!addSymptomSelect || !addIntensity || !addNotes) return;

        try {
            const symptomId = addSymptomSelect.value;
            const intensity = parseInt(addIntensity.value);
            const notes = addNotes.value.trim();

            // Validación básica
            if (!symptomId || !intensity) {
                this.showMessage('Por favor completa todos los campos requeridos', 'error');
                return;
            }

            // Validación de seguridad
            if (typeof securityConfig !== 'undefined') {
                const validation = securityConfig.validateSymptomRecordData({
                    intensity: intensity,
                    notes: notes
                });

                if (!validation.isValid) {
                    this.showMessage('Datos inválidos: ' + validation.errors.join(', '), 'error');
                    return;
                }
            }

            // Validación de intensidad
            if (isNaN(intensity) || intensity < 1 || intensity > 10) {
                this.showMessage('La intensidad debe ser un número entre 1 y 10', 'error');
                return;
            }

            // Crear nuevo registro
            const newRecord = {
                id: `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                symptomId: symptomId,
                intensity: intensity,
                notes: securityConfig ? securityConfig.sanitizeText(notes) : notes,
                recordDate: new Date().toISOString()
            };

            // Guardar usando DataManager
            await dataManager.addSymptomRecord(newRecord);

            // Actualizar datos locales
            this.recordsData.push(newRecord);

            this.closeModal('addRecordModal');
            this.renderTimeline();
            this.showMessage('Nuevo registro agregado correctamente', 'success');

            // Limpiar el formulario
            addSymptomSelect.value = '';
            addIntensity.value = '';
            addNotes.value = '';

        } catch (error) {
            console.error('Error agregando registro:', error);
            this.showMessage('Error al agregar el registro. Intenta nuevamente.', 'error');
        }
    }

    /**
     * Cambia el estado de una condición (activo/inactivo)
     */
    async toggleConditionStatus(conditionId) {
        const condition = this.conditionsData.find(c => c.id === conditionId);
        if (!condition) return;

        const currentStatus = condition.status === 'active' ? 'Activo' : 'Inactivo';
        const newStatus = condition.status === 'active' ? 'Inactivo' : 'Activo';
        
        // Mostrar modal de confirmación
        this.showStatusChangeConfirmation(condition, currentStatus, newStatus);
    }

    /**
     * Muestra el modal de confirmación para cambio de estado
     */
    showStatusChangeConfirmation(condition, currentStatus, newStatus) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Cambiar Estado de Condición</h3>
                    <button class="modal-close" type="button" aria-label="Cerrar">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="modal-message">
                        ¿Estás seguro de que quieres cambiar el estado de 
                        <strong>"${condition.name}"</strong> de <strong>${currentStatus}</strong> a <strong>${newStatus}</strong>?
                    </p>
                    <div class="modal-actions">
                        <button class="modal-btn modal-btn-cancel" type="button">Cancelar</button>
                        <button class="modal-btn modal-btn-confirm" type="button">Confirmar Cambio</button>
                    </div>
                </div>
            </div>
        `;

        // Agregar al DOM
        document.body.appendChild(modal);

        // Mostrar modal con animación
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-btn-cancel');
        const confirmBtn = modal.querySelector('.modal-btn-confirm');

        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        confirmBtn.addEventListener('click', async () => {
            closeModal();
            await this.performStatusChange(condition);
        });

        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Cerrar con tecla Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }

    /**
     * Ejecuta el cambio de estado de la condición
     */
    async performStatusChange(condition) {
        try {
            this.updateLoadingText('Actualizando estado...');
            this.showLoading();

            // Cambiar estado
            const newStatus = condition.status === 'active' ? 'inactive' : 'active';
            const updatedCondition = {
                ...condition,
                status: newStatus,
                updatedAt: new Date().toISOString()
            };

            // Guardar usando DataManager
            await dataManager.updateCondition(updatedCondition.id, updatedCondition);

            // Actualizar datos locales
            const conditionIndex = this.conditionsData.findIndex(c => c.id === condition.id);
            if (conditionIndex !== -1) {
                this.conditionsData[conditionIndex] = updatedCondition;
            }

            this.hideLoading();
            this.renderTimeline();
            this.showMessage(`Condición marcada como ${newStatus === 'active' ? 'Activa' : 'Inactiva'}`, 'success');

        } catch (error) {
            console.error('Error cambiando estado:', error);
            this.hideLoading();
            this.showMessage('Error al cambiar el estado. Intenta nuevamente.', 'error');
        }
    }

    /**
     * Maneja la salida de la aplicación
     */
    handleExit() {
        // Mostrar modal de confirmación personalizado
        this.showLogoutConfirmation();
    }

    /**
     * Muestra el modal de confirmación de logout
     */
    showLogoutConfirmation() {
        // Crear modal de confirmación personalizado
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Cerrar Sesión</h3>
                    <button class="modal-close" type="button" aria-label="Cerrar">&times;</button>
                </div>
                <div class="modal-body">
                    <p class="modal-message">¿Estás seguro de que quieres cerrar sesión? Todos los datos no guardados se perderán.</p>
                    <div class="modal-actions">
                        <button class="modal-btn modal-btn-cancel" type="button">Cancelar</button>
                        <button class="modal-btn modal-btn-confirm" type="button">Confirmar</button>
                    </div>
                </div>
            </div>
        `;

        // Agregar al DOM
        document.body.appendChild(modal);

        // Mostrar modal con animación
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);

        // Event listeners
        const closeBtn = modal.querySelector('.modal-close');
        const cancelBtn = modal.querySelector('.modal-btn-cancel');
        const confirmBtn = modal.querySelector('.modal-btn-confirm');

        const closeModal = () => {
            modal.classList.remove('show');
            setTimeout(() => {
                if (modal.parentNode) {
                    modal.parentNode.removeChild(modal);
                }
            }, 300);
        };

        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        confirmBtn.addEventListener('click', () => {
            closeModal();
            this.performLogout();
        });

        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Cerrar con tecla Escape
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                closeModal();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
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

// Variable global para acceso desde HTML
let symptomsHistory;

// Inicializa el historial cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    symptomsHistory = new SymptomsHistoryManager();
});
