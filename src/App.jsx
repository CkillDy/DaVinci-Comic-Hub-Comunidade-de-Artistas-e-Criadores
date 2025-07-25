import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link, useNavigate, useLocation } from "react-router-dom";
import "./App.css"

// Configurações da comunidade (simulando config.json)
const config = {
  comunidade: {
    nome: "DaVinci Comic",
    descricao: "Comunidade de artistas criadores de quadrinhos, mangás e personagens originais",
    fundador: "Ck",
    anoFundacao: "2025",
    whatsapp: {
      grupoOficial: "https://chat.whatsapp.com/BYjflMYFBHNJDM5OpxVXiZ",
      grupoPlus18: "https://davinci-verification18.netlify.app/"
    },
    redesSociais: {
      tiktok: "@davinci_comic_oficial",
      instagram: "@davincicomic",
      discord: "DaVinci Comic#1234"
    },
    eventos: {
      gartic: {
        dia: "Quinta-feira",
        horario: "20:30",
        descricao: "Sessões de Gartic Phone para descontrair e criar juntos"
      }
    }
  },
  equipe: {
    fundador: ["Ck"],
    admSuperiores: ["Abner", "ArtBook", "Guimar", "Mariana"],
    moderadores: ["Jinx", "Ks", "Lucca", "Daysson"]
  },
  desafios: {
    diario: {
      tema: "Robôs Urbanos",
      descricao: "Crie personagens robóticos em cenários urbanos futuristas",
      premio: "Destaque no grupo e galeria principal"
    },
    semanal: {
      tema: "Universo Fantástico",
      descricao: "Explore mundos mágicos e criaturas fantásticas",
      premio: "Arte em destaque por uma semana + menção especial"
    },
    mensal: {
      tema: "Personagens Originais",
      descricao: "Desenvolva seus OCs com backstory completa",
      premio: "Entrevista exclusiva + arte promocional"
    }
  }
};

// Estilos CSS inline para responsividade
const styles = {
  app: {
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    backgroundColor: '#0a0a18ff',
    color: '#fff'
  },
  header: {
    background: 'linear-gradient(135deg, #261b44ff 0%, #092324ff 100%)',
    padding: '1rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '1rem'
  },
  logo: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
    color: '#fff',
    textDecoration: 'none'
  },
  nav: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap'
  },
  navLink: {
    color: '#fff',
    textDecoration: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '20px',
    transition: 'all 0.3s',
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  navLinkActive: {
    backgroundColor: '#fff',
    color: '#764ba2',
    fontWeight: 'bold'
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1rem',
    minHeight: 'calc(100vh - 200px)'
  },
  card: {
    backgroundColor: '#1a1a2e',
    borderRadius: '15px',
    padding: '1.5rem',
    margin: '1rem 0',
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    border: '1px solid #16213e'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1.5rem',
    margin: '2rem 0'
  },
  button: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '25px',
    cursor: 'pointer',
    fontSize: '1rem',
    transition: 'all 0.3s',
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '10px',
    border: '1px solid #333',
    backgroundColor: '#2a2a3e',
    color: '#fff',
    fontSize: '1rem',
    marginBottom: '1rem'
  },
  footer: {
    backgroundColor: '#16213e',
    textAlign: 'center',
    padding: '2rem',
    marginTop: '2rem'
  }
};

