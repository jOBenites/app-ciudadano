import { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle, ThumbsUp, ThumbsDown } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Survey {
  id: string;
  title: string;
  description: string;
  type: 'rating' | 'yesno' | 'multiple';
  options?: string[];
  completed?: boolean;
}

export function SurveysList() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cd2eafa/surveys`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();
      if (data.surveys) {
        setSurveys(data.surveys);
      }
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnswer = async (surveyId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cd2eafa/survey-responses`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            surveyId,
            answer: answers[surveyId]
          })
        }
      );

      const data = await response.json();
      if (data.success) {
        setSurveys(surveys.map(s => 
          s.id === surveyId ? { ...s, completed: true } : s
        ));
        setSelectedSurvey(null);
      }
    } catch (error) {
      console.error('Error submitting survey response:', error);
    }
  };

  const renderSurveyContent = (survey: Survey) => {
    if (survey.type === 'rating') {
      return (
        <div className="space-y-3">
          <p className="text-gray-700">Selecciona una calificación del 1 al 5:</p>
          <div className="flex gap-2 justify-center">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                onClick={() => setAnswers({ ...answers, [survey.id]: rating })}
                className={`w-12 h-12 rounded-full border-2 transition-all ${
                  answers[survey.id] === rating
                    ? 'bg-indigo-600 text-white border-indigo-600 scale-110'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-indigo-400'
                }`}
              >
                {rating}
              </button>
            ))}
          </div>
          <div className="flex justify-between text-sm text-gray-500 px-2">
            <span>Muy inseguro</span>
            <span>Muy seguro</span>
          </div>
        </div>
      );
    }

    if (survey.type === 'yesno') {
      return (
        <div className="space-y-3">
          <p className="text-gray-700 text-center mb-4">Selecciona una opción:</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setAnswers({ ...answers, [survey.id]: 'yes' })}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                answers[survey.id] === 'yes'
                  ? 'bg-green-50 border-green-500 text-green-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-green-400'
              }`}
            >
              <ThumbsUp className="w-6 h-6" />
              <span>Sí</span>
            </button>
            <button
              onClick={() => setAnswers({ ...answers, [survey.id]: 'no' })}
              className={`flex items-center justify-center gap-2 p-4 rounded-lg border-2 transition-all ${
                answers[survey.id] === 'no'
                  ? 'bg-red-50 border-red-500 text-red-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-red-400'
              }`}
            >
              <ThumbsDown className="w-6 h-6" />
              <span>No</span>
            </button>
          </div>
        </div>
      );
    }

    if (survey.type === 'multiple' && survey.options) {
      return (
        <div className="space-y-2">
          <p className="text-gray-700 mb-3">Selecciona una o más opciones:</p>
          {survey.options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                checked={(answers[survey.id] || []).includes(option)}
                onChange={(e) => {
                  const current = answers[survey.id] || [];
                  if (e.target.checked) {
                    setAnswers({ ...answers, [survey.id]: [...current, option] });
                  } else {
                    setAnswers({ ...answers, [survey.id]: current.filter((o: string) => o !== option) });
                  }
                }}
                className="w-4 h-4 text-indigo-600 rounded"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="w-6 h-6 text-indigo-600" />
          <h2 className="text-indigo-900">Encuestas de Seguridad</h2>
        </div>
        <p className="text-gray-600">
          Tu opinión es importante para mejorar la seguridad en nuestra comunidad
        </p>
      </div>

      <div className="space-y-3">
        {surveys.map((survey) => (
          <div key={survey.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                  <h3 className="text-gray-900 mb-1">{survey.title}</h3>
                  <p className="text-sm text-gray-600">{survey.description}</p>
                </div>
                {survey.completed && (
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                )}
              </div>

              {survey.completed ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                  <p className="text-green-700">
                    ¡Gracias por participar! Tu respuesta ha sido registrada.
                  </p>
                </div>
              ) : selectedSurvey === survey.id ? (
                <div className="mt-4 space-y-4">
                  {renderSurveyContent(survey)}
                  <div className="flex gap-2 pt-3">
                    <button
                      onClick={() => handleSubmitAnswer(survey.id)}
                      disabled={!answers[survey.id]}
                      className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                      Enviar respuesta
                    </button>
                    <button
                      onClick={() => setSelectedSurvey(null)}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setSelectedSurvey(survey.id)}
                  className="mt-3 w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Responder encuesta
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-md p-6 text-white">
        <h3 className="mb-2">Tu opinión cuenta</h3>
        <p className="text-indigo-100">
          Cada respuesta nos ayuda a tomar mejores decisiones para la seguridad de todos.
          Completa las encuestas regularmente para mantenernos informados.
        </p>
      </div>
    </div>
  );
}