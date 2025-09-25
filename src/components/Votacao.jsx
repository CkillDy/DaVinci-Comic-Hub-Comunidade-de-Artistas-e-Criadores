import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ajtdyjlzwpzqfqhkbrzj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdGR5amx6d3B6cWZxaGticnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MDYzNDIsImV4cCI6MjA3NDA4MjM0Mn0.g0hxkZrZ5jiEMsIK1RU0QVuI4LWgXZD56HWrcyNcslk";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Componente para quem já votou
const JaVotou = ({ emailVotante, onVotarNovamente }) => (
  <div className="votacao-main main">
    <div className="votacao-card ja-votou">
      <div className="ja-votou-icon">✅</div>
      <h2 className="votacao-titulo">Voto Já Registrado!</h2>
      <p className="ja-votou-msg">
        O email <strong>{emailVotante}</strong> já participou da votação desta
        semana.
      </p>
      <div className="ja-votou-info">
        <p>📝 Cada pessoa pode votar apenas uma vez por período</p>
        <p>🗳️ Seu voto foi registrado com sucesso</p>
        <p>🏆 Aguarde o resultado da votação!</p>
      </div>
      <button className="votacao-button-secondary" onClick={onVotarNovamente}>
        🔄 Tentar com Outro Email
      </button>
    </div>
  </div>
);

// Componente de loading
const LoadingVotacao = () => (
  <div className="votacao-main main">
    <div className="votacao-card">
      <div className="loading-votacao">
        <div className="spinner"></div>
        <p>🔄 Verificando disponibilidade para votação...</p>
      </div>
    </div>
  </div>
);

