import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from "react-router-dom";
import "./App.css"
import useGitHubData from "./configGit"
import Admin from "./components/Admin"
import VideoGallerySlider from "./components/VideosGalerrySlider"
import Galeria from ".//components/Galeria"
import Brushs from "./components/brushs"
import Perfil from "./components/profile"
import Regras from "./components/regras"
import Plus18 from "./components/plus18"
import ConviteGrupo from "./components/ConviteGrupo"

const Header = ({ config }) => {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ? 'nav-link nav-link-active' : 'nav-link';

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo">{config.comunidade.nome}</Link>
        <nav className="nav">
          <Link to="/" className={isActive('/')}>🏠 Início</Link>
          <Link to="/galeria" className={isActive('/galeria')}>🎨 Galeria</Link>
          <Link to="/desafios" className={isActive('/desafios')}>🏆 Desafios</Link>
          <Link to="/envio" className={isActive('/envio')}>📤 Enviar</Link>
          <Link to="/votacao" className={isActive('/votacao')}>🗳️ Votar</Link>
          <Link to="/plus18" className={isActive('/plus18')}>🔞 +18</Link>
          <Link to="/perfil" className={isActive('/perfil')}>ℹ️ Sobre</Link>
          <Link to="/regras" className={isActive('/regras')}>📋 Regras</Link>
          <Link to="/admin" className={isActive('/admin')}>⚙️ Admin</Link>
        </nav>
      </div>
    </header>
  );
}

const Footer = ({ config }) => (
  < footer className="footer" >
    {console.log(config)}
    <p>© {new Date().getFullYear()} {config.comunidade?.nome}. Todos os direitos reservados.</p>
  </footer >
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
      <button className="button-search
      ">🔍</button>
    </div>
  </div>
);

const arts = [
  { src: "/imgs/art1.jpg", autor: "Lucca" },
  { src: "/imgs/art2.jpg", autor: "Mariana" },
  { src: "/imgs/art3.jpg", autor: "Guimar" },
];

const ArtGallerySlider = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % arts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="slider-container">
      <img
        src={arts[index].src}
        alt={`Arte enviada por ${arts[index].autor}`}
        className="slider-image"
      />
      <div className="slider-caption">
        Arte enviada por <strong className="highlight">{arts[index].autor}</strong>
      </div>
    </div>
  );
};

const destaques = [
  { titulo: "Vencedor Diário", autor: "Ks", arte: "/imgs/dia.jpg" },
  { titulo: "Destaque Semanal", autor: "Jinx", arte: "/imgs/semana.jpg" },
  { titulo: "Melhor OC do Mês", autor: "Ck", arte: "/imgs/oc.jpg" }
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

const ChallengeCard = ({ challenge, type, onParticipate }) => (
  <div className="card challenge-gradient">
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
    <button className="button-btn" onClick={() => onParticipate && onParticipate(type)}>
      Participar do Desafio
    </button>
  </div>
);

const SocialLinks = ({ config }) => {
  if (!config) {
    return (
      <div className="error-container">
        <p>❌ Configuração não carregada. Verifique a origem dos dados.</p>
      </div>
    )
  }

  const redes = config.comunidade?.redesSociais || {}
  const whatsapp = config.comunidade?.whatsapp || {}

  return (
    <div className="social-container">
      <h2 className="social-title">🌐 Nossas Redes Sociais</h2>
      <p className="social-sub">Siga-nos ou entre para participar das novidades:</p>
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
  )
}


// const Galeria = ({ artes }) => (
//   <div className="galeria-main">
//     <h2 className="galeria-title">🎨 Galeria de Artes</h2>
//     <div className="galeria-grid">
//       {artes.length === 0 ? (
//         <p className="galeria-empty">Nenhuma arte aprovada ainda. Volte mais tarde!</p>
//       ) : (
//         artes.map((arte, i) => (
//           <div key={i} className="galeria-card">
//             <img
//               src={URL.createObjectURL(arte.arquivo)}
//               alt={`Arte de ${arte.nome}`}
//               className="galeria-image"
//             />
//             <h4 className="galeria-artist-name">{arte.nome}</h4>
//             <p className="galeria-level">Nível: {arte.nivel}</p>
//             {arte.desafio && arte.desafio !== 'livre' && (
//               <span className="galeria-challenge-badge">
//                 Desafio {arte.desafio}
//               </span>
//             )}
//           </div>
//         ))
//       )}
//     </div>
//   </div>
// );

const Home = ({ config }) => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="main">
      <div className="home-header">
        <h1 className="home-title">
          Bem-vindo à {config.comunidade?.nome}
        </h1>
        <p className="home-description">
          {config.comunidade?.descricao}
        </p>
      </div>

      <SearchBar onSearch={setSearchTerm} />
      <ArtGallerySlider />

      <VideoGallerySlider config={config} />

      <ChallengeWinners />

      <div className="grid">
        <EventCard title="Gartic Night" description="Sessão semanal de Gartic Phone para relaxar e criar juntos!" date={config.comunidade.eventos.gartic.dia} time={config.comunidade.eventos.gartic.horario} icon="🎮" />
        <EventCard title="Desafio Semanal" description="Novo tema toda semana para testar sua criatividade" date="Segunda-feira" time="Anúncio às 18:00" icon="🏆" />
        <EventCard title="Review de Artes" description="Feedback construtivo dos membros experientes" date="Sábado" time="15:00" icon="👁️" />
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
    navigate('/envio', { state: { desafioType: type } });
  };

  return (
    <div className="desafios-main">
      <h2 className="desafios-title">🏆 Desafios Atuais</h2>
      <div className="desafios-grid">
        <ChallengeCard challenge={config.desafios.diario} type="Diário" onParticipate={handleParticipate} />
        <ChallengeCard challenge={config.desafios.semanal} type="Semanal" onParticipate={handleParticipate} />
        <ChallengeCard challenge={config.desafios.mensal} type="Mensal" onParticipate={handleParticipate} />
      </div>
      <div className="desafios-info-card">
        <h3 className="desafios-highlight">🤔 Como Funciona?</h3>
        <p>
          Participe dos nossos desafios de arte! Basta clicar em "Participar do Desafio", enviar sua arte dentro do prazo e concorrer a prêmios incríveis. Os desafios são uma ótima forma de se motivar e testar suas habilidades!
        </p>
        <Link to="/regras" className="desafios-button-link">
          Ver regras dos desafios
        </Link>
      </div>
    </div>
  );
};

