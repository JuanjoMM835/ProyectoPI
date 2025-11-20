# 📧 Configuración del Sistema de Invitaciones

## Resumen del Sistema

El sistema permite que los doctores inviten a cuidadores por correo electrónico. Cuando un cuidador se registra a través de la invitación, queda automáticamente asociado al paciente y al doctor.

## 🔧 Configuración de EmailJS

### Paso 1: Crear cuenta en EmailJS

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea una cuenta gratuita (permite 200 emails/mes)

### Paso 2: Conectar tu cuenta de Gmail

1. En el dashboard de EmailJS, ve a **Email Services**
2. Click en **Add New Service**
3. Selecciona **Gmail**
4. Autoriza tu cuenta de Gmail
5. Copia el **Service ID** (ej: `service_abc123`)

### Paso 3: Crear plantilla de email

1. Ve a **Email Templates**
2. Click en **Create New Template**
3. Usa esta plantilla:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #14b8a6, #3b82f6); padding: 30px; border-radius: 10px; text-align: center;">
    <h1 style="color: white; margin: 0;">DoURemember</h1>
    <p style="color: white; font-size: 18px;">Invitación de Cuidador</p>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border-radius: 10px; margin-top: 20px;">
    <h2 style="color: #1e293b; margin-top: 0;">¡Hola!</h2>
    
    <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
      El <strong>Dr. {{doctor_name}}</strong> te ha invitado a ser el cuidador de 
      <strong>{{patient_name}}</strong> en nuestra plataforma DoURemember.
    </p>
    
    <p style="color: #64748b; font-size: 16px; line-height: 1.6;">
      Esta invitación es válida por <strong>{{expires_in}}</strong>.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{invitation_link}}" 
         style="background: #14b8a6; color: white; padding: 15px 40px; 
                text-decoration: none; border-radius: 8px; font-weight: bold;
                display: inline-block;">
        Completar Registro
      </a>
    </div>
    
    <p style="color: #94a3b8; font-size: 14px; margin-top: 30px;">
      Si no solicitaste esta invitación, puedes ignorar este correo.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 20px;">
    <p style="color: #94a3b8; font-size: 12px;">
      © 2025 DoURemember - Sistema de Gestión de Memoria
    </p>
  </div>
</div>
```

4. Guarda la plantilla y copia el **Template ID** (ej: `template_xyz789`)

### Paso 4: Obtener Public Key

1. Ve a **Account** → **General**
2. Copia tu **Public Key** (ej: `xYz123AbC456DeF`)

### Paso 5: Configurar en el código

Abre el archivo `src/api/invitationService.ts` y reemplaza en la línea 60-62:

```typescript
const serviceId = "service_abc123"; // Tu Service ID
const templateId = "template_xyz789"; // Tu Template ID
const publicKey = "xYz123AbC456DeF"; // Tu Public Key
```

## 🏗️ Arquitectura del Sistema

### Colección `invitations` en Firestore

```typescript
{
  invitedEmail: string,          // Email del cuidador
  invitedBy: string,             // UID del doctor
  doctorName: string,            // Nombre del doctor
  role: "caregiver",             // Siempre cuidador
  patientId: string,             // ID del paciente
  patientName: string,           // Nombre del paciente
  status: "pending" | "accepted" | "expired",
  createdAt: Timestamp,
  expiresAt: Timestamp,          // Expira en 7 días
  token: string                  // Token único para validar
}
```

### Colección `family` (actualizada)

```typescript
{
  caregiverId: string,           // UID del cuidador
  patientId: string,             // UID del paciente
  doctorId: string,              // UID del doctor (NUEVO)
  relationship: string,          // "Cuidador"
  createdAt: Timestamp
}
```

## 📝 Flujo Completo

### 1. Doctor invita cuidador

```
Doctor → Selecciona paciente → Click "Invitar Cuidador" → Ingresa email
→ Sistema crea invitación → Envía email con token único
```

### 2. Cuidador recibe email

```
Email → Click en "Completar Registro" → Redirige a: /register?token=ABC123
```

### 3. Sistema valida token

```
Register page → Valida token → Muestra info de invitación
→ Email pre-llenado → Role = "caregiver" (bloqueado)
```

### 4. Cuidador completa registro

```
Ingresa nombre y contraseña → Submit → Crea usuario en Firebase Auth
→ Crea documento en users → Crea vínculo en family → Marca invitación como "accepted"
→ Actualiza paciente con doctorId (si no tiene)
```

## 🧪 Pruebas

### Crear invitación de prueba

1. Inicia sesión como doctor
2. Ve a "Mis Pacientes"
3. Selecciona un paciente
4. Click en "✉️ Invitar Cuidador"
5. Ingresa tu propio email para probar
6. Revisa tu bandeja de entrada

### Verificar en Firestore

Después de enviar invitación, verifica:

```
Firestore → invitations → [nuevo documento]
{
  invitedEmail: "test@example.com",
  status: "pending",
  token: "abc123xyz789",
  ...
}
```

### Probar registro

1. Copia el link del email
2. Ábrelo en navegador de incógnito
3. Completa el registro
4. Verifica que se crean:
   - Usuario en `users` con role "caregiver"
   - Vínculo en `family` con doctorId
   - Invitación marcada como "accepted"

## 🔍 Debugging

### Si no llega el email

1. Verifica credenciales en `invitationService.ts`
2. Revisa spam/promotions en Gmail
3. Chequea límite de emails en EmailJS (200/mes gratis)
4. Mira la consola del navegador para errores

### Si token es inválido

1. Verifica que el token en URL coincide con Firestore
2. Chequea que la invitación no haya expirado (7 días)
3. Confirma que status sea "pending"

### Si no se crea el vínculo

1. Revisa console.log en `acceptInvitation()`
2. Verifica permisos de Firestore
3. Confirma que doctorId y patientId existen

## 📋 Reglas de Seguridad Firestore

Agrega estas reglas para la colección `invitations`:

```javascript
match /invitations/{invitationId} {
  // Doctores pueden crear invitaciones
  allow create: if request.auth != null && 
                get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor';
  
  // Cualquiera puede leer invitaciones con token válido
  allow read: if request.auth != null || resource.data.status == 'pending';
  
  // Solo el doctor que creó puede actualizar
  allow update: if request.auth != null && 
                resource.data.invitedBy == request.auth.uid;
}

match /family/{familyId} {
  // Doctores y cuidadores pueden crear vínculos
  allow create: if request.auth != null;
  
  // Usuario puede leer si es el doctor, cuidador o paciente en el vínculo
  allow read: if request.auth != null && (
    resource.data.doctorId == request.auth.uid ||
    resource.data.caregiverId == request.auth.uid ||
    resource.data.patientId == request.auth.uid
  );
}
```

## 🎯 Características

✅ Email automático con plantilla personalizada
✅ Token único con expiración de 7 días
✅ Validación de invitaciones duplicadas
✅ Email pre-llenado en registro
✅ Role bloqueado como "caregiver"
✅ Asociación automática: Cuidador ↔ Paciente ↔ Doctor
✅ Modal moderno con animaciones
✅ Manejo de errores completo
✅ Feedback visual (loading, success, error)

## 🚀 Próximos Pasos

1. Configurar EmailJS con tus credenciales
2. Probar el flujo completo
3. Ajustar reglas de Firestore
4. Personalizar plantilla de email
5. Implementar notificaciones adicionales

## 💡 Mejoras Futuras (Opcionales)

- [ ] Recordatorio automático si no aceptan en 3 días
- [ ] Panel para ver invitaciones pendientes
- [ ] Cancelar/reenviar invitaciones
- [ ] Invitaciones múltiples (varios cuidadores)
- [ ] Notificaciones in-app cuando se acepta
- [ ] Historial de invitaciones enviadas