const Votacao = ({ votacaoAtiva }) => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [votos, setVotos] = useState({});
  const [msg, setMsg] = useState("");
  const [artesAprovadas, setArtesAprovadas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jaVotou, setJaVotou] = useState(false);
  const [emailVotante, setEmailVotante] = useState("");
  const [enviandoVoto, setEnviandoVoto] = useState(false);

  // Verifica se já votou (localStorage primeiro, depois Supabase)
  const verificarSeJaVotou = async (emailParaVerificar) => {
    // Verifica localStorage primeiro (mais rápido)
    const votoLocal = localStorage.getItem("ultimoVoto");
    if (votoLocal) {
      const { email: emailLocal, timestamp } = JSON.parse(votoLocal);
      const umaSemana = 7 * 24 * 60 * 60 * 1000; // 7 dias
      const agora = new Date().getTime();

      if (emailLocal === emailParaVerificar && agora - timestamp < umaSemana) {
        return true;
      }
    }

    // Se não encontrou no localStorage, verifica no Supabase
    try {
      const { data, error } = await supabase
        .from("votos")
        .select("id")
        .eq("email_eleitor", emailParaVerificar)
        .gte(
          "data_voto",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        ); // Última semana

      if (error) throw error;
      return data && data.length > 0;
    } catch (err) {
      console.error("Erro ao verificar voto:", err);
      return false;
    }
  };

  // Busca artes aprovadas apenas se votação estiver ativa
  useEffect(() => {
    const inicializar = async () => {
      if (!votacaoAtiva) {
        setLoading(false);
        return;
      }

      try {
        // Busca artes aprovadas do Supabase
        const { data, error } = await supabase
          .from("envios")
          .select("id, nome, whatsapp, nivel, arquivo_url, created_at")
          .eq("desafio", "Semanal")
          .eq("aprovado", true) // Apenas artes aprovadas pelo admin
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Erro ao buscar artes:", error);
          setArtesAprovadas([]);
        } else {
          setArtesAprovadas(data || []);
        }
      } catch (err) {
        console.error("Erro:", err);
        setArtesAprovadas([]);
      } finally {
        setLoading(false);
      }
    };

    inicializar();
  }, [votacaoAtiva]);

  // Verifica se já votou quando email é digitado
  useEffect(() => {
    const verificarVoto = async () => {
      if (email && email.includes("@")) {
        const jaVotouResult = await verificarSeJaVotou(email);
        if (jaVotouResult) {
          setJaVotou(true);
          setEmailVotante(email);
        } else {
          setJaVotou(false);
        }
      }
    };

    const timeoutId = setTimeout(verificarVoto, 500); // Debounce
    return () => clearTimeout(timeoutId);
  }, [email]);

  const votar = (nivel, artistaId) => {
    setVotos((prev) => ({ ...prev, [nivel]: artistaId }));
    // Limpa mensagens quando usuário interage
    if (msg) setMsg("");
  };

  const enviarVoto = async (e) => {
    e.preventDefault();

    if (!nome.trim() || !email.trim() || Object.keys(votos).length === 0) {
      return setMsg(
        "❌ Preencha todos os campos e vote em pelo menos uma categoria."
      );
    }

    // Verifica novamente antes de enviar
    const jaVotouFinal = await verificarSeJaVotou(email);
    if (jaVotouFinal) {
      setJaVotou(true);
      setEmailVotante(email);
      return;
    }

    try {
      setEnviandoVoto(true);
      setMsg("📤 Registrando seu voto...");

      // Salva o voto no Supabase
      const { error } = await supabase.from("votos").insert([
        {
          nome_eleitor: nome.trim(),
          email_eleitor: email.trim().toLowerCase(),
          votos: votos,
          data_voto: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Salva no localStorage para controle rápido
      localStorage.setItem(
        "ultimoVoto",
        JSON.stringify({
          email: email.trim().toLowerCase(),
          timestamp: new Date().getTime(),
        })
      );

      setMsg("✅ Voto registrado com sucesso! Obrigado por participar.");

      // Limpa formulário após sucesso
      setTimeout(() => {
        setNome("");
        setEmail("");
        setVotos({});
        setMsg("");
        setJaVotou(true);
        setEmailVotante(email);
      }, 2000);
    } catch (err) {
      setMsg(`❌ Erro ao registrar voto: ${err.message}`);
    } finally {
      setEnviandoVoto(false);
    }
  };

  const tentarComOutroEmail = () => {
    setJaVotou(false);
    setEmailVotante("");
    setEmail("");
    setNome("");
    setVotos({});
    setMsg("");
  };

  // Votação desativada pelo admin
  if (!votacaoAtiva) {
    return (
      <div className="votacao-main main">
        <div className="votacao-card votacao-encerrada">
          <div className="encerrada-icon">🚧</div>
          <h2 className="votacao-titulo">Votação Não Disponível</h2>
          <p>A votação do desafio semanal não está ativa no momento.</p>
          <p>O administrador precisa liberar o período de votação.</p>
          <div className="aguarde-info">
            <p>
              📢 Acompanhe nossos canais para saber quando a votação será
              aberta!
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingVotacao />;
  }

  // Usuário já votou
  if (jaVotou) {
    return (
      <JaVotou
        emailVotante={emailVotante}
        onVotarNovamente={tentarComOutroEmail}
      />
    );
  }

  // Organiza artes por nível
  const niveis = ["Iniciante", "Intermediário", "Avançado"];
  const artesComVotacao = niveis
    .map((nivel) => ({
      nivel,
      artes: artesAprovadas.filter((arte) => arte.nivel === nivel),
    }))
    .filter((categoria) => categoria.artes.length > 0);

  if (artesComVotacao.length === 0) {
    return (
      <div className="votacao-main main">
        <div className="votacao-card sem-candidatos">
          <div className="sem-artes-icon">🎨</div>
          <h2 className="votacao-titulo">🗳️ Votação - Desafio Semanal</h2>
          <h3>Aguardando Candidatos</h3>
          <p>Ainda não há artes aprovadas para votação no desafio semanal.</p>
          <div className="info-processo">
            <p>📝 As artes precisam ser aprovadas pelo administrador</p>
            <p>🏆 Após aprovação, aparecerão aqui para votação</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="votacao-main main">
      <div className="votacao-header">
        <h2 className="votacao-titulo">🗳️ Votação - Desafio Semanal</h2>
        <div className="votacao-regras">
          <p>Vote na sua arte favorita em cada categoria disponível</p>
          <div className="regras-destaque">
            <span>⚠️ Cada pessoa pode votar apenas UMA vez por período</span>
          </div>
        </div>
      </div>

      <form onSubmit={enviarVoto} className="votacao-form">
        {/* Dados do Eleitor */}
        <div className="votacao-card dados-eleitor">
          <h3 className="votacao-subtitulo">
            <span className="icone">👤</span>
            Identificação do Eleitor
          </h3>
          <div className="dados-grid">
            <input
              className="votacao-input"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome completo"
              disabled={enviandoVoto}
              required
            />
            <input
              className="votacao-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu email (verificamos se já votou)"
              disabled={enviandoVoto}
              required
            />
          </div>
          <div className="dados-info">
            <p>📧 Usamos seu email apenas para evitar votos duplicados</p>
          </div>
        </div>

        {/* Categorias de Votação */}
        {artesComVotacao.map(({ nivel, artes }) => (
          <div key={nivel} className="votacao-card categoria">
            <h3 className="votacao-subtitulo">
              <span className="icone">🏆</span>
              Categoria: {nivel}
              <span className="contador">
                ({artes.length} candidato{artes.length > 1 ? "s" : ""})
              </span>
            </h3>

            <div className="votacao-grid">
              {artes.map((arte) => (
                <label
                  key={arte.id}
                  className={`votacao-label ${
                    votos[nivel] === arte.id ? "ativo" : ""
                  }`}
                >
                  <input
                    type="radio"
                    name={`voto_${nivel}`}
                    value={arte.id}
                    onChange={() => votar(nivel, arte.id)}
                    disabled={enviandoVoto}
                    hidden
                    required
                  />

                  <div className="votacao-arte-wrapper">
                    <div className="arte-imagem-container">
                      <img
                        src={arte.arquivo_url}
                        alt={`Arte de ${arte.nome}`}
                        className="arte-imagem"
                        onError={(e) => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='100' y='100' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3EImagem%3C/text%3E%3Ctext x='100' y='115' text-anchor='middle' dy='.3em' fill='%23999' font-size='12'%3Enão encontrada%3C/text%3E%3C/svg%3E";
                        }}
                      />
                      {votos[nivel] === arte.id && (
                        <div className="voto-selecionado">
                          <span className="check">✅</span>
                        </div>
                      )}
                    </div>

                    <div className="arte-info">
                      <strong className="artista-nome">{arte.nome}</strong>
                      <div className="artista-detalhes">
                        <span className="nivel-badge">{arte.nivel}</span>
                        <span className="whatsapp">📱 {arte.whatsapp}</span>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        ))}

        {/* Botão de Envio */}
        <div className="votacao-card votacao-envio">
          <div className="voto-resumo">
            <p>
              Você selecionou <strong>{Object.keys(votos).length}</strong> voto
              {Object.keys(votos).length !== 1 ? "s" : ""} de{" "}
              <strong>{artesComVotacao.length}</strong> categoria
              {artesComVotacao.length !== 1 ? "s" : ""} disponível
              {artesComVotacao.length !== 1 ? "eis" : ""}
            </p>
          </div>

          <button
            type="submit"
            className="votacao-button"
            disabled={Object.keys(votos).length === 0 || enviandoVoto}
          >
            {enviandoVoto ? "📤 Enviando..." : "🗳️ Confirmar Meu Voto"}
          </button>

          <div className="aviso-unico">
            ⚠️ <strong>Atenção:</strong> Você só pode votar uma vez.
            Certifique-se das suas escolhas!
          </div>

          {msg && (
            <div
              className={`votacao-msg ${
                msg.includes("✅")
                  ? "sucesso"
                  : msg.includes("📤")
                  ? "loading"
                  : "erro"
              }`}
            >
              {msg.includes("📤") && <div className="msg-spinner"></div>}
              {msg}
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Votacao;
