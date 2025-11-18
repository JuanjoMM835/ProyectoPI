# 📐 Modelo C4 - Diagrama de Componentes
## DoURemember - Sistema de Apoyo para Pacientes con Alzheimer

---

## 🎯 Descripción General

Este diagrama representa la arquitectura de componentes del sistema DoURemember, mostrando cómo los diferentes módulos y componentes interactúan entre sí para proporcionar funcionalidad a los tres tipos de usuarios: Doctores, Cuidadores y Pacientes.

---

## 📊 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          APLICACIÓN WEB DOUREMEMBER                          │
│                        [Container: React + TypeScript]                       │
│                                                                               │
│  Proporciona toda la funcionalidad del sistema de apoyo para pacientes       │
│  con Alzheimer a través del navegador web.                                   │
│                                                                               │
│  ┌────────────────────────┐         ┌────────────────────────┐              │
│  │  Authentication Module │         │   Patient Dashboard    │              │
│  │   [Component: React]   │         │   [Component: React]   │              │
│  │                        │         │                        │              │
│  │ Permite a los usuarios │         │ Proporciona a los      │              │
│  │ iniciar sesión en el   │         │ pacientes acceso a su  │              │
│  │ sistema con email y    │◄────────│ galería, pruebas y     │              │
│  │ contraseña.            │  Uses   │ recordatorios.         │              │
│  └───────────┬────────────┘         └────────────────────────┘              │
│              │ Uses                                                          │
│              ▼                                                                │
│  ┌────────────────────────┐         ┌────────────────────────┐              │
│  │  Auth Context Provider │         │   Doctor Dashboard     │              │
│  │   [Component: React]   │         │   [Component: React]   │              │
│  │                        │         │                        │              │
│  │ Gestiona el estado de  │         │ Proporciona a los      │              │
│  │ autenticación global y │◄────────│ doctores gestión de    │              │
│  │ protege rutas según el │  Uses   │ pacientes, pruebas y   │              │
│  │ rol del usuario.       │         │ reportes médicos.      │              │
│  └───────────┬────────────┘         └────────────────────────┘              │
│              │ Uses                                                          │
│              ▼                                                                │
│  ┌────────────────────────┐         ┌────────────────────────┐              │
│  │   Firebase Auth        │         │  Caregiver Dashboard   │              │
│  │   [Component: SDK]     │         │   [Component: React]   │              │
│  │                        │         │                        │              │
│  │ Proporciona funciones  │         │ Proporciona a los      │              │
│  │ de autenticación,      │◄────────│ cuidadores gestión de  │              │
│  │ registro y gestión de  │  Uses   │ recuerdos, familia y   │              │
│  │ sesiones.              │         │ pruebas.               │              │
│  └────────────────────────┘         └────────────────────────┘              │
│                                                                               │
│  ┌───────────────────────────────────────────────────────────┐              │
│  │              CAPA DE SERVICIOS DE API                     │              │
│  │                  [Container: Services]                     │              │
│  │                                                            │              │
│  │  ┌──────────────────┐  ┌──────────────────┐              │              │
│  │  │ Memory Service   │  │ Patient Service  │              │              │
│  │  │ [Component: TS]  │  │ [Component: TS]  │              │              │
│  │  │                  │  │                  │              │              │
│  │  │ CRUD de recuerdos│  │ CRUD de pacientes│              │              │
│  │  │ con imágenes y   │  │ y gestión de     │              │              │
│  │  │ descripciones.   │  │ relaciones.      │              │              │
│  │  └────────┬─────────┘  └────────┬─────────┘              │              │
│  │           │ Uses                │ Uses                    │              │
│  │           ▼                     ▼                         │              │
│  │  ┌──────────────────┐  ┌──────────────────┐              │              │
│  │  │   Test Service   │  │ Reminder Service │              │              │
│  │  │ [Component: TS]  │  │ [Component: TS]  │              │              │
│  │  │                  │  │                  │              │              │
│  │  │ Gestión de tests │  │ CRUD de          │              │              │
│  │  │ cognitivos y     │  │ recordatorios    │              │              │
│  │  │ resultados.      │  │ para pacientes.  │              │              │
│  │  └────────┬─────────┘  └────────┬─────────┘              │              │
│  │           │ Uses                │ Uses                    │              │
│  │           ▼                     ▼                         │              │
│  │  ┌──────────────────┐  ┌──────────────────┐              │              │
│  │  │  AI Test Service │  │ Invitation Svc   │              │              │
│  │  │ [Component: TS]  │  │ [Component: TS]  │              │              │
│  │  │                  │  │                  │              │              │
│  │  │ Generación de    │  │ Sistema de       │              │              │
│  │  │ pruebas con      │  │ invitaciones por │              │              │
│  │  │ OpenAI GPT-4.    │  │ email (EmailJS). │              │              │
│  │  └────────┬─────────┘  └────────┬─────────┘              │              │
│  │           │                     │                         │              │
│  └───────────┼─────────────────────┼─────────────────────────┘              │
│              │                     │                                         │
│              │ Uses [JSON/HTTPS]   │ Uses [JSON/HTTPS]                      │
│              ▼                     ▼                                         │
└──────────────┼─────────────────────┼─────────────────────────────────────────┘
               │                     │
               │                     │
    ┌──────────▼──────────┐    ┌────▼──────────────┐
    │  OpenAI API         │    │  EmailJS API      │
    │  [External System]  │    │  [External System]│
    │                     │    │                   │
    │ API de inteligencia │    │ Servicio de envío │
    │ artificial para     │    │ de correos para   │
    │ generar tests       │    │ invitaciones de   │
    │ cognitivos.         │    │ cuidadores.       │
    └─────────────────────┘    └───────────────────┘

               │
               │ Uses [JSON/HTTPS]
               ▼
    ┌─────────────────────┐
    │  Firebase Services  │
    │  [External System]  │
    │                     │
    │ ┌─────────────────┐ │
    │ │  Firestore DB   │ │
    │ │  [Database]     │ │
    │ │                 │ │
    │ │ Almacena datos  │ │
    │ │ de usuarios,    │ │
    │ │ pacientes,      │ │
    │ │ recuerdos, etc. │ │
    │ └─────────────────┘ │
    │                     │
    │ ┌─────────────────┐ │
    │ │ Firebase Auth   │ │
    │ │ [Service]       │ │
    │ │                 │ │
    │ │ Autenticación   │ │
    │ │ y gestión de    │ │
    │ │ usuarios.       │ │
    │ └─────────────────┘ │
    │                     │
    │ ┌─────────────────┐ │
    │ │ Cloud Storage   │ │
    │ │ [Storage]       │ │
    │ │                 │ │
    │ │ Almacenamiento  │ │
    │ │ de imágenes y   │ │
    │ │ archivos.       │ │
    │ └─────────────────┘ │
    └─────────────────────┘
