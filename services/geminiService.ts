import { GoogleGenAI, Type } from "@google/genai";
import { AppState, AIAnalysisResult } from "../types";
import { MEDICATIONS } from "../constants";

export const analyzeHealthStatus = async (state: AppState): Promise<AIAnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const takenMeds = MEDICATIONS.filter(m => state.takenMedications[m.id]).map(m => `${m.name} (${m.dosage})`);
  const missedMeds = MEDICATIONS.filter(m => !state.takenMedications[m.id]).map(m => m.name);
  
  const sleepLabels: Record<string, string> = { good: 'جيد جداً ومريح', fair: 'متقطع أو متوسط', poor: 'سيء أو غير كافٍ' };
  const appetiteLabels: Record<string, string> = { good: 'ممتازة', fair: 'طبيعية', poor: 'ضعيفة جداً' };

  const prompt = `
    أنت خبير طبي استشاري ومساعد صحي ذكي. حلل البيانات الصحية الشاملة التالية للمريض ${state.patientName} (العمر: ${state.patientAge} عاماً):

    السياق الصحي اليومي:
    - الأدوية التي تم تناولها: ${takenMeds.join('، ') || 'لم يتم تسجيل أدوية مأخوذة'}
    - الأدوية التي لم يتم تناولها بعد: ${missedMeds.join('، ') || 'تم تناول جميع الأدوية المجدولة'}
    - تقييم الحالة العامة (من 5): ${state.currentReport.healthRating}
    - مقياس الألم (0-10): ${state.currentReport.painLevel}
    - موقع الألم المذكور: ${state.currentReport.painLocation || 'لا يوجد ألم محدد'}
    - جودة النوم الأخيرة: ${sleepLabels[state.currentReport.sleepQuality] || 'غير محددة'}
    - حالة الشهية اليوم: ${appetiteLabels[state.currentReport.appetite] || 'غير محددة'}
    - الأعراض المرصودة: ${state.currentReport.symptoms.join('، ') || 'لا توجد أعراض مزعجة مسجلة'}
    - ملاحظات إضافية من المريض: ${state.currentReport.notes || 'لا توجد'}

    المطلوب منك تحليل الطبيب الحكيم:
    1. ملخص شامل (Summary): قدم قراءة تحليلية للحالة مع الربط بين الأعراض والأدوية المأخوذة (خاصة أدوية الضغط والسيولة). استخدم نبرة مطمئنة لكنها مهنية.
    2. توصيات (Recommendations): اقترح إجراءات عملية (تغيير نمط الغذاء، توقيت شرب المياه، تمارين خفيفة، أو استشارة الطبيب).
    3. تحذيرات (Warnings): ركز بشدة على تداخلات الأدوية أو إذا كان الألم المذكور في منطقة حساسة (مثل الصدر) أو أعراض تشير لخلل في السيولة أو الضغط.
    4. نقاط إيجابية (Positive Points): شجع المريض على الالتزام بالأدوية التي أخذها أو التحسن في بعض المؤشرات.

    ملاحظة هامة: إذا كان المريض يأخذ أدوية سيولة (مثل Plavix أو Eliquis) ويعاني من أعراض نزيف أو كدمات أو صداع حاد، يجب ذكر ذلك في التحذيرات فوراً.

    الرد يجب أن يكون بصيغة JSON حصراً وباللغة العربية.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      thinkingConfig: { thinkingBudget: 8000 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          warnings: { type: Type.ARRAY, items: { type: Type.STRING } },
          positivePoints: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["summary", "recommendations", "warnings", "positivePoints"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("فشل الحصول على استجابة من الذكاء الاصطناعي");
  return JSON.parse(text) as AIAnalysisResult;
};