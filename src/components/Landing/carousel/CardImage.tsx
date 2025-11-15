interface CardImageProps {
	src: string;
	alt: string;
	overlay?: boolean;
}

export const CardImage = ({ src, alt, overlay = false }: CardImageProps) => {
	if (!src) return null;

	return (
		<div className="w-full h-full relative overflow-hidden rounded-4xl">
			<img
				src={src}
				alt={alt}
				className="w-full h-full object-cover object-center block rounded-4xl"
				style={{
					objectFit: 'cover',
					display: 'block',
				}}
			/>
			{overlay && <div className="absolute inset-0 bg-black/10 z-10 rounded-4xl" />}
		</div>
	);
};
