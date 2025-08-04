import React, { useState, useMemo } from "react";
import { Download, Eye, Trash2, CheckCircle, XCircle, BarChart3, Users, Trophy, Calendar } from "lucide-react";

const Admin = ({
  envios,
  setEnvios,
  aprovados,
  setAprovados,
  setEnvioAtivo,
  setVotacaoAtiva,
  envioAtivo,
  votacaoAtiva
}) => {
  const [pass, setPass] = useState("");
  const [auth, setAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('envios');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("todos");
  const [filterChallenge, setFilterChallenge] = useState("todos");
  const [previewImage, setPreviewImage] = useState(null);
  const [votacoes, setVotacoes] = useState([]);
  const [novaVotacao, setNovaVotacao] = useState({ titulo: "", descricao: "", ativa: false });
  const [showVotacaoForm, setShowVotacaoForm] = useState(false);

  const login = e => {
    e.preventDefault();
    if (pass === "admin123") {
      setAuth(true);
    } else {
      alert("Senha incorreta!");
    }
  };

  const aprovar = (idx) => {
    const envio = envios[idx];
    setAprovados(a => [...a, {
      ...envio,
      id: Date.now() + Math.random(),
      dataAprovacao: new Date().toLocaleDateString(),
      votos: 0,
      votantes: []
    }]);
    setEnvios(e => e.filter((_, i) => i !== idx));

    showNotification(`✅ Arte de ${envio.nome} aprovada com sucesso!`, 'success');
  };

  const aprovarTodos = () => {
    if (confirm(`Aprovar todos os ${envios.length} envios pendentes?`)) {
      const novosAprovados = envios.map(envio => ({
        ...envio,
        id: Date.now() + Math.random(),
        dataAprovacao: new Date().toLocaleDateString(),
        votos: 0,
        votantes: []
      }));
      setAprovados(a => [...a, ...novosAprovados]);
      setEnvios([]);
      showNotification(`✅ ${novosAprovados.length} artes aprovadas em lote!`, 'success');
    }
  };

  const rejeitar = (idx) => {
    if (confirm("Tem certeza que deseja rejeitar este envio?")) {
      const envio = envios[idx];
      setEnvios(e => e.filter((_, i) => i !== idx));
      showNotification(`❌ Arte de ${envio.nome} rejeitada`, 'error');
    }
  };

  const removerAprovado = (idx) => {
    if (confirm("Tem certeza que deseja remover esta arte aprovada?")) {
      const arte = aprovados[idx];
      setAprovados(a => a.filter((_, i) => i !== idx));
      showNotification(`🗑️ Arte de ${arte.nome} removida`, 'warning');
    }
  };

  const downloadImage = (arquivo, nome) => {
    const url = URL.createObjectURL(arquivo);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${nome}-${Date.now()}.${arquivo.name.split('.').pop()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const criarVotacao = () => {
    if (!novaVotacao.titulo.trim()) {
      alert("Digite um título para a votação");
      return;
    }

    const artesElegiveis = aprovados.filter(arte =>
      arte.desafio === 'Semanal' || arte.desafio === 'Mensal'
    );

    if (artesElegiveis.length < 2) {
      alert("É necessário pelo menos 2 artes semanais/mensais aprovadas para criar uma votação");
      return;
    }

    const votacao = {
      id: Date.now(),
      titulo: novaVotacao.titulo,
      descricao: novaVotacao.descricao,
      dataInicio: new Date().toLocaleDateString(),
      artes: artesElegiveis.map(arte => ({ ...arte, votos: 0, votantes: [] })),
      ativa: true,
      totalVotos: 0
    };

    setVotacoes(v => [...v, votacao]);
    setNovaVotacao({ titulo: "", descricao: "", ativa: false });
    setShowVotacaoForm(false);
    showNotification(`🗳️ Votação "${votacao.titulo}" criada com sucesso!`, 'success');
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    notification.innerHTML = message;
    notification.className = `notification notification--${type}`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const logout = () => {
    if (confirm("Deseja sair do painel administrativo?")) {
      setAuth(false);
      setPass("");
      setActiveTab('envios');
    }
  };

  const filteredEnvios = useMemo(() => {
    return envios.filter(envio => {
      const matchesSearch = envio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        envio.whatsapp.includes(searchTerm);
      const matchesLevel = filterLevel === "todos" || envio.nivel === filterLevel;
      const matchesChallenge = filterChallenge === "todos" || envio.desafio === filterChallenge;
      return matchesSearch && matchesLevel && matchesChallenge;
    });
  }, [envios, searchTerm, filterLevel, filterChallenge]);

  const stats = useMemo(() => {
    const totalVotacoes = votacoes.reduce((acc, v) => acc + v.totalVotos, 0);
    return {
      totalEnvios: envios.length,
      totalAprovados: aprovados.length,
      totalVotacoes: votacoes.length,
      votosTotal: totalVotacoes,
      porNivel: {
        iniciante: envios.filter(e => e.nivel === 'Iniciante').length,
        intermediario: envios.filter(e => e.nivel === 'Intermediário').length,
        avancado: envios.filter(e => e.nivel === 'Avançado').length
      },
      porDesafio: {
        livre: envios.filter(e => e.desafio === 'livre').length,
        diario: envios.filter(e => e.desafio === 'Diário').length,
        semanal: envios.filter(e => e.desafio === 'Semanal').length,
        mensal: envios.filter(e => e.desafio === 'Mensal').length
      }
    };
  }, [envios, aprovados, votacoes]);

  if (!auth) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="login-icon">🔐</div>
            <h2 className="login-title">Acesso Administrativo</h2>
          </div>
          <form onSubmit={login} className="login-form">
            <input
              className="input input--primary"
              type="password"
              onChange={e => setPass(e.target.value)}
              placeholder="Digite a senha de acesso"
              value={pass}
            />
            <button className="btn btn--primary btn--full">
              🔑 Entrar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="container">
          <div className="header-content">
            <h1 className="admin-title">
              ⚙️ Painel Administrativo
            </h1>
            <button onClick={logout} className="btn btn--danger">
              🚪 Sair
            </button>
          </div>
        </div>
      </header>

      <div className="container admin-main">
        {/* Controles Gerais */}
        <div className="controls-panel">
          <h3 className="panel-title">
            🎛️ Controles Gerais
          </h3>
          <div className="controls-buttons">
            <button
              className={`btn btn--status ${envioAtivo ? 'btn--status-active' : 'btn--status-inactive'}`}
              onClick={() => setEnvioAtivo(e => !e)}
            >
              {envioAtivo ? '✅ Envios Ativos' : '❌ Envios Desativados'}
            </button>
            <button
              className={`btn btn--status ${votacaoAtiva ? 'btn--status-active' : 'btn--status-inactive'}`}
              onClick={() => setVotacaoAtiva(v => !v)}
            >
              {votacaoAtiva ? '✅ Votação Ativa' : '❌ Votação Desativada'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs-container">
          <nav className="tabs-nav">
            {[
              { id: 'envios', label: '📤 Envios', count: envios.length },
              { id: 'aprovados', label: '✅ Aprovados', count: aprovados.length },
              { id: 'votacoes', label: '🗳️ Votações', count: votacoes.length },
              { id: 'stats', label: '📊 Estatísticas', count: null }
            ].map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${activeTab === tab.id ? 'tab-btn--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} {tab.count !== null && `(${tab.count})`}
              </button>
            ))}
          </nav>

          <div className="tab-content">
            {/* Tab Envios */}
            {activeTab === 'envios' && (
              <div className="envios-tab">
                {/* Filtros */}
                <div className="filters">
                  <input
                    className="input input--search"
                    type="text"
                    placeholder="🔍 Buscar por nome ou WhatsApp..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <select
                    className="select select--filter"
                    value={filterLevel}
                    onChange={e => setFilterLevel(e.target.value)}
                  >
                    <option value="todos">Todos os níveis</option>
                    <option value="Iniciante">Iniciante</option>
                    <option value="Intermediário">Intermediário</option>
                    <option value="Avançado">Avançado</option>
                  </select>
                  <select
                    className="select select--filter"
                    value={filterChallenge}
                    onChange={e => setFilterChallenge(e.target.value)}
                  >
                    <option value="todos">Todos os desafios</option>
                    <option value="livre">Envio Livre</option>
                    <option value="Diário">Desafio Diário</option>
                    <option value="Semanal">Desafio Semanal</option>
                    <option value="Mensal">Desafio Mensal</option>
                  </select>
                </div>

                {/* Botão Aprovar Todos */}
                {envios.length > 0 && (
                  <div className="bulk-actions">
                    <button
                      onClick={aprovarTodos}
                      className="btn btn--success"
                    >
                      ✅ Aprovar Todos ({envios.length})
                    </button>
                  </div>
                )}

                {/* Lista de Envios */}
                {filteredEnvios.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📭</div>
                    <p className="empty-text">
                      {envios.length === 0 ? 'Nenhum envio pendente' : 'Nenhum envio encontrado com os filtros aplicados'}
                    </p>
                  </div>
                ) : (
                  <div className="envios-grid">
                    {filteredEnvios.map((envio, i) => {
                      const originalIndex = envios.findIndex(e => e === envio);
                      return (
                        <div key={i} className="envio-card">
                          <div className="envio-image">
                            <img
                              className="image image--clickable"
                              src={URL.createObjectURL(envio.arquivo)}
                              alt={`Arte de ${envio.nome}`}
                              onClick={() => setPreviewImage(envio.arquivo)}
                            />
                            <button
                              onClick={() => setPreviewImage(envio.arquivo)}
                              className="btn btn--icon btn--preview"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                          <div className="envio-content">
                            <h4 className="envio-title">{envio.nome}</h4>
                            <div className="envio-info">
                              <p><strong>Nível:</strong> <span className="tag tag--blue">{envio.nivel}</span></p>
                              <p><strong>WhatsApp:</strong> {envio.whatsapp}</p>
                              <p><strong>Tipo:</strong> <span className="tag tag--purple">{envio.desafio}</span></p>
                            </div>
                            <div className="envio-actions">
                              <button
                                onClick={() => aprovar(originalIndex)}
                                className="btn btn--success btn--small"
                              >
                                <CheckCircle size={16} />
                                Aprovar
                              </button>
                              <button
                                onClick={() => downloadImage(envio.arquivo, envio.nome)}
                                className="btn btn--primary btn--icon"
                              >
                                <Download size={16} />
                              </button>
                              <button
                                onClick={() => rejeitar(originalIndex)}
                                className="btn btn--danger btn--icon"
                              >
                                <XCircle size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab Aprovados */}
            {activeTab === 'aprovados' && (
              <div className="aprovados-tab">
                <div className="tab-header">
                  <h3 className="tab-title">✅ Artes Aprovadas ({aprovados.length})</h3>
                </div>

                {aprovados.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🎨</div>
                    <p className="empty-text">Nenhuma arte aprovada ainda</p>
                  </div>
                ) : (
                  <div className="aprovados-grid">
                    {aprovados.map((arte, i) => (
                      <div key={i} className="aprovado-card">
                        <div className="aprovado-image">
                          <img
                            className="image image--clickable"
                            src={URL.createObjectURL(arte.arquivo)}
                            alt={`Arte de ${arte.nome}`}
                            onClick={() => setPreviewImage(arte.arquivo)}
                          />
                        </div>
                        <div className="aprovado-content">
                          <h4 className="aprovado-title">{arte.nome}</h4>
                          <p className="aprovado-level">{arte.nivel}</p>
                          {arte.dataAprovacao && (
                            <p className="aprovado-date">
                              Aprovado em: {arte.dataAprovacao}
                            </p>
                          )}
                          <div className="aprovado-actions">
                            <button
                              onClick={() => downloadImage(arte.arquivo, arte.nome)}
                              className="btn btn--primary btn--small"
                            >
                              <Download size={12} />
                              Baixar
                            </button>
                            <button
                              onClick={() => removerAprovado(i)}
                              className="btn btn--danger btn--icon"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab Votações */}
            {activeTab === 'votacoes' && (
              <div className="votacoes-tab">
                <div className="tab-header">
                  <h3 className="tab-title">🗳️ Gerenciar Votações</h3>
                  <button
                    onClick={() => setShowVotacaoForm(!showVotacaoForm)}
                    className="btn btn--purple"
                  >
                    ➕ Nova Votação
                  </button>
                </div>

                {/* Formulário Nova Votação */}
                {showVotacaoForm && (
                  <div className="votacao-form">
                    <h4 className="form-title">Criar Nova Votação</h4>
                    <div className="form-fields">
                      <input
                        className="input input--primary"
                        placeholder="Título da votação"
                        value={novaVotacao.titulo}
                        onChange={e => setNovaVotacao(prev => ({ ...prev, titulo: e.target.value }))}
                      />
                      <textarea
                        className="textarea textarea--primary"
                        placeholder="Descrição (opcional)"
                        rows={3}
                        value={novaVotacao.descricao}
                        onChange={e => setNovaVotacao(prev => ({ ...prev, descricao: e.target.value }))}
                      />
                      <div className="form-actions">
                        <button
                          onClick={criarVotacao}
                          className="btn btn--purple"
                        >
                          ✅ Criar Votação
                        </button>
                        <button
                          onClick={() => setShowVotacaoForm(false)}
                          className="btn btn--gray"
                        >
                          ❌ Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Lista de Votações */}
                {votacoes.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🗳️</div>
                    <p className="empty-text">Nenhuma votação criada ainda</p>
                  </div>
                ) : (
                  <div className="votacoes-list">
                    {votacoes.map(votacao => (
                      <div key={votacao.id} className="votacao-card">
                        <div className="votacao-header">
                          <div className="votacao-info">
                            <h4 className="votacao-title">{votacao.titulo}</h4>
                            {votacao.descricao && (
                              <p className="votacao-description">{votacao.descricao}</p>
                            )}
                            <p className="votacao-meta">
                              Iniciada em: {votacao.dataInicio} • {votacao.artes.length} participantes
                            </p>
                          </div>
                          <span className={`status-badge ${votacao.ativa ? 'status--active' : 'status--inactive'}`}>
                            {votacao.ativa ? 'Ativa' : 'Encerrada'}
                          </span>
                        </div>

                        <div className="votacao-artes">
                          {votacao.artes.map((arte, idx) => (
                            <div key={idx} className="votacao-arte">
                              <div className="arte-image">
                                <img
                                  className="image"
                                  src={URL.createObjectURL(arte.arquivo)}
                                  alt={arte.nome}
                                />
                              </div>
                              <p className="arte-name">{arte.nome}</p>
                              <p className="arte-votes">
                                {arte.votos || 0} votos
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab Estatísticas */}
            {activeTab === 'stats' && (
              <div className="stats-tab">
                <h3 className="tab-title">
                  <BarChart3 size={24} />
                  Estatísticas do Sistema
                </h3>

                {/* Cards de Estatísticas Gerais */}
                <div className="stats-grid">
                  <div className="stat-card stat-card--blue">
                    <div className="stat-content">
                      <div className="stat-info">
                        <p className="stat-label">Envios Pendentes</p>
                        <p className="stat-value">{stats.totalEnvios}</p>
                      </div>
                      <Users size={32} className="stat-icon" />
                    </div>
                  </div>

                  <div className="stat-card stat-card--green">
                    <div className="stat-content">
                      <div className="stat-info">
                        <p className="stat-label">Artes Aprovadas</p>
                        <p className="stat-value">{stats.totalAprovados}</p>
                      </div>
                      <CheckCircle size={32} className="stat-icon" />
                    </div>
                  </div>

                  <div className="stat-card stat-card--purple">
                    <div className="stat-content">
                      <div className="stat-info">
                        <p className="stat-label">Votações Ativas</p>
                        <p className="stat-value">{stats.totalVotacoes}</p>
                      </div>
                      <Trophy size={32} className="stat-icon" />
                    </div>
                  </div>

                  <div className="stat-card stat-card--orange">
                    <div className="stat-content">
                      <div className="stat-info">
                        <p className="stat-label">Total de Votos</p>
                        <p className="stat-value">{stats.votosTotal}</p>
                      </div>
                      <Calendar size={32} className="stat-icon" />
                    </div>
                  </div>
                </div>

                {/* Estatísticas por Nível */}
                <div className="stats-section">
                  <h4 className="section-title">📊 Por Nível de Experiência</h4>
                  <div className="level-stats">
                    {Object.entries(stats.porNivel).map(([nivel, count]) => (
                      <div key={nivel} className="level-stat">
                        <div className="level-count">{count}</div>
                        <div className="level-name">{nivel}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Estatísticas por Desafio */}
                <div className="stats-section">
                  <h4 className="section-title">🏆 Por Tipo de Desafio</h4>
                  <div className="challenge-stats">
                    {Object.entries(stats.porDesafio).map(([desafio, count]) => (
                      <div key={desafio} className="challenge-stat">
                        <div className="challenge-count">{count}</div>
                        <div className="challenge-name">{desafio}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status do Sistema */}
                <div className="stats-section">
                  <h4 className="section-title">⚡ Status do Sistema</h4>
                  <div className="system-status">
                    <div className="status-item">
                      <div className={`status-indicator ${envioAtivo ? 'status-indicator--active' : 'status-indicator--inactive'}`}></div>
                      <div className="status-details">
                        <p className="status-name">Sistema de Envios</p>
                        <p className="status-description">{envioAtivo ? 'Funcionando normalmente' : 'Desativado pelo administrador'}</p>
                      </div>
                    </div>
                    <div className="status-item">
                      <div className={`status-indicator ${votacaoAtiva ? 'status-indicator--active' : 'status-indicator--inactive'}`}></div>
                      <div className="status-details">
                        <p className="status-name">Sistema de Votação</p>
                        <p className="status-description">{votacaoAtiva ? 'Funcionando normalmente' : 'Desativado pelo administrador'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Preview */}
      {previewImage && (
        <div className="modal-overlay" onClick={() => setPreviewImage(null)}>
          <div className="modal-content">
            <img
              className="modal-image"
              src={URL.createObjectURL(previewImage)}
              alt="Preview"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="modal-close"
            >
              <XCircle size={24} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;