// Componentes
const Header = () => {
  const location = useLocation();
  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <Link to="/" style={styles.logo}>{config.comunidade.nome}</Link>
        <nav style={styles.nav}>
          <Link to="/" style={{ ...styles.navLink, ...(location.pathname === '/' && styles.navLinkActive) }}>🏠 Início</Link>
          <Link to="/galeria" style={{ ...styles.navLink, ...(location.pathname === '/galeria' && styles.navLinkActive) }}>🎨 Galeria</Link>
          <Link to="/desafios" style={{ ...styles.navLink, ...(location.pathname === '/desafios' && styles.navLinkActive) }}>🏆 Desafios</Link>
          <Link to="/envio" style={{ ...styles.navLink, ...(location.pathname === '/envio' && styles.navLinkActive) }}>📤 Enviar</Link>
          <Link to="/votacao" style={{ ...styles.navLink, ...(location.pathname === '/votacao' && styles.navLinkActive) }}>🗳️ Votar</Link>
          <Link to="/grupos" style={{ ...styles.navLink, ...(location.pathname === '/grupos' && styles.navLinkActive) }}>👥 Grupos</Link>
          <Link to="/plus18" style={{ ...styles.navLink, ...(location.pathname === '/plus18' && styles.navLinkActive) }}>🔞 +18</Link>
          <Link to="/dicas" style={{ ...styles.navLink, ...(location.pathname === '/dicas' && styles.navLinkActive) }}>💡 Dicas</Link>
          <Link to="/perfil" style={{ ...styles.navLink, ...(location.pathname === '/perfil' && styles.navLinkActive) }}>ℹ️ Sobre</Link>
          <Link to="/regras" style={{ ...styles.navLink, ...(location.pathname === '/regras' && styles.navLinkActive) }}>📋 Regras</Link>
          <Link to="/admin" style={{ ...styles.navLink, ...(location.pathname === '/admin' && styles.navLinkActive) }}>⚙️ Admin</Link>
        </nav>
      </div>
    </header>
  );
};

const Footer = () => (
  <footer style={styles.footer}>
    <p>© {new Date().getFullYear()} {config.comunidade.nome}. Todos os direitos reservados.</p>
  </footer>
);

const SearchBar = ({ onSearch }) => (
  <div style={{ ...styles.card, marginBottom: '2rem' }}>
    <div style={{ display: 'flex', gap: '1rem' }}>
      <input
        style={{ ...styles.input, marginBottom: 0 }}
        type="text"
        placeholder="Buscar artistas, artes, desafios..."
        onChange={(e) => onSearch && onSearch(e.target.value)}
      />
      <button style={styles.button}>🔍</button>
    </div>
  </div>
);

const EventCard = ({ title, description, date, time, icon }) => (
  <div style={styles.card}>
    <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>{icon}</div>
    <h3 style={{ color: '#667eea', marginBottom: '0.5rem' }}>{title}</h3>
    <p style={{ marginBottom: '1rem' }}>{description}</p>
    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.9rem', color: '#aaa' }}>
      <span>📅 {date}</span>
      <span>🕐 {time}</span>
    </div>
  </div>
);

