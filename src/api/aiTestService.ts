import OpenAI from "openai";
import type { Memory } from "../types/Memory";
import type { TestQuestion } from "../types/Test";

// Inicializar la API de OpenAI
// ⚠️ IMPORTANTE: Debes crear un archivo .env con tu API KEY
// VITE_OPENAI_API_KEY=sk-proj-tu_clave_aqui
const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  console.error("⚠️ API Key de OpenAI no configurada. Agrega VITE_OPENAI_API_KEY en tu archivo .env");
}

const openai = new OpenAI({
  apiKey: apiKey || "",
  dangerouslyAllowBrowser: true // Permite usar OpenAI desde el navegador
});

/**
 * Genera preguntas de test basadas en las memorias del paciente usando OpenAI
 */
export async function generateTestFromMemories(
  memories: Memory[],
  numberOfQuestions: number = 5
): Promise<TestQuestion[]> {
  if (!apiKey) {
    throw new Error("API Key de OpenAI no configurada");
  }

  if (memories.length === 0) {
    throw new Error("No hay memorias disponibles para generar el test");
  }

  try {
    // Seleccionar memorias aleatorias si hay más de las necesarias
    const selectedMemories = memories
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(numberOfQuestions, memories.length));

    const questions: TestQuestion[] = [];

    for (const memory of selectedMemories) {
      const prompt = `
Eres un terapeuta especializado en pacientes con problemas de memoria (como Alzheimer o demencia).
Tienes una foto con esta descripción: "${memory.description}"

Tu tarea es crear UNA pregunta de opción múltiple que ayude a evaluar si el paciente recuerda esta memoria.

La pregunta debe ser:
- Clara y específica sobre la descripción
- Relacionada con detalles importantes de la memoria
- Con 4 opciones de respuesta (A, B, C, D)
- Una respuesta correcta y tres incorrectas pero creíbles

Responde ÚNICAMENTE en el siguiente formato JSON (sin texto adicional):
{
  "question": "¿Pregunta sobre la memoria?",
  "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
  "correctAnswer": 0
}

Donde correctAnswer es el índice (0-3) de la respuesta correcta.
`;

      // Llamar a OpenAI GPT-3.5-turbo
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "Eres un terapeuta especializado en crear preguntas de evaluación cognitiva para pacientes con problemas de memoria. Siempre respondes en formato JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: "json_object" } // Forzar respuesta en JSON
      });

      const responseText = completion.choices[0].message.content || "";
      
      // Parsear la respuesta JSON
      const parsedQuestion = JSON.parse(responseText);

      questions.push({
        id: `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        question: parsedQuestion.question,
        options: parsedQuestion.options,
        correctAnswer: parsedQuestion.correctAnswer,
        memoryId: memory.id,
        imageUrl: memory.imageUrl,
      });

      // Esperar un poco entre solicitudes para no saturar la API
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    if (questions.length === 0) {
      throw new Error("No se pudieron generar preguntas");
    }

    return questions;
  } catch (error: any) {
    console.error("Error generando test con IA:", error);
    
    // Si es un error de cuota o límite, usar fallback sin IA
    if (error.message?.includes("exceeded") || error.message?.includes("quota") || error.message?.includes("RateLimitError")) {
      console.warn("⚠️ Cuota de API excedida. Usando generación de preguntas sin IA (fallback)");
      return generateSimpleTestFromMemories(memories, numberOfQuestions);
    }
    
    throw error;
  }
}

/**
 * Genera preguntas adicionales basadas en una memoria específica
 */
export async function generateQuestionsFromMemory(
  memory: Memory,
  numberOfQuestions: number = 1
): Promise<TestQuestion[]> {
  return generateTestFromMemories([memory], numberOfQuestions);
}

/**
 * Analiza las respuestas del paciente y genera recomendaciones usando OpenAI
 */
export async function analyzeTestResults(
  score: number,
  totalQuestions: number,
  timeSpent: number
): Promise<string> {
  if (!apiKey) {
    return "No se pudo generar análisis: API Key no configurada";
  }

  try {
    const percentage = (score / totalQuestions) * 100;
    const avgTimePerQuestion = timeSpent / totalQuestions;

    const prompt = `
Un paciente ha completado un test de memoria con los siguientes resultados:
- Puntuación: ${score}/${totalQuestions} (${percentage.toFixed(1)}%)
- Tiempo promedio por pregunta: ${avgTimePerQuestion.toFixed(1)} segundos

Proporciona un análisis breve (2-3 oraciones) y recomendaciones para el cuidador.
Sé empático y constructivo.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un terapeuta especializado en pacientes con problemas de memoria. Proporciona análisis empáticos y constructivos."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return completion.choices[0].message.content || "No se pudo generar el análisis.";
  } catch (error) {
    console.error("Error analizando resultados:", error);
    return "No se pudo generar el análisis en este momento.";
  }
}

