import { useCallback, useEffect, useState } from "react"

const generateUrlBrush = () => {
  const arrayList = []
  const limite = 28
  for (let index = 2; index < limite; index++) {
    arrayList.push(`https://raw.githubusercontent.com/CkillDy/brush-Ibispaint-ck/main/brushs-ck/ck${index}.png`)
  }
  return arrayList
}

function CardBrush({ imageUrl, nameImgDownload, titleDownload, handleDownload }) {
  return (
    <div className="votacaoLabel">
      <img
        src={imageUrl}
        alt={nameImgDownload}
        className="image"
        onClick={() => handleDownload(imageUrl, nameImgDownload + ".png")}
      />
      <button
        className="votacaoButton"
        onClick={() => handleDownload(imageUrl, nameImgDownload + ".png")}
      >
        {titleDownload}
      </button>
    </div>
  )
}

function BrushGallery() {
  const [brushs, setBrushs] = useState([])

  useEffect(() => {
    const result = generateUrlBrush()
    setBrushs(result)
  }, [])

  const handleDownloadClick = useCallback(async (url, filename) => {
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error("Erro ao baixar imagem")
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = blobUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error(error)
    }
  }, [])


  const handleDownloadAll = async () => {
    for (let i = 0; i < brushs.length; i++) {
      try {
        const response = await fetch(brushs[i])
        if (!response.ok) throw new Error("Erro ao baixar imagem " + (i + 1))
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = blobUrl
        a.download = `brush${i + 1}.png`
        document.body.appendChild(a)
        a.click()
        a.remove()
        URL.revokeObjectURL(blobUrl)
        await new Promise(r => setTimeout(r, 500))
      } catch (error) {
        console.error(error)
      }
    }
  }


  return (
    <div className="envioMain">
      <h2 className="envioTitulo">✨ Brushes para IbisPaintX</h2>
      <p className="envioLembrete">
        Clique em qualquer imagem para baixar, ou clique no botão abaixo para baixar todas.
      </p>

      <button className="envioButton" onClick={handleDownloadAll}>
        ⬇️ Baixar Todos
      </button>

      <div className="votacaoGrid">
        {brushs.map((url, i) => (
          <CardBrush
            key={i}
            imageUrl={url}
            nameImgDownload={`brush${i + 1}`}
            titleDownload="Baixar"
            handleDownload={handleDownloadClick}
          />
        ))}
      </div>

      <a href="https://ckilldy.github.io/ck-brushs-ibis/" target="_blank" style={{
        position: "relative",
        top: "13px",
        color: "#ffffff",
        backgroundColor: "#3030ff",
        padding: "10px",
        borderRadius: "10px",
        textDecoration: "none"
      }}>Ver todos Brushs</a>
    </div>
  )
}

export default BrushGallery
