interface LoaderProps {
	size?: 'sm' | 'md' | 'lg';
	text?: string;
}

const Loader = ({ size = 'md', text }: LoaderProps) => {
	const sizes = {
		sm: 'w-6 h-6',
		md: 'w-10 h-10',
		lg: 'w-16 h-16',
	};

	return (
		<div className="flex flex-col items-center justify-center gap-4">
			<div className="relative">
				<div className={`${sizes[size]} border-4 border-slate-200 dark:border-slate-700 border-t-primary-600 rounded-full animate-spin`} />
			</div>
			{text && <p className="text-sm font-medium text-slate-600 dark:text-slate-400">{text}</p>}
		</div>
	);
};

export default Loader;
