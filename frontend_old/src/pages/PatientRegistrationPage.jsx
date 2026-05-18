import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, ChevronLeft, Save, User, Calendar, CreditCard, Hash } from 'lucide-react';
import api from '../services/api';

const PatientRegistrationPage = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cpf: '',
    cns: '',
    full_name: '',
    birth_date: '',
    gender: 'M'
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Sanitize CPF: remove any non-digit characters
    const sanitizedCpf = formData.cpf.replace(/\D/g, '');
    
    try {
      await api.post('/patients/', {
        ...formData,
        cpf: sanitizedCpf
      });
      alert('Paciente cadastrado com sucesso!');
      navigate('/novo-caso');
    } catch (err) {
      const errorMsg = err.response?.data?.detail || 'Erro ao cadastrar paciente';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft size={20} /> Voltar
        </button>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-blue-600 px-6 py-8 text-white">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-3 rounded-lg">
                <UserPlus size={32} />
              </div>
              <div>
                <h1 className="text-2xl font-bold">Cadastro de Paciente</h1>
                <p className="text-blue-100">Preencha as informações básicas para iniciar o atendimento</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <User size={16} className="mr-2 text-blue-500" /> Nome Completo
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="Ex: João da Silva Sauro"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <CreditCard size={16} className="mr-2 text-blue-500" /> CPF
                </label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="000.000.000-00"
                  value={formData.cpf}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Hash size={16} className="mr-2 text-blue-500" /> Cartão SUS (CNS)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  placeholder="000 0000 0000 0000"
                  value={formData.cns}
                  onChange={(e) => setFormData({ ...formData, cns: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center">
                  <Calendar size={16} className="mr-2 text-blue-500" /> Data de Nascimento
                </label>
                <input
                  required
                  type="date"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                  value={formData.birth_date}
                  onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Gênero</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none appearance-none bg-white"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                >
                  <option value="M">Masculino</option>
                  <option value="F">Feminino</option>
                  <option value="O">Outro</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all transform hover:-translate-y-1 disabled:bg-gray-400 disabled:transform-none"
              >
                <Save size={20} className="mr-2" />
                {loading ? 'Salvando...' : 'Cadastrar Paciente'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PatientRegistrationPage;
