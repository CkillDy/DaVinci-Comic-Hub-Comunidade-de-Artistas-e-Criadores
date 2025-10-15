import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  buscarVotacaoAtiva,
  criarVotacaoSemanal,
  buscarTodosEnvios,
} from "../hooks/superbase";

const SUPABASE_URL = "https://ajtdyjlzwpzqfqhkbrzj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdGR5amx6d3B6cWZxaGticnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MDYzNDIsImV4cCI6MjA3NDA4MjM0Mn0.g0hxkZrZ5jiEMsIK1RU0QVuI4LWgXZD56HWrcyNcslk";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: {
    schema: "public",
  },
});

// --- FUNÇÕES DE ADMIN ---
const excluirVotacao = async (votacaoId) => {
  try {
    await supabase.from("votos").delete().eq("votacao_id", votacaoId);
    await supabase
      .from("envios")
      .update({ em_votacao: false })
      .eq("em_votacao", true);
    await supabase.from("votacoes").delete().eq("id", votacaoId);

    try {
      localStorage.removeItem(`votacao_ultimo_contato_${votacaoId}`);
    } catch (err) {
      // Ignora erro de localStorage
    }

    return true;
  } catch (error) {
    throw error;
  }
};

const ConfirmacaoExclusao = ({ onConfirmar, onCancelar, loading }) => (
  <div className="modal-overlay">
    <div className="modal-exclusao">
      <div className="modal-header">
        <h3>⚠️ Confirmar Exclusão</h3>
      </div>
      <div className="modal-body">
        <p>Você tem certeza que deseja excluir esta votação?</p>
        <div className="aviso-exclusao">
          <strong>Esta ação irá:</strong>
          <ul>
            <li>🗑️ Remover TODOS os votos registrados</li>
            <li>📋 Desmarcar todas as artes da votação</li>
            <li>🔥 Excluir permanentemente a votação</li>
          </ul>
          <p>
            <strong>⚠️ Esta ação não pode ser desfeita!</strong>
          </p>
        </div>
      </div>
      <div className="modal-actions">
        <button
          className="btn-cancelar"
          onClick={onCancelar}
          disabled={loading}
        >
          ❌ Cancelar
        </button>
        <button
          className="btn-excluir"
          onClick={onConfirmar}
          disabled={loading}
        >
          {loading ? "🔄 Excluindo..." : "🗑️ Confirmar Exclusão"}
        </button>
      </div>
    </div>
  </div>
);

