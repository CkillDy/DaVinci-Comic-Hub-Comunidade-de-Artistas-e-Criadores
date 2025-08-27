import React, { useState, useEffect, useRef, useCallback } from 'react';

// Componente para cada arte com lazy loading otimizado
const ArteCard = React.memo(({ arte, index, onClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef();
  const observerRef = useRef();

  useEffect(() => {
    // Configuração mais agressiva para economizar recursos
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observerRef.current?.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px' // Carrega um pouco antes de ficar visível
      }
    );

    if (cardRef.current) {
      observerRef.current.observe(cardRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, []);

  const handleImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const handleImageError = useCallback(() => {
    setImageError(true);
    setImageLoaded(true);
  }, []);

  const handleClick = useCallback(() => {
    onClick(arte, index);
  }, [arte, index, onClick]);

  return (
    <div
      ref={cardRef}
      className="galeria-card"
      onClick={handleClick}
    >
      <div className="galeria-image-container">
        {isVisible && (
          <>
            {!imageLoaded && <div className="image-skeleton" />}
            {!imageError ? (
              <img
                src={arte.url || arte.imagem || arte.link}
                alt={`Arte de ${arte.nome}`}
                className={`galeria-image ${imageLoaded ? 'loaded' : ''}`}
                onLoad={handleImageLoad}
                onError={handleImageError}
                loading="lazy" // Suporte nativo do browser
                decoding="async"
              />
            ) : (
              <div className="image-error">
                <span>❌</span>
                <p>Erro ao carregar</p>
              </div>
            )}
            <div className="galeria-overlay">
              <span className="preview-icon">👁️</span>
              <span className="preview-text">Ver arte</span>
            </div>
          </>
        )}
      </div>

      <div className="galeria-info">
        <h4 className="galeria-artist-name">{arte.nome}</h4>
        <p className="galeria-level">Nível: {arte.nivel}</p>
        {arte.desafio && arte.desafio !== 'livre' ? (
          <span className="galeria-challenge-badge">
            {arte.desafio}
          </span>
        ) : (
          <span className="galeria-free-badge">
            Arte Livre
          </span>
        )}
      </div>
    </div>
  );
});

const Galeria = ({ artes }) => {
  const [selectedArt, setSelectedArt] = useState(null);

  const abrirPreview = useCallback((arte, index) => {
    setSelectedArt({ ...arte, index });
  }, []);

  const fecharPreview = useCallback(() => {
    setSelectedArt(null);
  }, []);

  const navegarPreview = useCallback((direcao) => {
    setSelectedArt(prev => {
      if (!prev) return null;

      const currentIndex = prev.index;
      let newIndex;

      if (direcao === 'prev') {
        newIndex = currentIndex === 0 ? artes.length - 1 : currentIndex - 1;
      } else {
        newIndex = currentIndex === artes.length - 1 ? 0 : currentIndex + 1;
      }

      return { ...artes[newIndex], index: newIndex };
    });
  }, [artes]);

  // Memoizar handlers de teclado
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') fecharPreview();
    if (e.key === 'ArrowLeft') navegarPreview('prev');
    if (e.key === 'ArrowRight') navegarPreview('next');
  }, [fecharPreview, navegarPreview]);

  // Event listeners otimizados
  useEffect(() => {
    if (selectedArt) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedArt, handleKeyDown]);

  // Evitar re-renders desnecessários
  const artesCount = artes.length;

  return (
    <div className="galeria-main">
      <div className="galeria-header">
        <h2 className="galeria-title">🎨 Galeria de Artes</h2>
        <p className="galeria-subtitle">{artesCount} artes aprovadas</p>
      </div>

      <div className="galeria-grid">
        {artesCount === 0 ? (
          <div className="galeria-empty">
            <span className="empty-icon">🎭</span>
            <p>Nenhuma arte aprovada ainda. Volte mais tarde!</p>
          </div>
        ) : (
          artes.map((arte, i) => (
            <ArteCard
              key={arte.id || `${arte.nome}-${i}`} // Key mais estável
              arte={arte}
              index={i}
              onClick={abrirPreview}
            />
          ))
        )}
      </div>

      {/* Modal Otimizado */}
      {selectedArt && (
        <div className="galeria-modal" onClick={fecharPreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={fecharPreview}>×</button>

            <div className="modal-navigation">
              <button
                className="nav-btn prev"
                onClick={() => navegarPreview('prev')}
                aria-label="Arte anterior"
              >
                ‹
              </button>
              <button
                className="nav-btn next"
                onClick={() => navegarPreview('next')}
                aria-label="Próxima arte"
              >
                ›
              </button>
            </div>

            <div className="modal-image-container">
              <img
                src={selectedArt.url || selectedArt.imagem || selectedArt.link}
                alt={`Arte de ${selectedArt.nome}`}
                className="modal-image"
                loading="lazy"
                style={{
                  maxWidth: '90vw',
                  maxHeight: '80vh',
                  width: 'auto',
                  height: 'auto',
                  objectFit: 'contain'
                }}
              />
            </div>

            <div className="modal-counter">
              {selectedArt.index + 1} / {artesCount}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Galeria;