const ChallengeCard = ({ challenge, type, onParticipate }) => (
  <div style={{ ...styles.card, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <h3 style={{ color: '#667eea' }}>Desafio {type}</h3>
      <span style={{ backgroundColor: '#667eea', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '15px', fontSize: '0.8rem' }}>
        {type}
      </span>
    </div>
    <h4 style={{ marginBottom: '1rem', color: '#fff' }}>{challenge.tema}</h4>
    <p style={{ marginBottom: '1rem', color: '#ccc' }}>{challenge.descricao}</p>
    <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(102, 126, 234, 0.1)', borderRadius: '10px' }}>
      <strong style={{ color: '#667eea' }}>🏆 Prêmio: </strong>
      <span>{challenge.premio}</span>
    </div>
    <button
      style={styles.button}
      onClick={() => onParticipate && onParticipate(type)}
    >
      Participar do Desafio
    </button>
  </div>
);

const StatsWidget = () => (
  <div style={styles.card}>
    <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>📊 Estatísticas da Comunidade</h3>
    <div style={styles.grid}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', color: '#667eea' }}>850+</div>
        <div>Membros Ativos</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', color: '#667eea' }}>1.2k+</div>
        <div>Artes Compartilhadas</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2rem', color: '#667eea' }}>45+</div>
        <div>Desafios Realizados</div>
      </div>
    </div>
  </div>
);

const SocialLinks = () => (
  <div style={styles.card}>
    <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>🌐 Nossas Redes Sociais</h3>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      <a href={`https://tiktok.com/${config.comunidade.redesSociais.tiktok}`}
        style={{ ...styles.button, textDecoration: 'none' }}
        target="_blank" rel="noopener noreferrer">
        🎵 TikTok
      </a>
      <a href={`https://instagram.com/${config.comunidade.redesSociais.instagram}`}
        style={{ ...styles.button, textDecoration: 'none' }}
        target="_blank" rel="noopener noreferrer">
        📸 Instagram
      </a>
      <a href={config.comunidade.whatsapp.grupoOficial}
        style={{ ...styles.button, textDecoration: 'none' }}
        target="_blank" rel="noopener noreferrer">
        💬 WhatsApp
      </a>
    </div>
  </div>
);

const Galeria = ({ artes }) => (
  <div style={styles.main}>
    <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#667eea' }}>🎨 Galeria de Artes</h1>
    <div style={styles.grid}>
      {artes.length === 0 ? (
        <p style={{ textAlign: 'center', color: '#aaa', gridColumn: '1 / -1' }}>Nenhuma arte aprovada ainda. Volte mais tarde!</p>
      ) : (
        artes.map((arte, i) => (
          <div key={i} style={styles.card}>
            <img
              src={URL.createObjectURL(arte.arquivo)}
              alt={`Arte de ${arte.nome}`}
              style={{ width: '100%', borderRadius: '10px', marginBottom: '1rem' }}
            />
            <h4 style={{ color: '#667eea' }}>{arte.nome}</h4>
            <p style={{ fontSize: '0.9rem', color: '#ccc' }}>Nível: {arte.nivel}</p>
            {arte.desafio && arte.desafio !== 'livre' && (
              <span style={{ backgroundColor: '#764ba2', color: '#fff', padding: '0.25rem 0.75rem', borderRadius: '15px', fontSize: '0.8rem', display: 'inline-block', marginTop: '0.5rem' }}>
                Desafio {arte.desafio}
              </span>
            )}
          </div>
        ))
      )}
    </div>
  </div>
);

// Páginas
const Home = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div style={styles.main}>
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(135deg, #324080ff 0%, #8b5abbff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Bem-vindo à {config.comunidade.nome}
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#ccc', maxWidth: '600px', margin: '0 auto' }}>
          {config.comunidade.descricao}
        </p>
      </div>

      <SearchBar onSearch={setSearchTerm} />

      <div style={styles.grid}>
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

      <StatsWidget />
      <SocialLinks />
    </div>
  );
};

const Desafios = () => {
  const navigate = useNavigate();

  const handleParticipate = (type) => {
    navigate('/envio', { state: { desafioType: type } });
  };

  return (
    <div style={styles.main}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#667eea' }}>🏆 Desafios Atuais</h1>

      <div style={styles.grid}>
        <ChallengeCard challenge={config.desafios.diario} type="Diário" onParticipate={handleParticipate} />
        <ChallengeCard challenge={config.desafios.semanal} type="Semanal" onParticipate={handleParticipate} />
        <ChallengeCard challenge={config.desafios.mensal} type="Mensal" onParticipate={handleParticipate} />
      </div>

      <div style={styles.card}>
        <h3 style={{ color: '#ff6b6b' }}>🤔 Como Funciona?</h3>
        <p>
          Participe dos nossos desafios de arte! Basta clicar em "Participar do Desafio", enviar sua arte dentro do prazo e concorrer a prêmios incríveis. Os desafios são uma ótima forma de se motivar e testar suas habilidades!
        </p>
        <Link to="/regras" style={{ ...styles.button, marginTop: '1rem' }}>
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
    if (name === "arquivo") {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
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
      <div style={styles.main}>
        <div style={styles.card}>
          <h2 style={{ color: '#ff6b6b' }}>❌ Envio de Artes Desativado</h2>
          <p>O envio de novas artes foi desativado temporariamente. Por favor, volte mais tarde.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.main}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#667eea' }}>📤 Enviar Arte</h1>

      {form.desafio !== 'livre' && (
        <div style={{ ...styles.card, backgroundColor: 'rgba(102, 126, 234, 0.2)', marginBottom: '2rem', border: '1px solid #667eea' }}>
          <h3>🏆 Participando do Desafio {form.desafio}</h3>
          <p>Você está enviando uma arte para o desafio {form.desafio.toLowerCase()}!</p>
        </div>
      )}

      <form onSubmit={submit} style={styles.card}>
        <input
          style={styles.input}
          name="nome"
          placeholder="Seu nome de artista"
          onChange={handle}
          value={form.nome}
          required
        />

        <input
          style={styles.input}
          name="whatsapp"
          placeholder="WhatsApp (com DDD)"
          onChange={handle}
          value={form.whatsapp}
          required
        />

        <select style={styles.input} name="nivel" onChange={handle} value={form.nivel}>
          <option value="Iniciante">Iniciante</option>
          <option value="Intermediário">Intermediário</option>
          <option value="Avançado">Avançado</option>
        </select>

        <select style={styles.input} name="desafio" onChange={handle} value={form.desafio}>
          <option value="livre">Envio Livre</option>
          <option value="Diário">Desafio Diário</option>
          <option value="Semanal">Desafio Semanal</option>
          <option value="Mensal">Desafio Mensal</option>
        </select>

        <input
          style={styles.input}
          type="file"
          name="arquivo"
          accept="image/*"
          onChange={handle}
          required
        />

        <div style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', padding: '1rem', borderRadius: '10px', marginBottom: '1rem' }}>
          <h4 style={{ color: '#667eea', marginBottom: '0.5rem' }}>📋 Lembre-se:</h4>
          <ul style={{ margin: 0 }}>
            <li>Apenas obras autorais</li>
            <li>Respeite as regras da comunidade</li>
            <li>Máximo 5MB por arquivo</li>
            <li>Formatos aceitos: JPG, PNG, GIF</li>
          </ul>
        </div>

        <button type="submit" style={styles.button}>
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
      <div style={styles.main}>
        <div style={styles.card}>
          <h2 style={{ color: '#ff6b6b' }}>🗳️ Votação Encerrada</h2>
          <p>A votação atual foi encerrada pelo administrador.</p>
          <p>Aguarde o próximo período de votação!</p>
        </div>
      </div>
    );
  }

  const niveis = ["Iniciante", "Intermediário", "Avançado"];

  return (
    <div style={styles.main}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#667eea' }}>🗳️ Votação</h1>

      <form onSubmit={enviar}>
        <div style={styles.card}>
          <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>👤 Seus Dados</h3>
          <input
            style={styles.input}
            value={nome}
            onChange={e => setNome(e.target.value)}
            placeholder="Seu nome"
            required
          />
          <input
            style={styles.input}
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
            <div key={nivel} style={styles.card}>
              <h3 style={{ color: '#667eea', marginBottom: '1rem' }}>🏆 Categoria: {nivel}</h3>
              <div style={styles.grid}>
                {artesDoNivel.map(arte => (
                  <label key={arte.nome} style={{
                    display: 'block',
                    cursor: 'pointer',
                    padding: '1rem',
                    border: votos[nivel] === arte.nome ? '2px solid #667eea' : '2px solid transparent',
                    borderRadius: '100px',
                    backgroundColor: votos[nivel] === arte.nome ? 'rgba(102, 126, 234, 0.1)' : 'rgba(255,255,255,0.05)'
                  }}>
                    <input
                      type="radio"
                      name={nivel}
                      value={arte.nome}
                      onChange={() => votar(nivel, arte.nome)}
                      style={{ marginRight: '0.5rem', display: 'none' }}
                      required
                    />
                    <div style={{ position: 'relative' }}>
                      <img
                        src={URL.createObjectURL(arte.arquivo)}
                        alt={arte.nome}
                        style={{ width: '100%', borderRadius: '10px', marginBottom: '0.5rem' }}
                      />
                      <strong style={{ color: '#667eea' }}>{arte.nome}</strong>
                      {arte.desafio && arte.desafio !== 'livre' && (
                        <div style={{ fontSize: '0.9rem', color: '#aaa', marginTop: '0.25rem' }}>
                          Desafio: {arte.desafio}
                        </div>
                      )}
                      {votos[nivel] === arte.nome && (
                        <span style={{
                          position: 'absolute',
                          top: '10px',
                          right: '10px',
                          background: '#4caf50',
                          color: '#fff',
                          borderRadius: '50%',
                          width: '30px',
                          height: '30px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.2rem'
                        }}>
                          ✅
                        </span>
                      )}
                    </div>
                  </label>
                ))}
              </div>
            </div>
          );
        })}

        <div style={styles.card}>
          <button type="submit" style={styles.button}>
            🗳️ Confirmar Voto
          </button>
          {msg && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '10px',
              backgroundColor: msg.includes('✅') ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
              color: msg.includes('✅') ? '#4caf50' : '#f44336'
            }}>
              {msg}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

