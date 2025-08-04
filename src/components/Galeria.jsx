import React, { useState, useEffect, useRef } from 'react';
// Componente para cada arte com lazy loading
const ArteCard = ({ arte, index, onClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const cardRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className="galeria-card"
      onClick={() => onClick(arte, index)}
    >
      <div className="galeria-image-container">
        {isVisible && (
          <>
            {!imageLoaded && <div className="image-skeleton" />}
            <img
              src={arte.url || arte.imagem || arte.link}
              alt={`Arte de ${arte.nome}`}
              className={`galeria-image ${imageLoaded ? 'loaded' : ''}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)} // Caso a imagem não carregue
            />
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
        {arte.desafio && arte.desafio !== 'livre' && (
          <span className="galeria-challenge-badge">
            {arte.desafio}
          </span>
        )}
        {(!arte.desafio || arte.desafio === 'livre') && (
          <span className="galeria-free-badge">
            Arte Livre
          </span>
        )}
      </div>
    </div>
  );
};

const Galeria = ({ artes }) => {
  const [selectedArt, setSelectedArt] = useState(null);

  const abrirPreview = (arte, index) => {
    setSelectedArt({ ...arte, index });
  };

  const fecharPreview = () => {
    setSelectedArt(null);
  };

  const navegarPreview = (direcao) => {
    const currentIndex = selectedArt.index;
    let newIndex;

    if (direcao === 'prev') {
      newIndex = currentIndex === 0 ? artes.length - 1 : currentIndex - 1;
    } else {
      newIndex = currentIndex === artes.length - 1 ? 0 : currentIndex + 1;
    }

    setSelectedArt({ ...artes[newIndex], index: newIndex });
  };

  // Fechar modal com ESC
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') fecharPreview();
      if (e.key === 'ArrowLeft') navegarPreview('prev');
      if (e.key === 'ArrowRight') navegarPreview('next');
    };

    if (selectedArt) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedArt]);

  return (
    <div className="galeria-main">
      <div className="galeria-header">
        <h2 className="galeria-title">🎨 Galeria de Artes</h2>
        <p className="galeria-subtitle">{artes.length} artes aprovadas</p>
      </div>

      <div className="galeria-grid">
        {artes.length === 0 ? (
          <div className="galeria-empty">
            <span className="empty-icon">🎭</span>
            <p>Nenhuma arte aprovada ainda. Volte mais tarde!</p>
          </div>
        ) : (
          artes.map((arte, i) => (
            <ArteCard
              key={i}
              arte={arte}
              index={i}
              onClick={abrirPreview}
            />
          ))
        )}
      </div>

      {/* Modal Simplificado */}
      {selectedArt && (
        <div className="galeria-modal" onClick={fecharPreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={fecharPreview}>×</button>

            <div className="modal-navigation">
              <button className="nav-btn prev" onClick={() => navegarPreview('prev')}>
                ‹
              </button>
              <button className="nav-btn next" onClick={() => navegarPreview('next')}>
                ›
              </button>
            </div>

            <div className="modal-image-container">
              <img
                src={selectedArt.url || selectedArt.imagem || selectedArt.link}
                alt={`Arte de ${selectedArt.nome}`}
                className="modal-image"
              />
            </div>

            <div className="modal-counter">
              {selectedArt.index + 1} / {artes.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Galeria;