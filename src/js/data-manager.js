/**
 * Data Manager - Dr Asistente
 * Maneja las operaciones de datos JSON para la aplicación
 * 
 * ⚠️ IMPORTANTE: Este es un prototipo que usa localStorage para simulación.
 * En producción, los datos médicos sensibles NO deben almacenarse en el cliente.
 */

class DataManager {
    constructor() {
        // Detectar la ruta correcta según el entorno
        this.dataFile = this.getDataFilePath();
        this.cache = null;
        this.cacheTimestamp = null;
        this.cacheTimeout = 30000; // 30 segundos
        
        // Configuración de seguridad
        this.isProduction = false; // Cambiar a true en producción
        this.maxDataSize = 1024 * 1024; // 1MB límite para localStorage
        this.allowedDataTypes = ['string', 'number', 'boolean', 'object'];
    }

    /**
     * Obtiene la ruta correcta del archivo de datos según el entorno
     */
    getDataFilePath() {
        const hostname = window.location.hostname;
        const protocol = window.location.protocol;
        
        // Si estamos en un entorno desplegado, usar rutas absolutas
        if (hostname !== 'localhost' && hostname !== '127.0.0.1' && protocol !== 'file:') {
            return './src/data/users-db.json';
        }
        
        // Para desarrollo local, usar ruta relativa
        return '../../src/data/users-db.json';
    }

    /**
     * Valida y sanitiza datos de entrada usando configuración de seguridad
     */
    validateAndSanitizeInput(data, type = 'general') {
        if (!data || typeof data !== 'object') {
            throw new Error('Datos inválidos: debe ser un objeto');
        }

        // Usar configuración de seguridad
        if (typeof securityConfig === 'undefined') {
            throw new Error('Configuración de seguridad no disponible');
        }

        // Validar según tipo usando securityConfig
        if (type === 'condition') {
            const validation = securityConfig.validateConditionData(data);
            if (!validation.isValid) {
                throw new Error('Datos de condición inválidos: ' + validation.errors.join(', '));
            }
            
            // Sanitizar campos de texto
            data.name = securityConfig.sanitizeText(data.name);
            data.description = securityConfig.sanitizeText(data.description || '');
        }

        if (type === 'symptom') {
            const validation = securityConfig.validateSymptomData(data);
            if (!validation.isValid) {
                throw new Error('Datos de síntoma inválidos: ' + validation.errors.join(', '));
            }
            
            // Sanitizar campos de texto
            data.name = securityConfig.sanitizeText(data.name);
            data.description = securityConfig.sanitizeText(data.description || '');
            data.notes = securityConfig.sanitizeText(data.notes || '');
            
            // Validar intensidad
            data.intensity = parseInt(data.intensity);
        }

        return data;
    }

    /**
     * Valida formato de fecha usando configuración de seguridad
     */
    isValidDate(dateString) {
        return securityConfig.isValidDate(dateString);
    }

    /**
     * Verifica si el uso de localStorage es seguro
     */
    isLocalStorageSafe() {
        return securityConfig.isLocalStorageSafe();
    }

    /**
     * Carga los datos desde el archivo JSON
     */
    async loadData() {
        try {
            // Verificar si tenemos datos en caché válidos
            if (this.cache && this.cacheTimestamp && 
                (Date.now() - this.cacheTimestamp) < this.cacheTimeout) {
                return this.cache;
            }

            // En producción, solo cargar desde API
            if (this.isProduction) {
                throw new Error('En producción, use APIs seguras para datos médicos');
            }

            // Intentar cargar desde localStorage primero
            if (this.isLocalStorageSafe()) {
                try {
                    const localData = localStorage.getItem('drAssistantData');
                    if (localData) {
                        // Validar tamaño de datos
                        if (localData.length > this.maxDataSize) {
                            console.warn('Datos demasiado grandes, limpiando caché');
                            localStorage.removeItem('drAssistantData');
                        } else {
                            this.cache = JSON.parse(localData);
                            this.cacheTimestamp = Date.now();
                            console.log('✅ Datos cargados desde localStorage');
                            return this.cache;
                        }
                    }
                } catch (localError) {
                    console.warn('Error cargando desde localStorage:', localError);
                    // Continuar con la carga desde archivo
                }
            }

            // Si no hay datos locales, cargar desde el archivo JSON
            try {
                const response = await fetch(this.dataFile);
                if (!response.ok) {
                    throw new Error(`Error cargando datos: ${response.status}`);
                }
                
                this.cache = await response.json();
                this.cacheTimestamp = Date.now();
                
                // Guardar en localStorage si es seguro
                if (this.isLocalStorageSafe()) {
                    localStorage.setItem('drAssistantData', JSON.stringify(this.cache));
                }
                
                return this.cache;
            } catch (fetchError) {
                console.warn('No se pudo cargar desde archivo JSON:', fetchError);
                // Si falla la carga del archivo, usar datos de ejemplo
                this.cache = this.getDefaultData();
                this.cacheTimestamp = Date.now();
                
                // Guardar datos de ejemplo en localStorage
                if (this.isLocalStorageSafe()) {
                    localStorage.setItem('drAssistantData', JSON.stringify(this.cache));
                }
                
                return this.cache;
            }
        } catch (error) {
            console.error('Error cargando datos:', error);
            // Retornar estructura vacía si hay error
            return this.getEmptyDataStructure();
        }
    }

    /**
     * Guarda los datos de forma segura
     */
    async saveData(data) {
        try {
            // Validar que no estemos en producción
            if (this.isProduction) {
                throw new Error('En producción, use APIs seguras para guardar datos médicos');
            }

            // Validar estructura de datos
            if (!this.validateDataStructure(data)) {
                throw new Error('Estructura de datos inválida');
            }

            // Verificar tamaño de datos usando configuración de seguridad
            const sizeInfo = securityConfig.checkDataSize(data);

            this.cache = data;
            this.cacheTimestamp = Date.now();
            
            // Solo guardar en localStorage si es seguro
            if (this.isLocalStorageSafe()) {
                try {
                    const dataString = JSON.stringify(data);
                    localStorage.setItem(securityConfig.LOCALSTORAGE_CONFIG.KEY, dataString);
                    console.log('✅ Datos guardados en localStorage');
                } catch (saveError) {
                    console.warn('Error guardando en localStorage:', saveError);
                    // Los datos se mantienen en caché aunque no se puedan guardar
                }
            }
            
            return true;
        } catch (error) {
            console.error('Error guardando datos:', error);
            return false;
        }
    }

    /**
     * Valida la estructura de datos
     */
    validateDataStructure(data) {
        if (!data || typeof data !== 'object') return false;
        
        const requiredKeys = ['users', 'conditions', 'symptoms', 'symptomRecords', 'conditionUpdates'];
        for (const key of requiredKeys) {
            if (!Array.isArray(data[key])) return false;
        }
        
        return true;
    }

    /**
     * Obtiene el usuario actual
     */
    async getCurrentUser() {
        const data = await this.loadData();
        const currentUserId = localStorage.getItem('currentUserId') || 'user-001';
        return data.users.find(user => user.id === currentUserId) || data.users[0];
    }

    /**
     * Obtiene las condiciones del usuario actual
     */
    async getConditions() {
        const data = await this.loadData();
        const currentUser = await this.getCurrentUser();
        return data.conditions.filter(condition => condition.userId === currentUser.id);
    }

    /**
     * Obtiene los síntomas de una condición específica
     */
    async getSymptomsByCondition(conditionId) {
        const data = await this.loadData();
        return data.symptoms.filter(symptom => symptom.conditionId === conditionId);
    }

