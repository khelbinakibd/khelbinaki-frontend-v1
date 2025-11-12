import img1 from "/src/assets/Gallery (1).jpg";
import img2 from "/src/assets/Gallery (2).jpg";
import img3 from "/src/assets/Gallery (3).jpg";
import img4 from "/src/assets/Gallery (4).jpg";
import img5 from "/src/assets/Gallery (5).jpg";
import img6 from "/src/assets/Gallery (6).jpg";
import img7 from "/src/assets/Gallery (7).jpg";
import img8 from "/src/assets/Gallery (8).jpg";
import img9 from "/src/assets/Gallery (9).jpg";
import img10 from "/src/assets/Gallery (10).jpg";

const imagesRow1 = [img1, img2, img3, img4, img5];
const imagesRow2 = [img6, img7, img8, img9, img10];

const GallerySlider: React.FC = () => {
  return (
    <div className="min-h-screen py-16 px-4">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-4xl md:text-6xl font-bold text-center mb-2 sm:mb-4 text-green-700">
          Turf <span className="italic text-yellow-500">Images</span>
        </h2>
        <p className="text-lg leading-7 text-gray-500 italic text-center px-3 md:w-2/3 mx-auto w-full mb-10">
          Enjoy Our Turf image
        </p>
      </div>

      {/* Row 1 - Left to Right */}
      <div className="overflow-hidden">
        <div className="flex gap-6 animate-slide-left">
          {[...imagesRow1, ...imagesRow1].map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`row1-${i}`}
              className="sm:w-96 w-72 h-48 sm:h-80 object-cover rounded shadow-md"
            />
          ))}
        </div>
      </div>

      {/* Row 2 - Right to Left */}
      <div className="overflow-hidden mt-10">
        <div className="flex gap-6 animate-slide-right">
          {[...imagesRow2, ...imagesRow2].map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`row2-${i}`}
              loading="lazy"
              className="sm:w-96 w-72 h-48 sm:h-80 object-cover rounded shadow-md transition-transform duration-300 hover:scale-105"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default GallerySlider;
