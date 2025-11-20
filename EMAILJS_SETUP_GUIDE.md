# 📧 Guía Rápida: Configurar EmailJS para Invitaciones

## ¿Qué es EmailJS?

EmailJS es un servicio que permite enviar emails directamente desde JavaScript sin necesidad de un servidor backend. Es perfecto para nuestro sistema de invitaciones.

## 🚀 Configuración en 5 pasos

### 1️⃣ Crear cuenta (2 minutos)

1. Ve a **https://www.emailjs.com/**
2. Click en **"Sign Up Free"**
3. Completa el registro (puedes usar Gmail)
4. Confirma tu email

✅ **Plan gratuito**: 200 emails/mes (suficiente para empezar)

---

### 2️⃣ Conectar Gmail (3 minutos)

1. En el dashboard de EmailJS, ve a **"Email Services"** (menú izquierdo)
2. Click en **"Add New Service"**
3. Selecciona **"Gmail"**
4. Click en **"Connect Account"**
5. Autoriza el acceso a tu cuenta de Gmail
6. Dale un nombre al servicio (ej: "DoRemember Gmail")
7. **¡IMPORTANTE!** Copia el **Service ID** (aparece como `service_xxxxxxx`)

📝 **Guarda el Service ID**, lo necesitarás después.

---

### 3️⃣ Crear plantilla de email (5 minutos)

1. Ve a **"Email Templates"** (menú izquierdo)
2. Click en **"Create New Template"**
3. Dale un nombre: **"Invitación Cuidador"**
4. En el editor, **borra todo** y pega este código:

```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #14b8a6, #3b82f6); padding: 30px; border-radius: 10px; text-align: center;">
    <h1 style="color: white; margin: 0;">DoURemember</h1>
    <p style="color: white; font-size: 18px;">Invitación de Cuidador</p>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; margin-top: 20px;">
    <h2 style="color: #1e293b;">¡Hola!</h2>
    
    <p style="color: #64748b; font-size: 16px;">
      El <strong>Dr. {{doctor_name}}</strong> te ha invitado a ser el cuidador de 
      <strong>{{patient_name}}</strong> en nuestra plataforma DoURemember.
    </p>
    
    <p style="color: #64748b; font-size: 16px;">
      Esta invitación es válida por <strong>{{expires_in}}</strong>.
    </p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{invitation_link}}" 
         style="background: #14b8a6; color: white; padding: 15px 40px; 
                text-decoration: none; border-radius: 8px; font-weight: bold;">
        Completar Registro
      </a>
    </div>
    
    <p style="color: #94a3b8; font-size: 14px;">
      Si no solicitaste esta invitación, puedes ignorar este correo.
    </p>
  </div>
</div>
```

5. En **"Settings"** verifica estos campos:
   - **To email**: `{{to_email}}`
   - **Subject**: `Invitación para ser Cuidador - DoURemember`
   - **From name**: `DoURemember`

6. Click en **"Save"**
7. **¡IMPORTANTE!** Copia el **Template ID** (aparece como `template_xxxxxxx`)

📝 **Guarda el Template ID**, lo necesitarás después.

---

### 4️⃣ Obtener Public Key (1 minuto)

1. Ve a **"Account"** → **"General"** (menú izquierdo)
2. Busca la sección **"API Keys"**
3. Copia tu **Public Key** (aparece como una cadena larga de caracteres)

📝 **Guarda el Public Key**, lo necesitarás después.

---

### 5️⃣ Configurar en tu código (2 minutos)

Abre el archivo:
```
src/api/invitationService.ts
```

Busca las líneas 60-62 y reemplaza con tus credenciales:

```typescript
// Línea 60-62
const serviceId = "service_tu_id_aqui";     // Pega tu Service ID
const templateId = "template_tu_id_aqui";   // Pega tu Template ID
const publicKey = "tu_public_key_aqui";     // Pega tu Public Key
```

**Ejemplo:**
```typescript
const serviceId = "service_abc123xyz";
const templateId = "template_def456uvw";
const publicKey = "xYz789AbCdEf012345";
```

✅ **¡Listo!** Ya está configurado.

---

## 🧪 Probar el sistema

### Prueba rápida:

1. **Inicia sesión como doctor**
2. Ve a **"Mis Pacientes"**
3. Selecciona un paciente
4. Click en **"✉️ Invitar Cuidador"**
5. **Ingresa tu propio email** para probar
6. Click en **"Enviar Invitación"**
7. **Revisa tu bandeja de entrada** (puede tardar 1-2 minutos)
8. Click en el botón del email
9. **Completa el registro**

---

## ❓ Solución de Problemas

### ❌ No llega el email

**Causas posibles:**
- Credenciales incorrectas en `invitationService.ts`
- El email está en spam/promociones
- Alcanzaste el límite de 200 emails/mes
- Gmail necesita re-autorización

**Solución:**
1. Revisa spam y promociones
2. Verifica que copiaste bien las credenciales
3. Revisa la consola del navegador (F12) para errores
4. En EmailJS, ve a "Email Services" y reconecta Gmail

---

### ❌ Email llega pero sin estilos

**Causa:** Algunos clientes de email no soportan CSS complejo

**Solución:** Es normal, el contenido sigue siendo funcional

---

### ❌ Link del email no funciona

**Causa:** Token inválido o expirado (7 días)

**Solución:** 
1. Verifica en Firestore que la invitación existe
2. Genera una nueva invitación

---

## 📊 Límites del Plan Gratuito

| Característica | Plan Gratuito |
|---------------|---------------|
| Emails/mes | 200 |
| Servicios | 2 |
| Plantillas | Ilimitadas |
| Soporte | Comunidad |

💡 **Tip:** Si necesitas más emails, el plan Personal cuesta $9/mes (1,000 emails)

---

## 🎯 Checklist Final

Antes de poner en producción, verifica:

- [ ] Service ID configurado en `invitationService.ts`
- [ ] Template ID configurado en `invitationService.ts`
- [ ] Public Key configurado en `invitationService.ts`
- [ ] Plantilla de email probada y funcionando
- [ ] Gmail autorizado en EmailJS
- [ ] Probado envío de invitación completo
- [ ] Probado registro desde invitación
- [ ] Verificado vínculo creado en Firestore

---

## 📞 Recursos Adicionales

- **Documentación EmailJS**: https://www.emailjs.com/docs/
- **Dashboard EmailJS**: https://dashboard.emailjs.com/
- **Soporte**: https://www.emailjs.com/support/

---

## 🎨 Personalizar Email (Opcional)

Si quieres cambiar el diseño del email:

1. Ve a EmailJS → Email Templates
2. Selecciona tu plantilla
3. Edita el HTML
4. Usa estas variables:
   - `{{doctor_name}}` - Nombre del doctor
   - `{{patient_name}}` - Nombre del paciente
   - `{{invitation_link}}` - Link de registro
   - `{{expires_in}}` - Tiempo de expiración
   - `{{to_email}}` - Email del destinatario

---

## ✅ ¡Configuración Completa!

Ahora tu sistema de invitaciones está listo para:
- ✉️ Enviar invitaciones automáticas por email
- 🔗 Generar links únicos con token
- 👥 Asociar cuidadores con pacientes y doctores
- ⏰ Controlar expiración de invitaciones (7 días)
- 🔒 Validar tokens de forma segura

**¡A probar!** 🚀
