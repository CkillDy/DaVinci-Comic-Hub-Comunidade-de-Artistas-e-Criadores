import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  memo,
  startTransition
} from 'react'

// ==================== 🔀 UTIL (melhor shuffle) ====================
const shuffleArray = arr => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// ==================== 🖼️ ARTE CARD ====================
const ArteCard = memo(({ arte, onClick }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const ref = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '100px' } // margem maior => carrega antes
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  const isLivre = !arte.desafio || arte.desafio === 'livre'

  return (
    <div ref={ref} className='galeria-card' onClick={onClick}>
      <div className='galeria-image-container'>
        {isVisible ? (
          <>
            {!loaded && !error && <div className='image-skeleton' />}
            {!error ? (
              <img
                src={arte.url}
                alt={`Arte de ${arte.nome}`}
                className={`galeria-image ${loaded ? 'loaded' : ''}`}
                loading='lazy'
                decoding='async'
                onLoad={() => setLoaded(true)}
                onError={() => setError(true)}
              />
            ) : (
              <div className='image-error'>
                <span>❌</span>
                <p>Erro ao carregar</p>
              </div>
            )}
            <div className='galeria-overlay'>
              <span className='preview-icon'>👁️</span>
              <span className='preview-text'>Ver arte</span>
            </div>
          </>
        ) : (
          <div className='image-skeleton' />
        )}
      </div>

      <div className='galeria-info'>
        <h4 className='galeria-artist-name'>{arte.nome}</h4>
        <p className='galeria-level'>Nível: {arte.nivel}</p>
        {isLivre ? (
          <span className='galeria-free-badge'>Arte Livre</span>
        ) : (
          <span className='galeria-challenge-badge'>{arte.desafio}</span>
        )}
      </div>
    </div>
  )
})

// ==================== 🎚️ FILTRO ====================
const FiltroGaleria = memo(({ filtros, desafios, onChange }) => (
  <div className='galeria-filtros'>
    <div className='filtro-group'>
      <label>Nível:</label>
      <select
        value={filtros.nivel}
        onChange={e => onChange('nivel', e.target.value)}
      >
        {['Todos', 'Iniciante', 'Intermediário', 'Avançado'].map(n => (
          <option key={n}>{n}</option>
        ))}
      </select>
    </div>

    <div className='filtro-group'>
      <label>Desafio:</label>
      <select
        value={filtros.desafio}
        onChange={e => onChange('desafio', e.target.value)}
      >
        {['Todos', 'Livre', ...desafios].map(d => (
          <option key={d}>{d}</option>
        ))}
      </select>
    </div>
  </div>
))

// ==================== 🪟 MODAL ====================
const Modal = memo(({ arte, total, onClose, onNavigate }) => {
  useEffect(() => {
    const handleKey = e => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onNavigate('prev')
      if (e.key === 'ArrowRight') onNavigate('next')
    }

    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = 'unset'
    }
  }, [onClose, onNavigate])

  return (
    <div className='galeria-modal' onClick={onClose}>
      <div className='modal-content' onClick={e => e.stopPropagation()}>
        <button className='modal-close' onClick={onClose} aria-label='Fechar'>
          ×
        </button>

        <div className='modal-navigation'>
          <button
            className='nav-btn prev'
            onClick={() => onNavigate('prev')}
            aria-label='Arte anterior'
          >
            ‹
          </button>
          <button
            className='nav-btn next'
            onClick={() => onNavigate('next')}
            aria-label='Próxima arte'
          >
            ›
          </button>
        </div>

        <div className='modal-image-container'>
          <img
            src={arte.url}
            alt={`Arte de ${arte.nome}`}
            className='modal-image'
            loading='lazy'
            style={{
              maxWidth: '90vw',
              maxHeight: '80vh',
              objectFit: 'contain'
            }}
          />
        </div>

        <div className='modal-info'>
          <h3 className='modal-artist-name'>{arte.nome}</h3>
          <div className='modal-details'>
            <span className='modal-level'>Nível: {arte.nivel}</span>
            <span className='modal-separator'>•</span>
            <span className='modal-challenge'>
              {arte.desafio || 'Arte Livre'}
            </span>
          </div>
        </div>

        <div className='modal-counter'>
          {arte.index + 1} / {total}
        </div>
      </div>
    </div>
  )
})

