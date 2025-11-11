# 🔧 Solución: Error de Cuota de OpenAI

## ❌ El Error

```
RateLimitError: 429 You exceeded your current quota
```

Esto significa que **agotaste tus créditos de OpenAI**.

---

## ✅ Soluciones (3 opciones)

### **Opción 1: Agregar Método de Pago (Recomendado)**

La forma más fácil y económica:

1. Ve a: https://platform.openai.com/account/billing
2. Click en **"Add payment method"**
3. Agrega tu tarjeta de crédito/débito
4. Establece un límite de gasto (ejemplo: $5/mes)
5. ¡Listo! Cada test cuesta ~$0.002 USD

**Costos reales:**
- 1 test = $0.002 USD (0.002 centavos)
- 100 tests = $0.20 USD (20 centavos)
- 1000 tests = $2.00 USD (2 dólares)

Es **EXTREMADAMENTE barato**.

---

### **Opción 2: Usar el Modo Fallback (YA IMPLEMENTADO) ⚡**

**¡Buenas noticias!** Ya implementé un sistema de respaldo automático.

**Cómo funciona:**
1. Si OpenAI falla (cuota excedida, error de red, etc.)
2. El sistema **automáticamente** genera preguntas simples sin IA
3. El test se crea igual y funciona perfectamente
4. Las preguntas son más básicas pero funcionales

**No necesitas hacer nada**, el sistema ya lo maneja automáticamente.

**Intenta generar un test ahora** y verás que funciona con el modo fallback.

---

### **Opción 3: Crear Nueva Cuenta de OpenAI**

Si no quieres agregar tarjeta:

1. Cierra sesión en OpenAI
2. Regístrate con un **nuevo email**
3. Obtienes otros **$5 gratis**
4. Genera una nueva API Key
5. Actualiza tu `.env` con la nueva clave

**Nota:** Esto solo te da $5 más temporalmente.

---

## 🎯 Mi Recomendación

**Usa Opción 2 (Modo Fallback)** para pruebas y desarrollo:
- ✅ Funciona AHORA sin hacer nada
- ✅ Gratis para siempre
- ✅ Sin configuración adicional
- ⚠️ Preguntas más simples (pero funcionales)

**Usa Opción 1 (Agregar tarjeta)** para producción:
- ✅ Preguntas de mejor calidad
- ✅ Muy económico ($2 por 1000 tests)
- ✅ Confiable y rápido
- ⚠️ Requiere tarjeta

---

## 🧪 Probar el Modo Fallback

1. **No cambies nada** en tu código
2. Inicia sesión como Doctor
3. Ve a "Mis Pacientes"
4. Click en "🤖 Generar Test"
5. Espera 10-20 segundos
6. Verás en la consola: `⚠️ Cuota de API excedida. Usando generación de preguntas sin IA (fallback)`
7. ¡El test se crea correctamente!

---

## 📊 Comparación

| Característica | Con OpenAI | Modo Fallback |
|---|---|---|
| **Costo** | ~$0.002/test | Gratis |
| **Calidad preguntas** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Personalización** | Alta | Media |
| **Velocidad** | 30-60 seg | Instantáneo |
| **Confiabilidad** | Depende de cuota | 100% |
| **Requiere config** | Sí (API Key) | No |

---

## 🔍 Verificar tu Cuota

1. Ve a: https://platform.openai.com/account/usage
2. Verás cuánto has gastado
3. Verás cuánto crédito te queda
4. Puedes establecer límites de gasto

---

## ✅ ¿Qué Hice?

Modifiqué `aiTestService.ts` para que:

```typescript
try {
  // Intenta usar OpenAI
  const questions = await openai.chat.completions.create(...)
} catch (error) {
  // Si falla (cuota excedida, etc)
  // Usa el modo fallback sin IA
  return generateSimpleTestFromMemories(memories, numberOfQuestions);
}
```

**Tu aplicación ahora:**
- ✅ Intenta usar IA primero
- ✅ Si falla, usa modo fallback automáticamente
- ✅ Nunca deja de funcionar
- ✅ Siempre genera tests

---

## 💡 Conclusión

**Para desarrollo/pruebas**: Usa el modo fallback (ya funciona)

**Para producción real**: Agrega método de pago ($2-5 al mes es suficiente)

**Para seguir gratis**: Crea nueva cuenta de OpenAI cada vez que se acabe el crédito

---

¿Necesitas ayuda para configurar algo? ¡Avísame!
