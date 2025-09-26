import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import "./App.css";
import "./Votacao.css";
import useGitHubData from "./configGit";
import Admin from "./components/Admin";
import VideoGallerySlider from "./components/VideosGalerrySlider";
import Galeria from ".//components/Galeria";
import Brushs from "./components/brushs";
import Perfil from "./components/profile";
import Regras from "./components/regras";
import Plus18 from "./components/plus18";
import ConviteGrupo from "./components/ConviteGrupo";
import { useGitHubArts } from "./hooks/useGithubArts";
import Envio from "./components/Envio";
import Votacao from "./components/Votacao";

const Header = ({ config }) => {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? "nav-link nav-link-active" : "nav-link";

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">
          {config.comunidade.nome}
        </Link>
        <nav className="nav">
          <Link to="/" className={isActive("/")}>
            🏠 Início
          </Link>
          <Link to="/galeria" className={isActive("/galeria")}>
            🎨 Galeria
          </Link>
          <Link to="/desafios" className={isActive("/desafios")}>
            🏆 Desafios
          </Link>
          <Link to="/envio" className={isActive("/envio")}>
            📤 Enviar
          </Link>
          <Link to="/votacao" className={isActive("/votacao")}>
            🗳️ Votar
          </Link>
          <Link to="/plus18" className={isActive("/plus18")}>
            🔞 +18
          </Link>
          <Link to="/perfil" className={isActive("/perfil")}>
            ℹ️ Sobre
          </Link>
          <Link to="/regras" className={isActive("/regras")}>
            📋 Regras
          </Link>
          <Link to="/admin" className={isActive("/admin")}>
            ⚙️ Admin
          </Link>
        </nav>
      </div>
    </header>
  );
};

const Footer = ({ config }) => (
  <footer className="footer">
    {console.log(config)}
    <p>
      © {new Date().getFullYear()} {config.comunidade?.nome}. Todos os direitos
      reservados.
    </p>
  </footer>
);

const SearchBar = ({ onSearch, config }) => (
  <div className="card search-bar">
    <div className="search-input-container">
      <input
        className="input"
        type="text"
        placeholder="Buscar artistas, artes, desafios..."
        onChange={(e) => onSearch && onSearch(e.target.value)}
      />
      <button
        className="button-search
      "
      >
        🔍
      </button>
    </div>
  </div>
);

const ArtGallerySlider = ({ artesGalery }) => {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    if (!artesGalery || artesGalery.length === 0) return;
    const interval = setInterval(() => {
      if (!hover) setIndex((prev) => (prev + 1) % artesGalery.length);
    }, 2000); // muda a cada 4s
    return () => clearInterval(interval);
  }, [artesGalery, hover]);

  if (!artesGalery || artesGalery.length === 0) {
    return <div>Nenhuma arte disponível no momento.</div>;
  }

  const currentArt = artesGalery[index];
  const imageUrl = currentArt.url || currentArt.imagem || currentArt.link || "";
  const autor = currentArt.autor || currentArt.editor || "Autor Desconhecido";
  const nome = currentArt.nome || currentArt.titulo || "";

  const nextSlide = () => setIndex((index + 1) % artesGalery.length);
  const prevSlide = () =>
    setIndex((index - 1 + artesGalery.length) % artesGalery.length);

  return (
    <div
      className="slider-container"
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "900px",
        margin: "40px auto",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 8px 20px rgba(0,0,0,0.4)",
        backgroundColor: "#000",
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Imagem do slide */}
      <img
        src={imageUrl}
        alt={`Arte de ${nome}`}
        style={{
          width: "100%",
          height: "100%",
          maxHeight: "300px",
          objectFit: "fill",
          transition: "opacity 1s ease-in-out",
          display: "block",
        }}
      />

      {/* Legenda */}
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          padding: "12px 20px",
          fontSize: "16px",
          fontWeight: "500",
          textAlign: "center",
        }}
      >
        {nome} — <strong>{autor}</strong>
      </div>

      {/* Botões de navegação */}
      <button
        onClick={prevSlide}
        style={{
          position: "absolute",
          top: "50%",
          left: "10px",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.5)",
          border: "none",
          color: "#fff",
          fontSize: "32px",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          cursor: "pointer",
          zIndex: 2,
        }}
        aria-label="Slide anterior"
      >
        ‹
      </button>

      <button
        onClick={nextSlide}
        style={{
          position: "absolute",
          top: "50%",
          right: "10px",
          transform: "translateY(-50%)",
          background: "rgba(0,0,0,0.5)",
          border: "none",
          color: "#fff",
          fontSize: "32px",
          borderRadius: "50%",
          width: "50px",
          height: "50px",
          cursor: "pointer",
          zIndex: 2,
        }}
        aria-label="Próximo slide"
      >
        ›
      </button>
    </div>
  );
};

