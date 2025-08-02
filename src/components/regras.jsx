const Regras = ({ config }) => (
  <div className="regras-main">
    <h2 className="regras-title">📋 Regras da Comunidade</h2>

    <div className="regras-card">
      <h2 className="regras-community-title">👑 {config.comunidade.nome} – Grupo Oficial da Comunidade</h2>
      <p className="regras-welcome-text">
        Seja bem-vindo(a) ao grupo principal! Aqui é o espaço pra compartilhar
        suas ideias, artes e projetos autorais ✍️ Não importa seu estilo, traço
        ou nível de experiência — o foco é crescer juntos, trocar ideias e se
        inspirar.
      </p>
    </div>

    <div className="regras-warning-card">
      <h3 className="regras-warning-title">🧸 Atenção - Menores de 13 anos:</h3>
      <p>Comportamento será monitorado de perto. Qualquer atitude fora das regras resultará em banimento imediato.</p>
    </div>

    <div className="regras-card">
      <h2 className="regras-section-title">📌 Regras Importantes:</h2>
      <div className="regras-rules-grid">
        <div className="regras-rule-item">
          <span className="regras-rule-icon regras-allowed">✅</span>
          <span><strong>Respeito é básico</strong> – sem ofensas, brigas ou tretas</span>
        </div>
        <div className="regras-rule-item">
          <span className="regras-rule-icon regras-forbidden">🚫</span>
          <span><strong>Sem pornografia</strong> – nada de +18 ou cenas explícitas no grupo principal</span>
        </div>
        <div className="regras-rule-item">
          <span className="regras-rule-icon regras-forbidden">🚫</span>
          <span><strong>Zero preconceito</strong> – racismo, homofobia, machismo, etc</span>
        </div>
        <div className="regras-rule-item">
          <span className="regras-rule-icon regras-forbidden">🚫</span>
          <span><strong>Sem spam, flood ou divulgação aleatória</strong></span>
        </div>
        <div className="regras-rule-item">
          <span className="regras-rule-icon regras-forbidden">🚫</span>
          <span><strong>Proibido plágio</strong> – só obras próprias ou com permissão/crédito</span>
        </div>
        <div className="regras-rule-item">
          <span className="regras-rule-icon regras-allowed">✅</span>
          <span><strong>Críticas construtivas</strong> são bem-vindas, sempre com respeito</span>
        </div>
        <div className="regras-rule-item">
          <span className="regras-rule-icon regras-forbidden">🚫</span>
          <span><strong>Nada de política ou religião</strong> – fora do foco do grupo</span>
        </div>
        <div className="regras-rule-item">
          <span className="regras-rule-icon regras-allowed">✅</span>
          <span><strong>Pode divulgar projetos</strong>, mas com contexto e descrição</span>
        </div>
        <div className="regras-rule-item">
          <span className="regras-rule-icon regras-allowed">✅</span>
          <span><strong>Poste com moderação</strong> – nada de lotar o grupo de uma vez</span>
        </div>
        <div className="regras-rule-item">
          <span className="regras-rule-icon regras-forbidden">🚫</span>
          <span><strong>Uso indevido de IA está proibido</strong> – respeitem os limites e o foco</span>
        </div>
        <div className="regras-rule-item">
          <span className="regras-rule-icon regras-forbidden">🚫</span>
          <span><strong>Gore explícito não é permitido</strong></span>
        </div>
        <div className="regras-rule-item">
          <span className="regras-rule-icon regras-forbidden">🚫</span>
          <span><strong>Calls aleatórias nos grupos são proibidas</strong> – apenas liberadas em dias marcados e com ordem dos adms</span>
        </div>
      </div>
    </div>

    <div className="regras-highlight-card">
      <h3 className="regras-highlight-text">🎯 Nosso foco é colaboração, não competição!</h3>
    </div>

    <div className="regras-card">
      <h3 className="regras-schedule-title">🔐 Horário de Funcionamento</h3>
      <p>Durante a noite, apenas o grupo principal (DaVinci Comic) fica aberto. Os outros grupos fecham e reabrem pela manhã para manter a organização.</p>
    </div>

    <div className="regras-card">
      <h3 className="regras-contact-title">📞 Contato com Moderação</h3>
      <p>Em caso de dúvidas ou problemas, entre em contato com qualquer membro da equipe de moderação. Estamos aqui para ajudar!</p>
    </div>
  </div>
);

export default Regras