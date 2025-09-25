import React, { useState, useEffect } from "react";
import { Eye, Trash2, RefreshCw, BarChart3 } from "lucide-react";
import { buscarTodosEnvios, removerEnvio } from "../hooks/superbase";

const Admin = ({
  setEnvioAtivo,
  setVotacaoAtiva,
  envioAtivo,
  votacaoAtiva,
}) => {
  const [pass, setPass] = useState("");
  const [auth, setAuth] = useState(() => {
    return sessionStorage.getItem("adminAuth") === "true";
  });
  const [activeTab, setActiveTab] = useState("controles");
  const [previewImage, setPreviewImage] = useState(null);

  // Estados para dados do Supabase
  const [artes, setArtes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Estatísticas calculadas
  const stats = React.useMemo(() => {
    const artistasUnicos = [...new Set(artes.map((arte) => arte.nome))].length;

    const agora = new Date();
    const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const enviosRecentes = artes.filter(
      (arte) => new Date(arte.created_at) >= seteDiasAtras
    ).length;

    const porNivel = {
      iniciante: artes.filter((e) => e.nivel === "Iniciante").length,
      intermediario: artes.filter((e) => e.nivel === "Intermediário").length,
      avancado: artes.filter((e) => e.nivel === "Avançado").length,
    };

    const porDesafio = {
      diario: artes.filter((e) => e.desafio === "Diário").length,
      semanal: artes.filter((e) => e.desafio === "Semanal").length,
      livre: artes.filter((e) => e.desafio === "livre").length,
    };

    return {
      totalArtes: artes.length,
      artistasUnicos,
      enviosRecentes,
      porNivel,
      porDesafio,
    };
  }, [artes]);

  // Carrega todas as artes
  const carregarArtes = async () => {
    setLoading(true);
    setError(null);
    try {
      const artesData = await buscarTodosEnvios();
      setArtes(artesData);
    } catch (err) {
      console.error("Erro ao carregar artes:", err);
      setError("Erro ao carregar dados do servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (auth) {
      carregarArtes();
    }
  }, [auth]);

  const login = (e) => {
    e.preventDefault();
    if (pass === "admin123") {
      setAuth(true);
      sessionStorage.setItem("adminAuth", "true");
    } else {
      alert("Senha incorreta!");
    }
  };

  // Remover arte específica
  const removerArte = async (arte) => {
    if (
      confirm(
        `Tem certeza que deseja REMOVER PERMANENTEMENTE a arte de "${arte.nome}"?`
      )
    ) {
      setLoading(true);
      try {
        await removerEnvio(arte.id);
        setArtes((prev) => prev.filter((a) => a.id !== arte.id));
        alert("Arte removida com sucesso!");
      } catch (err) {
        console.error("Erro ao remover arte:", err);
        alert("Erro ao remover arte. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }
  };

  const logout = () => {
    if (confirm("Deseja sair do painel administrativo?")) {
      setAuth(false);
      setPass("");
      setActiveTab("controles");
      sessionStorage.removeItem("adminAuth");
    }
  };

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
              onChange={(e) => setPass(e.target.value)}
              placeholder="Digite a senha de acesso"
              value={pass}
            />
            <button className="btn btn--primary btn--full">🔑 Entrar</button>
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
            <h1 className="admin-title">⚙️ Painel Administrativo</h1>
            <div className="header-actions">
              <button
                onClick={carregarArtes}
                className="btn btn--secondary"
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className={loading ? "animate-spin" : ""}
                />
                Atualizar
              </button>
              <button onClick={logout} className="btn btn--danger">
                🚪 Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container admin-main">
        {/* Mensagem de Erro */}
        {error && (
          <div className="error-banner">
            <p>❌ {error}</p>
            <button onClick={carregarArtes} className="btn btn--small">
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className="tabs-container">
          <nav className="tabs-nav">
            {[
              { id: "controles", label: "🎛️ Controles" },
              { id: "artes", label: "🎨 Desenhos", count: artes.length },
              { id: "stats", label: "📊 Estatísticas" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn ${
                  activeTab === tab.id ? "tab-btn--active" : ""
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} {tab.count !== undefined && `(${tab.count})`}
              </button>
            ))}
          </nav>

          <div className="tab-content">
            {/* Tab Controles */}
            {activeTab === "controles" && (
              <div className="controles-tab">
                <div className="controls-panel">
                  <h3 className="panel-title">🎛️ Controles do Sistema</h3>
                  <div className="controls-buttons">
                    <button
                      className={`btn btn--status ${
                        envioAtivo
                          ? "btn--status-active"
                          : "btn--status-inactive"
                      }`}
                      onClick={() => setEnvioAtivo((e) => !e)}
                    >
                      {envioAtivo
                        ? "✅ Envios Ativos"
                        : "❌ Envios Desativados"}
                    </button>
                    <button
                      className={`btn btn--status ${
                        votacaoAtiva
                          ? "btn--status-active"
                          : "btn--status-inactive"
                      }`}
                      onClick={() => setVotacaoAtiva((v) => !v)}
                    >
                      {votacaoAtiva
                        ? "✅ Votação Ativa"
                        : "❌ Votação Desativada"}
                    </button>
                  </div>
                </div>

                {/* Status do Sistema */}
                <div className="stats-section">
                  <h4 className="section-title">⚡ Status Atual</h4>
                  <div className="system-status">
                    <div className="status-item">
                      <div
                        className={`status-indicator ${
                          envioAtivo
                            ? "status-indicator--active"
                            : "status-indicator--inactive"
                        }`}
                      ></div>
                      <div className="status-details">
                        <p className="status-name">Sistema de Envios</p>
                        <p className="status-description">
                          {envioAtivo
                            ? "Funcionando normalmente"
                            : "Desativado pelo administrador"}
                        </p>
                      </div>
                    </div>
                    <div className="status-item">
                      <div
                        className={`status-indicator ${
                          votacaoAtiva
                            ? "status-indicator--active"
                            : "status-indicator--inactive"
                        }`}
                      ></div>
                      <div className="status-details">
                        <p className="status-name">Sistema de Votação</p>
                        <p className="status-description">
                          {votacaoAtiva
                            ? "Funcionando normalmente"
                            : "Desativado pelo administrador"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Artes */}
            {activeTab === "artes" && (
              <div className="artes-tab">
                <div className="tab-header">
                  <h3 className="tab-title">🎨 Todas as Artes da Galeria</h3>
                  <p className="tab-description">
                    Visualize e gerencie todas as artes enviadas pelos usuários
                  </p>
                </div>

                {loading ? (
                  <div className="loading-state">
                    <RefreshCw className="animate-spin" size={32} />
                    <p>Carregando artes...</p>
                  </div>
                ) : (
                  <>
                    {artes.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">🎨</div>
                        <p className="empty-text">Nenhuma arte enviada ainda</p>
                      </div>
                    ) : (
                      <div className="envios-grid">
                        {artes.map((arte) => (
                          <div key={arte.id} className="envio-card">
                            <div className="envio-image">
                              <img
                                className="image image--clickable"
                                src={arte.arquivo_url}
                                alt={`Arte de ${arte.nome}`}
                                onClick={() =>
                                  setPreviewImage(arte.arquivo_url)
                                }
                              />
                              <button
                                onClick={() =>
                                  setPreviewImage(arte.arquivo_url)
                                }
                                className="btn btn--icon btn--preview"
                              >
                                <Eye size={16} />
                              </button>
                            </div>
                            <div className="envio-content">
                              <h4 className="envio-title">{arte.nome}</h4>
                              <div className="envio-info">
                                <p>
                                  <strong>Nível:</strong>{" "}
                                  <span className="tag tag--blue">
                                    {arte.nivel}
                                  </span>
                                </p>
                                <p>
                                  <strong>WhatsApp:</strong> {arte.whatsapp}
                                </p>
                                <p>
                                  <strong>Desafio:</strong>{" "}
                                  <span className="tag tag--purple">
                                    {arte.desafio}
                                  </span>
                                </p>
                                <p>
                                  <strong>Enviado:</strong>{" "}
                                  {new Date(arte.created_at).toLocaleDateString(
                                    "pt-BR",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </p>
                              </div>
                              <div className="envio-actions">
                                <button
                                  onClick={() => removerArte(arte)}
                                  className="btn btn--danger btn--small"
                                  disabled={loading}
                                >
                                  <Trash2 size={16} />
                                  Remover
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Tab Estatísticas */}
            {activeTab === "stats" && (
              <div className="stats-tab">
                <h3 className="tab-title">
                  <BarChart3 size={24} />
                  Estatísticas da Galeria
                </h3>

                {/* Cards Principais */}
                <div className="stats-grid">
                  <div className="stat-card stat-card--blue">
                    <div className="stat-content">
                      <div className="stat-info">
                        <p className="stat-label">Total de Artes</p>
                        <p className="stat-value">{stats.totalArtes}</p>
                      </div>
                      <div className="stat-icon">🎨</div>
                    </div>
                  </div>

                  <div className="stat-card stat-card--green">
                    <div className="stat-content">
                      <div className="stat-info">
                        <p className="stat-label">Artistas Únicos</p>
                        <p className="stat-value">{stats.artistasUnicos}</p>
                      </div>
                      <div className="stat-icon">👥</div>
                    </div>
                  </div>

                  <div className="stat-card stat-card--purple">
                    <div className="stat-content">
                      <div className="stat-info">
                        <p className="stat-label">Últimos 7 dias</p>
                        <p className="stat-value">{stats.enviosRecentes}</p>
                      </div>
                      <div className="stat-icon">📈</div>
                    </div>
                  </div>
                </div>

                {/* Por Nível */}
                <div className="stats-section">
                  <h4 className="section-title">📊 Por Nível de Experiência</h4>
                  <div className="level-stats">
                    <div className="level-stat">
                      <div className="level-count">
                        {stats.porNivel.iniciante}
                      </div>
                      <div className="level-name">Iniciante</div>
                    </div>
                    <div className="level-stat">
                      <div className="level-count">
                        {stats.porNivel.intermediario}
                      </div>
                      <div className="level-name">Intermediário</div>
                    </div>
                    <div className="level-stat">
                      <div className="level-count">
                        {stats.porNivel.avancado}
                      </div>
                      <div className="level-name">Avançado</div>
                    </div>
                  </div>
                </div>

                {/* Por Tipo de Desafio */}
                <div className="stats-section">
                  <h4 className="section-title">🎯 Por Tipo de Desafio</h4>
                  <div className="level-stats">
                    <div className="level-stat">
                      <div className="level-count">
                        {stats.porDesafio.diario}
                      </div>
                      <div className="level-name">Diário</div>
                    </div>
                    <div className="level-stat">
                      <div className="level-count">
                        {stats.porDesafio.semanal}
                      </div>
                      <div className="level-name">Semanal</div>
                    </div>
                    <div className="level-stat">
                      <div className="level-count">
                        {stats.porDesafio.livre}
                      </div>
                      <div className="level-name">Livre</div>
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
            <img className="modal-image" src={previewImage} alt="Preview" />
            <button
              onClick={() => setPreviewImage(null)}
              className="modal-close"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
