import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Save,
  Users,
  UserPlus,
  Download,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import './App.css';

const feriadosNacionais = [
  '2026-01-01',
  '2026-02-16',
  '2026-02-17',
  '2026-02-18',
  '2026-04-03',
  '2026-04-21',
  '2026-05-01',
  '2026-06-04',
  '2026-09-07',
  '2026-10-12',
  '2026-11-02',
  '2026-11-15',
  '2026-11-20',
  '2026-12-24',
  '2026-12-25',
  '2026-12-31',
  '2027-01-01',
  '2027-02-08',
  '2027-02-09',
  '2027-02-10',
  '2027-03-26',
  '2027-04-21',
  '2027-05-01',
  '2027-05-27',
  '2027-09-07',
  '2027-10-12',
  '2027-11-02',
  '2027-11-15',
  '2027-11-20',
  '2027-12-24',
  '2027-12-25',
  '2027-12-31',
  '2028-01-01',
  '2028-02-28',
  '2028-02-29',
  '2028-03-01',
  '2028-04-14',
  '2028-04-21',
  '2028-05-01',
  '2028-06-15',
  '2028-09-07',
  '2028-10-12',
  '2028-11-02',
  '2028-11-15',
  '2028-11-20',
  '2028-12-24',
  '2028-12-25',
  '2028-12-31',
  '2029-01-01',
  '2029-02-12',
  '2029-02-13',
  '2029-02-14',
  '2029-03-30',
  '2029-04-21',
  '2029-05-01',
  '2029-05-31',
  '2029-09-07',
  '2029-10-12',
  '2029-11-02',
  '2029-11-15',
  '2029-11-20',
  '2029-12-24',
  '2029-12-25',
  '2029-12-31',
  '2030-01-01',
  '2030-03-04',
  '2030-03-05',
  '2030-03-06',
  '2030-04-19',
  '2030-04-21',
  '2030-05-01',
  '2030-06-20',
  '2030-09-07',
  '2030-10-12',
  '2030-11-02',
  '2030-11-15',
  '2030-11-20',
  '2030-12-24',
  '2030-12-25',
  '2030-12-31',
];