const Perfil = () => (
  <div style={styles.main}>
    <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#667eea' }}>ℹ️ Sobre a {config.comunidade.nome}</h1>

    <div style={styles.card}>
      <h2 style={{ color: '#667eea' }}>🎨 Nossa História</h2>
      <p style={{ lineHeight: '1.8' }}>
        A {config.comunidade.nome} foi criada por <strong>{config.comunidade.fundador}</strong> em {config.comunidade.anoFundacao} com o objetivo inicial de reunir artistas que produzem histórias em quadrinhos, mangás, comics e personagens originais (OCs). Começou como um grupo simples, mas cresceu rapidamente, transformando-se em uma grande comunidade.
      </p>

      <p style={{ lineHeight: '1.8' }}>
        Com o crescimento, foi necessário organizar melhor os espaços, criando grupos e áreas separados por temas e níveis de experiência, permitindo que artistas iniciantes, intermediários e avançados pudessem interagir, compartilhar seus trabalhos e evoluir juntos.
      </p>

      <p style={{ lineHeight: '1.8' }}>
        A comunidade é administrada por uma equipe dedicada que cuida da moderação, organização de eventos e criação de espaços seguros para todos os tipos de artistas. Também foram criadas áreas especiais como a Área +18, voltada para conteúdo mais maduro, com acesso restrito e verificação.
      </p>
    </div>

    <div style={styles.card}>
      <h2 style={{ color: '#667eea' }}>👥 Nossa Equipe</h2>

      <div style={styles.grid}>
        <div>
          <h3 style={{ color: '#ffd700' }}>👑 Fundador</h3>
          <ul>
            {config.equipe.fundador.map(nome => (
              <li key={nome}>{nome} - Criador da DaVinci Comic</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 style={{ color: '#ff6b6b' }}>⭐ Administradores Superiores</h3>
          <ul>
            {config.equipe.admSuperiores.map(nome => (
              <li key={nome}>{nome}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 style={{ color: '#4ecdc4' }}>🛡️ Moderadores</h3>
          <ul>
            {config.equipe.moderadores.map(nome => (
              <li key={nome}>{nome}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>

    <div style={styles.card}>
      <h2 style={{ color: '#667eea' }}>🎯 Nosso Foco</h2>
      <div style={styles.grid}>
        <div>
          <h4>📚 Apoio à Criação</h4>
          <p>Suporte e feedback para artistas em desenvolvimento</p>
        </div>
        <div>
          <h4>🤝 Troca de Ideias</h4>
          <p>Ambiente colaborativo para compartilhar conhecimento</p>
        </div>
        <div>
          <h4>📢 Divulgação</h4>
          <p>Plataforma para mostrar seus trabalhos</p>
        </div>
        <div>
          <h4>🏆 Eventos</h4>
          <p>Desafios, concursos e atividades regulares</p>
        </div>
      </div>
    </div>

    <div style={styles.card}>
      <h2 style={{ color: '#667eea' }}>📈 Estatísticas</h2>
      <div style={styles.grid}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', color: '#667eea' }}>850+</div>
          <div>Membros Ativos</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', color: '#667eea' }}>1.2k+</div>
          <div>Artes Compartilhadas</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', color: '#667eea' }}>45+</div>
          <div>Desafios Realizados</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', color: '#667eea' }}>24/7</div>
          <div>Suporte Ativo</div>
        </div>
      </div>
    </div>
  </div>
);

const Grupos = () => (
  <div style={styles.main}>
    <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#667eea' }}>👥 Grupos e Áreas Especiais</h1>

    <div style={styles.card}>
      <h2 style={{ color: '#667eea' }}>💬 Grupos do WhatsApp</h2>
      <p>Nossa comunidade se concentra principalmente no WhatsApp para comunicação diária, compartilhamento de artes e interação entre os membros.</p>
      <div style={{ marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <a href={config.comunidade.whatsapp.grupoOficial} style={{ ...styles.button, textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
          Grupo Oficial
        </a>
      </div>
    </div>
  </div>
);

const Plus18 = () => (
  <div style={styles.main}>
    <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#667eea' }}>🔞 Área +18</h1>

    <div style={{ ...styles.card, background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>
      <h2 style={{ color: '#ff6b6b' }}>Aviso: Conteúdo Sensível</h2>
      <p>
        Esta área é exclusiva para membros da comunidade com mais de 18 anos. É um espaço para compartilhar
        artes com temas mais maduros, seguindo regras específicas para garantir o respeito e a segurança de todos.
      </p>
      <p>
        Para ter acesso, é necessário passar por um processo de verificação de idade.
      </p>
      <div style={{ marginTop: '1rem' }}>
        <a href={config.comunidade.whatsapp.grupoPlus18} style={{ ...styles.button, textDecoration: 'none' }} target="_blank" rel="noopener noreferrer">
          Entrar no Grupo +18
        </a>
      </div>
    </div>
  </div>
);

const Dicas = () => (
  <div style={styles.main}>
    <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#667eea' }}>💡 Dicas e Tutoriais</h1>

    <div style={styles.card}>
      <h2 style={{ color: '#667eea' }}>📚 Recursos para Artistas</h2>
      <p>Aqui você encontrará uma biblioteca de tutoriais, dicas de ferramentas e recursos para aprimorar suas habilidades artísticas.</p>
      <p>Explore links para pincéis digitais, guias de anatomia, referências de cores e muito mais!</p>
    </div>

    <div style={styles.grid}>
      <div style={{ ...styles.card, backgroundColor: '#2a2a3e' }}>
        <h3 style={{ color: '#ff6b6b' }}>Guia de Anatomia</h3>
        <p>Aprenda a desenhar figuras humanas de forma mais realista e dinâmica.</p>
        <button style={styles.button}>Ver guia</button>
      </div>
      <div style={{ ...styles.card, backgroundColor: '#2a2a3e' }}>
        <h3 style={{ color: '#ff6b6b' }}>Pincéis para Procreate</h3>
        <p>Baixe pacotes de pincéis gratuitos e premium para suas artes digitais.</p>
        <button style={styles.button}>Ver pincéis</button>
      </div>
      <div style={{ ...styles.card, backgroundColor: '#2a2a3e' }}>
        <h3 style={{ color: '#ff6b6b' }}>Dicas de Composição</h3>
        <p>Melhore a organização visual de suas ilustrações com este tutorial.</p>
        <button style={styles.button}>Ver dicas</button>
      </div>
    </div>
  </div>
);

const Regras = () => (
  <div style={styles.main}>
    <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#667eea' }}>📋 Regras da Comunidade</h1>

    <div style={styles.card}>
      <h2 style={{ color: '#667eea' }}>👑 {config.comunidade.nome} – Grupo Oficial da Comunidade</h2>
      <p style={{ lineHeight: '1.8' }}>
        Seja bem-vindo(a) ao grupo principal! Aqui é o espaço pra compartilhar
        suas ideias, artes e projetos autorais ✍️ Não importa seu estilo, traço
        ou nível de experiência — o foco é crescer juntos, trocar ideias e se
        inspirar.
      </p>
    </div>

    <div style={styles.card}>
      <h3 style={{ color: '#ff6b6b' }}>🧸 Atenção - Menores de 13 anos:</h3>
      <p>Comportamento será monitorado de perto. Qualquer atitude fora das regras resultará em banimento imediato.</p>
    </div>

    <div style={styles.card}>
      <h2 style={{ color: '#667eea' }}>📌 Regras Importantes:</h2>
      <div style={{ display: 'grid', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ color: '#4caf50', fontSize: '1.2rem' }}>✅</span>
          <span><strong>Respeito é básico</strong> – sem ofensas, brigas ou tretas</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ color: '#f44336', fontSize: '1.2rem' }}>🚫</span>
          <span><strong>Sem pornografia</strong> – nada de +18 ou cenas explícitas no grupo principal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ color: '#f44336', fontSize: '1.2rem' }}>🚫</span>
          <span><strong>Zero preconceito</strong> – racismo, homofobia, machismo, etc</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ color: '#f44336', fontSize: '1.2rem' }}>🚫</span>
          <span><strong>Sem spam, flood ou divulgação aleatória</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ color: '#f44336', fontSize: '1.2rem' }}>🚫</span>
          <span><strong>Proibido plágio</strong> – só obras próprias ou com permissão/crédito</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ color: '#4caf50', fontSize: '1.2rem' }}>✅</span>
          <span><strong>Críticas construtivas</strong> são bem-vindas, sempre com respeito</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ color: '#f44336', fontSize: '1.2rem' }}>🚫</span>
          <span><strong>Nada de política ou religião</strong> – fora do foco do grupo</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ color: '#4caf50', fontSize: '1.2rem' }}>✅</span>
          <span><strong>Pode divulgar projetos</strong>, mas com contexto e descrição</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ color: '#4caf50', fontSize: '1.2rem' }}>✅</span>
          <span><strong>Poste com moderação</strong> – nada de lotar o grupo de uma vez</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ color: '#f44336', fontSize: '1.2rem' }}>🚫</span>
          <span><strong>Uso indevido de IA está proibido</strong> – respeitem os limites e o foco</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ color: '#f44336', fontSize: '1.2rem' }}>🚫</span>
          <span><strong>Gore explícito não é permitido</strong></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
          <span style={{ color: '#f44336', fontSize: '1.2rem' }}>🚫</span>
          <span><strong>Calls aleatórias nos grupos são proibidas</strong> – apenas liberadas em dias marcados e com ordem dos adms</span>
        </div>
      </div>
    </div>

    <div style={{ ...styles.card, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <h3 style={{ margin: 0, textAlign: 'center' }}>🎯 Nosso foco é colaboração, não competição!</h3>
    </div>

    <div style={styles.card}>
      <h3 style={{ color: '#ffa726' }}>🔐 Horário de Funcionamento</h3>
      <p>Durante a noite, apenas o grupo principal (DaVinci Comic) fica aberto. Os outros grupos fecham e reabrem pela manhã para manter a organização.</p>
    </div>

    <div style={styles.card}>
      <h3 style={{ color: '#667eea' }}>📞 Contato com Moderação</h3>
      <p>Em caso de dúvidas ou problemas, entre em contato com qualquer membro da equipe de moderação. Estamos aqui para ajudar!</p>
    </div>
  </div>
);

const Admin = ({ envios, setEnvios, setAprovados, setEnvioAtivo, setVotacaoAtiva, envioAtivo, votacaoAtiva }) => {
  const [pass, setPass] = useState("");
  const [auth, setAuth] = useState(false);
  const [activeTab, setActiveTab] = useState('envios');

  const login = e => {
    e.preventDefault();
    // Senha fixa, em um projeto real, isso seria uma chamada de API segura
    if (pass === "admin123") {
      setAuth(true);
    } else {
      alert("Senha incorreta!");
    }
  };

  const aprovar = (idx) => {
    setAprovados(a => [...a, envios[idx]]);
    setEnvios(e => e.filter((_, i) => i !== idx));
  };

  const rejeitar = (idx) => {
    if (confirm("Tem certeza que deseja rejeitar este envio?")) {
      setEnvios(e => e.filter((_, i) => i !== idx));
    }
  };

  if (!auth) {
    return (
      <div style={styles.main}>
        <div style={{ ...styles.card, maxWidth: '400px', margin: '0 auto' }}>
          <h2 style={{ color: '#667eea', textAlign: 'center' }}>🔐 Acesso Administrativo</h2>
          <form onSubmit={login}>
            <input
              style={styles.input}
              type="password"
              onChange={e => setPass(e.target.value)}
              placeholder="Digite a senha de acesso"
              value={pass}
            />
            <button style={styles.button} type="submit">🔑 Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.main}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#667eea' }}>⚙️ Painel Administrativo</h1>

      <div style={styles.card}>
        <h3 style={{ color: '#667eea' }}>🎛️ Controles Gerais</h3>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <button
            style={{
              ...styles.button,
              backgroundColor: envioAtivo ? '#4caf50' : '#f44336'
            }}
            onClick={() => setEnvioAtivo(e => !e)}
          >
            {envioAtivo ? '✅ Envios Ativos' : '❌ Envios Desativados'}
          </button>
          <button
            style={{
              ...styles.button,
              backgroundColor: votacaoAtiva ? '#4caf50' : '#f44336'
            }}
            onClick={() => setVotacaoAtiva(v => !v)}
          >
            {votacaoAtiva ? '✅ Votação Ativa' : '❌ Votação Desativada'}
          </button>
        </div>
      </div>

      <div style={styles.card}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
          <button
            style={{
              ...styles.button,
              backgroundColor: activeTab === 'envios' ? '#667eea' : '#333'
            }}
            onClick={() => setActiveTab('envios')}
          >
            📤 Envios Pendentes ({envios.length})
          </button>
          <button
            style={{
              ...styles.button,
              backgroundColor: activeTab === 'stats' ? '#667eea' : '#333'
            }}
            onClick={() => setActiveTab('stats')}
          >
            📊 Estatísticas
          </button>
        </div>

        {activeTab === 'envios' && (
          <div>
            <h3 style={{ color: '#667eea' }}>📤 Envios Pendentes de Aprovação</h3>
            {envios.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#aaa' }}>Nenhum envio pendente.</p>
            ) : (
              <div style={styles.grid}>
                {envios.map((envio, i) => (
                  <div key={i} style={{ ...styles.card, backgroundColor: '#2a2a3e' }}>
                    <img
                      src={URL.createObjectURL(envio.arquivo)}
                      alt={`Arte de ${envio.nome}`}
                      style={{ width: '100%', borderRadius: '10px', marginBottom: '1rem' }}
                    />
                    <h4 style={{ color: '#667eea' }}>{envio.nome}</h4>
                    <p><strong>Nível:</strong> {envio.nivel}</p>
                    <p><strong>WhatsApp:</strong> {envio.whatsapp}</p>
                    <p><strong>Tipo:</strong> {envio.desafio}</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      <button
                        style={{ ...styles.button, backgroundColor: '#4caf50', flex: 1 }}
                        onClick={() => aprovar(i)}
                      >
                        ✅ Aprovar
                      </button>
                      <button
                        style={{ ...styles.button, backgroundColor: '#f44336', flex: 1 }}
                        onClick={() => rejeitar(i)}
                      >
                        ❌ Rejeitar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div>
            <h3 style={{ color: '#667eea' }}>📊 Estatísticas do Sistema</h3>
            <div style={styles.grid}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#667eea' }}>{envios.length}</div>
                <div>Envios Pendentes</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#667eea' }}>{aprovados.length}</div>
                <div>Artes Aprovadas</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: '#667eea' }}>0</div>
                <div>Votos Registrados</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', color: envioAtivo ? '#4caf50' : '#f44336' }}>
                  {envioAtivo ? 'ON' : 'OFF'}
                </div>
                <div>Status dos Envios</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const App = () => {
  const [envios, setEnvios] = useState([]);
  const [aprovados, setAprovados] = useState([]);
  const [envioAtivo, setEnvioAtivo] = useState(true);
  const [votacaoAtiva, setVotacaoAtiva] = useState(true);

  return (
    <div style={styles.app}>
      <Router>
        <Header />
        <div style={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/galeria" element={<Galeria artes={aprovados} />} />
            <Route path="/desafios" element={<Desafios />} />
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
            <Route path="/grupos" element={<Grupos />} />
            <Route path="/plus18" element={<Plus18 />} />
            <Route path="/dicas" element={<Dicas />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/regras" element={<Regras />} />
            <Route path="/admin" element={
              <Admin
                envios={envios}
                setEnvios={setEnvios}
                setAprovados={setAprovados}
                setEnvioAtivo={setEnvioAtivo}
                setVotacaoAtiva={setVotacaoAtiva}
                envioAtivo={envioAtivo}
                votacaoAtiva={votacaoAtiva}
              />
            } />
          </Routes>
        </div>
        <Footer />
      </Router>
    </div>
  );
};

export default App;