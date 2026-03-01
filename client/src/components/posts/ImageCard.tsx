import * as React from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ImageType {
  image_id: number;
  image_url: string;
}

interface Props {
  images: ImageType[];
}

const ImageCard = ({ images }: Props) => {
  const plugin = React.useRef(
    Autoplay({ delay: 3000, stopOnInteraction: true }),
  );

  if (!images || images.length === 0) return null;

  return (
    <Carousel
      plugins={[plugin.current]}
      onMouseEnter={plugin.current.stop}
      onMouseLeave={plugin.current.reset}
      className="w-full relative"
    >
      <CarouselContent>
        {images.map((img) => (
          <CarouselItem key={img.image_id}>
            <div className="w-full aspect-[4/3] overflow-hidden rounded-xl">
              <img
                src={img.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>

      {images.length > 1 && (
        <>
          <CarouselPrevious className="absolute left-3 top-1/2 -translate-y-1/2 z-10" />
          <CarouselNext className="absolute right-3 top-1/2 -translate-y-1/2 z-10" />
        </>
      )}
    </Carousel>
  );
};

export default ImageCard;
