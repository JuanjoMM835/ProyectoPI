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
