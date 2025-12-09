import { useState } from 'react';
import { ReportForm } from './components/ReportForm';
import { AlertsList } from './components/AlertsList';
import { PoliceChat } from './components/PoliceChat';
import { SurveysList } from './components/SurveysList';
import { DataInitializer } from './components/DataInitializer';
import { Shield, AlertTriangle, MessageCircle, ClipboardList } from 'lucide-react';

type TabType = 'report' | 'alerts' | 'chat' | 'surveys';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('alerts');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DataInitializer />
      
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            <div>
              <h1 className="text-indigo-900">Seguridad Ciudadana</h1>
              <p className="text-gray-600 text-sm">Tu comunidad, tu seguridad</p>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('alerts')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'alerts'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
              <span>Alertas</span>
            </button>
            <button
              onClick={() => setActiveTab('report')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'report'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <Shield className="w-5 h-5" />
              <span>Reportar</span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'chat'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat</span>
            </button>
            <button
              onClick={() => setActiveTab('surveys')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'surveys'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              <ClipboardList className="w-5 h-5" />
              <span>Encuestas</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === 'alerts' && <AlertsList onNavigateToReport={() => setActiveTab('report')} />}
        {/* {activeTab === 'alerts' && <ReportsList onNavigateToReport={() => setActiveTab('report')} />} */}
        {activeTab === 'report' && <ReportForm />}
        {activeTab === 'chat' && <PoliceChat />}
        {activeTab === 'surveys' && <SurveysList />}
      </main>
    </div>
  );
}