const Envio = ({ envioAtivo, onNovoEnvio }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const desafioTypeFromState = location.state?.desafioType || 'livre';

  const [form, setForm] = useState({
    nome: '',
    whatsapp: '',
    nivel: 'Iniciante',
    desafio: desafioTypeFromState,
    arquivo: null,
  });

  useEffect(() => {
    setForm(prevForm => ({ ...prevForm, desafio: desafioTypeFromState }));
  }, [desafioTypeFromState]);

  const handle = e => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: name === 'arquivo' ? files[0] : value });
  };

  const submit = e => {
    e.preventDefault();
    if (!envioAtivo) {
      alert("O envio de artes está temporariamente desativado pelo administrador. Por favor, tente novamente mais tarde.");
      return;
    }
    onNovoEnvio(form);
    alert("Arte enviada para aprovação! Agradecemos sua participação.");
    navigate('/galeria');
  };

  if (!envioAtivo) {
    return (
      <div className="envio-main">
        <div className="envio-card">
          <h2 style={{ color: '#ff6b6b' }}>❌ Envio de Artes Desativado</h2>
          <p>O envio de novas artes foi desativado temporariamente. Por favor, volte mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="envio-main">
      <h1 className="envio-titulo">📤 Enviar Arte</h1>

      {form.desafio !== 'livre' && (
        <div className="envio-card envio-alerta">
          <h3>🏆 Participando do Desafio {form.desafio}</h3>
          <p>Você está enviando uma arte para o desafio {form.desafio.toLowerCase()}!</p>
        </div>
      )}

      <form onSubmit={submit} className="envio-card">
        <input
          className="envio-input"
          name="nome"
          placeholder="Seu nome de artista"
          onChange={handle}
          value={form.nome}
          required
        />

        <input
          className="envio-input"
          name="whatsapp"
          placeholder="WhatsApp (com DDD)"
          onChange={handle}
          value={form.whatsapp}
          required
        />

        <select className="envio-input" name="nivel" onChange={handle} value={form.nivel}>
          <option value="Iniciante">Iniciante</option>
          <option value="Intermediário">Intermediário</option>
          <option value="Avançado">Avançado</option>
        </select>

        <select className="envio-input" name="desafio" onChange={handle} value={form.desafio}>
          <option value="Diário">Desafio Diário</option>
          <option value="Semanal">Desafio Semanal</option>
          <option value="Mensal">Desafio Mensal</option>
        </select>

        <input
          className="envio-input"
          type="file"
          name="arquivo"
          accept="image/*"
          onChange={handle}
          required
        />

        <div className="envio-lembrete">
          <h4>📋 Lembre-se:</h4>
          <ul>
            <li>Apenas obras autorais</li>
            <li>Respeite as regras da comunidade</li>
            <li>Máximo 5MB por arquivo</li>
            <li>Formatos aceitos: JPG, PNG, GIF</li>
          </ul>
        </div>

        <button type="submit" className="envio-button">
          📤 Enviar Arte
        </button>
      </form>
    </div>
  );
};

