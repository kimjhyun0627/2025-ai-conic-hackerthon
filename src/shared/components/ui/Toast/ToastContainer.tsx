import { AnimatePresence } from 'framer-motion';
import { ToastItem } from './ToastItem';
import { useToastStore } from './useToastStore';

export const ToastContainer = () => {
	const toasts = useToastStore((state) => state.toasts);
	const removeToast = useToastStore((state) => state.removeToast);

	return (
		<AnimatePresence mode="popLayout">
			{toasts.map((toast, index) => (
				<ToastItem
					key={toast.id}
					toast={toast}
					onClose={removeToast}
					index={index}
					total={toasts.length}
				/>
			))}
		</AnimatePresence>
	);
};
