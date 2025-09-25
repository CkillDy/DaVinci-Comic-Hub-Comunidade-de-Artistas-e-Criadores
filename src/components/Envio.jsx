import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import imageCompression from "browser-image-compression";
import { uploadArquivo, criarEnvio } from "../hooks/superbase";

// Componente de Loading
const CarregandoEnvio = ({ mensagem, progresso = null }) => (
  <div className="envio-loading">
    <div className="loading-spinner">
      <div className="spinner"></div>
    </div>
    <div className="loading-content">
      <span className="loading-message">{mensagem}</span>
      {progresso !== null && (
        <div className="progress-container">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progresso}%` }}
            ></div>
          </div>
          <span className="progress-text">{progresso.toFixed(0)}%</span>
        </div>
      )}
    </div>
  </div>
);

// Componente de Erro
const ErroEnvio = ({ mensagem, onTentarNovamente }) => (
  <div className="envio-error">
    <div className="error-icon">❌</div>
    <h3>Ops! Algo deu errado</h3>
    <p>{mensagem}</p>
    {onTentarNovamente && (
      <button className="envio-button-secondary" onClick={onTentarNovamente}>
        🔄 Tentar Novamente
      </button>
    )}
  </div>
);

// Componente de Sucesso
const SucessoEnvio = ({ mensagem }) => (
  <div className="envio-success-full">
    <div className="success-animation">
      <div className="checkmark">✓</div>
    </div>
    <h3>Arte Enviada com Sucesso! 🎉</h3>
    <p>{mensagem}</p>
    <p className="success-note">
      Sua arte será analisada e, se aprovada, aparecerá na galeria em breve!
    </p>
  </div>
);

const Envio = ({ envioAtivo, onNovoEnvio }) => {
  const location = useLocation();
  const desafioTypeFromState = location.state?.desafioType || "livre";

  const [form, setForm] = useState({
    nome: "",
    whatsapp: "",
    nivel: "Iniciante",
    desafio: desafioTypeFromState,
    arquivo: null,
  });

  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [progresso, setProgresso] = useState(null);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState(null);

  const [podeEnviar, setPodeEnviar] = useState(true);
  const [tempoRestante, setTempoRestante] = useState(0);

  // Função para formatar tempo restante
  const formatarTempoRestante = (milissegundos) => {
    const horas = Math.floor(milissegundos / (1000 * 60 * 60));
    const minutos = Math.floor(
      (milissegundos % (1000 * 60 * 60)) / (1000 * 60)
    );

    if (horas > 0) {
      return `${horas}h ${minutos}min`;
    }
    return `${minutos} minutos`;
  };

  // Checa bloqueio e atualiza tempo
  useEffect(() => {
    const atualizarTempo = () => {
      const ultimoEnvio = localStorage.getItem("ultimoEnvio");
      if (ultimoEnvio) {
        const agora = new Date().getTime();
        const diff = agora - parseInt(ultimoEnvio, 10);
        const umDia = 1000 * 60 * 60 * 24;

        if (diff < umDia) {
          setPodeEnviar(false);
          setTempoRestante(umDia - diff);
        } else {
          setPodeEnviar(true);
          setTempoRestante(0);
        }
      } else {
        setPodeEnviar(true);
        setTempoRestante(0);
      }
    };

    atualizarTempo();
    const interval = setInterval(atualizarTempo, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setForm((prev) => ({ ...prev, desafio: desafioTypeFromState }));
  }, [desafioTypeFromState]);

  const handle = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: name === "arquivo" ? files[0] : value });

    // Limpa mensagens de erro quando usuário interage
    if (erro) {
      setErro(null);
    }
  };

  const tentarNovamente = () => {
    setErro(null);
    setSucesso(false);
    setProgresso(null);
    setStatusMessage("");
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!envioAtivo) {
      setErro("O envio de artes está temporariamente desativado.");
      return;
    }

    if (!form.arquivo) {
      setErro("Por favor, selecione um arquivo antes de enviar.");
      return;
    }

    if (!podeEnviar) return;

    try {
      setLoading(true);
      setSucesso(false);
      setErro(null);
      setProgresso(null);

      // Etapa 1: Preparação
      setStatusMessage("🚀 Preparando o envio...");
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Etapa 2: Compressão
      setStatusMessage("⚙️ Compactando imagem...");
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        onProgress: (percent) => {
          setProgresso(percent);
          setStatusMessage(`⚙️ Compactando imagem...`);
        },
      };

      const compressedFile = await imageCompression(form.arquivo, options);
      setProgresso(null);

      // Etapa 3: Upload (usando função otimizada)
      setStatusMessage("📤 Enviando arquivo...");
      const arquivoUrl = await uploadArquivo(compressedFile);

      if (!arquivoUrl) {
        throw new Error("Falha ao enviar o arquivo para o servidor.");
      }

      // Etapa 4: Salvando no banco (usando função otimizada)
      setStatusMessage("💾 Salvando informações...");
      await criarEnvio({
        nome: form.nome,
        whatsapp: form.whatsapp,
        nivel: form.nivel,
        desafio: form.desafio,
        arquivo_url: arquivoUrl,
      });

      // Sucesso!
      setStatusMessage("Arte enviada com sucesso! 🎉");
      setLoading(false);
      setSucesso(true);

      // Bloqueio de 24h
      localStorage.setItem("ultimoEnvio", new Date().getTime());
      setPodeEnviar(false);

      // Limpa formulário
      setForm({
        nome: "",
        whatsapp: "",
        nivel: "Iniciante",
        desafio: desafioTypeFromState,
        arquivo: null,
      });

      // Callback para notificar componente pai
      onNovoEnvio?.();
    } catch (err) {
      setErro(err.message || "Erro inesperado ao processar o envio.");
      setLoading(false);
      setProgresso(null);
    }
  };

  if (!envioAtivo) {
    return (
      <div className="envio-main">
        <div className="envio-card envio-disabled">
          <div className="disabled-icon">🚧</div>
          <h2>Envio Temporariamente Desativado</h2>
          <p>
            O envio de novas artes foi desativado temporariamente para
            manutenção. Volte mais tarde ou acompanhe nossos canais para
            atualizações.
          </p>
        </div>
      </div>
    );
  }

  // Se está carregando, mostra apenas o loading
  if (loading) {
    return (
      <div className="envio-main">
        <h1 className="envio-titulo">📤 Enviar Arte</h1>
        <div className="envio-card">
          <CarregandoEnvio mensagem={statusMessage} progresso={progresso} />
        </div>
      </div>
    );
  }

  // Se teve sucesso, mostra apenas a mensagem de sucesso
  if (sucesso) {
    return (
      <div className="envio-main">
        <h1 className="envio-titulo">📤 Enviar Arte</h1>
        <div className="envio-card">
          <SucessoEnvio mensagem={statusMessage} />
          <button className="envio-button" onClick={() => setSucesso(false)}>
            ✨ Enviar Outra Arte
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="envio-main">
      <h1 className="envio-titulo">📤 Enviar Arte</h1>

      {form.desafio !== "livre" && (
        <div className="envio-card envio-alerta">
          <h3>🏆 Participando do Desafio {form.desafio}</h3>
          <p>Você está enviando uma arte para o desafio {form.desafio}!</p>
        </div>
      )}

      {!podeEnviar && (
        <div className="envio-card envio-cooldown">
          <div className="cooldown-icon">⏳</div>
          <h3>Aguarde para Enviar Novamente</h3>
          <p>
            Você já enviou uma arte hoje! Poderá enviar novamente em{" "}
            <strong>{formatarTempoRestante(tempoRestante)}</strong>
          </p>
        </div>
      )}

      <form onSubmit={submit} className="envio-card">
        {erro && (
          <ErroEnvio mensagem={erro} onTentarNovamente={tentarNovamente} />
        )}

        <fieldset
          disabled={!podeEnviar || loading}
          style={{ border: "none", padding: 0 }}
        >
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
          <select
            className="envio-input"
            name="nivel"
            onChange={handle}
            value={form.nivel}
          >
            <option value="Iniciante">Iniciante</option>
            <option value="Intermediário">Intermediário</option>
            <option value="Avançado">Avançado</option>
          </select>
          <select
            className="envio-input"
            name="desafio"
            onChange={handle}
            value={form.desafio}
          >
            <option value="Diário">Desafio Diário</option>
            <option value="Semanal">Desafio Semanal</option>
            <option value="Mensal" disabled>
              Desafio Mensal
            </option>
          </select>
          <input
            className="envio-input"
            type="file"
            name="arquivo"
            accept="image/*"
            onChange={handle}
            required
          />
        </fieldset>

        <button
          type="submit"
          className="envio-button"
          disabled={loading || !podeEnviar}
        >
          {!podeEnviar ? "⏳ Aguarde para enviar novamente" : "📤 Enviar Arte"}
        </button>
      </form>
    </div>
  );
};

export default Envio;
