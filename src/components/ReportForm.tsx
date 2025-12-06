import { useState } from 'react';
import { Shield, MapPin, Camera, Send, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function ReportForm() {
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    location: '',
    description: '',
    name: '',
    phone: '',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cd2eafa/reports`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            type: formData.type,
            location: formData.location,
            description: formData.description,
            isAnonymous,
            name: isAnonymous ? null : formData.name,
            phone: isAnonymous ? null : formData.phone,
            email: isAnonymous ? null : formData.email
          })
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setTrackingNumber(data.trackingNumber);
        setSubmitted(true);
        setTimeout(() => {
          setSubmitted(false);
          setFormData({
            type: '',
            location: '',
            description: '',
            name: '',
            phone: '',
            email: ''
          });
        }, 5000);
      } else {
        console.error('Error submitting report:', data.error);
        alert('Error al enviar el reporte. Por favor intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Error al enviar el reporte. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-green-700 mb-2">¡Reporte enviado exitosamente!</h2>
        <p className="text-gray-600 mb-4">
          Las autoridades han recibido tu reporte y lo están evaluando.
          {isAnonymous && ' Tu identidad permanece protegida.'}
        </p>
        <p className="text-sm text-gray-500">
          Número de seguimiento: #{trackingNumber}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-6 h-6 text-indigo-600" />
          <h2 className="text-indigo-900">Reportar Actividad Sospechosa</h2>
        </div>
        <p className="text-gray-600">
          Tu reporte ayuda a mantener segura nuestra comunidad. Todos los reportes son revisados por las autoridades.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        {/* Anonymous Toggle */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mt-1 w-4 h-4 text-indigo-600 rounded"
            />
            <div className="flex-1">
              <div className="text-gray-900">Reporte anónimo</div>
              <div className="text-sm text-gray-600">
                Tu identidad será protegida. No se compartirá tu información personal.
              </div>
            </div>
          </label>
        </div>

        {/* Type of Incident */}
        <div>
          <label className="block text-gray-900 mb-2">
            Tipo de incidente *
          </label>
          <select
            required
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="">Selecciona un tipo</option>
            <option value="suspicious">Actividad sospechosa</option>
            <option value="theft">Robo o intento de robo</option>
            <option value="violence">Violencia o agresión</option>
            <option value="vandalism">Vandalismo</option>
            <option value="drugs">Actividad relacionada con drogas</option>
            <option value="vehicle">Vehículo sospechoso</option>
            <option value="other">Otro</option>
          </select>
        </div>

        {/* Location */}
        <div>
          <label className="block text-gray-900 mb-2">
            Ubicación *
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Ej: Calle Principal #123, Parque Central"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Indica el lugar más preciso posible
          </p>
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-900 mb-2">
            Descripción del incidente *
          </label>
          <textarea
            required
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={5}
            placeholder="Describe lo que viste o escuchaste. Incluye detalles como hora, personas involucradas, vehículos, etc."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-gray-900 mb-2">
            Adjuntar foto o video (opcional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-indigo-400 transition-colors cursor-pointer">
            <Camera className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 mb-1">
              Haz clic para adjuntar evidencia
            </p>
            <p className="text-sm text-gray-500">
              PNG, JPG, MP4 (máx. 10MB)
            </p>
          </div>
        </div>

        {/* Contact Information (if not anonymous) */}
        {!isAnonymous && (
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-gray-900">Información de contacto (opcional)</h3>
            
            <div>
              <label className="block text-gray-700 mb-2">
                Nombre completo
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Tu nombre"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Tu número de teléfono"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="tu@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            <span>Enviar reporte</span>
          </button>
        </div>

        <p className="text-sm text-gray-500 text-center">
          Al enviar este reporte, aceptas que la información será revisada por las autoridades competentes
        </p>
      </form>
    </div>
  );
}