const destaques = [
  {
    titulo: "Vencedor Diário",
    autor: "Indisponivel no momento",
    arte: "/imgs/dia.jpg",
  },
  {
    titulo: "Destaque Semanal",
    autor: "Indisponivel no momento",
    arte: "/imgs/semana.jpg",
  },
  {
    titulo: "Melhor OC do Mês",
    autor: "Indisponivel no momento",
    arte: "/imgs/oc.jpg",
  },
];

const ChallengeWinners = () => (
  <div className="challenge-grid">
    {destaques.map((d, i) => (
      <div key={i} className="challenge-card">
        <img src={d.arte} alt={d.titulo} className="challenge-card-image" />
        <div className="challenge-card-text">
          <div className="challenge-title">{d.titulo}</div>
          <div className="challenge-author">por {d.autor}</div>
        </div>
      </div>
    ))}
  </div>
);

const EventCard = ({ title, description, date, time, icon }) => (
  <div className="card">
    <div className="event-icon">{icon}</div>
    <h3 className="event-title">{title}</h3>
    <p className="event-description">{description}</p>
    <div className="event-info">
      <span>📅 {date}</span>
      <span>🕐 {time}</span>
    </div>
  </div>
);

const ChallengeCard = ({ challenge, type, onParticipate, disabled }) => (
  <div
    className={`card challenge-gradient ${
      disabled ? "challenge-disabled" : ""
    }`}
  >
    <div className="challenge-header">
      <h3 className="event-title">Desafio {type}</h3>
      <span className="challenge-badge">{type}</span>
    </div>
    <h4 className="challenge-theme">{challenge.tema}</h4>
    <p className="challenge-description">{challenge.descricao}</p>
    <div className="challenge-prize">
      <strong className="highlight">🏆 Prêmio: </strong>
      <span>{challenge.premio}</span>
    </div>
    {disabled ? (
      <button className="button-btn disabled" disabled>
        Desafio Indisponível
      </button>
    ) : (
      <button
        className="button-btn"
        onClick={() => onParticipate && onParticipate(type)}
      >
        Participar do Desafio
      </button>
    )}
  </div>
);

const SocialLinks = ({ config }) => {
  if (!config) {
    return (
      <div className="error-container">
        <p>❌ Configuração não carregada. Verifique a origem dos dados.</p>
      </div>
    );
  }

  const redes = config.comunidade?.redesSociais || {};
  const whatsapp = config.comunidade?.whatsapp || {};

  return (
    <div className="social-container">
      <h2 className="social-title">🌐 Nossas Redes Sociais</h2>
      <p className="social-sub">
        Siga-nos ou entre para participar das novidades:
      </p>
      <div className="social-links">
        {redes.tiktok && (
          <a
            href={`https://tiktok.com/${redes.tiktok}`}
            className="social-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            🎵 TikTok
          </a>
        )}
        {redes.instagram && (
          <a
            href={`https://instagram.com/${redes.instagram}`}
            className="social-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            📸 Instagram
          </a>
        )}
        {whatsapp.grupoOficial && (
          <a
            href={whatsapp.grupoOficial}
            className="social-button"
            target="_blank"
            rel="noopener noreferrer"
          >
            💬 WhatsApp
          </a>
        )}
      </div>
    </div>
  );
};

const Home = ({ config, artesHome }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="main">
      <div className="home-header">
        <h1 className="home-title">Bem-vindo à {config.comunidade?.nome}</h1>
        <p className="home-description">{config.comunidade?.descricao}</p>
      </div>

      <SearchBar onSearch={setSearchTerm} />
      <ArtGallerySlider artesGalery={artesHome} />

      <VideoGallerySlider config={config} />

      <ChallengeWinners />

      <div className="grid">
        <EventCard
          title="Gartic Night"
          description="Sessão semanal de Gartic Phone para relaxar e criar juntos!"
          date={config.comunidade.eventos.gartic.dia}
          time={config.comunidade.eventos.gartic.horario}
          icon="🎮"
        />
        <EventCard
          title="Desafio Semanal"
          description="Novo tema toda semana para testar sua criatividade"
          date="Segunda-feira"
          time="Anúncio às 18:00"
          icon="🏆"
        />
        <EventCard
          title="Review de Artes"
          description="Feedback construtivo dos membros experientes"
          date="Sábado"
          time="15:00"
          icon="👁️"
        />
      </div>

      <ConviteGrupo config={config} />

      <Brushs config={config} />
      <SocialLinks config={config} />
    </div>
  );
};

