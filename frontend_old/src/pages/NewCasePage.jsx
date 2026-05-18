import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Clipboard, Camera, ChevronRight, ChevronLeft, CheckCircle, UserPlus } from 'lucide-react';
import api from '../services/api';
import ImageValidator from '../components/ImageValidator';

const NewCasePage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [patient, setPatient] = useState(null);
  const [cpf, setCpf] = useState('');
  const [formData, setFormData] = useState({
    protocol_type: 'cancer_pele',
    lesion_location: '',
    evolution_time: '',
    symptoms: '',
    observations: '',
    health_unit_cnes: '1234567' // Simulated
  });
  const [caseId, setCaseId] = useState(null);
  const [imagesUploaded, setImagesUploaded] = useState({
    panoramic: false,
    zoom: false,
    dermoscopy: false
  });
  const navigate = useNavigate();

  const searchPatient = async () => {
    setLoading(true);
    const sanitizedCpf = cpf.replace(/\D/g, '');
    console.log("Buscando paciente com CPF sanitizado:", sanitizedCpf);
    try {
      const response = await api.get(`/patients/${sanitizedCpf}`);
      console.log("Paciente encontrado:", response.data);
      setPatient(response.data);
    } catch (err) {
      console.error("Erro na busca de paciente:", err.response?.data || err.message);
      setPatient(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCase = async () => {
    setLoading(true);
    console.log("Iniciando criação de caso para paciente:", patient.cpf);
    try {
      const response = await api.post('/cases/', {
        ...formData,
        patient_cpf: patient.cpf
      });
      console.log("Caso criado com sucesso:", response.data);
      setCaseId(response.data.id);
      setStep(3);
    } catch (err) {
      console.error("Erro detalhado ao criar caso:", err.response?.data || err.message);
      alert('Erro ao criar caso: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file, type, qualityData = {}) => {
    if (!file) return;
    console.log(`Iniciando upload da imagem ${type} para o caso ${caseId}`);

    const data = new FormData();
    data.append('file', file);
    data.append('image_type', type);
    
    data.append('is_focused', qualityData.isFocused ?? true);
    data.append('is_well_lit', qualityData.brightness ?? true);
    data.append('has_ruler', type === 'zoom');

    try {
      const response = await api.post(`/cases/${caseId}/images`, data);
      console.log(`Upload da imagem ${type} concluído:`, response.data);
      setImagesUploaded(prev => ({ ...prev, [type]: true }));
    } catch (err) {
      console.error(`Erro no upload da imagem ${type}:`, err.response?.data || err.message);
      alert(`Erro ao enviar imagem ${type}: ` + (err.response?.data?.detail || err.message));
    }
  };

  const handleFinalize = async () => {
    setLoading(true);
    try {
      await api.post(`/cases/${caseId}/finalize`);
      alert('Caso enviado com sucesso! A pré-análise por IA foi iniciada.');
      navigate('/');
    } catch (err) {
      alert('Erro ao finalizar caso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Novo Caso</h1>
          <div className="mt-4 flex items-center justify-between relative">
            <div className={`flex flex-col items-center z-10 ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 1 ? 'border-blue-600 bg-white' : 'border-gray-300 bg-gray-100'}`}>
                <User size={20} />
              </div>
              <span className="text-xs mt-1">Paciente</span>
            </div>
            <div className={`flex flex-col items-center z-10 ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 2 ? 'border-blue-600 bg-white' : 'border-gray-300 bg-gray-100'}`}>
                <Clipboard size={20} />
              </div>
              <span className="text-xs mt-1">Clínico</span>
            </div>
            <div className={`flex flex-col items-center z-10 ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= 3 ? 'border-blue-600 bg-white' : 'border-gray-300 bg-gray-100'}`}>
                <Camera size={20} />
              </div>
              <span className="text-xs mt-1">Fotos</span>
            </div>
            <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-0"></div>
            <div className="absolute top-5 left-0 h-0.5 bg-blue-600 -z-0 transition-all duration-300" style={{ width: `${(step - 1) * 50}%` }}></div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Identificação do Paciente</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">CPF do Paciente</label>
                <div className="mt-1 flex space-x-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="000.000.000-00"
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                  />
                  <button
                    onClick={searchPatient}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    Buscar
                  </button>
                </div>
              </div>

              {patient && (
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="text-sm text-blue-800 font-medium">Paciente encontrado:</p>
                  <p className="text-lg text-blue-900">{patient.full_name}</p>
                  <p className="text-sm text-blue-700">CPF: {patient.cpf}</p>
                </div>
              )}

              {!patient && cpf.replace(/\D/g, '').length >= 11 && !loading && (
                <div className="bg-red-50 p-6 rounded-xl border border-red-100 flex flex-col items-center text-center">
                  <div className="bg-red-100 p-3 rounded-full text-red-600 mb-3">
                    <UserPlus size={24} />
                  </div>
                  <p className="text-red-800 font-bold mb-1">Paciente não encontrado</p>
                  <p className="text-sm text-red-600 mb-4">O CPF {cpf} não consta em nossa base de dados.</p>
                  <Link 
                    to="/cadastro-paciente" 
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Cadastrar Novo Paciente
                  </Link>
                </div>
              )}

              <div className="flex justify-end mt-8">
                <button
                  onClick={() => setStep(2)}
                  disabled={!patient}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                >
                  Próximo <ChevronRight size={18} className="ml-1" />
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Dados Clínicos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Protocolo</label>
                  <select
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    value={formData.protocol_type}
                    onChange={(e) => setFormData({...formData, protocol_type: e.target.value})}
                  >
                    <option value="cancer_pele">Protocolo A - Câncer de Pele</option>
                    <option value="outras_dermatoses">Protocolo B - Outras Dermatoses</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Localização da Lesão</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ex: Braço direito, Face, etc."
                    value={formData.lesion_location}
                    onChange={(e) => setFormData({...formData, lesion_location: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tempo de Evolução</label>
                  <input
                    type="text"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Ex: 2 meses"
                    value={formData.evolution_time}
                    onChange={(e) => setFormData({...formData, evolution_time: e.target.value})}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Sintomas Associados</label>
                  <textarea
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                    value={formData.symptoms}
                    onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
                  ></textarea>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center px-6 py-2 text-gray-600 hover:text-gray-900"
                >
                  <ChevronLeft size={18} className="mr-1" /> Voltar
                </button>
                <button
                  onClick={handleCreateCase}
                  disabled={loading}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Continuar para Fotos <ChevronRight size={18} className="ml-1" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-800">Registro Fotográfico</h2>
              <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                <p className="text-sm text-yellow-800">
                  <strong>Protocolo UFSC/STT:</strong> Mínimo de 3 fotos para Câncer de Pele. Use régua milimetrada na foto de aproximação.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ImageValidator 
                  imageType="panoramic" 
                  description="Foto da região (distância)"
                  onValidImage={(file, checks) => handleImageUpload(file, 'panoramic', checks)} 
                />
                <ImageValidator 
                  imageType="zoom" 
                  description="Foto aproximada (com régua)"
                  onValidImage={(file, checks) => handleImageUpload(file, 'zoom', checks)} 
                />
                <ImageValidator 
                  imageType="dermoscopy" 
                  description="Dermatoscopia (opcional)"
                  onValidImage={(file, checks) => handleImageUpload(file, 'dermoscopy', checks)} 
                />
              </div>

              <div className="flex justify-between mt-8 pt-6 border-t">
                <div className="text-sm text-gray-500">
                  <p className="italic">Ao finalizar, o caso será enviado para análise por IA e dermatologista.</p>
                  <p className="font-bold mt-1 text-blue-600">
                    Fotos enviadas: {Object.values(imagesUploaded).filter(Boolean).length} / 
                    {formData.protocol_type === 'cancer_pele' ? '3' : '2'}
                  </p>
                </div>
                <button
                  onClick={handleFinalize}
                  disabled={
                    loading || 
                    !imagesUploaded.panoramic || 
                    !imagesUploaded.zoom || 
                    (formData.protocol_type === 'cancer_pele' && !imagesUploaded.dermoscopy)
                  }
                  className="flex items-center px-8 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 shadow-lg disabled:bg-gray-400"
                >
                  <CheckCircle size={20} className="mr-2" /> Finalizar e Enviar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewCasePage;
