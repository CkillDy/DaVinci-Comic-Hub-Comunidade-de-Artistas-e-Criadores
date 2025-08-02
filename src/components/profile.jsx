const Perfil = ({ config }) => (
  <div className="perfil-main">
    {/* Hero Section com Imagem de Capa */}
    <div className="perfil-hero">
      <div className="perfil-hero-overlay">
        <h1 className="perfil-hero-title"> Sobre a {config.comunidade.nome}</h1>
        <p className="perfil-hero-subtitle">
          Funcionando desde {config.comunidade.anoFundacao}
        </p>
      </div>
    </div>

    <div className="perfil-content">
      <div className="perfil-card">
        <h2 className="perfil-section-title">🎨 Nossa História</h2>
        <div className="perfil-story-content">
          <p className="perfil-text">
            A {config.comunidade.nome} foi criada por <strong className="perfil-highlight">{config.comunidade.fundador}</strong> em {config.comunidade.anoFundacao} com o objetivo inicial de reunir artistas que produzem histórias em quadrinhos, mangás, comics e personagens originais (OCs). Começou como um grupo simples, mas cresceu rapidamente, transformando-se em uma grande comunidade.
          </p>
          <p className="perfil-text">
            Com o crescimento, foi necessário organizar melhor os espaços, criando grupos e áreas separados por temas e níveis de experiência, permitindo que artistas iniciantes, intermediários e avançados pudessem interagir, compartilhar seus trabalhos e evoluir juntos.
          </p>
          <p className="perfil-text">
            A comunidade é administrada por uma equipe dedicada que cuida da moderação, organização de eventos e criação de espaços seguros para todos os tipos de artistas. Também foram criadas áreas especiais como a Área +18, voltada para conteúdo mais maduro, com acesso restrito e verificação.
          </p>
        </div>
      </div>

      <div className="perfil-card">
        <h2 className="perfil-section-title">👥 Nossa Equipe</h2>
        <div className="perfil-team-grid">
          <div className="perfil-team-section">
            <h3 className="perfil-team-role perfil-founder">👑 Fundador</h3>
            <div className="perfil-team-members">
              {config.equipe.fundador.map(nome => (
                <div key={nome} className="perfil-member-card perfil-founder-card">
                  <div className="perfil-member-avatar">👑</div>
                  <div className="perfil-member-info">
                    <div className="perfil-member-name">{nome}</div>
                    <div className="perfil-member-title">Criador da DaVinci Comic</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="perfil-team-section">
            <h3 className="perfil-team-role perfil-admin">⭐ Administradores Superiores</h3>
            <div className="perfil-team-members">
              {config.equipe.admSuperiores.map(nome => (
                <div key={nome} className="perfil-member-card perfil-admin-card">
                  <div className="perfil-member-avatar">⭐</div>
                  <div className="perfil-member-info">
                    <div className="perfil-member-name">{nome}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="perfil-team-section">
            <h3 className="perfil-team-role perfil-mod">🛡️ Moderadores</h3>
            <div className="perfil-team-members">
              {config.equipe.moderadores.map(nome => (
                <div key={nome} className="perfil-member-card perfil-mod-card">
                  <div className="perfil-member-avatar">🛡️</div>
                  <div className="perfil-member-info">
                    <div className="perfil-member-name">{nome}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="perfil-card">
        <h2 className="perfil-section-title">🎯 Nosso Foco</h2>
        <div className="perfil-focus-grid">
          <div className="perfil-focus-item">
            <div className="perfil-focus-icon">📚</div>
            <h4 className="perfil-focus-title">Apoio à Criação</h4>
            <p className="perfil-focus-description">Suporte e feedback para artistas em desenvolvimento</p>
          </div>
          <div className="perfil-focus-item">
            <div className="perfil-focus-icon">🤝</div>
            <h4 className="perfil-focus-title">Troca de Ideias</h4>
            <p className="perfil-focus-description">Ambiente colaborativo para compartilhar conhecimento</p>
          </div>
          <div className="perfil-focus-item">
            <div className="perfil-focus-icon">📢</div>
            <h4 className="perfil-focus-title">Divulgação</h4>
            <p className="perfil-focus-description">Plataforma para mostrar seus trabalhos</p>
          </div>
          <div className="perfil-focus-item">
            <div className="perfil-focus-icon">🏆</div>
            <h4 className="perfil-focus-title">Eventos</h4>
            <p className="perfil-focus-description">Desafios, concursos e atividades regulares</p>
          </div>
        </div>
      </div>

      <div className="perfil-card">
        <h2 className="perfil-section-title">📈 Estatísticas</h2>
        <div className="perfil-stats-grid">
          <div className="perfil-stat-item">
            <div className="perfil-stat-number">850+</div>
            <div className="perfil-stat-label">Membros Ativos</div>
            <div className="perfil-stat-icon">👥</div>
          </div>
          <div className="perfil-stat-item">
            <div className="perfil-stat-number">1.2k+</div>
            <div className="perfil-stat-label">Artes Compartilhadas</div>
            <div className="perfil-stat-icon">🎨</div>
          </div>
          <div className="perfil-stat-item">
            <div className="perfil-stat-number">45+</div>
            <div className="perfil-stat-label">Desafios Realizados</div>
            <div className="perfil-stat-icon">🏆</div>
          </div>
          <div className="perfil-stat-item">
            <div className="perfil-stat-number">24/7</div>
            <div className="perfil-stat-label">Suporte Ativo</div>
            <div className="perfil-stat-icon">🔧</div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="perfil-cta-card">
        <h3 className="perfil-cta-title">🚀 Junte-se à Nossa Comunidade!</h3>
        <p className="perfil-cta-text">
          Faça parte de uma comunidade vibrante de artistas apaixonados por criar e compartilhar arte!
        </p>
      </div>
    </div>
  </div>
);

export default Perfil