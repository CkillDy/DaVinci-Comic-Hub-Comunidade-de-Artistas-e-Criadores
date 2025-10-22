import React, { useState, useEffect } from 'react'

const VideoGallerySlider = () => {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [videos, setVideos] = useState([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const CONFIG_URL =
    'https://raw.githubusercontent.com/CkillDy/davinci-dados/main/config.json'

  // Converter URL normal ou shorts em URL embedável
  const convertYouTubeUrl = url => {
    if (!url) return ''
    if (url.includes('youtube.com/shorts/')) {
      const id = url.split('/shorts/')[1].split('?')[0]
      return `https://www.youtube.com/embed/${id}`
    }
    if (url.includes('youtube.com/watch?v=')) {
      const id = url.split('v=')[1].split('&')[0]
      return `https://www.youtube.com/embed/${id}`
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1].split('?')[0]
      return `https://www.youtube.com/embed/${id}`
    }
    return url
  }

  // Gerar miniatura automaticamente
  const getThumbnailFromUrl = url => {
    try {
      const id = url.split(/shorts\/|v=|youtu\.be\//)[1].split(/[?&]/)[0]
      return `https://img.youtube.com/vi/${id}/hqdefault.jpg`
    } catch {
      return 'https://via.placeholder.com/315x560/000000/ffffff?text=🎬+Video'
    }
  }

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(CONFIG_URL)
        if (!res.ok) throw new Error('Erro ao buscar vídeos.')

        const data = await res.json()
        if (!data.videos || !Array.isArray(data.videos))
          throw new Error('Nenhum vídeo encontrado.')

        // embaralhar lista para ficar aleatório
        const shuffled = [...data.videos].sort(() => Math.random() - 0.5)

        const processed = shuffled.map(v => ({
          ...v,
          embedUrl: convertYouTubeUrl(v.url),
          thumbnail: v.thumbnail || getThumbnailFromUrl(v.url),
          originalUrl: v.url
        }))

        setVideos(processed)
      } catch (err) {
        console.error(err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()
  }, [])

  const nextVideo = () => {
    setCurrentVideo(p => (p + 1) % videos.length)
    setIsPlaying(false)
  }

  const prevVideo = () => {
    setCurrentVideo(p => (p - 1 + videos.length) % videos.length)
    setIsPlaying(false)
  }

  const refreshData = () => window.location.reload()

  if (loading) return <div>🎥 Carregando vídeos...</div>
  if (error)
    return (
      <div>
        <p>Erro: {error}</p>
        <button onClick={refreshData}>🔄 Tentar novamente</button>
      </div>
    )

  if (!videos.length)
    return (
      <div>
        <p>Nenhum vídeo disponível.</p>
        <button onClick={refreshData}>🔄 Atualizar</button>
      </div>
    )

  const video = videos[currentVideo]

  return (
    <div
      className='video-gallery-slider'
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: '#fff',
        fontFamily: 'Poppins, sans-serif'
      }}
    >
      <h2 style={{ marginBottom: '12px', fontSize: '22px' }}>
        🎬 Desafios Criativos
      </h2>

      <div
        className='video-container'
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '16px'
        }}
      >
        {/* Botão anterior */}
        <button
          onClick={prevVideo}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            fontSize: '32px',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: '0.3s'
          }}
        >
          ‹
        </button>

        {/* Área principal */}
        <div
          className='video-frame'
          style={{
            width: '315px',
            height: '560px',
            borderRadius: '18px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 0 25px rgba(0,0,0,0.5)',
            background: 'rgba(255,255,255,0.05)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.1)',
            transition: 'transform 0.4s ease, box-shadow 0.4s ease'
          }}
        >
          {isPlaying ? (
            <iframe
              src={video.embedUrl}
              width='315'
              height='560'
              frameBorder='0'
              allow='autoplay; encrypted-media'
              allowFullScreen
              title={video.nomeDesafio}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '18px'
              }}
            ></iframe>
          ) : (
            <div
              onClick={() => setIsPlaying(true)}
              style={{
                cursor: 'pointer',
                width: '100%',
                height: '100%',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <img
                src={video.thumbnail}
                alt={video.nomeDesafio}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: 'blur(2px) brightness(0.7)',
                  transition: '0.3s'
                }}
                onError={e => {
                  e.target.src =
                    'https://via.placeholder.com/315x560/1a1a1a/ffffff?text=🎬+Shorts'
                }}
              />

              {/* camada de vidro */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    'linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1))',
                  backdropFilter: 'blur(8px)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  animation: 'glow 3s infinite ease-in-out'
                }}
              >
                <span
                  style={{
                    fontSize: '56px',
                    color: 'white',
                    textShadow: '0 0 15px rgba(255,255,255,0.8)'
                  }}
                >
                  ▶
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Botão próximo */}
        <button
          onClick={nextVideo}
          style={{
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            color: '#fff',
            fontSize: '32px',
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            cursor: 'pointer',
            transition: '0.3s'
          }}
        >
          ›
        </button>
      </div>

      {/* Informações do vídeo */}
      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <h3 style={{ fontSize: '18px', marginBottom: '4px' }}>
          {video.nomeDesafio}
        </h3>
        <p style={{ opacity: 0.8, marginBottom: '4px' }}>🎨 {video.editor}</p>
        <p style={{ opacity: 0.7, marginBottom: '8px' }}>📅 {video.data}</p>
        <a
          href={video.originalUrl}
          target='_blank'
          rel='noopener noreferrer'
          style={{
            color: '#61dafb',
            textDecoration: 'none',
            fontWeight: '600'
          }}
        >
          🔗 Ver no YouTube
        </a>
      </div>

      {/* Pontinhos de navegação */}
      <div style={{ marginTop: '12px' }}>
        {videos.map((_, i) => (
          <span
            key={i}
            onClick={() => {
              setCurrentVideo(i)
              setIsPlaying(false)
            }}
            style={{
              display: 'inline-block',
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background:
                i === currentVideo
                  ? 'linear-gradient(45deg, #61dafb, #bb86fc)'
                  : 'rgba(255,255,255,0.3)',
              margin: '0 4px',
              cursor: 'pointer',
              transition: '0.3s'
            }}
          />
        ))}
      </div>

      {/* Botão atualizar */}
      <button
        onClick={refreshData}
        style={{
          marginTop: '18px',
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.2)',
          padding: '8px 16px',
          borderRadius: '8px',
          color: '#fff',
          cursor: 'pointer',
          transition: '0.3s'
        }}
      >
        🔄 Atualizar
      </button>

      <style>
        {`
          @keyframes glow {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  )
}

export default VideoGallerySlider
