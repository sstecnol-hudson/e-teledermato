import { useAuth } from '../context/AuthContext';
import { LogOut, PlusCircle, List, BarChart, Clock, CheckCircle, AlertTriangle, FileText, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api, { API_BASE_URL } from '../services/api';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        const response = await api.get('/cases/');
        setCases(response.data);
      } catch (err) {
        console.error("Erro ao buscar casos", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCases();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pendente': return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">Pendente</span>;
      case 'em_analise': return <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Em Análise</span>;
      case 'concluido': return <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Concluído</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">{status}</span>;
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case 'verde': return <span className="w-3 h-3 rounded-full bg-green-500 inline-block mr-1"></span>;
      case 'amarelo_leve': return <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block mr-1"></span>;
      case 'amarelo_grave': return <span className="w-3 h-3 rounded-full bg-orange-500 inline-block mr-1"></span>;
      case 'vermelho': return <span className="w-3 h-3 rounded-full bg-red-600 inline-block mr-1"></span>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-bold text-blue-600">E-Teledermato</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.email}</span>
              <button
                onClick={logout}
                className="flex items-center text-gray-500 hover:text-red-600"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Painel de Controle</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Link
            to="/novo-caso"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
          >
            <PlusCircle className="h-12 w-12 text-blue-500 mb-4" />
            <h2 className="text-xl font-semibold text-center">Novo Caso</h2>
            <p className="text-gray-500 text-center mt-2 text-sm">Registrar nova solicitação</p>
          </Link>

          <Link
            to="/cadastro-paciente"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
          >
            <UserPlus className="h-12 w-12 text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold text-center">Cadastrar Paciente</h2>
            <p className="text-gray-500 text-center mt-2 text-sm">Adicionar paciente ao sistema</p>
          </Link>

          <Link
            to="/meus-casos"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
          >
            <List className="h-12 w-12 text-green-500 mb-4" />
            <h2 className="text-xl font-semibold text-center">Meus Casos</h2>
            <p className="text-gray-500 text-center mt-2 text-sm">Acompanhar solicitações</p>
          </Link>

          <Link
            to="/metricas"
            className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
          >
            <BarChart className="h-12 w-12 text-purple-500 mb-4" />
            <h2 className="text-xl font-semibold text-center">Métricas</h2>
            <p className="text-gray-500 text-center mt-2 text-sm">Visualizar indicadores</p>
          </Link>
        </div>

        {/* Fila de Casos */}
        <div className="mt-12 bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">
              {user?.role === 'dermatologista' ? 'Fila de Regulação' : 'Minhas Solicitações'}
            </h2>
            <div className="flex space-x-2">
              <span className="flex items-center text-xs text-gray-500"><Clock size={14} className="mr-1" /> SLA 72h</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 text-left">Risco</th>
                  <th className="px-6 py-3 text-left">Protocolo</th>
                  <th className="px-6 py-3 text-left">Localização</th>
                  <th className="px-6 py-3 text-left">Data</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-4 text-center">Carregando casos...</td></tr>
                ) : cases.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-4 text-center text-gray-500">Nenhum caso encontrado</td></tr>
                ) : (
                  cases.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRiskBadge(c.risk_level)}
                        <span className="text-sm text-gray-900 capitalize">{c.risk_level?.replace('_', ' ') || 'Não Triado'}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {c.protocol_type === 'cancer_pele' ? 'A - Câncer' : 'B - Outras'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {c.lesion_location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(c.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {user?.role === 'dermatologista' && c.status === 'pendente' ? (
                          <Link to={`/analise/${c.id}`} className="text-blue-600 hover:text-blue-900 bg-blue-50 px-3 py-1 rounded">Laudar</Link>
                        ) : c.status === 'concluido' ? (
                          <button 
                            onClick={() => window.open(`${API_BASE_URL}/api/v1/reports/${c.id}/pdf`, '_blank')}
                            className="text-green-600 hover:text-green-900 flex items-center justify-end ml-auto"
                          >
                            <FileText size={16} className="mr-1" /> PDF
                          </button>
                        ) : (
                          <span className="text-gray-400 italic">Em processamento</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
