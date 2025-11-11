# 🧠 Sistema de Tests con IA para Pacientes

## 📋 ¿Cómo funciona?

Este sistema permite que **cuidadores y doctores** generen tests personalizados para pacientes basándose en las memorias (fotos y descripciones) que han subido.

### 🎯 Flujo del Sistema:

1. **Cuidador sube memorias** → Fotos con descripciones
2. **IA analiza las memorias** → OpenAI GPT genera preguntas personalizadas
3. **Paciente toma el test** → Responde preguntas sobre sus memorias
4. **Sistema evalúa** → Calcula puntuación y genera análisis
5. **Doctor/Cuidador revisa** → Ve resultados y progreso

---

## 🚀 Configuración

### 1. Instalar dependencias

```bash
npm install openai
```

### 2. Obtener API Key de OpenAI

1. **Regístrate**: https://platform.openai.com/signup
2. **Verifica tu email**
3. **Ve a**: https://platform.openai.com/api-keys
4. **Click en**: "Create new secret key"
5. **Dale un nombre**: "DoRemember App"
6. **Copia la clave** (empieza con `sk-proj-...`)
   - ⚠️ **IMPORTANTE**: Guárdala bien, solo se muestra una vez

### 3. Configurar variables de entorno

Abre tu archivo `.env` y agrega:

```bash
VITE_OPENAI_API_KEY=sk-proj-tu_clave_aqui
```

**💰 Créditos Gratis**: OpenAI te da $5 USD de crédito gratis al registrarte.
- Cada test cuesta aproximadamente $0.002 USD
- Con $5 puedes generar ~2,500 tests
- Es MUY económico y confiable

---

## 📁 Estructura de Archivos Creados

```
src/
├── types/
│   └── Test.ts                 # Tipos TypeScript para tests
├── api/
│   ├── aiTestService.ts        # Servicio de IA (Google Gemini)
│   └── testService.ts          # Servicio de Firestore para tests
└── modules/
    └── caregiver/              # (Por implementar)
        └── GenerateTest.tsx    # Componente para generar tests
```

---

## 🔧 Uso del Sistema

### Para Cuidadores/Doctores:

#### Generar un Test con IA

```typescript
import { generateTestFromMemories } from '../api/aiTestService';
import { createTest } from '../api/testService';
import { getMemories } from '../api/memoryService';

// 1. Obtener memorias del paciente
const memories = await getMemories(patientId, 'caregiver');

// 2. Generar preguntas con IA
const questions = await generateTestFromMemories(memories, 5); // 5 preguntas

// 3. Crear el test
const testId = await createTest(
  patientId,
  questions,
  { id: caregiverId, role: 'caregiver' },
  'Test de Memoria - Noviembre 2025',
  'Test generado automáticamente basado en las últimas memorias'
);
```

#### Ver Tests de un Paciente

```typescript
import { getAllTestsByPatient, getTestStatistics } from '../api/testService';

// Obtener todos los tests
const tests = await getAllTestsByPatient(patientId);

// Obtener estadísticas
const stats = await getTestStatistics(patientId);
console.log(`Promedio: ${stats.averageScore}%`);
console.log(`Completados: ${stats.completed}/${stats.total}`);
```

### Para Pacientes:

#### Ver Tests Pendientes

```typescript
import { getPendingTests } from '../api/testService';

const pendingTests = await getPendingTests(patientId);
```

#### Completar un Test

```typescript
import { submitTestResults } from '../api/testService';

// Después de que el paciente responda
const answers = [
  { questionId: 'q1', selectedAnswer: 0, isCorrect: true, timeSpent: 15 },
  { questionId: 'q2', selectedAnswer: 2, isCorrect: false, timeSpent: 20 },
  // ...
];

const score = answers.filter(a => a.isCorrect).length;
const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);

await submitTestResults(testId, patientId, answers, score, totalTime);
```

---

## 🎨 Ejemplo de Componente React

### Componente para Generar Test (Cuidador)

