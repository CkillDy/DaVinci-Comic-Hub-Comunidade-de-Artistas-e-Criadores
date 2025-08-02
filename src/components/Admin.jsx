import React, { useState } from "react";

const Admin = ({ envios, setEnvios, aprovados, setAprovados, setEnvioAtivo, setVotacaoAtiva, envioAtivo, votacaoAtiva }) => {
  const [pass, setPass] = useState("");
  const [auth, setAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('envios');
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("todos");
  const [filterChallenge, setFilterChallenge] = useState("todos");

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
    setAprovados(a => [...a, { ...envio, dataAprovacao: new Date().toLocaleDateString() }]);
    setEnvios(e => e.filter((_, i) => i !== idx));

    // Feedback visual melhorado
    const notification = document.createElement('div');
    notification.innerHTML = `✅ Arte de ${envio.nome} aprovada com sucesso!`;
    notification.className = 'admin-notification admin-success';
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  };

  const rejeitar = (idx) => {
    if (confirm("Tem certeza que deseja rejeitar este envio?")) {
      const envio = envios[idx];
      setEnvios(e => e.filter((_, i) => i !== idx));

      // Feedback visual melhorado
      const notification = document.createElement('div');
      notification.innerHTML = `❌ Arte de ${envio.nome} rejeitada`;
      notification.className = 'admin-notification admin-error';
      document.body.appendChild(notification);
      setTimeout(() => notification.remove(), 3000);
    }
  };

  const logout = () => {
    if (confirm("Deseja sair do painel administrativo?")) {
      setAuth(false);
      setPass("");
      setActiveTab('envios');
    }
  };

  // Sistema de filtros melhorado
  const filteredEnvios = envios.filter(envio => {
    const matchesSearch = envio.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      envio.whatsapp.includes(searchTerm);
    const matchesLevel = filterLevel === "todos" || envio.nivel === filterLevel;
    const matchesChallenge = filterChallenge === "todos" || envio.desafio === filterChallenge;

    return matchesSearch && matchesLevel && matchesChallenge;
  });

  // Estatísticas melhoradas
  const stats = {
    totalEnvios: envios.length,
    totalAprovados: aprovados?.length,
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

  if (!auth) {
    return (
      <div className="admin-main">
        <div className="admin-login-card">
          <h2 className="admin-login-title">🔐 Acesso Administrativo</h2>
          <form onSubmit={login}>
            <input
              className="admin-input"
              type="password"
              onChange={e => setPass(e.target.value)}
              placeholder="Digite a senha de acesso"
              value={pass}
            />
            <button className="admin-button" type="submit">🔑 Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-main">
      <div className="admin-header">
        <h2 className="admin-title">⚙️ Painel Administrativo</h2>
        <button className="admin-logout-button" onClick={logout}>
          🚪 Sair
        </button>
      </div>

      <div className="admin-controls-card">
        <h3 className="admin-section-title">🎛️ Controles Gerais</h3>
        <div className="admin-controls-grid">
          <button
            className={`admin-control-button ${envioAtivo ? 'admin-active' : 'admin-inactive'}`}
            onClick={() => setEnvioAtivo(e => !e)}
          >
            {envioAtivo ? '✅ Envios Ativos' : '❌ Envios Desativados'}
          </button>
          <button
            className={`admin-control-button ${votacaoAtiva ? 'admin-active' : 'admin-inactive'}`}
            onClick={() => setVotacaoAtiva(v => !v)}
          >
            {votacaoAtiva ? '✅ Votação Ativa' : '❌ Votação Desativada'}
          </button>
        </div>
      </div>

      <div className="admin-content-card">
        <div className="admin-tabs">
          <button
            className={`admin-tab-button ${activeTab === 'envios' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('envios')}
          >
            📤 Envios Pendentes ({envios.length})
          </button>
          <button
            className={`admin-tab-button ${activeTab === 'stats' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            📊 Estatísticas
          </button>
          <button
            className={`admin-tab-button ${activeTab === 'approved' ? 'admin-tab-active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            ✅ Aprovados ({aprovados.length})
          </button>
        </div>

        {activeTab === 'envios' && (
          <div className="admin-tab-content">
            <div className="admin-filters">
              <input
                className="admin-search-input"
                type="text"
                placeholder="🔍 Buscar por nome ou WhatsApp..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <select
                className="admin-filter-select"
                value={filterLevel}
                onChange={e => setFilterLevel(e.target.value)}
              >
                <option value="todos">Todos os níveis</option>
                <option value="Iniciante">Iniciante</option>
                <option value="Intermediário">Intermediário</option>
                <option value="Avançado">Avançado</option>
              </select>
              <select
                className="admin-filter-select"
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

            <h3 className="admin-section-title">
              📤 Envios Pendentes
              {filteredEnvios.length !== envios.length && (
                <span className="admin-filter-count">({filteredEnvios.length} de {envios.length})</span>
              )}
            </h3>
            {filteredEnvios.length === 0 ? (
              <p className="admin-empty-message">
                {envios.length === 0 ? 'Nenhum envio pendente.' : 'Nenhum envio encontrado com os filtros aplicados.'}
              </p>
            ) : (
              <div className="admin-envios-grid">
                {filteredEnvios.map((envio, i) => {
                  const originalIndex = envios.findIndex(e => e === envio);
                  return (
                    <div key={i} className="admin-envio-card">
                      <img
                        className="admin-envio-image"
                        src={URL.createObjectURL(envio.arquivo)}
                        alt={`Arte de ${envio.nome}`}
                      />
                      <div className="admin-envio-info">
                        <h4 className="admin-envio-name">{envio.nome}</h4>
                        <div className="admin-envio-details">
                          <p><strong>Nível:</strong> <span className="admin-level-badge">{envio.nivel}</span></p>
                          <p><strong>WhatsApp:</strong> {envio.whatsapp}</p>
                          <p><strong>Tipo:</strong> <span className="admin-challenge-badge">{envio.desafio}</span></p>
                        </div>
                      </div>
                      <div className="admin-envio-actions">
                        <button
                          className="admin-approve-button"
                          onClick={() => aprovar(originalIndex)}
                        >
                          ✅ Aprovar
                        </button>
                        <button
                          className="admin-reject-button"
                          onClick={() => rejeitar(originalIndex)}
                        >
                          ❌ Rejeitar
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'approved' && (
          <div className="admin-tab-content">
            <h3 className="admin-section-title">✅ Artes Aprovadas ({aprovados.length})</h3>
            {aprovados.length === 0 ? (
              <p className="admin-empty-message">Nenhuma arte aprovada ainda.</p>
            ) : (
              <div className="admin-approved-grid">
                {aprovados.map((arte, i) => (
                  <div key={i} className="admin-approved-card">
                    <img
                      className="admin-approved-image"
                      src={URL.createObjectURL(arte.arquivo)}
                      alt={`Arte de ${arte.nome}`}
                    />
                    <div className="admin-approved-info">
                      <h4 className="admin-approved-name">{arte.nome}</h4>
                      <p className="admin-approved-level">{arte.nivel}</p>
                      {arte.dataAprovacao && (
                        <p className="admin-approved-date">
                          Aprovado em: {arte.dataAprovacao}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="admin-tab-content">
            <h3 className="admin-section-title">📊 Estatísticas do Sistema</h3>

            <div className="admin-stats-section">
              <h4 className="admin-stats-subtitle">📈 Visão Geral</h4>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-number">{stats.totalEnvios}</div>
                  <div className="admin-stat-label">Envios Pendentes</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-number">{stats.totalAprovados}</div>
                  <div className="admin-stat-label">Artes Aprovadas</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-number">{stats.totalEnvios + stats.totalAprovados}</div>
                  <div className="admin-stat-label">Total de Submissões</div>
                </div>
                <div className="admin-stat-card">
                  <div className={`admin-stat-number ${envioAtivo ? 'admin-stat-active' : 'admin-stat-inactive'}`}>
                    {envioAtivo ? 'ON' : 'OFF'}
                  </div>
                  <div className="admin-stat-label">Status dos Envios</div>
                </div>
              </div>
            </div>

            <div className="admin-stats-section">
              <h4 className="admin-stats-subtitle">🎯 Por Nível de Experiência</h4>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-number">{stats.porNivel.iniciante}</div>
                  <div className="admin-stat-label">Iniciante</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-number">{stats.porNivel.intermediario}</div>
                  <div className="admin-stat-label">Intermediário</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-number">{stats.porNivel.avancado}</div>
                  <div className="admin-stat-label">Avançado</div>
                </div>
              </div>
            </div>

            <div className="admin-stats-section">
              <h4 className="admin-stats-subtitle">🏆 Por Tipo de Desafio</h4>
              <div className="admin-stats-grid">
                <div className="admin-stat-card">
                  <div className="admin-stat-number">{stats.porDesafio.livre}</div>
                  <div className="admin-stat-label">Envio Livre</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-number">{stats.porDesafio.diario}</div>
                  <div className="admin-stat-label">Desafio Diário</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-number">{stats.porDesafio.semanal}</div>
                  <div className="admin-stat-label">Desafio Semanal</div>
                </div>
                <div className="admin-stat-card">
                  <div className="admin-stat-number">{stats.porDesafio.mensal}</div>
                  <div className="admin-stat-label">Desafio Mensal</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin