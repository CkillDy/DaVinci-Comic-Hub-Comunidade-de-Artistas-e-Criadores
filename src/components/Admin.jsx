import React, { useState, useEffect } from 'react'
import { Eye, Trash2, RefreshCw, BarChart3, Trophy } from 'lucide-react'
import { buscarTodosEnvios, removerEnvio, supabase } from '../hooks/superbase'

// FUNÇÃO PARA BUSCAR RESULTADOS DAS VOTAÇÕES - CORRIGIDA
const buscarResultadosVotacoes = async () => {
  try {
    // Busca todas as votações (ativas e inativas)
    const { data: votacoes, error: votacoesError } = await supabase
      .from('votacoes')
      .select('*')
      .order('created_at', { ascending: false })

    if (votacoesError) throw votacoesError

    // Para cada votação, busca os resultados
    const resultadosCompletos = await Promise.all(
      votacoes.map(async votacao => {
        // Busca todos os votos desta votação - CORREÇÃO: created_at em vez de data_voto
        const { data: votos, error: votosError } = await supabase
          .from('votos')
          .select(
            `
            arte_id,
            nome_eleitor,
            created_at
          `
          )
          .eq('votacao_id', votacao.id)

        if (votosError) throw votosError

        // Busca informações das artes votadas
        const artesIds = [...new Set(votos.map(v => v.arte_id))]

        if (artesIds.length === 0) {
          return {
            ...votacao,
            resultados: { Iniciante: [], Intermediário: [], Avançado: [] },
            totalVotos: 0,
            totalVotantes: 0,
            participantes: 0
          }
        }

        const { data: artes, error: artesError } = await supabase
          .from('envios')
          .select('*')
          .in('id', artesIds)

        if (artesError) throw artesError

        // Processa os resultados
        const resultados = {}
        votos.forEach(voto => {
          const arte = artes.find(a => a.id === voto.arte_id)
          if (arte) {
            const key = `${arte.id}_${arte.nivel}`
            if (!resultados[key]) {
              resultados[key] = {
                arte,
                votos: 0,
                nivel: arte.nivel,
                votantes: []
              }
            }
            resultados[key].votos++
            resultados[key].votantes.push({
              nome: voto.nome_eleitor,
              data: voto.created_at // CORREÇÃO: created_at em vez de data_voto
            })
          }
        })

        // Separa por nível e ordena
        const porNivel = {
          Iniciante: Object.values(resultados)
            .filter(r => r.nivel === 'Iniciante')
            .sort((a, b) => b.votos - a.votos),
          Intermediário: Object.values(resultados)
            .filter(r => r.nivel === 'Intermediário')
            .sort((a, b) => b.votos - a.votos),
          Avançado: Object.values(resultados)
            .filter(r => r.nivel === 'Avançado')
            .sort((a, b) => b.votos - a.votos)
        }

        return {
          ...votacao,
          resultados: porNivel,
          totalVotos: votos.length,
          totalVotantes: [...new Set(votos.map(v => v.nome_eleitor))].length,
          participantes: artesIds.length
        }
      })
    )

    return resultadosCompletos
  } catch (error) {
    console.error('Erro ao buscar resultados:', error)
    throw error
  }
}

