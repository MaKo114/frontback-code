interface Props {
  images: any[];
  onImageClick: (url: string) => void;
}

const PostDetailImages = ({ images, onImageClick }: Props) => {
  if (!images || images.length === 0) return null;

  return (
    <div className="mx-4 mb-4"> {/* เพิ่ม Margin ซ้าย-ขวา-ล่าง ให้เหมือน PostCard */}
      
      {/* --- กรณี 1 รูป --- */}
      {images.length === 1 && (
        <div
          className="rounded-2xl overflow-hidden cursor-zoom-in bg-gray-100"
          style={{ aspectRatio: "4/3" }} // ล็อค Ratio เหมือน PostCard
          onClick={() => onImageClick(images[0].image_url)}
        >
          <img
            src={images[0].image_url}
            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
            alt="post"
          />
        </div>
      )}

      {/* --- กรณี 2 รูป --- */}
      {images.length === 2 && (
        <div className="grid grid-cols-2 gap-1.5 rounded-2xl overflow-hidden">
          {images.map((img, i) => (
            <div
              key={i}
              className="relative overflow-hidden bg-gray-100 cursor-zoom-in"
              style={{ aspectRatio: "1/1" }}
              onClick={() => onImageClick(img.image_url)}
            >
              <img
                src={img.image_url}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                alt="post"
              />
            </div>
          ))}
        </div>
      )}

      {/* --- กรณี 3 รูป (ใหญ่ 1 เล็ก 2) --- */}
      {images.length === 3 && (
        <div className="grid grid-cols-2 gap-1.5 rounded-2xl overflow-hidden">
          <div
            className="row-span-2 relative overflow-hidden bg-gray-100 cursor-zoom-in"
            style={{ aspectRatio: "3/4" }}
            onClick={() => onImageClick(images[0].image_url)}
          >
            <img src={images[0].image_url} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          {images.slice(1).map((img: any, i: number) => (
            <div
              key={i}
              className="relative overflow-hidden bg-gray-100 cursor-zoom-in"
              style={{ aspectRatio: "3/2" }}
              onClick={() => onImageClick(img.image_url)}
            >
              <img src={img.image_url} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
        </div>
      )}

      {/* --- กรณี 4 รูปขึ้นไป --- */}
      {images.length >= 4 && (
        <div className="grid grid-cols-2 gap-1.5 rounded-2xl overflow-hidden">
          {images.slice(0, 3).map((img: any, i: number) => (
            <div
              key={i}
              className="relative overflow-hidden bg-gray-100 cursor-zoom-in"
              style={{ aspectRatio: "1/1" }}
              onClick={() => onImageClick(img.image_url)}
            >
              <img src={img.image_url} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
          ))}
          <div
            className="relative overflow-hidden bg-gray-100 cursor-zoom-in"
            style={{ aspectRatio: "1/1" }}
            onClick={() => onImageClick(images[3].image_url)}
          >
            <img src={images[3].image_url} className="w-full h-full object-cover" />
            {images.length > 4 && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="text-white text-2xl font-black">+{images.length - 4}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostDetailImages;