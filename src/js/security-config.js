/**
 * Configuración de Seguridad - Dr Asistente
 * Define configuraciones y constantes de seguridad para la aplicación
 */

class SecurityConfig {
    constructor() {
        // Configuración de entorno
        this.ENVIRONMENT = this.detectEnvironment();
        this.IS_PRODUCTION = this.ENVIRONMENT === 'production';
        
        // Límites de seguridad
        this.MAX_INPUT_LENGTH = 1000;
        this.MAX_SYMPTOMS_PER_CONDITION = 10;
        this.MAX_CONDITIONS_PER_USER = 50;
        this.MAX_DATA_SIZE = 1024 * 1024; // 1MB
        
        // Patrones de validación
        this.VALIDATION_PATTERNS = {
            // Solo letras, números, espacios y caracteres básicos
            SAFE_TEXT: /^[a-zA-Z0-9\s\-.,!?áéíóúüñÁÉÍÓÚÜÑ]+$/,
            // Fecha en formato YYYY-MM-DD
            DATE: /^\d{4}-\d{2}-\d{2}$/,
            // Intensidad de 1 a 10
            INTENSITY: /^[1-9]|10$/,
            // ID válido (letras, números, guiones)
            ID: /^[a-zA-Z0-9\-_]+$/
        };
        
        // Caracteres peligrosos para XSS
        this.DANGEROUS_CHARS = /[<>'"&]/g;
        this.XSS_PATTERNS = [
            /javascript:/gi,
            /on\w+\s*=/gi,
            /<script/gi,
            /<iframe/gi,
            /<object/gi,
            /<embed/gi
        ];
        
        // Configuración de localStorage
        this.LOCALSTORAGE_CONFIG = {
            ENABLED: !this.IS_PRODUCTION,
            KEY: 'drAssistantData',
            MAX_AGE: 30 * 24 * 60 * 60 * 1000, // 30 días
            WARNING_THRESHOLD: 0.8 // 80% del límite
        };
    }
    
    /**
     * Detecta el entorno actual
     */
    detectEnvironment() {
        const hostname = window.location.hostname;
        
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'development';
        } else if (hostname.includes('staging') || hostname.includes('test')) {
            return 'staging';
        } else {
            return 'production';
        }
    }
    
    /**
     * Valida si un texto es seguro
     */
    isSafeText(text) {
        if (typeof text !== 'string') return false;
        
        // Verificar longitud
        if (text.length > this.MAX_INPUT_LENGTH) return false;
        
        // Verificar caracteres peligrosos
        if (this.DANGEROUS_CHARS.test(text)) return false;
        
        // Verificar patrones XSS
        for (const pattern of this.XSS_PATTERNS) {
            if (pattern.test(text)) return false;
        }
        
        return true;
    }
    
    /**
     * Sanitiza texto para prevenir XSS
     */
    sanitizeText(text) {
        if (typeof text !== 'string') return '';
        
        return text
            .replace(this.DANGEROUS_CHARS, '') // Remover caracteres peligrosos
            .replace(/javascript:/gi, '') // Remover javascript:
            .replace(/on\w+\s*=/gi, '') // Remover event handlers
            .trim()
            .substring(0, this.MAX_INPUT_LENGTH); // Limitar longitud
    }
    
    /**
     * Valida formato de fecha
     */
    isValidDate(dateString) {
        if (!this.VALIDATION_PATTERNS.DATE.test(dateString)) return false;
        
        const date = new Date(dateString);
        const today = new Date();
        
        // La fecha no puede ser futura
        if (date > today) return false;
        
        // La fecha no puede ser muy antigua (más de 10 años)
        const tenYearsAgo = new Date();
        tenYearsAgo.setFullYear(today.getFullYear() - 10);
        if (date < tenYearsAgo) return false;
        
        return date instanceof Date && !isNaN(date);
    }
    
    /**
     * Valida intensidad de síntoma
     */
    isValidIntensity(intensity) {
        const num = parseInt(intensity);
        return !isNaN(num) && num >= 1 && num <= 10;
    }
    
