import { create } from 'zustand';
import type { ToastItem } from './ToastItem';

interface ToastStore {
	toasts: ToastItem[];
	addToast: (toast: Omit<ToastItem, 'id'>) => string;
	removeToast: (id: string) => void;
	clearToasts: () => void;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastStore>((set) => ({
	toasts: [],
	addToast: (toast) => {
		const id = `toast-${++toastIdCounter}-${Date.now()}`;
		const newToast: ToastItem = {
			...toast,
			id,
		};
		set((state) => ({
			toasts: [...state.toasts, newToast],
		}));
		return id;
	},
	removeToast: (id) => {
		set((state) => ({
			toasts: state.toasts.filter((toast) => toast.id !== id),
		}));
	},
	clearToasts: () => {
		set({ toasts: [] });
	},
}));
