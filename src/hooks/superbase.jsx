// lib/supabase.js
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ajtdyjlzwpzqfqhkbrzj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdGR5amx6d3B6cWZxaGticnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MDYzNDIsImV4cCI6MjA3NDA4MjM0Mn0.g0hxkZrZ5jiEMsIK1RU0QVuI4LWgXZD56HWrcyNcslk";

// Cria uma única instância do cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ========================
// FUNÇÕES DE UPLOAD
// ========================
export const uploadArquivo = async (file, bucket = "desenhos") => {
  if (!file) return null;

  const fileName = `uploads/${Date.now()}_${file.name}`;

  try {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) {
      console.error("Erro no upload:", error);
      return null;
    }

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicData.publicUrl;
  } catch (err) {
    console.error("Erro inesperado no upload:", err);
    return null;
  }
};

// ========================
// FUNÇÃO DE DEBUG - TESTE DE CONEXÃO
// ========================
export const testarConexao = async () => {
  try {
    console.log("🧪 Testando conexão com Supabase...");
    console.log("📍 URL:", SUPABASE_URL);

    // Primeiro, tenta buscar a estrutura da tabela
    const { data: tableInfo, error: tableError } = await supabase
      .from("envios")
      .select("*")
      .limit(1);

    if (tableError) {
      console.error("❌ Erro ao acessar tabela 'envios':", tableError);

      // Verifica se a tabela existe com um nome diferente
      console.log("🔍 Verificando outras possíveis tabelas...");

      // Tenta outras possibilidades comuns
      const tentativas = ["envio", "desenhos", "artes", "submissions"];

      for (const tabela of tentativas) {
        try {
          const { data, error } = await supabase
            .from(tabela)
            .select("*")
            .limit(1);
          if (!error && data) {
            console.log(
              `✅ Tabela encontrada: '${tabela}' com ${data.length} registro(s)`
            );
            return { sucesso: true, tabela, dados: data };
          }
        } catch (err) {
          console.log(`❌ Tabela '${tabela}' não existe`);
        }
      }

      return {
        sucesso: false,
        erro: "Nenhuma tabela de envios encontrada",
        detalhes: tableError,
      };
    }

    console.log("✅ Conexão OK! Dados encontrados:", tableInfo?.length || 0);
    return { sucesso: true, tabela: "envios", dados: tableInfo };
  } catch (err) {
    console.error("💥 Erro crítico ao testar conexão:", err);
    return { sucesso: false, erro: "Erro de conexão", detalhes: err };
  }
};

// BUSCAR TODOS OS ENVIOS (para galeria pública e admin)
export const criarEnvio = async (dadosEnvio) => {
  try {
    const { error } = await supabase.from("envios").insert([
      {
        nome: dadosEnvio.nome,
        whatsapp: dadosEnvio.whatsapp,
        nivel: dadosEnvio.nivel,
        desafio: dadosEnvio.desafio,
        arquivo_url: dadosEnvio.arquivo_url,
      },
    ]);

    if (error) throw new Error(`Erro ao salvar no banco: ${error.message}`);
    return true;
  } catch (err) {
    console.error("Erro ao criar envio:", err);
    throw err;
  }
};

// BUSCAR TODOS OS ENVIOS (para galeria pública e admin)
export const buscarTodosEnvios = async () => {
  try {
    console.log("🔍 Buscando envios na tabela 'envios'...");

    const { data, error } = await supabase
      .from("envios")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Erro do Supabase:", error);
      throw error;
    }

    console.log("✅ Dados retornados:", data);
    console.log("📊 Total de registros:", data?.length || 0);

    return data || [];
  } catch (err) {
    console.error("❌ Erro ao buscar envios:", err);
    return [];
  }
};

