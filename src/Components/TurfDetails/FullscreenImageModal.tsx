import { X } from "lucide-react";

interface FullscreenImageModalProps {
  image: string;
  onClose: () => void;
}

const FullscreenImageModal = ({ image, onClose }: FullscreenImageModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        type="button"
      >
        <X className="w-6 h-6 text-white" />
      </button>
      <img
        src={image}
        alt="Fullscreen view"
        className="max-w-full max-h-full object-contain rounded-lg"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default FullscreenImageModal;