// ==================== 🖌️ GALERIA ====================
const Galeria = ({ artes }) => {
  const [filtros, setFiltros] = useState({ nivel: 'Todos', desafio: 'Todos' })
  const [filtered, setFiltered] = useState([])
  const [page, setPage] = useState(0)
  const [selectedArt, setSelectedArt] = useState(null)
  const itemsPerPage = 36
  const loaderRef = useRef()

  // Aleatoriedade justa e estável
  const artesRandom = useMemo(() => shuffleArray(artes || []), [artes])

  const desafiosDisponiveis = useMemo(
    () => [
      ...new Set(artes.map(a => a.desafio).filter(d => d && d !== 'livre'))
    ],
    [artes]
  )

  // 🧮 Filtragem otimizada
  const filtrar = useCallback(() => {
    const run = () => {
      const resultado = artesRandom.filter(a => {
        const nivelOK = filtros.nivel === 'Todos' || a.nivel === filtros.nivel
        const desafioOK =
          filtros.desafio === 'Todos' ||
          (filtros.desafio === 'Livre' &&
            (!a.desafio || a.desafio === 'livre')) ||
          a.desafio === filtros.desafio
        return nivelOK && desafioOK
      })

      // Evita travar a UI em listas grandes
      startTransition(() => {
        setFiltered(resultado)
        setPage(0)
      })
    }

    if (typeof window.requestIdleCallback === 'function')
      requestIdleCallback(run, { timeout: 200 })
    else setTimeout(run, 0)
  }, [filtros, artesRandom])

  // 🔧 Evita bug "Nenhuma arte encontrada"
  useEffect(() => {
    if (artesRandom.length > 0) filtrar()
  }, [filtrar, artesRandom])

  const visibleItems = useMemo(
    () => filtered.slice(0, (page + 1) * itemsPerPage),
    [filtered, page]
  )

  // 📜 Scroll infinito
  useEffect(() => {
    if (!loaderRef.current) return
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && visibleItems.length < filtered.length) {
        setPage(prev => prev + 1)
      }
    })
    observer.observe(loaderRef.current)
    return () => observer.disconnect()
  }, [visibleItems.length, filtered.length])

  // 🖼️ Preview Modal
  const abrirPreview = useCallback((arte, index) => {
    setSelectedArt({ ...arte, index })
  }, [])

  const fecharPreview = useCallback(() => {
    setSelectedArt(null)
  }, [])

  const navegarPreview = useCallback(
    direcao => {
      setSelectedArt(prev => {
        if (!prev || filtered.length === 0) return prev
        const currentIndex = prev.index
        const newIndex =
          direcao === 'prev'
            ? currentIndex === 0
              ? filtered.length - 1
              : currentIndex - 1
            : currentIndex === filtered.length - 1
            ? 0
            : currentIndex + 1

        return { ...filtered[newIndex], index: newIndex }
      })
    },
    [filtered]
  )

  return (
    <div className='galeria-main'>
      <div className='galeria-header'>
        <h2 className='galeria-title'>🎨 Galeria de Artes</h2>
        <p className='galeria-subtitle'>
          {visibleItems.length} de {filtered.length} artes
          {filtered.length !== artes.length && ` — Total: ${artes.length}`}
        </p>
      </div>

      <FiltroGaleria
        filtros={filtros}
        desafios={desafiosDisponiveis}
        onChange={(tipo, valor) =>
          setFiltros(prev => ({ ...prev, [tipo]: valor }))
        }
      />

      <div className='galeria-grid'>
        {visibleItems.length === 0 ? (
          <div className='galeria-empty'>
            <span className='empty-icon'>🎭</span>
            <p>Nenhuma arte encontrada com esses filtros</p>
          </div>
        ) : (
          visibleItems.map((arte, i) => (
            <ArteCard
              key={arte.id}
              arte={arte}
              onClick={() => abrirPreview(arte, i)}
            />
          ))
        )}
      </div>

      {visibleItems.length < filtered.length && (
        <div ref={loaderRef} className='load-trigger'>
          <p
            style={{ textAlign: 'center', color: '#94a3b8', margin: '2rem 0' }}
          >
            Carregando mais artes...
          </p>
        </div>
      )}

      {selectedArt && (
        <Modal
          arte={selectedArt}
          total={filtered.length}
          onClose={fecharPreview}
          onNavigate={navegarPreview}
        />
      )}
    </div>
  )
}

export default Galeria