    /**
     * Valida ID de entidad
     */
    isValidId(id) {
        return typeof id === 'string' && 
               this.VALIDATION_PATTERNS.ID.test(id) && 
               id.length <= 100;
    }
    
    /**
     * Verifica si localStorage es seguro para usar
     */
    isLocalStorageSafe() {
        if (this.IS_PRODUCTION) {
            console.warn('⚠️ SEGURIDAD: No usar localStorage en producción para datos médicos');
            return false;
        }
        
        try {
            // Verificar si localStorage está disponible
            const testKey = '__test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch (error) {
            console.warn('⚠️ localStorage no disponible:', error);
            return false;
        }
    }
    
    /**
     * Verifica el tamaño de datos en localStorage
     */
    checkDataSize(data) {
        try {
            const dataString = JSON.stringify(data);
            const size = new Blob([dataString]).size;
            const maxSize = this.MAX_DATA_SIZE;
            
            if (size > maxSize) {
                throw new Error(`Datos demasiado grandes: ${size} bytes (máximo: ${maxSize})`);
            }
            
            const usagePercent = (size / maxSize) * 100;
            if (usagePercent > this.LOCALSTORAGE_CONFIG.WARNING_THRESHOLD * 100) {
                console.warn(`⚠️ Uso alto de localStorage: ${usagePercent.toFixed(1)}%`);
            }
            
            return { size, maxSize, usagePercent };
        } catch (error) {
            throw new Error('Error verificando tamaño de datos: ' + error.message);
        }
    }
    
    /**
     * Genera un ID seguro
     */
    generateSecureId(prefix = 'id') {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `${prefix}-${timestamp}-${random}`;
    }
    
    /**
     * Valida estructura de datos de condición
     */
    validateConditionData(data) {
        const errors = [];
        
        if (!data || typeof data !== 'object') {
            errors.push('Datos de condición inválidos');
            return { isValid: false, errors };
        }
        
        // Validar campos requeridos
        if (!data.name || typeof data.name !== 'string') {
            errors.push('Nombre de condición requerido');
        } else if (!this.isSafeText(data.name)) {
            errors.push('Nombre de condición contiene caracteres no válidos');
        }
        
        if (!data.startDate || !this.isValidDate(data.startDate)) {
            errors.push('Fecha de inicio inválida');
        }
        
        // Validar campos opcionales
        if (data.description && !this.isSafeText(data.description)) {
            errors.push('Descripción contiene caracteres no válidos');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Valida estructura de datos de síntoma
     */
    validateSymptomData(data) {
        const errors = [];
        
        if (!data || typeof data !== 'object') {
            errors.push('Datos de síntoma inválidos');
            return { isValid: false, errors };
        }
        
        // Validar campos requeridos
        if (!data.name || typeof data.name !== 'string') {
            errors.push('Nombre de síntoma requerido');
        } else if (!this.isSafeText(data.name)) {
            errors.push('Nombre de síntoma contiene caracteres no válidos');
        }
        
        if (!this.isValidIntensity(data.intensity)) {
            errors.push('Intensidad debe ser un número entre 1 y 10');
        }
        
        // Validar campos opcionales
        if (data.description && !this.isSafeText(data.description)) {
            errors.push('Descripción contiene caracteres no válidos');
        }
        
        if (data.notes && !this.isSafeText(data.notes)) {
            errors.push('Notas contienen caracteres no válidos');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    
    /**
     * Valida estructura de datos de registro de síntoma
     */
    validateSymptomRecordData(data) {
        const errors = [];
        
        if (!data || typeof data !== 'object') {
            errors.push('Datos de registro inválidos');
            return { isValid: false, errors };
        }
        
        // Validar intensidad
        if (!this.isValidIntensity(data.intensity)) {
            errors.push('Intensidad debe ser un número entre 1 y 10');
        }
        
        // Validar notas (opcional)
        if (data.notes && !this.isSafeText(data.notes)) {
            errors.push('Notas contienen caracteres no válidos');
        }
        
        // Validar ID de síntoma si está presente
        if (data.symptomId && !this.isValidId(data.symptomId)) {
            errors.push('ID de síntoma inválido');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
}

// Crear instancia global
window.securityConfig = new SecurityConfig();
