interface GallerySectionProps {
  images: string[];
  onSelectImage: (image: string) => void;
}

const GallerySection = ({ images, onSelectImage }: GallerySectionProps) => {
  if (!images.length) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8">
      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
          <span className="text-purple-600">📸</span>
        </div>
        Photo Gallery
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((img, idx) => (
          <button
            key={`${img}-${idx}`}
            className="relative group cursor-pointer"
            onClick={() => onSelectImage(img)}
            type="button"
          >
            <img
              src={img}
              alt={`Turf ${idx + 1}`}
              className="w-full h-48 object-cover rounded-xl shadow-sm group-hover:shadow-lg transition-all duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 rounded-xl transition-all duration-300 flex items-center justify-center">
              <svg className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default GallerySection;