// COMPONENTE DE GRÁFICO DE BARRAS
const GraficoBarras = ({ dados, titulo, nivel }) => {
  const cores = {
    Iniciante: '#4CAF50',
    Intermediário: '#FF9800',
    Avançado: '#F44336'
  }

  const corNivel = cores[nivel] || '#667eea'
  const maxVotos = Math.max(...dados.map(d => d.votos), 1)

  return (
    <div className='grafico-container'>
      <h4 className='grafico-titulo' style={{ color: corNivel }}>
        {titulo}
      </h4>

      {dados.length === 0 ? (
        <div className='sem-dados'>
          <p>Nenhum voto registrado neste nível</p>
        </div>
      ) : (
        <div className='barras-container'>
          {dados.slice(0, 5).map((item, index) => {
            const porcentagem = (item.votos / maxVotos) * 100
            const posicao = index + 1

            return (
              <div key={item.arte.id} className='barra-item'>
                <div className='barra-info'>
                  <div
                    className='posicao-badge'
                    style={{ backgroundColor: corNivel }}
                  >
                    {posicao === 1
                      ? '🏆'
                      : posicao === 2
                      ? '🥈'
                      : posicao === 3
                      ? '🥉'
                      : posicao}
                  </div>

                  <div className='artista-info'>
                    <div className='artista-avatar'>
                      <img
                        src={item.arte.arquivo_url}
                        alt={`Arte de ${item.arte.nome}`}
                        className='mini-arte'
                        onError={e => {
                          e.target.src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23ddd'/%3E%3Ctext x='20' y='25' text-anchor='middle' font-size='12' fill='%23999'%3E?%3C/text%3E%3C/svg%3E"
                        }}
                      />
                    </div>
                    <div className='artista-detalhes'>
                      <span className='artista-nome'>{item.arte.nome}</span>
                      <span className='votos-count'>
                        {item.votos} voto{item.votos !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                <div className='barra-visual'>
                  <div
                    className='barra-progresso'
                    style={{
                      width: `${porcentagem}%`,
                      backgroundColor: corNivel,
                      opacity: 1 - index * 0.15
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// COMPONENTE DE RESULTADOS
const ResultadosVotacao = () => {
  const [votacoes, setVotacoes] = useState([])
  const [votacaoSelecionada, setVotacaoSelecionada] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    carregarResultados()
  }, [])

  const carregarResultados = async () => {
    try {
      setLoading(true)
      const dados = await buscarResultadosVotacoes()
      setVotacoes(dados)
      if (dados.length > 0) {
        setVotacaoSelecionada(dados[0])
      }
    } catch (err) {
      setError('Erro ao carregar resultados das votações')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='loading-state'>
        <BarChart3 className='animate-spin' size={32} />
        <p>Carregando resultados...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className='error-state'>
        <p>{error}</p>
        <button onClick={carregarResultados} className='btn btn--primary'>
          Tentar Novamente
        </button>
      </div>
    )
  }

  if (votacoes.length === 0) {
    return (
      <div className='empty-state'>
        <Trophy size={48} />
        <h3>Nenhuma votação encontrada</h3>
        <p>Crie uma votação para ver os resultados aqui</p>
      </div>
    )
  }

  return (
    <div className='resultados-container'>
      <div className='resultados-header'>
        <h3 className='tab-title'>
          <Trophy size={24} />
          Resultados das Votações
        </h3>

        <div className='votacao-selector'>
          <label htmlFor='votacao-select'>Selecionar Votação:</label>
          <select
            id='votacao-select'
            value={votacaoSelecionada?.id || ''}
            onChange={e => {
              const votacao = votacoes.find(
                v => v.id === parseInt(e.target.value)
              )
              setVotacaoSelecionada(votacao)
            }}
            className='select-input'
          >
            {votacoes.map(votacao => (
              <option key={votacao.id} value={votacao.id}>
                {votacao.titulo} -{' '}
                {new Date(votacao.created_at).toLocaleDateString('pt-BR')}
                {votacao.ativa && ' (Ativa)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {votacaoSelecionada && (
        <>
          {/* Estatísticas Gerais */}
          <div className='stats-grid'>
            <div className='stat-card stat-card--blue'>
              <div className='stat-content'>
                <div className='stat-info'>
                  <p className='stat-label'>Total de Votos</p>
                  <p className='stat-value'>{votacaoSelecionada.totalVotos}</p>
                </div>
                <div className='stat-icon'>🗳️</div>
              </div>
            </div>

            <div className='stat-card stat-card--green'>
              <div className='stat-content'>
                <div className='stat-info'>
                  <p className='stat-label'>Votantes Únicos</p>
                  <p className='stat-value'>
                    {votacaoSelecionada.totalVotantes}
                  </p>
                </div>
                <div className='stat-icon'>👥</div>
              </div>
            </div>

            <div className='stat-card stat-card--purple'>
              <div className='stat-content'>
                <div className='stat-info'>
                  <p className='stat-label'>Artes Participantes</p>
                  <p className='stat-value'>
                    {votacaoSelecionada.participantes}
                  </p>
                </div>
                <div className='stat-icon'>🎨</div>
              </div>
            </div>
          </div>

          {/* Gráficos por Nível */}
          <div className='graficos-niveis'>
            <GraficoBarras
              dados={votacaoSelecionada.resultados['Iniciante'] || []}
              titulo='🏆 Ranking Iniciante'
              nivel='Iniciante'
            />

            <GraficoBarras
              dados={votacaoSelecionada.resultados['Intermediário'] || []}
              titulo='🏆 Ranking Intermediário'
              nivel='Intermediário'
            />

            <GraficoBarras
              dados={votacaoSelecionada.resultados['Avançado'] || []}
              titulo='🏆 Ranking Avançado'
              nivel='Avançado'
            />
          </div>

          {/* Status da Votação */}
          <div className='votacao-status'>
            <div
              className={`status-badge ${
                votacaoSelecionada.ativa ? 'ativa' : 'encerrada'
              }`}
            >
              {votacaoSelecionada.ativa
                ? '🔴 Votação Ativa'
                : '✅ Votação Encerrada'}
            </div>
            <p className='votacao-data'>
              Criada em:{' '}
              {new Date(votacaoSelecionada.created_at).toLocaleString('pt-BR')}
            </p>
          </div>
        </>
      )}
    </div>
  )
}

// COMPONENTE ADMIN PRINCIPAL
const Admin = ({
  setEnvioAtivo,
  setVotacaoAtiva,
  envioAtivo,
  votacaoAtiva
}) => {
  const [pass, setPass] = useState('')
  const [auth, setAuth] = useState(() => {
    return localStorage.getItem('adminAuth') === 'true'
  })
  const [activeTab, setActiveTab] = useState('controles')
  const [previewImage, setPreviewImage] = useState(null)

  // Estados para dados do Supabase
  const [artes, setArtes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estados para as funcionalidades
  const [termoPesquisa, setTermoPesquisa] = useState('')
  const [artesFiltradas, setArtesFiltradas] = useState([])

  // ADICIONAR ESTES ESTADOS NO COMPONENTE ADMIN (após os outros useState)

  const [desafioFiltro, setDesafioFiltro] = useState('')

  // SUBSTITUIR o useEffect de filtragem existente por este:
  useEffect(() => {
    let filtradas = artes

    // Filtro por desafio
    if (desafioFiltro) {
      filtradas = filtradas.filter(arte => arte.desafio === desafioFiltro)
    }

    // Filtro por pesquisa
    if (termoPesquisa.trim()) {
      const termo = termoPesquisa.toLowerCase()
      filtradas = filtradas.filter(
        arte =>
          arte.nome.toLowerCase().includes(termo) ||
          arte.whatsapp.includes(termo) ||
          arte.nivel.toLowerCase().includes(termo) ||
          arte.desafio.toLowerCase().includes(termo)
      )
    }

    setArtesFiltradas(filtradas)
  }, [artes, termoPesquisa, desafioFiltro])

  // ADICIONAR esta nova função para download por desafio específico
  const handleDownloadPorDesafio = async tipoDesafio => {
    const artesFiltradas = artes.filter(arte => arte.desafio === tipoDesafio)

    if (artesFiltradas.length === 0) {
      alert(`Nenhuma arte do tipo "${tipoDesafio}" encontrada!`)
      return
    }

    if (
      !confirm(
        `Deseja baixar ${artesFiltradas.length} imagens do desafio "${tipoDesafio}"?`
      )
    ) {
      return
    }

    try {
      setLoading(true)

      const JSZip = (await import('https://cdn.skypack.dev/jszip')).default
      const zip = new JSZip()

      for (let i = 0; i < artesFiltradas.length; i++) {
        const arte = artesFiltradas[i]

        try {
          const response = await fetch(arte.arquivo_url)
          const blob = await response.blob()

          const data = new Date(arte.created_at)
            .toLocaleDateString('pt-BR')
            .replace(/\//g, '-')
          const nomeArquivo = `${arte.nome}_${arte.nivel}_${data}.jpg`

          zip.file(nomeArquivo, blob)
        } catch (err) {
          console.error(`Erro ao baixar arte de ${arte.nome}:`, err)
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(zipBlob)
      link.download = `Desafio_${tipoDesafio}_${new Date()
        .toLocaleDateString('pt-BR')
        .replace(/\//g, '-')}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(link.href)

      alert(
        `ZIP do desafio "${tipoDesafio}" baixado com ${artesFiltradas.length} imagens!`
      )
    } catch (err) {
      console.error('Erro ao criar ZIP:', err)
      alert('Erro ao criar arquivo ZIP. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Estatísticas calculadas
  const stats = React.useMemo(() => {
    const artistasUnicos = [...new Set(artes.map(arte => arte.nome))].length

    const agora = new Date()
    const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000)
    const enviosRecentes = artes.filter(
      arte => new Date(arte.created_at) >= seteDiasAtras
    ).length

    const porNivel = {
      iniciante: artes.filter(e => e.nivel === 'Iniciante').length,
      intermediario: artes.filter(e => e.nivel === 'Intermediário').length,
      avancado: artes.filter(e => e.nivel === 'Avançado').length
    }

    const porDesafio = {
      diario: artes.filter(e => e.desafio === 'Diário').length,
      semanal: artes.filter(e => e.desafio === 'Semanal').length,
      livre: artes.filter(e => e.desafio === 'livre').length
    }

    return {
      totalArtes: artes.length,
      artistasUnicos,
      enviosRecentes,
      porNivel,
      porDesafio
    }
  }, [artes])

  // useEffect para filtrar artes
  useEffect(() => {
    if (!termoPesquisa.trim()) {
      setArtesFiltradas(artes)
    } else {
      const filtradas = artes.filter(
        arte =>
          arte.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
          arte.whatsapp.includes(termoPesquisa) ||
          arte.nivel.toLowerCase().includes(termoPesquisa.toLowerCase()) ||
          arte.desafio.toLowerCase().includes(termoPesquisa.toLowerCase())
      )
      setArtesFiltradas(filtradas)
    }
  }, [artes, termoPesquisa])

  // FUNÇÃO MELHORADA PARA DOWNLOAD EM ZIP
  const handleDownloadAll = async () => {
    if (artesFiltradas.length === 0) {
      alert('Nenhuma arte para baixar!')
      return
    }

    if (!confirm(`Deseja baixar ${artesFiltradas.length} imagens em ZIP?`))
      return

    try {
      setLoading(true)

      // Importar JSZip dinamicamente
      const JSZip = (await import('https://cdn.skypack.dev/jszip')).default
      const zip = new JSZip()

      // Determinar nome do desafio mais comum
      const desafios = artesFiltradas.map(arte => arte.desafio)
      const desafioMaisComum = desafios.reduce((a, b) =>
        desafios.filter(v => v === a).length >=
        desafios.filter(v => v === b).length
          ? a
          : b
      )

      // Baixar e adicionar cada imagem ao ZIP
      for (let i = 0; i < artesFiltradas.length; i++) {
        const arte = artesFiltradas[i]

        try {
          const response = await fetch(arte.arquivo_url)
          const blob = await response.blob()

          // Nome do arquivo: Nome_Nivel_Data.jpg
          const data = new Date(arte.created_at)
            .toLocaleDateString('pt-BR')
            .replace(/\//g, '-')
          const nomeArquivo = `${arte.nome}_${arte.nivel}_${data}.jpg`

          zip.file(nomeArquivo, blob)
        } catch (err) {
          console.error(`Erro ao baixar arte de ${arte.nome}:`, err)
        }
      }

      // Gerar e baixar o ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' })

      const link = document.createElement('a')
      link.href = URL.createObjectURL(zipBlob)
      link.download = `Desafio_${desafioMaisComum}_${new Date()
        .toLocaleDateString('pt-BR')
        .replace(/\//g, '-')}.zip`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(link.href)

      alert(`ZIP baixado com ${artesFiltradas.length} imagens!`)
    } catch (err) {
      console.error('Erro ao criar ZIP:', err)
      alert('Erro ao criar arquivo ZIP. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleExcluirTodos = async () => {
    if (artes.length === 0) {
      alert('Nenhuma arte para excluir!')
      return
    }

    const confirmacao = confirm(
      `ATENÇÃO: Deseja EXCLUIR todas as ${artes.length} artes?\n\nEsta ação NÃO PODE ser desfeita!`
    )

    if (!confirmacao) return

    const segundaConfirmacao = confirm(
      'ÚLTIMA CONFIRMAÇÃO: Tem CERTEZA ABSOLUTA?\n\nTodas as artes serão perdidas!'
    )

    if (!segundaConfirmacao) return

    try {
      setLoading(true)

      for (const arte of artes) {
        await removerEnvio(arte.id)
      }

      setArtes([])
      setArtesFiltradas([])
      alert('Todas as artes foram excluídas!')
    } catch (err) {
      console.error('Erro ao excluir:', err)
      alert('Erro ao excluir. Recarregue a página.')
      carregarArtes()
    } finally {
      setLoading(false)
    }
  }

  // Carregar todas as artes
  const carregarArtes = async () => {
    setLoading(true)
    setError(null)
    try {
      const artesData = await buscarTodosEnvios()
      setArtes(artesData)
    } catch (err) {
      console.error('Erro ao carregar artes:', err)
      setError('Erro ao carregar dados do servidor')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (auth) {
      carregarArtes()
    }
  }, [auth])

  const login = e => {
    e.preventDefault()
    if (pass === 'cknymos0101') {
      setAuth(true)
      localStorage.setItem('adminAuth', 'true')
    } else {
      alert('Senha incorreta!')
    }
  }

  // Remover arte específica
  const removerArte = async arte => {
    if (
      confirm(
        `Tem certeza que deseja REMOVER PERMANENTEMENTE a arte de "${arte.nome}"?`
      )
    ) {
      setLoading(true)
      try {
        await removerEnvio(arte.id)
        setArtes(prev => prev.filter(a => a.id !== arte.id))
        alert('Arte removida com sucesso!')
      } catch (err) {
        console.error('Erro ao remover arte:', err)
        alert('Erro ao remover arte. Tente novamente.')
      } finally {
        setLoading(false)
      }
    }
  }

  const logout = () => {
    if (confirm('Deseja sair do painel administrativo?')) {
      setAuth(false)
      setPass('')
      setActiveTab('controles')
      localStorage.removeItem('adminAuth')
    }
  }

  if (!auth) {
    return (
      <div className='login-container'>
        <div className='login-card'>
          <div className='login-header'>
            <div className='login-icon'>🔐</div>
            <h2 className='login-title'>Acesso Administrativo</h2>
          </div>
          <form onSubmit={login} className='login-form'>
            <input
              className='input input--primary'
              type='password'
              onChange={e => setPass(e.target.value)}
              placeholder='Digite a senha de acesso'
              value={pass}
            />
            <button className='btn btn--primary btn--full'>🔑 Entrar</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className='admin-container'>
      {/* Header */}
      <header className='admin-header'>
        <div className='container'>
          <div className='header-content'>
            <h1 className='admin-title'>⚙️ Painel Administrativo</h1>
            <div className='header-actions'>
              <button
                onClick={carregarArtes}
                className='btn btn--secondary'
                disabled={loading}
              >
                <RefreshCw
                  size={16}
                  className={loading ? 'animate-spin' : ''}
                />
                Atualizar
              </button>
              <button onClick={logout} className='btn btn--danger'>
                🚪 Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className='container admin-main'>
        {/* Mensagem de Erro */}
        {error && (
          <div className='error-banner'>
            <p>❌ {error}</p>
            <button onClick={carregarArtes} className='btn btn--small'>
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Tabs */}
        <div className='tabs-container'>
          <nav className='tabs-nav'>
            {[
              { id: 'controles', label: '🎛️ Controles' },
              { id: 'artes', label: '🎨 Desenhos', count: artes.length },
              { id: 'stats', label: '📊 Estatísticas' },
              { id: 'resultados', label: '🏆 Resultados' }
            ].map(tab => (
              <button
                key={tab.id}
                className={`tab-btn ${
                  activeTab === tab.id ? 'tab-btn--active' : ''
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label} {tab.count !== undefined && `(${tab.count})`}
              </button>
            ))}
          </nav>

          <div className='tab-content'>
            {/* Tab Controles */}
            {activeTab === 'controles' && (
              <div className='controles-tab'>
                <div className='controls-panel'>
                  <h3 className='panel-title'>🎛️ Controles do Sistema</h3>
                  <div className='controls-buttons'>
                    <button
                      className={`btn btn--status ${
                        envioAtivo
                          ? 'btn--status-active'
                          : 'btn--status-inactive'
                      }`}
                      onClick={() => setEnvioAtivo(e => !e)}
                    >
                      {envioAtivo
                        ? '✅ Envios Ativos'
                        : '❌ Envios Desativados'}
                    </button>
                    <button
                      className={`btn btn--status ${
                        votacaoAtiva
                          ? 'btn--status-active'
                          : 'btn--status-inactive'
                      }`}
                      onClick={() => setVotacaoAtiva(v => !v)}
                    >
                      {votacaoAtiva
                        ? '✅ Votação Ativa'
                        : '❌ Votação Desativada'}
                    </button>
                  </div>
                </div>

                {/* Status do Sistema */}
                <div className='stats-section'>
                  <h4 className='section-title'>⚡ Status Atual</h4>
                  <div className='system-status'>
                    <div className='status-item'>
                      <div
                        className={`status-indicator ${
                          envioAtivo
                            ? 'status-indicator--active'
                            : 'status-indicator--inactive'
                        }`}
                      ></div>
                      <div className='status-details'>
                        <p className='status-name'>Sistema de Envios</p>
                        <p className='status-description'>
                          {envioAtivo
                            ? 'Funcionando normalmente'
                            : 'Desativado pelo administrador'}
                        </p>
                      </div>
                    </div>
                    <div className='status-item'>
                      <div
                        className={`status-indicator ${
                          votacaoAtiva
                            ? 'status-indicator--active'
                            : 'status-indicator--inactive'
                        }`}
                      ></div>
                      <div className='status-details'>
                        <p className='status-name'>Sistema de Votação</p>
                        <p className='status-description'>
                          {votacaoAtiva
                            ? 'Funcionando normalmente'
                            : 'Desativado pelo administrador'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'artes' && (
              <div className='artes-tab'>
                {/* Barra de Pesquisa */}
                <div className='search-bar-container'>
                  <input
                    type='text'
                    className='search-input'
                    placeholder='🔍 Buscar por nome, WhatsApp, nível ou desafio...'
                    value={termoPesquisa}
                    onChange={e => setTermoPesquisa(e.target.value)}
                  />
                  {termoPesquisa && (
                    <button
                      className='search-clear-btn'
                      onClick={() => setTermoPesquisa('')}
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Filtros por Desafio */}
                <div className='desafio-filters'>
                  <button
                    className={`filter-chip ${!desafioFiltro ? 'active' : ''}`}
                    onClick={() => setDesafioFiltro('')}
                  >
                    📚 Todos ({artes.length})
                  </button>
                  <button
                    className={`filter-chip ${
                      desafioFiltro === 'Diário' ? 'active' : ''
                    }`}
                    onClick={() => setDesafioFiltro('Diário')}
                  >
                    ☀️ Diários (
                    {artes.filter(a => a.desafio === 'Diário').length})
                  </button>
                  <button
                    className={`filter-chip ${
                      desafioFiltro === 'Semanal' ? 'active' : ''
                    }`}
                    onClick={() => setDesafioFiltro('Semanal')}
                  >
                    📅 Semanais (
                    {artes.filter(a => a.desafio === 'Semanal').length})
                  </button>
                  <button
                    className={`filter-chip ${
                      desafioFiltro === 'livre' ? 'active' : ''
                    }`}
                    onClick={() => setDesafioFiltro('livre')}
                  >
                    🎨 Livres ({artes.filter(a => a.desafio === 'livre').length}
                    )
                  </button>
                </div>

                {/* Info de Resultados */}
                {(termoPesquisa || desafioFiltro) && (
                  <div className='search-result-info'>
                    Exibindo {artesFiltradas.length} de {artes.length} desenhos
                    {desafioFiltro && ` • Filtro: ${desafioFiltro}`}
                    {termoPesquisa && ` • Pesquisa: "${termoPesquisa}"`}
                  </div>
                )}

                {/* Ações em Lote */}
                <div className='artes-actions'>
                  <button
                    onClick={handleDownloadAll}
                    className='btn btn--secondary'
                    disabled={loading || artesFiltradas.length === 0}
                  >
                    📦 Baixar Selecionados ({artesFiltradas.length})
                  </button>

                  {desafioFiltro && (
                    <button
                      onClick={() => handleDownloadPorDesafio(desafioFiltro)}
                      className='btn btn--secondary'
                      disabled={loading}
                    >
                      💾 Baixar "{desafioFiltro}"
                    </button>
                  )}

                  <button
                    onClick={handleExcluirTodos}
                    className='btn btn--danger'
                    disabled={loading || artes.length === 0}
                  >
                    🗑️ Excluir Todos ({artes.length})
                  </button>
                </div>

                {/* Grid de Artes */}
                {loading ? (
                  <div className='loading-state'>
                    <div className='spinner'></div>
                    <p>Carregando desenhos...</p>
                  </div>
                ) : artesFiltradas.length === 0 ? (
                  <div className='empty-state'>
                    <div className='empty-icon'>🎨</div>
                    <h3>Nenhum desenho encontrado</h3>
                    <p>
                      {termoPesquisa || desafioFiltro
                        ? 'Tente ajustar os filtros de busca'
                        : 'Ainda não há desenhos enviados'}
                    </p>
                  </div>
                ) : (
                  <div className='envios-grid'>
                    {artesFiltradas.map(arte => (
                      <div key={arte.id} className='envio-card'>
                        <div className='envio-image'>
                          <img
                            src={arte.arquivo_url}
                            alt={`Arte de ${arte.nome}`}
                            loading='lazy'
                          />
                          <button
                            className='btn--preview'
                            onClick={() => setPreviewImage(arte.arquivo_url)}
                            title='Visualizar'
                          >
                            <Eye size={16} />
                          </button>
                        </div>

                        <div className='envio-content'>
                          <h3 className='envio-title'>{arte.nome}</h3>

                          <div className='envio-info'>
                            <p>
                              <strong>📱 WhatsApp:</strong> {arte.whatsapp}
                            </p>
                            <p>
                              <strong>📊 Nível:</strong>
                              <span
                                className={`tag tag--${arte.nivel.toLowerCase()}`}
                              >
                                {arte.nivel}
                              </span>
                            </p>
                            <p>
                              <strong>🎯 Desafio:</strong>
                              <span className={`tag tag--desafio`}>
                                {arte.desafio}
                              </span>
                            </p>
                            <p>
                              <strong>📅 Enviado:</strong>
                              {new Date(arte.created_at).toLocaleDateString(
                                'pt-BR'
                              )}
                            </p>
                          </div>

                          <button
                            onClick={() => removerArte(arte)}
                            className='btn btn--danger btn--small btn--full'
                            disabled={loading}
                          >
                            <Trash2 size={14} />
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Modal de Preview */}
            {previewImage && (
              <div
                className='preview-modal'
                onClick={() => setPreviewImage(null)}
              >
                <div
                  className='preview-content'
                  onClick={e => e.stopPropagation()}
                >
                  <button
                    className='preview-close'
                    onClick={() => setPreviewImage(null)}
                  >
                    ✕
                  </button>
                  <img src={previewImage} alt='Preview' />
                </div>
              </div>
            )}
            {/* Tab Estatísticas */}
            {activeTab === 'stats' && (
              <div className='stats-tab'>
                <h3 className='tab-title'>
                  <BarChart3 size={24} />
                  Estatísticas da Galeria
                </h3>

                {/* Cards Principais */}
                <div className='stats-grid'>
                  <div className='stat-card stat-card--blue'>
                    <div className='stat-content'>
                      <div className='stat-info'>
                        <p className='stat-label'>Total de Artes</p>
                        <p className='stat-value'>{stats.totalArtes}</p>
                      </div>
                      <div className='stat-icon'>🎨</div>
                    </div>
                  </div>

                  <div className='stat-card stat-card--green'>
                    <div className='stat-content'>
                      <div className='stat-info'>
                        <p className='stat-label'>Artistas Únicos</p>
                        <p className='stat-value'>{stats.artistasUnicos}</p>
                      </div>
                      <div className='stat-icon'>👥</div>
                    </div>
                  </div>

                  <div className='stat-card stat-card--purple'>
                    <div className='stat-content'>
                      <div className='stat-info'>
                        <p className='stat-label'>Últimos 7 dias</p>
                        <p className='stat-value'>{stats.enviosRecentes}</p>
                      </div>
                      <div className='stat-icon'>📈</div>
                    </div>
                  </div>
                </div>

                {/* Por Nível */}
                <div className='stats-section'>
                  <h4 className='section-title'>📊 Por Nível de Experiência</h4>
                  <div className='level-stats'>
                    <div className='level-stat'>
                      <div className='level-count'>
                        {stats.porNivel.iniciante}
                      </div>
                      <div className='level-name'>Iniciante</div>
                    </div>
                    <div className='level-stat'>
                      <div className='level-count'>
                        {stats.porNivel.intermediario}
                      </div>
                      <div className='level-name'>Intermediário</div>
                    </div>
                    <div className='level-stat'>
                      <div className='level-count'>
                        {stats.porNivel.avancado}
                      </div>
                      <div className='level-name'>Avançado</div>
                    </div>
                  </div>
                </div>

                {/* Por Tipo de Desafio */}
                <div className='stats-section'>
                  <h4 className='section-title'>🎯 Por Tipo de Desafio</h4>
                  <div className='level-stats'>
                    <div className='level-stat'>
                      <div className='level-count'>
                        {stats.porDesafio.diario}
                      </div>
                      <div className='level-name'>Diário</div>
                    </div>
                    <div className='level-stat'>
                      <div className='level-count'>
                        {stats.porDesafio.semanal}
                      </div>
                      <div className='level-name'>Semanal</div>
                    </div>
                    <div className='level-stat'>
                      <div className='level-count'>
                        {stats.porDesafio.livre}
                      </div>
                      <div className='level-name'>Livre</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Tab Resultados */}
            {activeTab === 'resultados' && (
              <div className='resultados-tab'>
                <ResultadosVotacao />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Preview */}
      {previewImage && (
        <div className='modal-overlay' onClick={() => setPreviewImage(null)}>
          <div className='modal-content'>
            <img className='modal-image' src={previewImage} alt='Preview' />
            <button
              onClick={() => setPreviewImage(null)}
              className='modal-close'
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Admin