```tsx
import { useState } from 'react';
import { generateTestFromMemories } from '../../api/aiTestService';
import { createTest } from '../../api/testService';
import { getMemories } from '../../api/memoryService';
import { useAuth } from '../../auth/useAuth';

export default function GenerateTestButton({ patientId }: { patientId: string }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleGenerateTest = async () => {
    try {
      setLoading(true);

      // 1. Obtener memorias
      const memories = await getMemories(patientId, 'caregiver');
      
      if (memories.length < 3) {
        alert('Se necesitan al menos 3 memorias para generar un test');
        return;
      }

      // 2. Generar preguntas con IA
      const questions = await generateTestFromMemories(memories, 5);

      // 3. Crear test
      await createTest(
        patientId,
        questions,
        { id: user!.uid, role: 'caregiver' },
        `Test de Memoria - ${new Date().toLocaleDateString()}`,
        'Generado automáticamente con IA'
      );

      alert('¡Test creado exitosamente!');
    } catch (error) {
      console.error(error);
      alert('Error generando test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleGenerateTest} disabled={loading}>
      {loading ? '⏳ Generando...' : '🤖 Generar Test con IA'}
    </button>
  );
}
```

---

## 📊 Estructura de Datos en Firestore

### Colección `tests`

```javascript
{
  patientId: "abc123",
  caregiverId: "xyz789",
  questions: [
    {
      id: "q_1234",
      question: "¿Qué recuerdas sobre esta foto de tu cumpleaños?",
      options: ["Fue en 2020", "Fue en 2021", "Fue en 2022", "No lo recuerdo"],
      correctAnswer: 1,
      memoryId: "mem_456",
      imageUrl: "https://..."
    }
  ],
  createdAt: Timestamp,
  completedAt: Timestamp,
  status: "completed",
  score: 4,
  totalQuestions: 5,
  title: "Test de Memoria - Noviembre 2025"
}
```

### Colección `testResults`

```javascript
{
  testId: "test_123",
  patientId: "abc123",
  answers: [
    {
      questionId: "q_1234",
      selectedAnswer: 1,
      isCorrect: true,
      timeSpent: 15
    }
  ],
  score: 4,
  completedAt: Timestamp,
  totalTimeSpent: 120
}
```

---

## 🔒 Reglas de Seguridad de Firestore

Actualiza tus reglas de Firestore para incluir tests:

```javascript
// Tests: pacientes pueden leer sus propios tests, cuidadores/doctores pueden crear y leer
match /tests/{testId} {
  allow read: if request.auth != null && (
    resource.data.patientId == request.auth.uid ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor' ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'caregiver'
  );
  
  allow create: if request.auth != null && (
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor' ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'caregiver'
  );
  
  allow update: if request.auth != null && (
    resource.data.patientId == request.auth.uid ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor' ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'caregiver'
  );
}

// Resultados: solo lectura para doctores y cuidadores
match /testResults/{resultId} {
  allow read: if request.auth != null && (
    resource.data.patientId == request.auth.uid ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'doctor' ||
    get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'caregiver'
  );
  
  allow create: if request.auth != null && resource.data.patientId == request.auth.uid;
}
```

---

## 🎯 Próximos Pasos

1. ✅ Crear componente UI para generar tests (cuidador)
2. ✅ Crear componente UI para tomar tests (paciente)
3. ✅ Crear dashboard de estadísticas (doctor)
4. ✅ Agregar notificaciones cuando haya tests pendientes
5. ✅ Implementar análisis de progreso con gráficas

---

## 💡 Tips y Mejores Prácticas

- **Frecuencia**: Genera tests 1-2 veces por semana
- **Cantidad**: 5-10 preguntas por test es óptimo
- **Memorias**: Usa memorias recientes y significativas
- **Tiempo**: Los tests deben completarse en 5-10 minutos
- **Feedback**: Muestra resultados inmediatos al paciente

---

## 🐛 Solución de Problemas

### Error: "API Key de Gemini no configurada"
- Verifica que el archivo `.env` exista
- Verifica que la variable se llame exactamente `VITE_GEMINI_API_KEY`
- Reinicia el servidor de desarrollo (`npm run dev`)

### Error: "No se pudieron generar preguntas"
- Verifica que tengas memorias con descripciones
- Revisa la consola para ver errores específicos de la API
- Verifica tu cuota de API de Gemini

### Las preguntas no tienen sentido
- Asegúrate de que las descripciones de memorias sean detalladas
- Considera ajustar el prompt en `aiTestService.ts`

---

## 📞 Soporte

Para más ayuda, revisa:
- [Documentación de Google Gemini](https://ai.google.dev/docs)
- [Documentación de Firebase](https://firebase.google.com/docs)