```

---

## 🔍 Componentes Principales

### 1️⃣ **Authentication Module**
- **Tipo**: Component (React)
- **Responsabilidad**: Gestionar el inicio de sesión y registro de usuarios
- **Tecnología**: React + TypeScript
- **Archivos**: 
  - `src/modules/auth/Login.tsx`
  - `src/modules/auth/Register.tsx`
- **Interacciones**:
  - Usa Auth Context Provider
  - Se comunica con Firebase Auth

### 2️⃣ **Auth Context Provider**
- **Tipo**: Component (React Context)
- **Responsabilidad**: Estado global de autenticación y protección de rutas
- **Tecnología**: React Context API + TypeScript
- **Archivos**:
  - `src/auth/AuthContext.tsx`
  - `src/auth/ProtectedRoute.tsx`
  - `src/auth/useAuth.ts`
- **Interacciones**:
  - Consume Firebase Auth
  - Proporciona estado a toda la aplicación

### 3️⃣ **Patient Dashboard**
- **Tipo**: Component (React)
- **Responsabilidad**: Interfaz para pacientes (galería, pruebas, recordatorios)
- **Tecnología**: React + TypeScript + CSS
- **Archivos**:
  - `src/modules/patient/Home.tsx`
  - `src/modules/patient/Gallery.tsx`
  - `src/modules/patient/TakeTest.tsx`
  - `src/modules/patient/reminders.tsx`
- **Interacciones**:
  - Usa Memory Service
  - Usa Test Service
  - Usa Reminder Service

### 4️⃣ **Doctor Dashboard**
- **Tipo**: Component (React)
- **Responsabilidad**: Interfaz para doctores (pacientes, pruebas, reportes)
- **Tecnología**: React + TypeScript + CSS
- **Archivos**:
  - `src/modules/doctor/Home.tsx`
  - `src/modules/doctor/DoctorPatients.tsx`
  - `src/modules/doctor/GenerateTest.tsx`
  - `src/modules/doctor/Reports.tsx`
  - `src/modules/doctor/DoctorGallery.tsx`
- **Interacciones**:
  - Usa Patient Service
  - Usa Test Service
  - Usa AI Test Service
  - Usa Invitation Service

### 5️⃣ **Caregiver Dashboard**
- **Tipo**: Component (React)
- **Responsabilidad**: Interfaz para cuidadores (familia, recuerdos, pruebas)
- **Tecnología**: React + TypeScript + CSS
- **Archivos**:
  - `src/modules/caregiver/Home.tsx`
  - `src/modules/caregiver/Family.tsx`
  - `src/modules/caregiver/UploadMemory.tsx`
  - `src/modules/caregiver/Gallery.tsx`
- **Interacciones**:
  - Usa Memory Service
  - Usa Patient Service
  - Usa Test Service

### 6️⃣ **Memory Service**
- **Tipo**: Service (TypeScript)
- **Responsabilidad**: CRUD de recuerdos (imágenes con descripciones)
- **Tecnología**: TypeScript + Firebase SDK
- **Archivos**: `src/api/memoryService.ts`
- **Funciones principales**:
  - `uploadMemory()` - Subir recuerdo con imagen
  - `getMemoriesByPatient()` - Obtener recuerdos
  - `deleteMemory()` - Eliminar recuerdo
- **Interacciones**:
  - Lee/Escribe en Firestore (colección `memories`)
  - Sube imágenes a Cloud Storage

### 7️⃣ **Patient Service**
- **Tipo**: Service (TypeScript)
- **Responsabilidad**: CRUD de pacientes y relaciones
- **Tecnología**: TypeScript + Firebase SDK
- **Archivos**: `src/api/patientService.ts`
- **Funciones principales**:
  - `getPatientsByDoctor()` - Listar pacientes
  - `getPatientProfile()` - Obtener perfil
  - `updatePatient()` - Actualizar datos
  - `linkCaregiver()` - Vincular cuidador
- **Interacciones**:
  - Lee/Escribe en Firestore (colección `users`)

### 8️⃣ **Test Service**
- **Tipo**: Service (TypeScript)
- **Responsabilidad**: Gestión de tests cognitivos y resultados
- **Tecnología**: TypeScript + Firebase SDK
- **Archivos**: `src/api/testService.ts`
- **Funciones principales**:
  - `createTest()` - Crear test
  - `getTestsByPatient()` - Listar tests
  - `submitTestResults()` - Guardar resultados
  - `getTestResults()` - Obtener resultados
- **Interacciones**:
  - Lee/Escribe en Firestore (colección `tests`)

### 9️⃣ **Reminder Service**
- **Tipo**: Service (TypeScript)
- **Responsabilidad**: CRUD de recordatorios para pacientes
- **Tecnología**: TypeScript + Firebase SDK
- **Archivos**: `src/api/reminderService.tsx`
- **Funciones principales**:
  - `createReminder()` - Crear recordatorio
  - `getRemindersByPatient()` - Listar recordatorios
  - `updateReminder()` - Actualizar estado
  - `deleteReminder()` - Eliminar recordatorio
- **Interacciones**:
  - Lee/Escribe en Firestore (colección `reminders`)

### 🔟 **AI Test Service**
- **Tipo**: Service (TypeScript)
- **Responsabilidad**: Generación de pruebas cognitivas con IA
- **Tecnología**: TypeScript + OpenAI SDK
- **Archivos**: `src/api/aiTestService.ts`
- **Funciones principales**:
  - `generateTestWithAI()` - Generar test con GPT-4
  - Utiliza prompts especializados
  - Retorna preguntas en formato estructurado
- **Interacciones**:
  - Llama a OpenAI API (GPT-4o-mini)
  - Guarda resultados con Test Service

### 1️⃣1️⃣ **Invitation Service**
- **Tipo**: Service (TypeScript)
- **Responsabilidad**: Sistema de invitaciones por email
- **Tecnología**: TypeScript + EmailJS SDK
- **Archivos**: 
  - `src/api/invitationService.ts`
  - `src/api/emailService.ts`
- **Funciones principales**:
  - `createInvitation()` - Crear invitación con token
  - `sendInvitationEmail()` - Enviar correo
  - `acceptInvitation()` - Aceptar invitación
  - `validateToken()` - Validar token de invitación
- **Interacciones**:
  - Lee/Escribe en Firestore (colección `invitations`)
  - Envía emails vía EmailJS API

---

## 🔗 Sistemas Externos

### 📡 **Firebase Services**
- **Firestore Database**: Base de datos NoSQL para almacenar usuarios, pacientes, recuerdos, tests, etc.
- **Firebase Authentication**: Sistema de autenticación con email/password
- **Cloud Storage**: Almacenamiento de imágenes de recuerdos
- **Protocolo**: JSON/HTTPS
- **URL**: `firebaseapp.com`

### 🤖 **OpenAI API**
- **Servicio**: GPT-4o-mini
- **Uso**: Generación inteligente de pruebas cognitivas
- **Protocolo**: JSON/HTTPS
- **URL**: `api.openai.com`
- **Modelo**: `gpt-4o-mini`

### 📧 **EmailJS API**
- **Servicio**: Envío de correos electrónicos
- **Uso**: Sistema de invitaciones de cuidadores
- **Protocolo**: JSON/HTTPS
- **URL**: `api.emailjs.com`

---

## 📋 Flujos de Datos Principales

### Flujo 1: Autenticación de Usuario
```
Usuario → Login Component → Auth Context → Firebase Auth → Firestore
                                                              ↓
                                                         Validación
                                                              ↓
                                                    Redirección a Dashboard