const Desafios = ({ config }) => {
  const navigate = useNavigate();

  const handleParticipate = (type) => {
    navigate("/envio", { state: { desafioType: type } });
  };

  // função para renderizar apenas se ativo
  const renderChallenge = (challenge, type) => {
    if (!challenge) return null; // se não existe
    if (!challenge.ativo) {
      return (
        <ChallengeCard
          challenge={challenge}
          type={type}
          disabled // passa flag para mostrar desativado
        />
      );
    }
    return (
      <ChallengeCard
        challenge={challenge}
        type={type}
        onParticipate={handleParticipate}
      />
    );
  };

  return (
    <div className="desafios-main">
      <h2 className="desafios-title">🏆 Desafios Atuais</h2>
      <div className="desafios-grid">
        {renderChallenge(config.desafios.diario, "Diário")}
        {renderChallenge(config.desafios.semanal, "Semanal")}
        {renderChallenge(config.desafios.mensal, "Mensal")}
      </div>
      <div className="desafios-info-card">
        <h3 className="desafios-highlight">🤔 Como Funciona?</h3>
        <p>
          Participe dos nossos desafios de arte! Basta clicar em "Participar do
          Desafio", enviar sua arte dentro do prazo e concorrer a prêmios
          incríveis. Os desafios são uma ótima forma de se motivar e testar suas
          habilidades!
        </p>
        <Link to="/regras" className="desafios-button-link">
          Ver regras dos desafios
        </Link>
      </div>
    </div>
  );
};

const Carregando = () => (
  <div className="loading-container">
    <p>🔄 Carregando dados da comunidade...</p>
  </div>
);

const Erro = ({ mensagem }) => (
  <div className="error-container">
    <h2>❌ Ocorreu um erro</h2>
    <p>
      {mensagem ||
        "Não foi possível carregar os dados necessários. Tente novamente mais tarde."}
    </p>
  </div>
);

const App = () => {
  const [envios, setEnvios] = useState([]);
  const [aprovados, setAprovados] = useState([]);
  const [envioAtivo, setEnvioAtivo] = useState(true);
  const [votacaoAtiva, setVotacaoAtiva] = useState(true);

  const { artes, loading } = useGitHubArts();
  const { config, loading: configLoading, error } = useGitHubData();

  if (loading || configLoading) return <Carregando />;
  if (error) return <Erro mensagem={error} />;

  return (
    <div className="app">
      <Router>
        <Header config={config} />
        <div className="main">
          <Routes>
            <Route
              path="/"
              element={<Home config={config} artesHome={artes} />}
            />
            <Route path="/galeria" element={<Galeria artes={artes} />} />
            <Route path="/desafios" element={<Desafios config={config} />} />
            <Route
              path="/envio"
              element={
                <Envio
                  envioAtivo={envioAtivo}
                  onNovoEnvio={(d) => setEnvios((e) => [...e, d])}
                />
              }
            />
            <Route
              path="/votacao"
              element={
                <Votacao
                  artesAprovadas={aprovados.filter(
                    (a) => a.desafio !== "livre"
                  )}
                  votacaoAtiva={votacaoAtiva}
                />
              }
            />
            <Route path="/plus18" element={<Plus18 config={config} />} />
            <Route path="/perfil" element={<Perfil config={config} />} />
            <Route path="/regras" element={<Regras config={config} />} />
            <Route
              path="/admin"
              element={
                <Admin
                  envios={envios}
                  setEnvios={setEnvios}
                  setAprovados={setAprovados}
                  setEnvioAtivo={setEnvioAtivo}
                  setVotacaoAtiva={setVotacaoAtiva}
                  envioAtivo={envioAtivo}
                  votacaoAtiva={votacaoAtiva}
                  aprovados={aprovados}
                />
              }
            />
          </Routes>
        </div>
        <Footer config={config} />
      </Router>
    </div>
  );
};

export default App;
