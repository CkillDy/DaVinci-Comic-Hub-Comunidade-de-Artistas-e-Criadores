import { useState, useEffect, useCallback, useRef } from 'react'

export const useGitHubArts = () => {
  const [artes, setArtes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Ref para cancelar requisições se componente desmontar
  const abortControllerRef = useRef()

  // Cache simples em memória
  const cacheRef = useRef({
    data: null,
    timestamp: null,
    duration: 5 * 60 * 1000 // 5 minutos
  })

  const buscarArtes = useCallback(async (forceRefresh = false) => {
    // Verificar cache primeiro
    const cache = cacheRef.current
    const agora = Date.now()

    if (
      !forceRefresh &&
      cache.data &&
      cache.timestamp &&
      agora - cache.timestamp < cache.duration
    ) {
      setArtes(cache.data)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Cancelar requisição anterior se existir
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Novo controller para esta requisição
      abortControllerRef.current = new AbortController()

      const token =
        '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'

      const response = await fetch(
        'https://api.github.com/repos/CkillDy/davinci-dados/contents/desenhos-galeria',
        {
          headers: {
            Authorization: `token ${token}`
          },
          signal: abortControllerRef.current.signal
        }
      )

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`)
      }

      const pastas = await response.json()

      if (!Array.isArray(pastas)) {
        throw new Error('Resposta da API não é um array')
      }

      const todasArtes = []

      // Usar Promise.all para requisições paralelas (mais rápido)
      const pastasDesafio = pastas.filter(pasta => pasta.type === 'dir')

      await Promise.all(
        pastasDesafio.map(async pasta => {
          try {
            // Buscar arquivos da pasta
            const respArquivos = await fetch(pasta.url, {
              signal: abortControllerRef.current.signal
            })

            if (!respArquivos.ok) {
              console.warn(
                `Erro ao buscar pasta ${pasta.name}: ${respArquivos.status}`
              )
              return
            }

            const arquivos = await respArquivos.json()

            // Pegar só as imagens
            const imagens = arquivos.filter(
              arquivo =>
                arquivo.type === 'file' &&
                /\.(jpg|jpeg|png|gif|webp)$/i.test(arquivo.name)
            )

            // Converter para formato da galeria
            imagens.forEach((img, index) => {
              const nomeArquivo = img.name.replace(
                /\.(jpg|jpeg|png|gif|webp)$/i,
                ''
              )
              const match = nomeArquivo.match(/^(\d+)(?:\s*-\s*(.+))?$/)

              const id = match?.[1] || `${Date.now()}-${index}`
              const nomeArtista = match?.[2]?.trim() || `Artista ${id}`
              const desafio = pasta.name
                .replace(/^Desafio\s+/i, '')
                .replace(/^de\s+/i, '')
                .trim()

              todasArtes.push({
                id,
                nome: nomeArtista,
                nivel: determinarNivel(desafio),
                desafio,
                url: img.download_url,
                arquivo: img.name,
                sha: img.sha // Para controle de versão futuro
              })
            })
          } catch (err) {
            if (err.name !== 'AbortError') {
              console.warn(`Erro ao processar pasta ${pasta.name}:`, err)
            }
          }
        })
      )

      // Ordenar por ID numérico
      const artesOrdenadas = todasArtes.sort((a, b) => {
        const idA = parseInt(a.id) || 0
        const idB = parseInt(b.id) || 0
        return idA - idB
      })

      // Salvar no cache
      cacheRef.current = {
        data: artesOrdenadas,
        timestamp: agora,
        duration: cache.duration
      }

      setArtes(artesOrdenadas)
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Requisição cancelada')
        return
      }

      console.error('Erro ao buscar artes:', err)
      setError(err.message || 'Erro desconhecido ao carregar artes')

      // Em caso de erro, usar cache se disponível
      if (cacheRef.current.data) {
        setArtes(cacheRef.current.data)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  // Função para determinar nível baseado no desafio
  const determinarNivel = desafio => {
    const niveisMap = {
      asas: 'Avançado',
      'garras e chifres': 'Intermediário',
      cores: 'Iniciante',
      livre: 'Iniciante'
    }

    const desafioLower = desafio.toLowerCase()
    return niveisMap[desafioLower] || 'Iniciante'
  }

  // Função para recarregar forçando refresh
  const recarregar = useCallback(() => {
    return buscarArtes(true)
  }, [buscarArtes])

  useEffect(() => {
    buscarArtes()

    // Cleanup ao desmontar
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [buscarArtes])

  return {
    artes,
    loading,
    error,
    recarregar,
    // Informações extras úteis
    totalArtes: artes.length,
    ultimaAtualizacao: cacheRef.current.timestamp
  }
}
