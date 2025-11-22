import { useCallback } from 'react';
import { useToastStore } from './useToastStore';
import type { ToastItem } from './ToastItem';

export const useToast = () => {
	const addToast = useToastStore((state) => state.addToast);
	const removeToast = useToastStore((state) => state.removeToast);

	const showToast = useCallback(
		(message: string, type?: ToastItem['type'], duration?: number | null) => {
			return addToast({ message, type, duration });
		},
		[addToast]
	);

	const showSuccess = useCallback(
		(message: string, duration?: number) => {
			return showToast(message, 'success', duration);
		},
		[showToast]
	);

	const showError = useCallback(
		(message: string, duration?: number) => {
			return showToast(message, 'error', duration);
		},
		[showToast]
	);

	const showWarning = useCallback(
		(message: string, duration?: number | null) => {
			return showToast(message, 'warning', duration);
		},
		[showToast]
	);

	const showInfo = useCallback(
		(message: string, duration?: number | null) => {
			return showToast(message, 'info', duration);
		},
		[showToast]
	);

	return {
		showToast,
		showSuccess,
		showError,
		showWarning,
		showInfo,
		removeToast,
	};
};
