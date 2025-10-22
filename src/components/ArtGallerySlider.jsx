import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const ArtGallerySlider = ({ artesGalery = [] }) => {
  const [index, setIndex] = useState(0)
  const [hover, setHover] = useState(false)
  const [shuffledArts, setShuffledArts] = useState([])

  // Embaralha as artes ao carregar
  useEffect(() => {
    if (artesGalery.length > 0) {
      const shuffled = [...artesGalery].sort(() => Math.random() - 0.5)
      setShuffledArts(shuffled)
    }
  }, [artesGalery])

  // Troca automática rápida
  useEffect(() => {
    if (!shuffledArts.length) return
    const interval = setInterval(() => {
      if (!hover) setIndex(prev => (prev + 1) % shuffledArts.length)
    }, 2000) // muda a cada 2s
    return () => clearInterval(interval)
  }, [shuffledArts, hover])

  if (!shuffledArts.length)
    return (
      <div style={{ textAlign: 'center' }}>🎨 Nenhuma arte disponível.</div>
    )

  const currentArt = shuffledArts[index]
  const imageUrl = currentArt.url || currentArt.imagem || currentArt.link || ''
  const autor = currentArt.autor || currentArt.editor || 'Autor desconhecido'
  const nome = currentArt.nome || currentArt.titulo || 'Arte sem nome'

  const nextSlide = () => setIndex(prev => (prev + 1) % shuffledArts.length)
  const prevSlide = () =>
    setIndex(prev => (prev - 1 + shuffledArts.length) % shuffledArts.length)

  return (
    <div
      className='slider-container'
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '900px',
        height: '320px',
        margin: '40px auto',
        borderRadius: '18px',
        overflow: 'hidden',
        backgroundColor: '#000',
        boxShadow: '0 8px 25px rgba(0,0,0,0.5)',
        userSelect: 'none'
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {/* Slide principal */}
      <AnimatePresence mode='wait' custom={index}>
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 80, rotateY: 20 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          exit={{ opacity: 0, x: -80, rotateY: -20 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          drag='x'
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={(e, info) => {
            if (info.offset.x < -80) nextSlide()
            if (info.offset.x > 80) prevSlide()
          }}
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
            cursor: 'grab',
            borderRadius: '18px',
            overflow: 'hidden'
          }}
        >
          <motion.img
            src={imageUrl}
            alt={`Arte: ${nome}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '18px',
              filter: 'brightness(0.95)'
            }}
            onError={e =>
              (e.target.src =
                'https://via.placeholder.com/800x320/1a1a1a/ffffff?text=Imagem+Indisponível')
            }
          />
          {/* Gradiente + informações */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              padding: '14px 20px',
              background:
                'linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2))',
              color: '#fff',
              textAlign: 'center',
              fontSize: '16px',
              backdropFilter: 'blur(4px)'
            }}
          >
            <div style={{ fontWeight: '600' }}>{nome}</div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>— {autor}</div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Botões de navegação bonitos */}
      <motion.button
        onClick={prevSlide}
        whileTap={{ scale: 0.85 }}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        style={navButtonStyle('left')}
        aria-label='Anterior'
      >
        ‹
      </motion.button>

      <motion.button
        onClick={nextSlide}
        whileTap={{ scale: 0.85 }}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        style={navButtonStyle('right')}
        aria-label='Próximo'
      >
        ›
      </motion.button>

      {/* Indicador de progresso elegante */}
      <div
        style={{
          position: 'absolute',
          bottom: '0',
          left: 0,
          height: '3px',
          width: `${((index + 1) / shuffledArts.length) * 100}%`,
          background: 'linear-gradient(90deg, #4fa3ff, #00d4ff)',
          transition: 'width 0.4s ease'
        }}
      />
    </div>
  )
}

// Estilo moderno dos botões de navegação
const navButtonStyle = side => ({
  position: 'absolute',
  top: '50%',
  [side]: '12px',
  transform: 'translateY(-50%)',
  background: 'rgba(0,0,0,0.3)',
  border: 'none',
  color: '#fff',
  fontSize: '34px',
  borderRadius: '50%',
  width: '46px',
  height: '46px',
  cursor: 'pointer',
  zIndex: 5,
  boxShadow: '0 2px 10px rgba(0,0,0,0.4)',
  backdropFilter: 'blur(4px)'
})

export default ArtGallerySlider