// REMOVER ENVIO (única função de remoção necessária)
export const removerEnvio = async (envioId) => {
  try {
    const { error } = await supabase.from("envios").delete().eq("id", envioId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erro ao remover envio:", err);
    throw err;
  }
};

// ========================
// FUNÇÕES DE ESTATÍSTICAS - SIMPLIFICADAS
// ========================
export const buscarEstatisticas = async () => {
  try {
    const envios = await buscarTodosEnvios();

    // Conta por nível
    const porNivel = {
      iniciante: envios.filter((e) => e.nivel === "Iniciante").length,
      intermediario: envios.filter((e) => e.nivel === "Intermediário").length,
      avancado: envios.filter((e) => e.nivel === "Avançado").length,
    };

    // Conta por desafio
    const porDesafio = {
      diario: envios.filter((e) => e.desafio === "Diário").length,
      semanal: envios.filter((e) => e.desafio === "Semanal").length,
      mensal: envios.filter((e) => e.desafio === "Mensal").length,
      livre: envios.filter((e) => e.desafio === "livre").length,
    };

    // Artistas únicos
    const artistasUnicos = [...new Set(envios.map((e) => e.nome))].length;

    // Envios por data (últimos 7 dias)
    const agora = new Date();
    const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
    const enviosRecentes = envios.filter(
      (e) => new Date(e.created_at) >= seteDiasAtras
    ).length;

    return {
      totalEnvios: envios.length,
      artistasUnicos,
      enviosRecentes,
      porNivel,
      porDesafio,
      ultimosEnvios: envios.slice(0, 10), // 10 mais recentes
    };
  } catch (err) {
    console.error("Erro ao buscar estatísticas:", err);
    return {
      totalEnvios: 0,
      artistasUnicos: 0,
      enviosRecentes: 0,
      porNivel: { iniciante: 0, intermediario: 0, avancado: 0 },
      porDesafio: { diario: 0, semanal: 0, mensal: 0, livre: 0 },
      ultimosEnvios: [],
    };
  }
};

// ========================
// FUNÇÕES DE VOTAÇÃO (mantidas para funcionalidade futura)
// ========================
export const buscarVotacaoAtiva = async () => {
  try {
    const { data, error } = await supabase
      .from("votacoes")
      .select(
        `
        *,
        votacao_artes (
          *,
          envios (*)
        )
      `
      )
      .eq("ativa", true)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  } catch (err) {
    console.error("Erro ao buscar votação ativa:", err);
    return null;
  }
};

export const criarVotacaoSemanal = async (
  artesIds,
  titulo = "Votação Semanal"
) => {
  try {
    // 1. Cria a votação
    const dataInicio = new Date();
    const dataFim = new Date();
    dataFim.setDate(dataFim.getDate() + 7); // 7 dias de duração

    const { data: votacao, error: erroVotacao } = await supabase
      .from("votacoes")
      .insert([
        {
          titulo,
          data_inicio: dataInicio.toISOString(),
          data_fim: dataFim.toISOString(),
          ativa: true,
        },
      ])
      .select()
      .single();

    if (erroVotacao) throw erroVotacao;

    // 2. Adiciona as artes à votação
    const votacaoArtes = artesIds.map((arteId) => ({
      votacao_id: votacao.id,
      envio_id: arteId,
      votos: 0,
    }));

    const { error: erroArtes } = await supabase
      .from("votacao_artes")
      .insert(votacaoArtes);

    if (erroArtes) throw erroArtes;

    return votacao;
  } catch (err) {
    console.error("Erro ao criar votação semanal:", err);
    throw err;
  }
};

export const votarEmArte = async (votacaoArteId, identificadorVotante) => {
  try {
    // Verifica se já votou
    const { data: jaVotou } = await supabase
      .from("votos")
      .select("id")
      .eq("votacao_arte_id", votacaoArteId)
      .eq("identificador_votante", identificadorVotante)
      .single();

    if (jaVotou) {
      throw new Error("Você já votou nesta arte!");
    }

    // Registra o voto
    const { error: erroVoto } = await supabase.from("votos").insert([
      {
        votacao_arte_id: votacaoArteId,
        identificador_votante,
        created_at: new Date().toISOString(),
      },
    ]);

    if (erroVoto) throw erroVoto;

    // Incrementa contador de votos
    const { error: erroIncremento } = await supabase.rpc("incrementar_votos", {
      votacao_arte_id: votacaoArteId,
    });

    if (erroIncremento) throw erroIncremento;

    return true;
  } catch (err) {
    console.error("Erro ao votar:", err);
    throw err;
  }
};

export const finalizarVotacao = async (votacaoId) => {
  try {
    const { error } = await supabase
      .from("votacoes")
      .update({ ativa: false })
      .eq("id", votacaoId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Erro ao finalizar votação:", err);
    throw err;
  }
};