/**
 * Genera un test de práctica simple sin IA (fallback)
 * Se usa cuando la API de OpenAI falla o excede la cuota
 */
export function generateSimpleTestFromMemories(
  memories: Memory[],
  numberOfQuestions: number = 5
): TestQuestion[] {
  const selectedMemories = memories
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(numberOfQuestions, memories.length));

  return selectedMemories.map((memory, index) => {
    // Generar opciones basadas en la descripción
    const templates = [
      {
        question: `¿Recuerdas qué había en esta foto?`,
        correctOption: memory.description,
        wrongOptions: [
          "Una celebración familiar",
          "Un día en el parque",
          "Una comida especial"
        ]
      },
      {
        question: `¿Qué momento representa esta imagen?`,
        correctOption: memory.description,
        wrongOptions: [
          "Un viaje a la playa",
          "Una reunión de amigos",
          "Un evento importante"
        ]
      },
      {
        question: `Esta foto muestra...`,
        correctOption: memory.description,
        wrongOptions: [
          "Un recuerdo familiar",
          "Una ocasión especial",
          "Un lugar significativo"
        ]
      }
    ];

    // Seleccionar un template aleatorio
    const template = templates[index % templates.length];
    
    // Crear opciones mezcladas
    const allOptions = [
      template.correctOption,
      ...template.wrongOptions.slice(0, 3)
    ].sort(() => Math.random() - 0.5);
    
    const correctAnswer = allOptions.indexOf(template.correctOption);

    return {
      id: `q_fallback_${Date.now()}_${index}`,
      question: template.question,
      options: allOptions,
      correctAnswer,
      memoryId: memory.id,
      imageUrl: memory.imageUrl,
    };
  });
}

/**
 * Genera un reporte médico completo analizando los tests del paciente usando IA
 */
