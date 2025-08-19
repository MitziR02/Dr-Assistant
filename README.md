# 🏥 Aplicación Médica - Prototipo Inicial

## 📖 Descripción
Este proyecto es una **aplicación de salud** enfocada en el **registro y seguimiento de padecimientos y síntomas** junto con su evolución en el tiempo.  
Además, ofrece un **perfil de usuario con información médica base** (antecedentes médicos) para tener un historial inicial.  

El objetivo principal es **construir un prototipo funcional de aplicación médica** que siente las bases en **arquitectura, seguridad y escalabilidad**, con miras a evolucionar hacia una solución de nivel producción en el futuro.

## 🎯 Objetivos
- Construir un prototipo funcional de aplicación médica.
- Establecer buenas prácticas de arquitectura y seguridad desde el inicio.
- Definir bases sólidas para la **escalabilidad futura** (ejemplo: migrar a React + TypeScript).
- Garantizar un diseño **móvil primero, responsive, accesible y amigable con el usuario**.

## 🛠️ Tecnologías
- **Frontend (prototipo actual):** HTML, CSS, JavaScript.  
- **Simulación de datos:** JSON local (simulación de API).  
- **Escalabilidad futura:** React + TypeScript.  

## 📝 Proceso de diseño
1. **Investigación inicial:** Definición de elementos principales para el MVP.  
2. **Wireframes de baja fidelidad:** Bocetos a mano para validar funcionalidades iniciales.  
3. **Moodboard y diseño base:** Selección de paleta de colores, logo y lineamientos de UI.  
4. **Programación:** Desarrollo bajo enfoque **mobile first**, asegurando **responsividad y accesibilidad**.  

> ⚠️ Por limitaciones de tiempo, no se desarrolló un prototipo de alta fidelidad previo; se pasó de wireframes a diseño + implementación directamente.

## 🧩 Convenciones de código y commits

### 1. Nomenclatura de archivos y carpetas
- Carpetas: `kebab-case` (ej. `user-profile`, `auth-pages`)
- Archivos: `kebab-case` para HTML/JS/CSS (ej. `login-form.js`, `profile-page.html`)
- Componentes reutilizables: `PascalCase` (ej. `UserCard.jsx`)

### 2. Nombres de variables y funciones
- Variables y funciones: `camelCase` (ej. `registerUser`, `userHistory`)
- Constantes: `UPPER_SNAKE_CASE` (ej. `API_BASE_URL`)
- Clases y objetos: `PascalCase` (ej. `UserProfile`)

### 3. Convenciones de commits
Se recomienda **Conventional Commits**:

Tipos principales:
- `feat` → nueva funcionalidad
- `fix` → corrección de errores
- `docs` → documentación
- `style` → formato, espacios, puntos y comas
- `refactor` → reestructuración sin cambiar funcionalidad
- `test` → pruebas
- `chore` → tareas de mantenimiento

## 🔒 Buenas prácticas de seguridad

Este proyecto sigue buenas prácticas de seguridad desde la fase de prototipo, considerando que manejará información médica sensible. Algunas recomendaciones implementadas o a seguir:

### 1. Manejo de datos sensibles

* Nunca almacenar información médica sensible en el cliente (localStorage, cookies sin cifrado).
* Utilizar siempre **simulación de datos en JSON local** durante el desarrollo.
* En producción, los datos deben manejarse mediante **APIs seguras** con autenticación y cifrado.

### 2. Validación de formularios

* Validar todos los inputs **tanto del lado del cliente como del servidor** (aunque por ahora solo hay cliente).
* Validaciones adicionales para contraseñas, fechas, números de historia clínica, etc.

### 3. Autenticación y autorización

* El prototipo actual tiene login/registro simulado.
* En producción, usar **contraseñas cifradas** y protocolos de autenticación seguros.
* Limitar el acceso a rutas sensibles según roles de usuario.

### 4. Protección contra ataques comunes

* Evitar **XSS** limpiando y validando inputs antes de renderizar.
* Evitar **CSRF** implementando tokens si se usan formularios y APIs.
* Nunca exponer datos sensibles en errores o logs del cliente.

### 5. Buenas prácticas generales

* Mantener dependencias actualizadas.
* Documentar cambios y revisiones de seguridad.
* Planificar revisiones periódicas de seguridad al migrar a producción.


## 📜 Licencia
Este proyecto se encuentra bajo la licencia  
**[Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)](https://creativecommons.org/licenses/by-nc-nd/4.0/)**.  

[![Licencia: CC BY-NC-ND 4.0](https://licensebuttons.net/l/by-nc-nd/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc-nd/4.0/)  

Esto significa que:
- ✅ Puedes compartir el material en cualquier medio o formato, siempre dando crédito.  
- ❌ No puedes usarlo con fines comerciales.  
- ❌ No puedes generar obras derivadas ni modificaciones basadas en este trabajo.  

