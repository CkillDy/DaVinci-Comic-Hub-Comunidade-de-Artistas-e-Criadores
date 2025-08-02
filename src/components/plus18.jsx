const Plus18 = ({ config }) => (
  <div className="plus18-main">
    <h1 className="plus18-title">🔞 Área +18</h1>

    <div className="plus18-card">
      <h2 className="plus18-warning">Aviso: Conteúdo Sensível</h2>
      <p>
        Esta área é exclusiva para membros da comunidade com mais de 18 anos. É um espaço para compartilhar
        artes com temas mais maduros, seguindo regras específicas para garantir o respeito e a segurança de todos.
      </p>
      <p>
        Para ter acesso, é necessário passar por um processo de verificação de idade.
      </p>
      <div className="plus18-button-container">
        <a
          href={config.comunidade.whatsapp.grupoPlus18}
          className="plus18-button"
          target="_blank"
          rel="noopener noreferrer"
        >
          Entrar no Grupo +18
        </a>
      </div>
    </div>
  </div>
);

export default Plus18;
