import Image from 'next/image';

// A full-width rounded photography band used to break up the landing sections.
export default function SectionPhoto({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="sec-photo">
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 92vw, 1100px"
      />
    </div>
  );
}
