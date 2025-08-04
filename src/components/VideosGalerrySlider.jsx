import React, { useState, useEffect } from 'react';

const VideoGallerySlider = ({ config }) => {
  const [currentVideo, setCurrentVideo] = useState(0);
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    // Videos dos membros da comunidade
    const videosData = config?.videos || [
      {
        id: 1,
        nomeDesafio: "Retrato Feminino",
        editor: "João Silva",
        data: "15/01/2024",
        thumbnail: "/thumbnails/video1.jpg",
        url: "video1.mp4"
      },
      {
        id: 2,
        nomeDesafio: "Paisagem Urbana",
        editor: "Maria Santos",
        data: "20/01/2024",
        thumbnail: "/thumbnails/video2.jpg",
        url: "video2.mp4"
      },
      {
        id: 3,
        nomeDesafio: "Fantasia Medieval",
        editor: "Pedro Costa",
        data: "25/01/2024",
        thumbnail: "/thumbnails/video3.jpg",
        url: "video3.mp4"
      }
    ];
    setVideos(videosData);
  }, [config]);

  const nextVideo = () => {
    setCurrentVideo((prev) => (prev + 1) % videos.length);
  };

  const prevVideo = () => {
    setCurrentVideo((prev) => (prev - 1 + videos.length) % videos.length);
  };

  if (!videos.length) return null;

  return (
    <div className="video-gallery-slider">
      <h2>🎬 Vídeos dos Desafios</h2>

      <div className="video-container">
        <button className="nav-btn prev" onClick={prevVideo}>‹</button>

        <div className="video-main">
          <div className="video-thumbnail">
            <img
              src={videos[currentVideo]?.thumbnail}
              alt={videos[currentVideo]?.nomeDesafio}
            />
            <div className="play-overlay">
              <span className="play-btn">▶</span>
            </div>
          </div>

          <div className="video-info">
            <h3>{videos[currentVideo]?.nomeDesafio}</h3>
            <p>Editado por: {videos[currentVideo]?.editor}</p>
            <p>Data: {videos[currentVideo]?.data}</p>
          </div>
        </div>

        <button className="nav-btn next" onClick={nextVideo}>›</button>
      </div>

      <div className="video-dots">
        {videos.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentVideo ? 'active' : ''}`}
            onClick={() => setCurrentVideo(index)}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoGallerySlider;