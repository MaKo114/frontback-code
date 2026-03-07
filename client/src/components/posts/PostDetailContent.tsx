import PostDetailImages from "./PostDetailImages";

interface Props {
  post: any;
  onImageClick: (url: string) => void;
}

const PostDetailContent = ({ post, onImageClick }: Props) => {
  const images = post.images || [];

  return (
    <>
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-orange-50 text-[#FF5800] text-[10px] font-black px-2 py-0.5 rounded uppercase border border-orange-100">
            {post.category_name}
          </span>
          <span className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-0.5 rounded uppercase border border-green-100">
            {post.status}
          </span>
        </div>
        <h1 className="text-xl font-black text-gray-900 mb-2">{post.title}</h1>
        <p className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px]">
          {post.description}
        </p>
      </div>

      <div className="space-y-1 bg-gray-50">
        {/* {images.map((img: any, i: number) => (
          <div
            key={i}
            className="cursor-zoom-in overflow-hidden bg-white flex justify-center"
            onClick={() => onImageClick(img.image_url)}
          >
            <img
              src={img.image_url}
              className="w-full h-auto max-h-[600px] object-contain"
              alt={`post-img-${i}`}
            />
          </div>
        ))} */}

          <PostDetailImages images={images} onImageClick={onImageClick}/>

      </div>
    </>
  );
};

export default PostDetailContent;