export async function generatePatientReport(
  patientName: string,
  tests: Array<{
    title: string;
    date: Date;
    score: number;
    totalQuestions: number;
    totalTime: number;
  }>
): Promise<string> {
  if (!apiKey) {
    console.warn("⚠️ API Key no disponible. Generando reporte sin IA...");
    return generateSimpleReport(patientName, tests);
  }

  try {
    // Preparar los datos de los tests
    const testsData = tests.map((test, index) => ({
      numero: index + 1,
      fecha: test.date.toLocaleDateString("es-ES"),
      puntuacion: `${test.score}/${test.totalQuestions}`,
      porcentaje: Math.round((test.score / test.totalQuestions) * 100),
      tiempo: `${Math.floor(test.totalTime / 60)}m ${test.totalTime % 60}s`
    }));

    const prompt = `
Eres un médico especialista en neurología y enfermedades neurodegenerativas como Alzheimer y demencia.

Debes generar un REPORTE MÉDICO PROFESIONAL para el paciente "${patientName}" basándote en los resultados de ${tests.length} tests cognitivos realizados:

${JSON.stringify(testsData, null, 2)}

Tu reporte debe incluir:

1. **RESUMEN EJECUTIVO** (2-3 líneas)
   - Estado general de la memoria del paciente
   
2. **ANÁLISIS DE TENDENCIAS**
   - ¿Hay mejoría, estabilidad o deterioro?
   - Comparación entre el primer y último test
   - Identificación de patrones
   
3. **EVALUACIÓN DEL RENDIMIENTO**
   - Rendimiento promedio
   - Consistencia en las respuestas
   - Análisis del tiempo de respuesta
   
4. **OBSERVACIONES CLÍNICAS**
   - Puntos fuertes identificados
   - Áreas de preocupación
   
5. **RECOMENDACIONES**
   - Sugerencias terapéuticas específicas
   - Actividades recomendadas
   - Frecuencia de evaluaciones futuras

El reporte debe ser:
- Profesional y empático
- Basado en datos objetivos
- Con lenguaje médico apropiado pero comprensible
- Formato en Markdown con secciones claras
- Máximo 500 palabras

Genera el reporte ahora:`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "Eres un médico neurólogo especializado en evaluación cognitiva y enfermedades neurodegenerativas."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const report = response.choices[0]?.message?.content || "";
    
    if (!report) {
      throw new Error("No se recibió respuesta de la IA");
    }

    console.log("✅ Reporte generado con IA exitosamente");
    return report;

  } catch (error: any) {
    console.error("❌ Error generando reporte con IA:", error);
    
    // Si hay error de cuota o cualquier otro, usar fallback
    if (error.message?.toLowerCase().includes("quota") || 
        error.message?.toLowerCase().includes("exceeded") ||
        error.code === "insufficient_quota") {
      console.warn("⚠️ Cuota de API excedida. Usando reporte simple (fallback)");
    }
    
    return generateSimpleReport(patientName, tests);
  }
}

/**
 * Genera un reporte simple sin IA (fallback)
 */
function generateSimpleReport(
  patientName: string,
  tests: Array<{
    title: string;
    date: Date;
    score: number;
    totalQuestions: number;
    totalTime: number;
  }>
): string {
  const scores = tests.map(t => (t.score / t.totalQuestions) * 100);
  const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
  const firstScore = scores[0];
  const lastScore = scores[scores.length - 1];
  const trend = lastScore > firstScore ? "mejoría" : lastScore < firstScore ? "leve deterioro" : "estabilidad";

  return `# 📋 Reporte Médico - ${patientName}

## 📊 Resumen Ejecutivo

Se han evaluado **${tests.length} tests cognitivos** del paciente. El rendimiento promedio es de **${avgScore.toFixed(1)}%**, mostrando una tendencia de **${trend}** entre la primera y última evaluación.

## 📈 Análisis de Tendencias

- **Primera evaluación:** ${firstScore.toFixed(1)}%
- **Última evaluación:** ${lastScore.toFixed(1)}%
- **Cambio:** ${(lastScore - firstScore).toFixed(1)}%

${lastScore > firstScore 
  ? "✅ Se observa una tendencia positiva, indicando que las terapias y actividades están teniendo efecto beneficioso."
  : lastScore < firstScore
  ? "⚠️ Se detecta una leve disminución en el rendimiento. Se recomienda ajustar el plan terapéutico."
  : "➡️ El rendimiento se mantiene estable, lo cual es positivo en el contexto de enfermedades neurodegenerativas."}

## 🎯 Evaluación del Rendimiento

- **Rendimiento Promedio:** ${avgScore.toFixed(1)}%
- **Tests Completados:** ${tests.length}
- **Rango:** ${Math.min(...scores).toFixed(1)}% - ${Math.max(...scores).toFixed(1)}%

## 💡 Recomendaciones

1. **Continuar con evaluaciones periódicas** (cada 1-2 semanas)
2. **Mantener actividades de estimulación cognitiva** diarias
3. **Reforzar memorias con álbumes fotográficos** familiares
4. **Establecer rutinas** consistentes para mejorar orientación temporal
5. **Realizar seguimiento** médico en caso de deterioro significativo

---
*Reporte generado automáticamente el ${new Date().toLocaleDateString("es-ES")}*
`;
}
