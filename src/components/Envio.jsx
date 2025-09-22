import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import imageCompression from "browser-image-compression";

const SUPABASE_URL = "https://ajtdyjlzwpzqfqhkbrzj.supabase.co";
const SUPABASE_ANON_KEY = "..."; // sua chave

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const uploadArquivo = async (file) => {
  if (!file) return null;
  const fileName = `uploads/${Date.now()}_${file.name}`;
  try {
    const { error } = await supabase.storage
      .from("desenhos")
      .upload(fileName, file);
    if (error) return null;
    const { data: publicData } = supabase.storage
      .from("desenhos")
      .getPublicUrl(fileName);
    return publicData.publicUrl;
  } catch (err) {
    console.error(err);
    return null;
  }
};

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
  const [sucesso, setSucesso] = useState(false);

  const [podeEnviar, setPodeEnviar] = useState(true);
  const [tempoRestante, setTempoRestante] = useState(0);

  // ==========================
  // Checa bloqueio e atualiza tempo
  // ==========================
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
    const interval = setInterval(atualizarTempo, 1000); // atualiza a cada segundo

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setForm((prev) => ({ ...prev, desafio: desafioTypeFromState }));
  }, [desafioTypeFromState]);

  const handle = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: name === "arquivo" ? files[0] : value });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!envioAtivo) {
      setStatusMessage("⚠️ O envio de artes está temporariamente desativado.");
      return;
    }
    if (!form.arquivo) {
      setStatusMessage("⚠️ Selecione um arquivo antes de enviar.");
      return;
    }
    if (!podeEnviar) return;

    try {
      setLoading(true);
      setSucesso(false);
      setStatusMessage("🚀 Preparando o envio...");

      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        onProgress: (percent) =>
          setStatusMessage(`⚙️ Compactando imagem... ${percent.toFixed(0)}%`),
      };
      const compressedFile = await imageCompression(form.arquivo, options);

      setStatusMessage("📤 Enviando arquivo...");
      const arquivoUrl = await uploadArquivo(compressedFile);
      if (!arquivoUrl) {
        setStatusMessage("❌ Erro ao enviar o arquivo.");
        setLoading(false);
        return;
      }

      setStatusMessage("💾 Salvando informações no banco...");
      const { error } = await supabase.from("envios").insert([
        {
          nome: form.nome,
          whatsapp: form.whatsapp,
          nivel: form.nivel,
          desafio: form.desafio,
          arquivo_url: arquivoUrl,
        },
      ]);

      if (error) {
        setStatusMessage(
          `❌ Erro ao salvar no banco: ${error.message || "Desconhecido"}`
        );
        setLoading(false);
        return;
      }

      setStatusMessage("🎉 Arte enviada com sucesso!");
      setLoading(false);
      setSucesso(true);

      // Bloqueio de 24h
      localStorage.setItem("ultimoEnvio", new Date().getTime());
      setPodeEnviar(false);

      setForm({
        nome: "",
        whatsapp: "",
        nivel: "Iniciante",
        desafio: desafioTypeFromState,
        arquivo: null,
      });

      onNovoEnvio?.();
    } catch (err) {
      setStatusMessage(
        `❌ Erro ao processar a imagem: ${err.message || "Desconhecido"}`
      );
      setLoading(false);
    }
  };

  if (!envioAtivo) {
    return (
      <div className="envio-main">
        <div className="envio-card">
          <h2 style={{ color: "#ff6b6b" }}>❌ Envio de Artes Desativado</h2>
          <p>
            O envio de novas artes foi desativado temporariamente. Volte mais
            tarde.
          </p>
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
        <div className="envio-card envio-alerta">
          ⏳ Você já enviou hoje! Tente novamente em{" "}
          {Math.ceil(tempoRestante / (1000 * 60 * 60))} horas.
        </div>
      )}

      <form onSubmit={submit} className="envio-card">
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
          {loading ? "⏳ Processando envio..." : "📤 Enviar Arte"}
        </button>

        <div className="envio-status-wrapper">
          {loading && (
            <div className="envio-loading">
              <div className="spinner"></div>
              <span>{statusMessage}</span>
            </div>
          )}
          {!loading && sucesso && (
            <div className="envio-success">
              <span>🎉 {statusMessage}</span>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default Envio;
