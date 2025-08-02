import React, { useState } from 'react';

const ConviteGrupo = ({ config }) => {
  const [copiado, setCopiado] = useState(false);
  const link = config.comunidade?.whatsapp?.grupoOficial || '#';

  const copiarLink = () => {
    navigator.clipboard.writeText(link);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div className="convite-main">
      <h2 className="convite-titulo">📢 Participe da Comunidade!</h2>
      <p className="convite-texto">
        Junte-se ao nosso grupo oficial no WhatsApp para interagir, compartilhar artes e conhecer outros artistas incríveis.
      </p>

      <div className="convite-acoes">
        <a
          href={link}
          className="convite-botao"
          target="_blank"
          rel="noopener noreferrer"
        >
          Entrar no Grupo
        </a>

        <button onClick={copiarLink} className="convite-copiar">
          {copiado ? '✅ Link Copiado!' : '📋 Copiar Link'}
        </button>
      </div>

      <p className="convite-texto-menor">Convide um amigo para se juntar à comunidade também!</p>
    </div>
  );
};

export default ConviteGrupo;

