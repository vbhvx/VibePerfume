import { useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import { getAssetUrl, handleImageError } from '../utils/imageUrl';
import './ImageGallery.css';

interface ImageGalleryProps {
  images: string[];
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const nextImg = () => setActiveIdx((prev) => (prev + 1) % images.length);
  const prevImg = () => setActiveIdx((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div className="image-gallery">
      <div className="main-image-container">
        <img 
          src={getAssetUrl(images[activeIdx])} 
          alt="Product" 
          className="main-image" 
          onError={handleImageError}
        />
        
        <button className="gallery-nav prev" onClick={prevImg}><ChevronLeft size={24} /></button>
        <button className="gallery-nav next" onClick={nextImg}><ChevronRight size={24} /></button>
        
        <button className="lightbox-btn" onClick={() => setIsOpen(true)}>
          <Maximize2 size={20} />
        </button>
      </div>

      <div className="thumbnails">
        {images.map((img, idx) => (
          <div 
            key={idx} 
            className={`thumbnail ${activeIdx === idx ? 'active' : ''}`}
            onClick={() => setActiveIdx(idx)}
          >
            <img 
              src={getAssetUrl(img)} 
              alt={`Thumbnail ${idx + 1}`} 
              onError={handleImageError}
            />
          </div>
        ))}
      </div>

      <Lightbox
        open={isOpen}
        close={() => setIsOpen(false)}
        slides={images.map(src => ({ src: getAssetUrl(src) }))}
        index={activeIdx}
      />
    </div>
  );
};

export default ImageGallery;
