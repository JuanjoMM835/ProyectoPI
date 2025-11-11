# 🔑 Guía Rápida: Configurar OpenAI en DoRemember

## ✅ Paso 1: Crear Cuenta en OpenAI

1. Abre tu navegador y ve a: **https://platform.openai.com/signup**

2. Regístrate con:
   - Tu email personal
   - O usa "Continuar con Google"
   - O usa "Continuar con Microsoft"

3. **Verifica tu email** (revisa tu bandeja de entrada)

---

## 🔑 Paso 2: Obtener tu API Key

1. Una vez dentro, ve a: **https://platform.openai.com/api-keys**

2. Haz click en el botón verde: **"Create new secret key"**

3. Dale un nombre descriptivo:
   ```
   DoRemember App
   ```

4. Haz click en **"Create secret key"**

5. **¡MUY IMPORTANTE!** 
   - La clave se mostrará **UNA SOLA VEZ**
   - Empieza con: `sk-proj-...`
   - **Cópiala AHORA** y guárdala en un lugar seguro

---

## 📝 Paso 3: Agregar la Clave a tu Proyecto

1. Abre tu proyecto en VS Code

2. Busca el archivo `.env` en la raíz del proyecto

3. Agrega esta línea (reemplaza con tu clave real):
   ```
   VITE_OPENAI_API_KEY=sk-proj-tu-clave-aqui-pegala
   ```

4. **Guarda el archivo** (Ctrl+S)

5. **Reinicia el servidor de desarrollo**:
   - Para el servidor (Ctrl+C en la terminal)
   - Vuelve a ejecutar: `npm run dev`

---

## 🧪 Paso 4: Probar que Funciona

1. Inicia sesión como **Doctor** o **Cuidador**

2. Ve a **Mis Pacientes**

3. Click en el botón **"🤖 Generar Test"** de cualquier paciente

4. Selecciona el número de preguntas (3-10)

5. Click en **"🧠 Generar Evaluación"**

6. Espera 30-60 segundos mientras la IA genera las preguntas

7. ¡Listo! El test se ha creado correctamente

---

## 💰 Información de Costos

- **Crédito gratis**: $5 USD al registrarte
- **Costo por test**: ~$0.002 USD (menos de un centavo)
- **Tests con $5**: Aproximadamente 2,500 tests
- **Modelo usado**: GPT-3.5-turbo (rápido y económico)

---

## 🔧 Solución de Problemas

### ❌ Error: "API Key no configurada"
- Verifica que agregaste la línea en el archivo `.env`
- Asegúrate de que la clave empieza con `sk-proj-`
- Reinicia el servidor (`npm run dev`)

### ❌ Error: "Insufficient credits"
- Tu cuenta no tiene créditos disponibles
- Ve a: https://platform.openai.com/account/billing
- Agrega un método de pago o verifica tus créditos gratuitos

### ❌ Error: "Invalid API Key"
- La clave que pusiste es incorrecta
- Genera una nueva clave en: https://platform.openai.com/api-keys
- Cópiala de nuevo en el archivo `.env`

### ❌ Error: "Rate limit exceeded"
- Estás haciendo muchas solicitudes muy rápido
- Espera 1 minuto e intenta de nuevo
- El sistema ya incluye delays entre preguntas

---

## 📚 Recursos Útiles

- **Panel de OpenAI**: https://platform.openai.com/
- **Ver uso y créditos**: https://platform.openai.com/account/usage
- **Documentación**: https://platform.openai.com/docs
- **Precios**: https://openai.com/pricing

---

## ✅ Checklist Final

Marca cada paso conforme lo completes:

- [ ] Creé mi cuenta en OpenAI
- [ ] Verifiqué mi email
- [ ] Generé mi API Key
- [ ] Copié la clave (empieza con sk-proj-)
- [ ] Agregué la clave al archivo .env
- [ ] Guardé el archivo .env
- [ ] Reinicié el servidor (npm run dev)
- [ ] Probé generar un test
- [ ] ✅ ¡Funciona correctamente!

---

**¿Necesitas ayuda?** Contáctame o revisa la documentación oficial de OpenAI.
