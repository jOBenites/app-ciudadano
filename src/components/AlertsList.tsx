import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Alert {
  id: string;
  type: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  location: string;
  time?: string;
  timestamp: string;
  distance: string;
}

interface AlertsListProps {
  onNavigateToReport: () => void;
}

export function AlertsList({ onNavigateToReport }: AlertsListProps) {
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cd2eafa/alerts`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();
      if (data.alerts) {
        // Calculate time ago for each alert
        const alertsWithTime = data.alerts.map((alert: Alert) => ({
          ...alert,
          time: getTimeAgo(alert.timestamp)
        }));
        setAlerts(alertsWithTime);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMs = now.getTime() - alertTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) {
      return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `Hace ${hours} hora${hours !== 1 ? 's' : ''}`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `Hace ${days} día${days !== 1 ? 's' : ''}`;
    }
  };

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getAlertBadgeColor = (type: Alert['type']) => {
    switch (type) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getAlertLevel = (type: Alert['type']) => {
    switch (type) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-indigo-600" />
          <h2 className="text-indigo-900">Alertas de Seguridad</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Mantente informado sobre las actividades de seguridad en tu zona
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">Cargando alertas...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">No hay alertas activas en este momento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`bg-white rounded-lg shadow-md border-l-4 overflow-hidden ${getAlertColor(alert.type)}`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${getAlertBadgeColor(alert.type)}`}>
                        Prioridad {getAlertLevel(alert.type)}
                      </span>
                    </div>
                    <h3 className="text-gray-900 mb-2">{alert.title}</h3>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{alert.time}</span>
                      </div>
                      <span className="text-indigo-600">{alert.distance} de distancia</span>
                    </div>

                    {expandedAlert === alert.id && (
                      <p className="text-gray-700 mb-3">
                        {alert.description}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                    className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                  >
                    {expandedAlert === alert.id ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <h3 className="mb-2">¿Ves algo sospechoso?</h3>
        <p className="text-indigo-100 mb-4">
          Reporta inmediatamente cualquier actividad inusual en tu zona
        </p>
        <button 
          onClick={onNavigateToReport}
          className="bg-white text-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
        >
          Hacer un reporte
        </button>
      </div>
    </div>
  );
}