export default function App() {
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [ferias, setFerias] = useState<any[]>([]);
  const [dataAtual, setDataAtual] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    colaborador_id: '',
    data_inicio: '',
    data_termino: '',
    observacao: '',
  });
  const [isEquipaModalOpen, setIsEquipaModalOpen] = useState(false);
  const [novoColaborador, setNovoColaborador] = useState('');

  useEffect(() => {
    carregarDados();

    // ESCUTADOR DE TEMPO REAL: Atualiza a tela de todos se houver qualquer mudança
    const subscription = supabase
      .channel('mudancas-db')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ferias' },
        () => {
          carregarDados();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'colaboradores' },
        () => {
          carregarDados();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function carregarDados() {
    const resColab = await supabase
      .from('colaboradores')
      .select('*')
      .order('nome_completo');
    if (resColab.data) setColaboradores(resColab.data);

    const resFerias = await supabase.from('ferias').select('*');
    if (resFerias.data) setFerias(resFerias.data);
  }

  const mes = dataAtual.getMonth();
  const ano = dataAtual.getFullYear();
  const diasNoMes = new Date(ano, mes + 1, 0).getDate();
  const dias = Array.from({ length: diasNoMes }, (_, i) => i + 1);

  const mesesNomes = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];
  const nomesDiasDaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  function isHoje(dia: number) {
    const hoje = new Date();
    return (
      hoje.getDate() === dia &&
      hoje.getMonth() === mes &&
      hoje.getFullYear() === ano
    );
  }

  function getFeriasDoDia(colabId: string, dia: number) {
    const dataVerificada = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(
      dia
    ).padStart(2, '0')}`;
    return ferias.find((f) => {
      if (f.colaborador_id !== colabId) return false;
      return (
        dataVerificada >= f.data_inicio && dataVerificada <= f.data_termino
      );
    });
  }

  function mudarMes(delta: number) {
    setDataAtual(new Date(ano, mes + delta, 1));
  }

  function voltarParaHoje() {
    setDataAtual(new Date());
  }

  function exportarExcel() {
    const feriasDoAno = ferias.filter(
      (f) =>
        f.data_inicio.startsWith(ano.toString()) ||
        f.data_termino.startsWith(ano.toString())
    );

    function formatarDataBR(dataString: string) {
      const [y, m, d] = dataString.split('-');
      return `${d}/${m}/${y}`;
    }

    const dados = feriasDoAno.map((f) => {
      const colab = colaboradores.find((c) => c.id === f.colaborador_id);
      return {
        Colaborador: colab ? colab.nome_completo : 'Desconhecido',
        'Data de Início': formatarDataBR(f.data_inicio),
        'Data de Término': formatarDataBR(f.data_termino),
        Observação: f.observacao || '',
      };
    });

    dados.sort((a, b) => a.Colaborador.localeCompare(b.Colaborador));

    const worksheet = XLSX.utils.json_to_sheet(dados);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Férias ${ano}`);
    worksheet['!cols'] = [{ wch: 35 }, { wch: 15 }, { wch: 15 }, { wch: 40 }];
    XLSX.writeFile(workbook, `Programacao_Ferias_Unimed_${ano}.xlsx`);
  }

  function abrirNovoCadastro() {
    setFormData({
      id: '',
      colaborador_id: colaboradores[0]?.id || '',
      data_inicio: '',
      data_termino: '',
      observacao: '',
    });
    setIsModalOpen(true);
  }

  function abrirEdicao(periodo: any) {
    setFormData({ ...periodo });
    setIsModalOpen(true);
  }

  async function salvarFerias(e: React.FormEvent) {
    e.preventDefault();
    if (formData.data_inicio > formData.data_termino) {
      alert('A data de término não pode ser antes da data de início!');
      return;
    }
    if (formData.id) {
      await supabase
        .from('ferias')
        .update({
          colaborador_id: formData.colaborador_id,
          data_inicio: formData.data_inicio,
          data_termino: formData.data_termino,
          observacao: formData.observacao,
        })
        .eq('id', formData.id);
    } else {
      await supabase.from('ferias').insert([
        {
          colaborador_id: formData.colaborador_id,
          data_inicio: formData.data_inicio,
          data_termino: formData.data_termino,
          observacao: formData.observacao,
        },
      ]);
    }
    setIsModalOpen(false);
  }

  async function excluirFerias() {
    if (confirm('Tem a certeza que deseja cancelar estas férias?')) {
      await supabase.from('ferias').delete().eq('id', formData.id);
      setIsModalOpen(false);
    }
  }

  async function adicionarColaborador(e: React.FormEvent) {
    e.preventDefault();
    if (!novoColaborador.trim()) return;
    await supabase
      .from('colaboradores')
      .insert([{ nome_completo: novoColaborador.trim() }]);
    setNovoColaborador('');
  }

  async function excluirColaborador(id: string, nome: string) {
    if (
      confirm(
        `Tem a certeza que deseja excluir ${nome}? ATENÇÃO: Todas as férias desta pessoa também serão eliminadas permanentemente.`
      )
    ) {
      await supabase.from('colaboradores').delete().eq('id', id);
    }
  }

  return (
    <div className="container">
      <div className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img
            src="/logo.png"
            alt="Logótipo Seguros Unimed"
            style={{ height: '45px', objectFit: 'contain' }}
          />
          <h2 className="header-title">Gestão de Férias</h2>
        </div>

        <div className="nav-mes">
          <button className="btn" onClick={() => mudarMes(-1)}>
            <ChevronLeft size={18} /> Anterior
          </button>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <span
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: 'var(--unimed-blue)',
                minWidth: '150px',
                textAlign: 'center',
              }}
            >
              {mesesNomes[mes]} {ano}
            </span>
            <button
              onClick={voltarParaHoje}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '11px',
                cursor: 'pointer',
                marginTop: '2px',
                textDecoration: 'underline',
              }}
            >
              Ir para Hoje
            </button>
          </div>

          <button className="btn" onClick={() => mudarMes(1)}>
            Próximo <ChevronRight size={18} />
          </button>

          <div style={{ display: 'flex', gap: '10px', marginLeft: '15px' }}>
            <button
              className="btn"
              onClick={exportarExcel}
              title={`Baixar planilha de ${ano}`}
            >
              <Download size={18} /> Excel
            </button>
            <button className="btn" onClick={() => setIsEquipaModalOpen(true)}>
              <Users size={18} /> Colaboradores
            </button>
            <button className="btn btn-primary" onClick={abrirNovoCadastro}>
              <Plus size={18} /> Nova Férias
            </button>
          </div>
        </div>
      </div>

      <div className="tabela-container">
        <table className="calendar-table">
          <thead>
            <tr>
              <th className="colab-name">Colaborador</th>
              {dias.map((dia) => {
                const dataDate = new Date(ano, mes, dia);
                const nomeDiaSemana = nomesDiasDaSemana[dataDate.getDay()];
                const classeHoje = isHoje(dia) ? 'today-header' : '';
                return (
                  <th key={dia} className={classeHoje}>
                    <div>{dia}</div>
                    <div
                      style={{
                        fontSize: '10px',
                        marginTop: '3px',
                        fontWeight: 'normal',
                        opacity: 0.9,
                      }}
                    >
                      {nomeDiaSemana}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {colaboradores.map((colab) => (
              <tr key={colab.id}>
                <td className="colab-name">{colab.nome_completo}</td>
                {dias.map((dia) => {
                  const periodo = getFeriasDoDia(colab.id, dia);
                  const dataVerificada = `${ano}-${String(mes + 1).padStart(
                    2,
                    '0'
                  )}-${String(dia).padStart(2, '0')}`;
                  const isFimDeSemana =
                    new Date(ano, mes, dia).getDay() === 0 ||
                    new Date(ano, mes, dia).getDay() === 6;
                  const isFeriado = feriadosNacionais.includes(dataVerificada);

                  let cssClass = isHoje(dia) ? 'today-cell ' : '';
                  if (periodo) cssClass += 'ferias-cell';
                  else if (isFeriado) cssClass += 'holiday-cell';
                  else if (isFimDeSemana) cssClass += 'weekend-cell';

                  return (
                    <td
                      key={dia}
                      className={cssClass}
                      title={
                        periodo
                          ? 'Férias - Clique para editar'
                          : isFeriado
                          ? 'Feriado'
                          : ''
                      }
                      onClick={() => (periodo ? abrirEdicao(periodo) : null)}
                    ></td>
                  );
                })}
              </tr>
            ))}
            {colaboradores.length === 0 && (
              <tr>
                <td
                  colSpan={32}
                  style={{ padding: '20px', textAlign: 'center' }}
                >
                  Nenhum colaborador registado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* JANELA: GERIR FÉRIAS */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                {formData.id ? 'Editar Férias' : 'Agendar Férias'}
              </h3>
              <button
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={salvarFerias}>
              <div className="form-group">
                <label className="form-label">Colaborador</label>
                <select
                  className="form-control"
                  value={formData.colaborador_id}
                  onChange={(e) =>
                    setFormData({ ...formData, colaborador_id: e.target.value })
                  }
                  required
                >
                  {colaboradores.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome_completo}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', gap: '15px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Início</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.data_inicio}
                    onChange={(e) =>
                      setFormData({ ...formData, data_inicio: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Fim</label>
                  <input
                    type="date"
                    className="form-control"
                    value={formData.data_termino}
                    onChange={(e) =>
                      setFormData({ ...formData, data_termino: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Observação (Opcional)</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ex: Viagem marcada"
                  value={formData.observacao || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, observacao: e.target.value })
                  }
                />
              </div>
              <div className="modal-actions">
                {formData.id && (
                  <div className="actions-left">
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={excluirFerias}
                    >
                      <Trash2 size={16} /> Excluir
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  className="btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={16} /> Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* JANELA: GERIR COLABORADORES */}
      {isEquipaModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Gerir Colaboradores</h3>
              <button
                className="close-btn"
                onClick={() => setIsEquipaModalOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={adicionarColaborador}
              style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}
            >
              <input
                type="text"
                className="form-control"
                placeholder="Nome do novo colaborador"
                value={novoColaborador}
                onChange={(e) => setNovoColaborador(e.target.value)}
                required
              />
              <button
                type="submit"
                className="btn btn-primary"
                style={{ whiteSpace: 'nowrap' }}
              >
                <UserPlus size={18} /> Adicionar
              </button>
            </form>

            <div
              style={{
                maxHeight: '350px',
                overflowY: 'auto',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
              }}
            >
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                  {colaboradores.map((c) => (
                    <tr
                      key={c.id}
                      style={{ borderBottom: '1px solid #e2e8f0' }}
                    >
                      <td
                        style={{
                          padding: '10px 15px',
                          fontWeight: '500',
                          color: '#334155',
                        }}
                      >
                        {c.nome_completo}
                      </td>
                      <td
                        style={{
                          padding: '8px 15px',
                          textAlign: 'right',
                          width: '60px',
                        }}
                      >
                        <button
                          className="btn-danger"
                          style={{
                            padding: '6px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            display: 'flex',
                          }}
                          onClick={() =>
                            excluirColaborador(c.id, c.nome_completo)
                          }
                          title="Excluir Colaborador"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
