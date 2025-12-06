import { useState, useEffect } from 'react';
import { AlertTriangle, MapPin, Clock, ChevronDown, ChevronUp, Shield, Hash } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Report {
  id: string;
  name?: string;
  type: string;
  email?: string;
  phone?: string;
  status: string;
  location: string;
  createdAt: string;
  description: string;
  isAnonymous: boolean;
  trackingNumber: string;
  priority?: 'high' | 'medium' | 'low';
}

interface ReportsListProps {
  onNavigateToReport: () => void;
}

export function ReportsList({ onNavigateToReport }: ReportsListProps) {
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-1cd2eafa/reports`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );

      const data = await response.json();
      if (data.reports) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    const now = new Date();
    const reportTime = new Date(timestamp);
    const diffMs = now.getTime() - reportTime.getTime();
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

  const getReportTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'suspicious': 'Actividad sospechosa',
      'theft': 'Robo o intento de robo',
      'violence': 'Violencia o agresión',
      'vandalism': 'Vandalismo',
      'drugs': 'Actividad relacionada con drogas',
      'vehicle': 'Vehículo sospechoso',
      'other': 'Otro'
    };
    return types[type] || type;
  };

  const getPriority = (report: Report): 'high' | 'medium' | 'low' => {
    // Si el backend envía priority, usarla, si no, default a 'high'
    return report.priority || 'high';
  };

  const getReportColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-orange-500 bg-orange-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  const getReportBadgeColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityLevel = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high':
        return 'Alta';
      case 'medium':
        return 'Media';
      case 'low':
        return 'Baja';
    }
  };

  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: string } = {
      'pending': 'Pendiente',
      'in_progress': 'En proceso',
      'resolved': 'Resuelto',
      'rejected': 'Rechazado'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-semibold text-indigo-900">Reportes de Seguridad</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Reportes enviados por la comunidad sobre actividades de seguridad
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">Cargando reportes...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">No hay reportes en este momento</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const priority = getPriority(report);
            return (
              <div
                key={report.id}
                className={`bg-white rounded-lg shadow-md border-l-4 overflow-hidden ${getReportColor(priority)}`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReportBadgeColor(priority)}`}>
                          Prioridad {getPriorityLevel(priority)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                        {report.isAnonymous && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            Anónimo
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {getReportTypeLabel(report.type)}
                      </h3>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span>{report.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>{getTimeAgo(report.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Hash className="w-4 h-4" />
                          <span className="font-mono">{report.trackingNumber}</span>
                        </div>
                      </div>

                      {expandedReport === report.id && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-gray-700 mb-3">
                            {report.description}
                          </p>
                          
                          {!report.isAnonymous && (report.name || report.phone || report.email) && (
                            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
                              <p className="text-sm font-medium text-gray-700 mb-2">Información de contacto:</p>
                              {report.name && (
                                <p className="text-sm text-gray-600">Nombre: {report.name}</p>
                              )}
                              {report.phone && (
                                <p className="text-sm text-gray-600">Teléfono: {report.phone}</p>
                              )}
                              {report.email && (
                                <p className="text-sm text-gray-600">Email: {report.email}</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setExpandedReport(expandedReport === report.id ? null : report.id)}
                      className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
                      aria-label={expandedReport === report.id ? 'Contraer' : 'Expandir'}
                    >
                      {expandedReport === report.id ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">¿Ves algo sospechoso?</h3>
        <p className="text-indigo-100 mb-4">
          Reporta inmediatamente cualquier actividad inusual en tu zona
        </p>
        <button 
          onClick={onNavigateToReport}
          className="bg-white text-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
        >
          Hacer un reporte
        </button>
      </div>
    </div>
  );
}