    /**
     * Obtiene todos los síntomas del usuario actual
     */
    async getAllSymptoms() {
        const data = await this.loadData();
        const currentUser = await this.getCurrentUser();
        const userConditions = data.conditions.filter(condition => condition.userId === currentUser.id);
        const conditionIds = userConditions.map(condition => condition.id);
        return data.symptoms.filter(symptom => conditionIds.includes(symptom.conditionId));
    }

    /**
     * Obtiene los registros de síntomas
     */
    async getSymptomRecords() {
        const data = await this.loadData();
        return data.symptomRecords || [];
    }

    /**
     * Guarda una nueva condición con validaciones de seguridad
     */
    async saveCondition(conditionData) {
        try {
            // Validar datos de entrada
            if (!conditionData || !conditionData.condition) {
                throw new Error('Datos de condición inválidos');
            }

            // Validar y sanitizar datos de la condición
            const validatedCondition = this.validateAndSanitizeInput(
                { ...conditionData.condition }, 
                'condition'
            );

            const data = await this.loadData();
            const currentUser = await this.getCurrentUser();
            
            const newCondition = {
                id: `condition-${Date.now()}`,
                userId: currentUser.id,
                ...validatedCondition,
                status: 'active',
                isCured: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            data.conditions.push(newCondition);

            // Validar y guardar síntomas asociados
            if (conditionData.symptoms && Array.isArray(conditionData.symptoms)) {
                // Limitar número de síntomas
                const maxSymptoms = 10;
                const symptomsToProcess = conditionData.symptoms.slice(0, maxSymptoms);
                
                for (const symptomData of symptomsToProcess) {
                    // Validar y sanitizar cada síntoma
                    const validatedSymptom = this.validateAndSanitizeInput(
                        { ...symptomData }, 
                        'symptom'
                    );

                    const newSymptom = {
                        id: `symptom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        conditionId: newCondition.id,
                        name: validatedSymptom.name,
                        description: validatedSymptom.description,
                        intensity: validatedSymptom.intensity,
                        notes: validatedSymptom.notes,
                        createdAt: new Date().toISOString()
                    };
                    data.symptoms.push(newSymptom);

                    // Crear registro inicial de intensidad
                    const initialRecord = {
                        id: `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                        symptomId: newSymptom.id,
                        intensity: validatedSymptom.intensity,
                        notes: validatedSymptom.notes || 'Registro inicial',
                        recordDate: new Date().toISOString()
                    };
                    data.symptomRecords.push(initialRecord);
                }
            }

            // Agregar actualización de condición (sanitizada)
            const conditionUpdate = {
                id: `update-${Date.now()}`,
                conditionId: newCondition.id,
                updateType: 'new_condition',
                description: `Nueva condición registrada: ${validatedCondition.name}`,
                date: new Date().toISOString()
            };
            data.conditionUpdates.push(conditionUpdate);

            await this.saveData(data);
            return newCondition;
        } catch (error) {
            console.error('Error guardando condición:', error);
            // No exponer detalles del error en producción
            throw new Error('Error al guardar la condición. Verifique los datos e intente nuevamente.');
        }
    }

    /**
     * Actualiza una condición existente
     */
    async updateCondition(conditionId, updateData) {
        try {
            const data = await this.loadData();
            const conditionIndex = data.conditions.findIndex(c => c.id === conditionId);
            
            if (conditionIndex === -1) {
                throw new Error('Condición no encontrada');
            }

            data.conditions[conditionIndex] = {
                ...data.conditions[conditionIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            await this.saveData(data);
            return data.conditions[conditionIndex];
        } catch (error) {
            console.error('Error actualizando condición:', error);
            throw error;
        }
    }

    /**
     * Agrega un nuevo síntoma a una condición existente
     */
    async addSymptomToCondition(conditionId, symptomData) {
        try {
            const data = await this.loadData();
            
            const newSymptom = {
                id: `symptom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                conditionId: conditionId,
                name: symptomData.name,
                description: symptomData.description,
                intensity: symptomData.intensity,
                notes: symptomData.notes,
                createdAt: new Date().toISOString()
            };
            
            data.symptoms.push(newSymptom);

            // Crear registro inicial de intensidad
            const initialRecord = {
                id: `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                symptomId: newSymptom.id,
                intensity: symptomData.intensity,
                notes: symptomData.notes || 'Registro inicial',
                recordDate: new Date().toISOString()
            };
            data.symptomRecords.push(initialRecord);

            // Agregar actualización
            const conditionUpdate = {
                id: `update-${Date.now()}`,
                conditionId: conditionId,
                updateType: 'new_symptom',
                description: `Nuevo síntoma agregado: ${symptomData.name}`,
                date: new Date().toISOString()
            };
            data.conditionUpdates.push(conditionUpdate);

            await this.saveData(data);
            return newSymptom;
        } catch (error) {
            console.error('Error agregando síntoma:', error);
            throw error;
        }
    }

    /**
     * Agrega un nuevo registro de intensidad para un síntoma
     */
    async addSymptomRecord(recordData) {
        try {
            const data = await this.loadData();
            
            const newRecord = {
                id: recordData.id || `record-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                symptomId: recordData.symptomId,
                intensity: recordData.intensity,
                notes: recordData.notes,
                recordDate: recordData.recordDate || new Date().toISOString()
            };
            
            data.symptomRecords.push(newRecord);
            await this.saveData(data);
            return newRecord;
        } catch (error) {
            console.error('Error agregando registro de síntoma:', error);
            throw error;
        }
    }

    /**
     * Actualiza un registro de síntoma existente
     */
    async updateSymptomRecord(recordData) {
        try {
            const data = await this.loadData();
            
            const recordIndex = data.symptomRecords.findIndex(r => r.id === recordData.id);
            if (recordIndex === -1) {
                throw new Error('Registro de síntoma no encontrado');
            }
            
            // Actualizar registro
            data.symptomRecords[recordIndex] = {
                ...data.symptomRecords[recordIndex],
                intensity: recordData.intensity,
                notes: recordData.notes,
                recordDate: recordData.recordDate || new Date().toISOString()
            };
            
            await this.saveData(data);
            return data.symptomRecords[recordIndex];
        } catch (error) {
            console.error('Error actualizando registro de síntoma:', error);
            throw error;
        }
    }

    /**
     * Obtiene estadísticas del usuario
     */
    async getUserStats() {
        try {
            const conditions = await this.getConditions();
            const symptoms = await this.getAllSymptoms();
            const records = await this.getSymptomRecords();
            const symptomIds = symptoms.map(s => s.id);
            const userRecords = records.filter(r => symptomIds.includes(r.symptomId));

            return {
                totalConditions: conditions.length,
                activeConditions: conditions.filter(c => c.status === 'active').length,
                totalSymptoms: symptoms.length,
                totalRecords: userRecords.length,
                averageIntensity: userRecords.length > 0 ? 
                    userRecords.reduce((sum, r) => sum + r.intensity, 0) / userRecords.length : 0
            };
        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                totalConditions: 0,
                activeConditions: 0,
                totalSymptoms: 0,
                totalRecords: 0,
                averageIntensity: 0
            };
        }
    }

    /**
     * Retorna una estructura de datos vacía
     */
    getEmptyDataStructure() {
        return {
            users: [],
            conditions: [],
            symptoms: [],
            symptomRecords: [],
            conditionUpdates: []
        };
    }

    /**
     * Retorna datos de ejemplo para cuando no se puede cargar el archivo JSON
     */
    getDefaultData() {
        return {
            users: [
                {
                    id: "user-001",
                    name: "Demo",
                    email: "demo@drasistente.com",
                    password: "demo123456",
                    createdAt: "2025-08-19T10:30:00Z",
                    isActive: true,
                    profile: {
                        height: 170,
                        weight: 70,
                        chronicConditions: ["Hipertensión"],
                        allergies: ["Penicilina", "Polen"],
                        bloodType: "O+",
                        emergencyContact: {
                            name: "María González",
                            phone: "+1234567890",
                            relationship: "Hermana"
                        }
                    }
                }
            ],
            conditions: [
                {
                    id: "condition-001",
                    userId: "user-001",
                    name: "Dolor de cabeza recurrente",
                    description: "Dolores de cabeza que aparecen por las tardes",
                    startDate: "2025-08-10",
                    status: "active",
                    isCured: false,
                    createdAt: "2025-08-10T14:30:00Z",
                    updatedAt: "2025-08-18T09:15:00Z"
                }
            ],
            symptoms: [
                {
                    id: "symptom-001",
                    conditionId: "condition-001",
                    name: "Dolor punzante",
                    description: "Dolor punzante en la sien derecha",
                    createdAt: "2025-08-10T14:30:00Z"
                },
                {
                    id: "symptom-002", 
                    conditionId: "condition-001",
                    name: "Sensibilidad a la luz",
                    description: "Molestia con luces brillantes",
                    createdAt: "2025-08-12T16:20:00Z"
                }
            ],
            symptomRecords: [
                {
                    id: "record-001",
                    symptomId: "symptom-001",
                    intensity: 7,
                    notes: "Dolor intenso después del trabajo",
                    recordDate: "2025-08-10T18:00:00Z"
                },
                {
                    id: "record-002",
                    symptomId: "symptom-001", 
                    intensity: 5,
                    notes: "Mejoró después de descansar",
                    recordDate: "2025-08-11T19:30:00Z"
                },
                {
                    id: "record-003",
                    symptomId: "symptom-002",
                    intensity: 8,
                    notes: "Muy molesto en la oficina con luz fluorescente",
                    recordDate: "2025-08-12T16:30:00Z"
                },
                {
                    id: "record-004",
                    symptomId: "symptom-001",
                    intensity: 3,
                    notes: "Dolor leve, tomé ibuprofeno",
                    recordDate: "2025-08-18T09:00:00Z"
                }
            ],
            conditionUpdates: [
                {
                    id: "update-001",
                    conditionId: "condition-001",
                    updateType: "improvement",
                    description: "Los dolores han disminuido en intensidad",
                    date: "2025-08-18T09:15:00Z"
                },
                {
                    id: "update-002",
                    conditionId: "condition-001", 
                    updateType: "new_symptom",
                    description: "Agregado nuevo síntoma: sensibilidad a la luz",
                    date: "2025-08-12T16:20:00Z"
                }
            ]
        };
    }

    /**
     * Limpia la caché
     */
    clearCache() {
        this.cache = null;
        this.cacheTimestamp = null;
    }

    /**
     * Resetea todos los datos (para testing)
     */
    async resetData() {
        try {
            localStorage.removeItem('drAssistantData');
            this.clearCache();
            return true;
        } catch (error) {
            console.error('Error reseteando datos:', error);
            return false;
        }
    }

    /**
     * Inicializa datos por defecto si no existen
     */
    async initializeDefaultData() {
        try {
            const data = await this.loadData();
            
            // Si no hay datos o están vacíos, inicializar con datos por defecto
            if (!data || 
                !data.users || data.users.length === 0 ||
                !data.conditions || data.conditions.length === 0) {
                
                console.log('🔄 Inicializando datos por defecto...');
                const defaultData = this.getDefaultData();
                await this.saveData(defaultData);
                console.log('✅ Datos por defecto inicializados');
                return defaultData;
            }
            
            return data;
        } catch (error) {
            console.error('Error inicializando datos por defecto:', error);
            return this.getDefaultData();
        }
    }
}

// Crear instancia global
window.dataManager = new DataManager();
