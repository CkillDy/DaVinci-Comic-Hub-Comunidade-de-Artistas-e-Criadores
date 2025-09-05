import React, { useState, useEffect } from 'react';

const VideoGallerySlider = () => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [videos, setVideos] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const CONFIG_URL = 'https://raw.githubusercontent.com/CkillDy/davinci-dados/main/config.json';

  // Função para converter URL do YouTube Shorts para formato embedável
  const convertYouTubeUrl = (url) => {
    // Se for um YouTube Shorts URL
    if (url.includes('youtube.com/shorts/')) {
      const videoId = url.split('/shorts/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Se for URL normal do YouTube
    if (url.includes('youtube.com/watch?v=')) {
      const videoId = url.split('v=')[1].split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Se for youtu.be
    if (url.includes('youtu.be/')) {
      const videoId = url.split('youtu.be/')[1].split('?')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    // Se já for embed, retorna como está
    return url;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(CONFIG_URL);
        if (!response.ok) {
          throw new Error(`Erro ao carregar dados: ${response.status}`);
        }

        const data = await response.json();

        if (data.videos && Array.isArray(data.videos)) {
          // Converte as URLs para formato embedável
          const processedVideos = data.videos.map(video => ({
            ...video,
            embedUrl: convertYouTubeUrl(video.url),
            originalUrl: video.url
          }));
          setVideos(processedVideos);
        } else {
          throw new Error('Nenhum vídeo encontrado no arquivo de configuração');
        }
      } catch (err) {
        console.error('Erro ao buscar vídeos:', err);
        setError(err.message);

        // Fallback com dados de exemplo
        setVideos([
          {
            id: 1,
            nomeDesafio: "Exemplo - Garras e Chifres",
            editor: "Editor Exemplo",
            data: "2025",
            thumbnail: "https://via.placeholder.com/560x315/1a1a1a/ffffff?text=Thumbnail+1",
            embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            originalUrl: "https://youtube.com/shorts/dQw4w9WgXcQ"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const nextVideo = () => {
    setCurrentVideo((prev) => (prev + 1) % videos.length);
    setIsPlaying(false);
  };

  const prevVideo = () => {
    setCurrentVideo((prev) => (prev - 1 + videos.length) % videos.length);
    setIsPlaying(false);
  };

  const refreshData = async () => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(CONFIG_URL + '?t=' + Date.now());
        if (!response.ok) {
          throw new Error(`Erro ao carregar dados: ${response.status}`);
        }

        const data = await response.json();
        if (data.videos && Array.isArray(data.videos)) {
          const processedVideos = data.videos.map(video => ({
            ...video,
            embedUrl: convertYouTubeUrl(video.url),
            originalUrl: video.url
          }));
          setVideos(processedVideos);
          setCurrentVideo(0);
          setIsPlaying(false);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    await fetchVideos();
  };

  if (loading) {
    return <div>Carregando vídeos...</div>;
  }

  if (error) {
    return (
      <div>
        <p>Erro ao carregar vídeos: {error}</p>
        <button onClick={refreshData}>Tentar Novamente</button>
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div>
        <p>Nenhum vídeo disponível no momento.</p>
        <button onClick={refreshData}>Atualizar</button>
      </div>
    );
  }

  const video = videos[currentVideo];

  return (
    <div className="video-gallery-slider">
      <h2>🎬 Vídeos dos Desafios</h2>

      <div className="video-container">
        <button className="nav-btn prev" onClick={prevVideo}>‹</button>

        <div className="video-main" style={{ textAlign: 'center' }}>
          {isPlaying ? (
            <div className="video-player" style={{
              width: '315px',
              height: '560px',
              margin: '0 auto',
              backgroundColor: '#000',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <iframe
                src={video.embedUrl}
                width="315"
                height="560"
                frameBorder="0"
                allow="autoplay; encrypted-media"
                allowFullScreen
                title={video.nomeDesafio}
                style={{ borderRadius: '12px' }}
              ></iframe>
            </div>
          ) : (
            <div className="video-thumbnail" onClick={() => setIsPlaying(true)} style={{
              cursor: 'pointer',
              width: '315px',
              height: '560px',
              margin: '0 auto',
              position: 'relative',
              backgroundColor: '#000',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <img
                src={video.thumbnail}
                alt={video.nomeDesafio}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/315x560/1a1a1a/ffffff?text=📱+Shorts";
                }}
              />
              <div className="play-overlay" style={{
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                bottom: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.3)'
              }}>
                <span className="play-btn" style={{
                  fontSize: '48px',
                  color: 'white',
                  textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                }}>▶</span>
              </div>
            </div>
          )}

          <div className="video-info">
            <h3>{video.nomeDesafio}</h3>
            <p>Editado por: {video.editor}</p>
            <p>Data: {video.data}</p>
            <p>
              <a href={video.originalUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#1976d2', textDecoration: 'none' }}>
                Ver no Drive 🔗
              </a>
            </p>
          </div>
        </div>

        <button className="nav-btn next" onClick={nextVideo}>›</button>
      </div>

      <div className="video-dots">
        {videos.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentVideo ? 'active' : ''}`}
            onClick={() => {
              setCurrentVideo(index);
              setIsPlaying(false);
            }}
          />
        ))}
      </div>

      <button className='refresh-btn' onClick={refreshData} style={{ marginTop: '20px' }}>🔄 Atualizar Dados</button>
    </div>
  );
};

export default VideoGallerySlider;