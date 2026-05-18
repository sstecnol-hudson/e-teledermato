import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Save, AlertCircle, CheckCircle, Info } from 'lucide-react';
import api, { API_BASE_URL } from '../services/api';

const CaseAnalysisPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState({
    hypothesis: '',
    cid10: '',
    conduct: '',
    ia_analysis: '',
    ia_urgency: '',
    ia_reasoning: '',
    ia_cid10: ''
  });

  useEffect(() => {
    const fetchCaseAndReport = async () => {
      try {
        const response = await api.get(`/cases/${id}`);
        setCaseData(response.data);
        
        // Try to fetch existing report
        try {
          const reportRes = await api.get(`/reports/${id}`);
          setReport({
            hypothesis: reportRes.data.hypothesis || '',
            cid10: reportRes.data.cid10 || '',
            conduct: reportRes.data.conduct || '',
            ia_analysis: reportRes.data.ia_analysis || '',
            ia_urgency: reportRes.data.ia_urgency || '',
            ia_reasoning: reportRes.data.ia_reasoning || '',
            ia_cid10: reportRes.data.ia_cid10 || ''
          });
        } catch (e) {
          console.log("No report found yet");
        }
      } catch (err) {
        alert('Erro ao carregar caso');
      } finally {
        setLoading(false);
      }
    };
    fetchCaseAndReport();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/reports/', {
        case_id: parseInt(id),
        ...report
      });
      alert('Parecer emitido com sucesso!');
      navigate('/');
    } catch (err) {
      alert('Erro ao salvar parecer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Carregando...</div>;
  if (!caseData) return <div className="p-10 text-center">Caso não encontrado</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ChevronLeft size={20} /> Voltar ao Dashboard
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Informações do Caso */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Dados do Paciente e Caso</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Localização:</p>
                  <p className="font-medium">{caseData.lesion_location}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tempo de Evolução:</p>
                  <p className="font-medium">{caseData.evolution_time}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">Sintomas:</p>
                  <p className="font-medium">{caseData.symptoms || 'Nenhum informado'}</p>
                </div>
              </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Imagens do Protocolo</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {caseData.images.map((img) => (
                  <div key={img.id} className="space-y-2">
                    <p className="text-xs font-bold uppercase text-gray-500">{img.image_type}</p>
                    <img
                      src={`${API_BASE_URL}${img.url}`}
                      alt={img.image_type}
                      className="rounded-lg w-full h-64 object-cover border"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Painel de Parecer */}
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 shadow rounded-lg p-6">
              <div className="flex items-center text-blue-800 mb-4">
                <Info size={20} className="mr-2" />
                <h2 className="font-bold">Pré-análise por IA</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-bold text-blue-800 uppercase">Hipótese Sugerida:</p>
                  <p className="text-sm text-blue-900 italic">
                    {report.ia_analysis || 'Análise indisponível'}
                  </p>
                </div>

                {report.ia_reasoning && (
                  <div>
                    <p className="text-xs font-bold text-blue-800 uppercase">Raciocínio Clínico:</p>
                    <p className="text-xs text-blue-800 leading-relaxed">
                      {report.ia_reasoning}
                    </p>
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="flex-1 p-2 bg-white rounded border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-800 uppercase">Urgência:</p>
                    <p className="text-xs font-bold capitalize text-blue-900">{report.ia_urgency || 'N/A'}</p>
                  </div>
                  <div className="flex-1 p-2 bg-white rounded border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-800 uppercase">CID-10 Sugerido:</p>
                    <p className="text-xs font-bold text-blue-900">{report.ia_cid10 || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4 border-b pb-2">Parecer Médico</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Hipótese Diagnóstica</label>
                <textarea
                  required
                  rows="3"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={report.hypothesis}
                  onChange={(e) => setReport({...report, hypothesis: e.target.value})}
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">CID-10 Final</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={report.cid10}
                  onChange={(e) => setReport({...report, cid10: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Conduta e Recomendações</label>
                <textarea
                  required
                  rows="4"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  value={report.conduct}
                  onChange={(e) => setReport({...report, conduct: e.target.value})}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                <Save size={18} className="mr-2" /> {saving ? 'Salvando...' : 'Finalizar Parecer'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseAnalysisPage;