const CriarVotacao = ({ onVotacaoCriada, onFechar }) => {
  const [titulo, setTitulo] = useState(
    "Votação Semanal - " + new Date().toLocaleDateString()
  );
  const [descricao, setDescricao] = useState(
    "Vote na sua arte favorita em cada nível de habilidade"
  );
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [carregandoArtes, setCarregandoArtes] = useState(true);
  const [estatisticasArtes, setEstatisticasArtes] = useState({
    iniciante: 0,
    intermediario: 0,
    avancado: 0,
    total: 0,
  });

  useEffect(() => {
    const carregarEstatisticas = async () => {
      try {
        const todasArtes = await buscarTodosEnvios();
        const artesDesafio = todasArtes.filter(
          (arte) => arte.desafio && arte.desafio !== "livre"
        );

        const stats = {
          iniciante: artesDesafio.filter((arte) => arte.nivel === "Iniciante")
            .length,
          intermediario: artesDesafio.filter(
            (arte) => arte.nivel === "Intermediário"
          ).length,
          avancado: artesDesafio.filter((arte) => arte.nivel === "Avançado")
            .length,
          total: artesDesafio.length,
        };

        setEstatisticasArtes(stats);

        if (stats.total === 0) {
          setMsg("⚠️ Nenhuma arte de desafio encontrada para criar votação");
        }
      } catch (err) {
        setMsg("❌ Erro ao carregar artes disponíveis: " + err.message);
      } finally {
        setCarregandoArtes(false);
      }
    };

    carregarEstatisticas();
  }, []);

  const criarVotacao = async (e) => {
    e.preventDefault();
    if (estatisticasArtes.total < 2) {
      return setMsg(
        "❌ É necessário pelo menos 2 artes de desafio para criar uma votação"
      );
    }

    if (!titulo.trim()) {
      return setMsg("❌ O título da votação é obrigatório");
    }

    try {
      setLoading(true);
      setMsg("📤 Criando votação com todas as artes de desafio...");

      const todasArtes = await buscarTodosEnvios();
      const artesDesafio = todasArtes.filter(
        (arte) => arte.desafio && arte.desafio !== "livre"
      );
      const idsArtesDesafio = artesDesafio.map((arte) => arte.id);

      await criarVotacaoSemanal(idsArtesDesafio, titulo.trim());

      setMsg(
        "✅ Votação criada com sucesso com " +
          estatisticasArtes.total +
          " artes!"
      );
      setTimeout(() => {
        onVotacaoCriada();
      }, 2000);
    } catch (err) {
      setMsg(`❌ Erro ao criar votação: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (carregandoArtes) {
    return (
      <div
        className="modal-overlay"
        onClick={(e) => e.target === e.currentTarget && onFechar()}
      >
        <div
          className="modal-criar-votacao"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="loading-criar-votacao">
            <div className="spinner-criar-votacao"></div>
            <p>🔄 Analisando artes disponíveis...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onFechar()}
    >
      <div className="modal-criar-votacao" onClick={(e) => e.stopPropagation()}>
        <div className="header-criar-votacao">
          <h2 className="titulo-criar-votacao">⚙️ Criar Nova Votação</h2>
          <button
            className="btn-fechar-criar-votacao"
            onClick={onFechar}
            disabled={loading}
            type="button"
          >
            ❌
          </button>
        </div>
        <div className="conteudo-criar-votacao">
          <p className="subtitulo-criar-votacao">
            Configure uma nova votação com todas as artes de desafio disponíveis
          </p>

          <form onSubmit={criarVotacao} className="form-criar-votacao">
            <div className="card-estatisticas">
              <h3 className="titulo-secao-criar">
                📊 Artes que serão incluídas na votação
              </h3>
              <div className="grid-estatisticas">
                <div className="item-estatistica nivel-iniciante">
                  <div className="icone-estatistica">🟢</div>
                  <div className="info-estatistica">
                    <span className="label-estatistica">Iniciante</span>
                    <span className="valor-estatistica">
                      {estatisticasArtes.iniciante} artes
                    </span>
                  </div>
                </div>
                <div className="item-estatistica nivel-intermediario">
                  <div className="icone-estatistica">🟡</div>
                  <div className="info-estatistica">
                    <span className="label-estatistica">Intermediário</span>
                    <span className="valor-estatistica">
                      {estatisticasArtes.intermediario} artes
                    </span>
                  </div>
                </div>
                <div className="item-estatistica nivel-avancado">
                  <div className="icone-estatistica">🔴</div>
                  <div className="info-estatistica">
                    <span className="label-estatistica">Avançado</span>
                    <span className="valor-estatistica">
                      {estatisticasArtes.avancado} artes
                    </span>
                  </div>
                </div>
                <div className="item-estatistica estatistica-total">
                  <div className="icone-estatistica">🎨</div>
                  <div className="info-estatistica">
                    <span className="label-estatistica">Total</span>
                    <span className="valor-estatistica">
                      {estatisticasArtes.total} artes
                    </span>
                  </div>
                </div>
              </div>
              <div className="info-estatisticas">
                <p>
                  🎯 Todas as artes de desafio serão incluídas automaticamente
                </p>
                <p>
                  📝 Artes com categoria "livre" não são incluídas em votações
                </p>
              </div>
            </div>

            <div className="card-configuracoes">
              <h3 className="titulo-secao-criar">
                📝 Configurações da Votação
              </h3>

              <div className="grupo-campo">
                <label className="label-campo">Título da Votação</label>
                <input
                  className="input-titulo-criar"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Votação Semanal - Janeiro 2024"
                  disabled={loading}
                  required
                />
              </div>

              <div className="grupo-campo">
                <label className="label-campo">Descrição (opcional)</label>
                <textarea
                  className="input-descricao-criar"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descrição que aparecerá para os votantes..."
                  disabled={loading}
                  rows={3}
                />
              </div>
            </div>

            <div className="container-submit-criar">
              <button
                type="submit"
                className="btn-submit-criar-votacao"
                disabled={loading || estatisticasArtes.total < 2}
              >
                {loading
                  ? "📤 Criando..."
                  : `🗳️ Criar Votação (${estatisticasArtes.total} artes)`}
              </button>

              {estatisticasArtes.total < 2 && (
                <div className="aviso-minimo-artes">
                  ⚠️ É necessário pelo menos 2 artes de desafio para criar uma
                  votação
                </div>
              )}

              {msg && (
                <div
                  className={`mensagem-criar ${
                    msg.includes("✅")
                      ? "sucesso-criar"
                      : msg.includes("📤")
                      ? "loading-criar"
                      : "erro-criar"
                  }`}
                >
                  {msg.includes("📤") && (
                    <div className="mini-spinner-criar"></div>
                  )}
                  {msg}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const JaVotou = ({ emailVotante, votosRealizados, votantesRecentes }) => {
  const niveis = ["iniciante", "intermediario", "avancado"];
  const nomeNiveis = {
    iniciante: "Iniciante",
    intermediario: "Intermediário",
    avancado: "Avançado",
  };
  return (
    <div className="ja-votou-container">
      <div className="ja-votou-card">
        <div className="ja-votou-icon">✅</div>
        <h2 className="ja-votou-titulo">Votos Registrados!</h2>
        <p className="ja-votou-descricao">
          O contato <strong>{emailVotante}</strong> já participou da votação.
        </p>

        <div className="votos-status">
          <h3>Status dos seus votos:</h3>
          {niveis.map((nivel) => (
            <div key={nivel} className={`voto-status nivel-${nivel}`}>
              <span className="nivel-nome">{nomeNiveis[nivel]}</span>
              <span
                className={`status ${
                  votosRealizados[nivel] ? "votado" : "pendente"
                }`}
              >
                {votosRealizados[nivel] ? "✅ Votado" : "⏳ Disponível"}
              </span>
            </div>
          ))}
        </div>

        {votantesRecentes && votantesRecentes.length > 0 && (
          <div className="votantes-recentes-section">
            <h3>🎉 Últimos que votaram:</h3>
            <div className="votantes-lista-mini">
              {votantesRecentes.slice(0, 5).map((votante, index) => (
                <div key={index} className="votante-item-mini">
                  <div className="votante-info-mini">
                    <strong>{votante.nome}</strong>
                    <span className="votante-data-mini">
                      {new Date(votante.data).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <div className="votante-check">✅</div>
                </div>
              ))}
            </div>
            <p className="total-votantes">
              👥 {votantesRecentes.length} pessoa
              {votantesRecentes.length !== 1 ? "s" : ""} já votaram
            </p>
          </div>
        )}

        <div className="ja-votou-info">
          <p>📝 Cada pessoa pode votar uma vez em cada nível</p>
          <p>🏆 Aguarde os resultados da votação!</p>
          <p>🔒 Sistema protegido contra votos duplicados</p>
          <p>
            <strong>
              ⚠️ Você só poderá votar novamente quando uma nova votação for
              criada
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const Votacao = ({ votacaoAtiva }) => {
  const [nome, setNome] = useState("");
  const [contato, setContato] = useState("");
  const [tipoContato, setTipoContato] = useState("whatsapp");
  const [votos, setVotos] = useState({});
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [votosRealizados, setVotosRealizados] = useState({
    iniciante: false,
    intermediario: false,
    avancado: false,
  });
  const [contatoVotante, setContatoVotante] = useState("");
  const [enviandoVoto, setEnviandoVoto] = useState(false);
  const [votacaoData, setVotacaoData] = useState(null);
  const [mostrarCriarVotacao, setMostrarCriarVotacao] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [excluindoVotacao, setExcluindoVotacao] = useState(false);
  const [votantesRecentes, setVotantesRecentes] = useState([]);

  const isAdmin = localStorage.getItem("adminAuth") === "true";

  const checkAlreadyVotedLevel = async (contato, nivel) => {
    const campoContato =
      tipoContato === "email" ? "email_eleitor" : "whatsapp_eleitor";
    const { data } = await supabase
      .from("votos")
      .select("id")
      .eq(campoContato, contato)
      .eq("votacao_id", votacaoData.id);
    return false;
  };

  const buscarVotantesRecentes = async (idVotacao) => {
    if (!idVotacao) return;
    try {
      const { data, error } = await supabase
        .from("votos")
        .select("nome_eleitor, whatsapp_eleitor, email_eleitor, created_at")
        .eq("votacao_id", idVotacao)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      const votantesUnicos = [];
      const contatosVistos = new Set();

      data.forEach((voto) => {
        const contatoUnico = voto.whatsapp_eleitor || voto.email_eleitor;
        if (contatoUnico && !contatosVistos.has(contatoUnico)) {
          contatosVistos.add(contatoUnico);
          votantesUnicos.push({
            nome: voto.nome_eleitor,
            contato: contatoUnico,
            data: voto.created_at,
          });
        }
      });
      setVotantesRecentes(votantesUnicos);
    } catch (err) {
      // Ignora erro
    }
  };

  const verificarVotosRealizados = async (
    contatoParaVerificar,
    tipoParaVerificar = tipoContato,
    votacaoId = votacaoData?.id
  ) => {
    if (!contatoParaVerificar || !votacaoId) return;
    try {
      const campoContato =
        tipoParaVerificar === "email" ? "email_eleitor" : "whatsapp_eleitor";

      const { data, error } = await supabase
        .from("votos")
        .select("arte_id")
        .eq(campoContato, contatoParaVerificar)
        .eq("votacao_id", votacaoId);
      if (error) throw error;

      if (data && data.length > 0) {
        const artesVotadas = await Promise.all(
          data.map(async (voto) => {
            const { data: arte } = await supabase
              .from("envios")
              .select("nivel")
              .eq("id", voto.arte_id)
              .single();
            return arte;
          })
        );
        const novosVotosRealizados = {
          iniciante: artesVotadas.some((arte) => arte?.nivel === "Iniciante"),
          intermediario: artesVotadas.some(
            (arte) => arte?.nivel === "Intermediário"
          ),
          avancado: artesVotadas.some((arte) => arte?.nivel === "Avançado"),
        };
        setVotosRealizados(novosVotosRealizados);

        const votouEmAlgumNivel =
          Object.values(novosVotosRealizados).some(Boolean);
        if (votouEmAlgumNivel) {
          setContatoVotante(contatoParaVerificar);
        } else {
          setContatoVotante("");
        }
      } else {
        setVotosRealizados({
          iniciante: false,
          intermediario: false,
          avancado: false,
        });
        setContatoVotante("");
      }
    } catch (err) {
      // Ignora erro
    }
  };

  useEffect(() => {
    const carregarVotacao = async () => {
      try {
        if (votacaoAtiva) {
          const votacao = await buscarVotacaoAtiva();
          setVotacaoData(votacao);

          if (votacao) {
            const votacaoId = votacao.id;

            const contatoPersistidoString = localStorage.getItem(
              `votacao_ultimo_contato_${votacaoId}`
            );

            if (contatoPersistidoString) {
              const { contato: c, tipo: t } = JSON.parse(
                contatoPersistidoString
              );
              setContato(c);
              setTipoContato(t);
              await verificarVotosRealizados(c, t, votacaoId);
            }

            await buscarVotantesRecentes(votacaoId);
          }
        }
      } catch (err) {
        // Ignora erro
      } finally {
        setLoading(false);
      }
    };

    carregarVotacao();
  }, [votacaoAtiva]);

  useEffect(() => {
    const verificarVoto = async () => {
      if (
        contato &&
        contato.length >= (tipoContato === "email" ? 5 : 10) &&
        votacaoData
      ) {
        await verificarVotosRealizados(contato, tipoContato, votacaoData.id);
      } else {
        setContatoVotante("");
        setVotosRealizados({
          iniciante: false,
          intermediario: false,
          avancado: false,
        });
      }
    };

    const timeoutId = setTimeout(verificarVoto, 500);
    return () => clearTimeout(timeoutId);
  }, [contato, votacaoData, tipoContato]);

  const votar = (arteId, nivel) => {
    if (votosRealizados[nivel] && !isAdmin) {
      setMsg(`❌ Você já votou no nível ${nivel}!`);
      return;
    }

    setVotos({ ...votos, [nivel]: arteId });
    if (msg) setMsg("");
  };

  const enviarVoto = async (e) => {
    e.preventDefault();
    if (!nome.trim() || !contato.trim()) {
      return setMsg("❌ Preencha seu nome e contato.");
    }

    const votosParaEnviar = Object.keys(votos).filter(
      (nivel) => votos[nivel] && !votosRealizados[nivel]
    );
    if (votosParaEnviar.length === 0) {
      if (
        Object.keys(votos).length > 0 &&
        Object.values(votosRealizados).some(Boolean)
      ) {
        return setMsg(
          "❌ Você selecionou apenas níveis que já votou. Selecione um novo para votar."
        );
      }
      return setMsg("❌ Selecione pelo menos uma arte para votar.");
    }

    try {
      setEnviandoVoto(true);
      setMsg("📤 Registrando seus votos...");
      const campoContato =
        tipoContato === "email" ? "email_eleitor" : "whatsapp_eleitor";
      const níveisInseridos = [];
      const níveisPulados = [];

      for (const nivel of votosParaEnviar) {
        const jaVotouNoNivel = await checkAlreadyVotedLevel(
          contato.trim(),
          nivel
        );
        if (jaVotouNoNivel) {
          níveisPulados.push(nivel);
          continue;
        }

        await supabase.from("votos").insert([
          {
            nome_eleitor: nome.trim(),
            [campoContato]: contato.trim(),
            votacao_id: votacaoData.id,
            arte_id: votos[nivel],
          },
        ]);
        níveisInseridos.push(nivel);
      }

      if (níveisInseridos.length > 0) {
        try {
          const chaveContato = `votacao_ultimo_contato_${votacaoData.id}`;
          localStorage.setItem(
            chaveContato,
            JSON.stringify({ contato: contato.trim(), tipo: tipoContato })
          );
        } catch (err) {
          // Ignora erro
        }
      }

      await verificarVotosRealizados(contato.trim());
      await buscarVotantesRecentes(votacaoData.id);

      let resumoMsg = "";
      if (níveisInseridos.length)
        resumoMsg += `✅ ${níveisInseridos.length} voto(s) registrado(s). `;
      if (níveisPulados.length)
        resumoMsg += `⚠️ Pularam: ${níveisPulados.join(", ")} (já havia voto).`;
      setMsg(resumoMsg || "✅ Votos processados.");
      setVotos({});
      setNome("");
      setContatoVotante(contato.trim());
      setTimeout(() => setMsg(""), 4000);
    } catch (err) {
      setMsg(`❌ Erro ao registrar voto: ${err.message}`);
    } finally {
      setEnviandoVoto(false);
    }
  };

  const handleVotacaoCriada = () => {
    setMostrarCriarVotacao(false);
    window.location.reload();
  };

  const confirmarExclusao = async () => {
    try {
      setExcluindoVotacao(true);
      await excluirVotacao(votacaoData.id);
      setMostrarConfirmacao(false);
      window.location.reload();
    } catch (err) {
      setMsg(`❌ Erro ao excluir votação: ${err.message}`);
    } finally {
      setExcluindoVotacao(false);
    }
  };

  const renderArtesNivel = (nivel, nomeNivel, cor) => {
    if (!votacaoData?.votacao_artes) return null;
    const artesDoNivel = votacaoData.votacao_artes.filter(
      (item) => item.envios.nivel === nomeNivel
    );
    if (artesDoNivel.length === 0) return null;

    const jaVotouNeste = votosRealizados[nivel];
    return (
      <div className={`nivel-votacao nivel-${nivel}`} key={nivel}>
        <div className="nivel-header" style={{ borderColor: cor }}>
          <h3 className="nivel-titulo" style={{ color: cor }}>
            🏆 {nomeNivel}
            {jaVotouNeste && (
              <span className="status-votado">✅ Já Votado</span>
            )}
          </h3>
          <span className="contador-artes">
            {artesDoNivel.length} candidata
            {artesDoNivel.length !== 1 ? "s" : ""}
          </span>
        </div>

        {jaVotouNeste && !isAdmin ? (
          <div className="nivel-bloqueado">
            <p>✅ Você já votou neste nível</p>
          </div>
        ) : (
          <div className="artes-grid">
            {artesDoNivel.map((item) => {
              const arte = item.envios;
              const selecionado = votos[nivel] === item.arte_id;

              return (
                <label
                  key={`${nivel}-${item.arte_id}`}
                  className={`arte-card ${selecionado ? "selecionada" : ""}`}
                >
                  <input
                    type="radio"
                    name={`voto_${nivel}`}
                    value={item.arte_id}
                    onChange={() => votar(item.arte_id, nivel)}
                    disabled={enviandoVoto}
                    hidden
                  />

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
                    {selecionado && <div className="selo-selecionado">✅</div>}
                  </div>

                  <div className="arte-info">
                    <strong className="artista-nome">{arte.nome}</strong>
                    <div className="artista-detalhes">
                      <span className="whatsapp">📱 {arte.whatsapp}</span>
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // ---------------------------------------------------------------------
  // 🚀 Lógica de Renderização Corrigida
  // ---------------------------------------------------------------------

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>🔄 Verificando votação disponível...</p>
      </div>
    );
  }

  // PASSO 1: Votação Desligada pelo Controle do Admin (Prioridade Máxima)
  if (!votacaoAtiva) {
    return (
      <div className="sem-votacao-container">
        <div className="sem-votacao-card">
          <div className="sem-votacao-icon">❌</div>
          <h2 className="sem-votacao-titulo">Votação Desativada</h2>
          <p>A votação está temporariamente desativada.</p>
          {isAdmin && <p>Admin: Ligue a chave de "Votação Ativa" no painel.</p>}
        </div>
      </div>
    );
  }

  // PASSO 2: Chave LIGADA (votacaoAtiva = true), mas NADA no Banco de Dados
  if (!votacaoData) {
    if (mostrarCriarVotacao && isAdmin) {
      return (
        <CriarVotacao
          onVotacaoCriada={handleVotacaoCriada}
          onFechar={() => setMostrarCriarVotacao(false)}
        />
      );
    }

    return (
      <div className="sem-votacao-container">
        <div className="sem-votacao-card">
          <div className="sem-votacao-icon">🚧</div>
          <h2 className="sem-votacao-titulo">Votação Não Iniciada</h2>
          <p>O Administrador precisa criar a votação semanal.</p>
          {isAdmin && (
            <div className="admin-actions">
              <p>Como administrador, você pode criar uma nova votação agora.</p>
              <button
                className="btn-admin-criar"
                onClick={() => {
                  setMostrarCriarVotacao(true);
                }}
              >
                ⚙️ Criar Nova Votação
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  const votouEmAlgumNivel = Object.values(votosRealizados).some(Boolean);

  // 3. Sem candidatos na votação ativa
  if (!votacaoData.votacao_artes?.length) {
    return (
      <div className="sem-votacao-container">
        <div className="sem-votacao-card">
          <div className="sem-votacao-icon">🎨</div>
          <h2 className="sem-votacao-titulo">Nenhuma Arte Candidata</h2>
          <p>A votação está ativa, mas não há artes candidatas no momento.</p>
          {isAdmin && (
            <button
              className="btn-admin-criar"
              onClick={() => setMostrarConfirmacao(true)}
            >
              🗑️ Excluir Votação Atual
            </button>
          )}
        </div>
        {mostrarConfirmacao && isAdmin && (
          <ConfirmacaoExclusao
            onConfirmar={confirmarExclusao}
            onCancelar={() => setMostrarConfirmacao(false)}
            loading={excluindoVotacao}
          />
        )}
      </div>
    );
  }

  // 4. Usuário comum já votou em QUALQUER nível (Bloqueio total)
  if (!isAdmin && contatoVotante && votouEmAlgumNivel) {
    return (
      <JaVotou
        emailVotante={contatoVotante}
        votosRealizados={votosRealizados}
        votantesRecentes={votantesRecentes}
      />
    );
  }

  // 5. Renderização Normal (Admin e usuários que não votaram)
  return (
    <div className="votacao-container">
      <div className="votacao-header">
        <h1 className="votacao-titulo">🗳️ {votacaoData.titulo}</h1>
        <p className="votacao-descricao">
          Vote na sua arte favorita em cada nível
        </p>

        {isAdmin && (
          <div className="admin-controls">
            <button
              className="btn-admin-excluir"
              onClick={() => setMostrarConfirmacao(true)}
            >
              🗑️ Excluir Votação
            </button>
            <p className="admin-aviso">
              ⚠️ Você está logado como Administrador.
            </p>
          </div>
        )}

        <div className="votacao-regras">
          <span>⚠️ Você pode votar UMA vez em cada nível</span>
        </div>
      </div>

      <form onSubmit={enviarVoto} className="votacao-form">
        <div className="eleitor-card">
          <h3 className="section-title">👤 Identificação do Eleitor</h3>
          <div className="eleitor-dados">
            <input
              className="input-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome do whatsapp"
              disabled={enviandoVoto}
              required
            />

            <div className="contato-grupo">
              <select
                className="select-tipo-contato"
                value={tipoContato}
                onChange={(e) => setTipoContato(e.target.value)}
                disabled={enviandoVoto}
              >
                <option value="whatsapp">📱 WhatsApp</option>
                <option value="email">📧 Email</option>
              </select>

              <input
                className="input-contato"
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                placeholder={
                  tipoContato === "email" ? "seu@email.com" : "WhatsApp com DDD"
                }
                type={tipoContato === "email" ? "email" : "tel"}
                disabled={enviandoVoto}
                required
              />
            </div>
          </div>

          <div className="eleitor-info">
            <p>🔒 Verificamos seu contato para evitar votos duplicados</p>
          </div>
        </div>

        <div className="niveis-votacao">
          {renderArtesNivel("iniciante", "Iniciante", "#4CAF50")}
          {renderArtesNivel("intermediario", "Intermediário", "#FF9800")}
          {renderArtesNivel("avancado", "Avançado", "#F44336")}
        </div>

        <div className="submit-card">
          <button
            type="submit"
            className="btn-votar"
            disabled={enviandoVoto || Object.keys(votos).length === 0}
          >
            {enviandoVoto
              ? "📤 Enviando..."
              : `🗳️ Votar (${Object.keys(votos).length} nível(is))`}{" "}
          </button>
          {msg && (
            <div
              className={`mensagem-voto ${
                msg.includes("✅")
                  ? "sucesso"
                  : msg.includes("❌")
                  ? "erro"
                  : ""
              }`}
            >
              {msg}
            </div>
          )}
        </div>
      </form>

      <div className="votacao-footer">
        <p>
          💝 Sistema desenvolvido por <strong>CK</strong>
        </p>
        <p>🎨 Promovendo arte e criatividade na comunidade</p>
      </div>

      {mostrarConfirmacao && isAdmin && (
        <ConfirmacaoExclusao
          onConfirmar={confirmarExclusao}
          onCancelar={() => setMostrarConfirmacao(false)}
          loading={excluindoVotacao}
        />
      )}
    </div>
  );
};

export default Votacao;