const Votacao = ({ artesAprovadas, votacaoAtiva }) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [votos, setVotos] = useState({});
  const [msg, setMsg] = useState("");

  const votar = (nivel, id) => setVotos(v => ({ ...v, [nivel]: id }));

  const enviar = e => {
    e.preventDefault();
    if (!nome || !email || Object.keys(votos).length === 0) {
      return setMsg("❌ Preencha todos os campos e vote em pelo menos uma categoria.");
    }
    console.log("Voto registrado:", { nome, email, votos });
    setMsg("✅ Voto registrado com sucesso! Obrigado por participar.");
    setTimeout(() => setMsg(""), 3000);
  };

  if (!votacaoAtiva) {
    return (
      <div className="votacao-main main">
        <div className="votacao-card">
          <h2 className="votacao-titulo encerrada">🗳️ Votação Encerrada</h2>
          <p>A votação atual foi encerrada pelo administrador.</p>
          <p>Aguarde o próximo período de votação!</p>
        </div>
      </div>
    );
  }

  const niveis = ["Iniciante", "Intermediário", "Avançado"];

  return (
    <div className="votacao-main main">
      <h2 className="votacao-titulo">🗳️ Votação</h2>

      <form onSubmit={enviar}>
        <div className="votacao-card">
          <h3 className="votacao-subtitulo">👤 Seus Dados</h3>
          <input
            className="votacao-input"
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Seu nome"
            required
          />
          <input
            className="votacao-input"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Seu email"
            required
          />
        </div>

        {niveis.map(nivel => {
          const artesDoNivel = artesAprovadas.filter(a => a.nivel === nivel);
          if (artesDoNivel.length === 0) return null;

          return (
            <div key={nivel} className="votacao-card">
              <h3 className="votacao-subtitulo">🏆 Categoria: {nivel}</h3>
              <div className="votacao-grid">
                {artesDoNivel.map(arte => (
                  <label
                    key={arte.nome}
                    className={`votacao-label ${votos[nivel] === arte.nome ? 'ativo' : ''}`}
                  >
                    <input
                      type="radio"
                      name={nivel}
                      value={arte.nome}
                      onChange={() => votar(nivel, arte.nome)}
                      hidden
                      required
                    />
                    <div className="votacao-arte-wrapper">
                      <img src={URL.createObjectURL(arte.arquivo)} alt={arte.nome} />
                      <strong className="votacao-nome">{arte.nome}</strong>
                      {arte.desafio && arte.desafio !== 'livre' && (
                        <div className="votacao-desafio">Desafio: {arte.desafio}</div>
                      )}
                      {votos[nivel] === arte.nome && (
                        <span className="votacao-check">✅</span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}

        <div className="votacao-card">
          <button type="submit" className="votacao-button">🗳️ Confirmar Voto</button>
          {msg && (
            <div className={`votacao-msg ${msg.includes("✅") ? "sucesso" : "erro"}`}>
              {msg}
            </div>
          )}
        </div>
      </form>
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
    <p>{mensagem || "Não foi possível carregar os dados necessários. Tente novamente mais tarde."}</p>
  </div>
);

const App = () => {
  const [envios, setEnvios] = useState([]);
  const [aprovados, setAprovados] = useState([]);
  const [envioAtivo, setEnvioAtivo] = useState(true);
  const [votacaoAtiva, setVotacaoAtiva] = useState(true);
  const { config, loading, error } = useGitHubData();

  if (loading) return <Carregando />;
  if (error || !config) return <Erro mensagem={error} />;



  return (
    <div className="app">
      <Router>
        <Header config={config} />
        <div className="main">
          <Routes>
            <Route path="/" element={<Home config={config} />} />
            <Route path="/galeria" element={<Galeria artes={aprovados} />} />
            <Route path="/desafios" element={<Desafios config={config} />} />
            <Route path="/envio" element={
              <Envio
                envioAtivo={envioAtivo}
                onNovoEnvio={(d) => setEnvios(e => [...e, d])}
              />
            } />
            <Route path="/votacao" element={
              <Votacao
                artesAprovadas={aprovados.filter(a => a.desafio !== 'livre')}
                votacaoAtiva={votacaoAtiva}
              />
            } />
            <Route path="/plus18" element={<Plus18 config={config} />} />
            <Route path="/perfil" element={<Perfil config={config} />} />
            <Route path="/regras" element={<Regras config={config} />} />
            <Route path="/admin" element={
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
            } />
          </Routes>
        </div>
        <Footer config={config} />
      </Router>
    </div>
  );
};


export default App;