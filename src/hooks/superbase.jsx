import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ajtdyjlzwpzqfqhkbrzj.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqdGR5amx6d3B6cWZxaGticnpqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg1MDYzNDIsImV4cCI6MjA3NDA4MjM0Mn0.g0hxkZrZ5jiEMsIK1RU0QVuI4LWgXZD56HWrcyNcslk";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  db: {
    // Adicione esta linha para garantir que o schema padrão 'public' seja usado
    schema: "public",
  },
});

export const uploadArquivo = async (file, bucket = "desenhos") => {
    if (!file) return null;

    // --- CORREÇÃO AQUI: Sanitização do nome do arquivo ---
    const originalFileName = file.name;
    const sanitizedFileName = originalFileName
        .normalize("NFD") // Decompõe caracteres acentuados (á -> a´)
        .replace(/[\u0300-\u036f]/g, "") // Remove os diacríticos (a´ -> a)
        .replace(/[^a-zA-Z0-9.\-]/g, "_") // Substitui tudo que não é letra/número/ponto/hífen por _
        .toLowerCase();
    const fileName = `uploads/${Date.now()}_${sanitizedFileName}`;
    // --------------------------------------------------------

    try {
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(fileName, file);

        if (uploadError) {
            console.error("❌ Erro no upload Supabase Storage:", uploadError);
            // Agora este erro virá apenas por permissão (400/403) ou outro problema
            throw new Error(`Falha no upload do arquivo: ${uploadError.message}`);
        }

        const { data: publicData } = supabase.storage
            .from(bucket)
            .getPublicUrl(fileName);

        if (!publicData?.publicUrl) {
            console.error("❌ Erro ao obter URL pública após upload.");
            throw new Error("O arquivo foi enviado, mas não foi possível gerar a URL pública.");
        }

        return publicData.publicUrl;
    } catch (err) {
        console.error("Erro inesperado no upload:", err);
        throw err;
    }
};
// ========================
// FUNÇÃO DE DEBUG - TESTE DE CONEXÃO
// ========================
export const testarConexao = async () => {
  try {
    console.log("🧪 Testando conexão com Supabase...");
    console.log("📍 URL:", SUPABASE_URL);

    const { data: tableInfo, error: tableError } = await supabase
      .from("envios")
      .select("*")
      .limit(1);

    if (tableError) {
      console.error("❌ Erro ao acessar tabela 'envios':", tableError);
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

// ============= FUNÇÕES DE ENVIO (mantidas como estão) =============

export const criarEnvio = async (dadosEnvio) => {
    try {
        // 1. INSERT no Banco de Dados (Database)
        const { error } = await supabase.from("envios").insert([
            {
                nome: dadosEnvio.nome,
                whatsapp: dadosEnvio.whatsapp,
                nivel: dadosEnvio.nivel,
                desafio: dadosEnvio.desafio,
                arquivo_url: dadosEnvio.arquivo_url,
            },
        ]);

        if (error) {
            console.error("❌ Erro Supabase ao salvar envio:", error);
            throw new Error(`Falha ao salvar no banco: ${error.message}`);
        }
        return true;
    } catch (err) {
        console.error("Erro ao criar envio:", err);
        throw err;
    }
};

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

// Aliases para manter compatibilidade
export const salvarEnvio = criarEnvio;
export const aprovarEnvio = async (id) => {
  try {
    const { data, error } = await supabase
      .from("envios")
      .update({ aprovado: true })
      .eq("id", id)
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Erro ao aprovar envio:", error);
    throw error;
  }
};

export const rejeitarEnvio = removerEnvio;

// ============= FUNÇÕES DE VOTAÇÃO (simplificadas) =============

export const criarVotacaoSemanal = async (artesIds, titulo) => {
  try {
    console.log("Iniciando criação de votação...", { artesIds, titulo });

    // 1. Desativa votações anteriores (se existir alguma)
    try {
      await supabase
        .from("votacoes")
        .update({ ativa: false })
        .eq("ativa", true);
    } catch (err) {
      console.log("Nenhuma votação anterior para desativar");
    }

    // 2. Remove marca de votação de artes anteriores
    try {
      await supabase
        .from("envios")
        .update({ em_votacao: false })
        .eq("em_votacao", true);
    } catch (err) {
      console.log("Nenhuma arte anterior marcada");
    }

    // 3. Criar nova votação (sem created_at manual)
    const { data: votacao, error: votacaoError } = await supabase
      .from("votacoes")
      .insert([
        {
          titulo: titulo,
          ativa: true,
        },
      ])
      .select()
      .single();

    if (votacaoError) {
      console.error("Erro ao inserir votação:", votacaoError);
      throw votacaoError;
    }

    console.log("Votação criada:", votacao);

    // 4. Marcar artes selecionadas (uma por vez para debug)
    for (const arteId of artesIds) {
      const { error: arteError } = await supabase
        .from("envios")
        .update({ em_votacao: true })
        .eq("id", arteId);

      if (arteError) {
        console.error(`Erro ao marcar arte ${arteId}:`, arteError);
        throw arteError;
      }
    }

    console.log("Votação criada com sucesso:", votacao);
    return votacao;
  } catch (error) {
    console.error("Erro ao criar votação semanal:", error);
    throw error;
  }
};

export const buscarVotacaoAtiva = async () => {
  try {
    // 1. Busca votação ativa
    const { data: votacao, error: votacaoError } = await supabase
      .from("votacoes")
      .select("*")
      .eq("ativa", true)
      .single();

    if (votacaoError && votacaoError.code !== "PGRST116") {
      throw votacaoError;
    }

    if (!votacao) {
      return null; // Sem votação ativa
    }

    // 2. Busca artes em votação (sem filtro de aprovado por enquanto)
    const { data: artes, error: artesError } = await supabase
      .from("envios")
      .select("*")
      .eq("em_votacao", true);

    if (artesError) throw artesError;

    // 3. Conta votos para cada arte
    const artesComVotos = await Promise.all(
      (artes || []).map(async (arte) => {
        const { count, error: countError } = await supabase
          .from("votos")
          .select("*", { count: "exact" })
          .eq("arte_id", arte.id)
          .eq("votacao_id", votacao.id);

        if (countError) {
          console.error("Erro ao contar votos:", countError);
        }

        return {
          id: `votacao_arte_${arte.id}`, // ID único para o componente
          arte_id: arte.id,
          envios: arte,
          votos: count || 0,
        };
      })
    );

    return {
      ...votacao,
      votacao_artes: artesComVotos,
    };
  } catch (error) {
    console.error("Erro ao buscar votação ativa:", error);
    throw error;
  }
};

export const votarEmArte = async (votoData) => {
  try {
    const { data, error } = await supabase
      .from("votos")
      .insert([
        {
          whatsapp_eleitor: votoData.whatsapp_eleitor,
          email_eleitor: votoData.email_eleitor,
          nome_eleitor: votoData.nome_eleitor,
          votacao_id: votoData.votacao_id,
          arte_id: votoData.arte_id,
          nivel_arte: votoData.nivel_arte,
        },
      ])
      .select();

    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error("Erro ao registrar voto:", error);
    throw error;
  }
};

export const verificarSeJaVotou = async (whatsapp, votacaoId) => {
  try {
    const { data, error } = await supabase
      .from("votos")
      .select("id")
      .eq("whatsapp_eleitor", whatsapp)
      .eq("votacao_id", votacaoId);

    if (error) throw error;
    return data && data.length > 0;
  } catch (error) {
    console.error("Erro ao verificar voto:", error);
    return false;
  }
};

export const encerrarVotacao = async (votacaoId) => {
  try {
    const { data, error } = await supabase
      .from("votacoes")
      .update({ ativa: false })
      .eq("id", votacaoId)
      .select();

    if (error) throw error;

    // Remove marca de votação das artes
    await supabase
      .from("envios")
      .update({ em_votacao: false })
      .eq("em_votacao", true);

    return data[0];
  } catch (error) {
    console.error("Erro ao encerrar votação:", error);
    throw error;
  }
};

export const buscarResultadosVotacao = async (votacaoId) => {
  try {
    // Busca todos os votos da votação
    const { data: votos, error } = await supabase
      .from("votos")
      .select(
        `
        arte_id,
        envios (
          nome,
          nivel,
          desafio,
          arquivo_url
        )
      `
      )
      .eq("votacao_id", votacaoId);

    if (error) throw error;

    // Agrupa votos por arte
    const resultados = {};
    votos.forEach((voto) => {
      const arteId = voto.arte_id;
      if (!resultados[arteId]) {
        resultados[arteId] = {
          arte: voto.envios,
          votos: 0,
        };
      }
      resultados[arteId].votos++;
    });

    // Converte para array e ordena por votos
    return Object.values(resultados).sort((a, b) => b.votos - a.votos);
  } catch (error) {
    console.error("Erro ao buscar resultados:", error);
    throw error;
  }
};

// ========================
// FUNÇÃO PARA RESULTADOS COMPLETOS (PARA ADMIN) - CORRIGIDA
// ========================
export const buscarResultadosVotacoes = async () => {
  try {
    // Busca todas as votações (ativas e inativas)
    const { data: votacoes, error: votacoesError } = await supabase
      .from("votacoes")
      .select("*")
      .order("created_at", { ascending: false });

    if (votacoesError) throw votacoesError;

    // Para cada votação, busca os resultados
    const resultadosCompletos = await Promise.all(
      votacoes.map(async (votacao) => {
        // Busca todos os votos desta votação - CORREÇÃO AQUI
        const { data: votos, error: votosError } = await supabase
          .from("votos")
          .select(
            `
            arte_id,
            nome_eleitor,
            created_at
          `
          )
          .eq("votacao_id", votacao.id);

        if (votosError) throw votosError;

        // Busca informações das artes votadas
        const artesIds = [...new Set(votos.map((v) => v.arte_id))];

        if (artesIds.length === 0) {
          return {
            ...votacao,
            resultados: { Iniciante: [], Intermediário: [], Avançado: [] },
            totalVotos: 0,
            totalVotantes: 0,
            participantes: 0,
          };
        }

        const { data: artes, error: artesError } = await supabase
          .from("envios")
          .select("*")
          .in("id", artesIds);

        if (artesError) throw artesError;

        // Processa os resultados
        const resultados = {};
        votos.forEach((voto) => {
          const arte = artes.find((a) => a.id === voto.arte_id);
          if (arte) {
            const key = `${arte.id}_${arte.nivel}`;
            if (!resultados[key]) {
              resultados[key] = {
                arte,
                votos: 0,
                nivel: arte.nivel,
                votantes: [],
              };
            }
            resultados[key].votos++;
            resultados[key].votantes.push({
              nome: voto.nome_eleitor,
              data: voto.created_at, // CORREÇÃO: created_at em vez de data_voto
            });
          }
        });

        // Separa por nível e ordena
        const porNivel = {
          Iniciante: Object.values(resultados)
            .filter((r) => r.nivel === "Iniciante")
            .sort((a, b) => b.votos - a.votos),
          Intermediário: Object.values(resultados)
            .filter((r) => r.nivel === "Intermediário")
            .sort((a, b) => b.votos - a.votos),
          Avançado: Object.values(resultados)
            .filter((r) => r.nivel === "Avançado")
            .sort((a, b) => b.votos - a.votos),
        };

        return {
          ...votacao,
          resultados: porNivel,
          totalVotos: votos.length,
          totalVotantes: [...new Set(votos.map((v) => v.nome_eleitor))].length,
          participantes: artesIds.length,
        };
      })
    );

    return resultadosCompletos;
  } catch (error) {
    console.error("Erro ao buscar resultados das votações:", error);
    throw error;
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



export { supabase };