```

### Flujo 2: Subida de Recuerdo
```
Cuidador → Upload Memory Component → Memory Service → Cloud Storage (imagen)
                                                           ↓
                                                       Firestore (metadata)
```

### Flujo 3: Generación de Test con IA
```
Doctor → Generate Test Component → AI Test Service → OpenAI API
                                                         ↓
                                                   Test generado
                                                         ↓
                                              Test Service → Firestore
```

### Flujo 4: Invitación de Cuidador
```
Doctor → Invite Caregiver Component → Invitation Service → Firestore (token)
                                              ↓
                                         EmailJS API
                                              ↓
                                    Correo enviado a cuidador
```

### Flujo 5: Toma de Test
```
Paciente → Take Test Component → Test Service → Firestore (leer test)
                                      ↓
                              Responde preguntas
                                      ↓
                            Test Service → Firestore (guardar resultados)
```

---

## 🎨 Convenciones del Diagrama

- **[Container]**: Contenedor principal de la aplicación
- **[Component]**: Componente individual dentro del contenedor
- **[Component: React]**: Componente de interfaz de usuario
- **[Component: TypeScript]**: Servicio o módulo de lógica
- **[External System]**: Sistema externo fuera de la aplicación
- **Uses**: Relación de dependencia entre componentes
- **Uses [JSON/HTTPS]**: Comunicación HTTP con API externa

---

## 📊 Estadísticas del Sistema

- **Total de Componentes React**: 15+
- **Total de Servicios**: 7
- **Sistemas Externos**: 3 (Firebase, OpenAI, EmailJS)
- **Colecciones de Firestore**: 5 (users, memories, tests, reminders, invitations)
- **Roles de Usuario**: 3 (Patient, Doctor, Caregiver)

---

## 🔐 Consideraciones de Seguridad

1. **Autenticación**: Firebase Authentication con email/password
2. **Autorización**: Firestore Rules basadas en roles
3. **Protección de Rutas**: ProtectedRoute component
4. **Variables de Entorno**: API keys en archivo `.env`
5. **Validación de Tokens**: Sistema de invitaciones con tokens únicos

---

## 📈 Escalabilidad

El diseño modular permite:
- ✅ Agregar nuevos tipos de pruebas cognitivas
- ✅ Incorporar más roles de usuario
- ✅ Extender funcionalidades sin afectar módulos existentes
- ✅ Reemplazar servicios externos (ej: cambiar de EmailJS a SendGrid)
- ✅ Agregar nuevas fuentes de datos

---

**Modelo C4 - Nivel de Componentes**  
**Proyecto**: DoURemember  
**Versión**: 1.0  
**Fecha**: Noviembre 2025  
**Universidad Autónoma de Occidente**
