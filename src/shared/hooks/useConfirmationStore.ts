import { create } from "zustand";

export interface ConfirmationOptions {
  title: string;
  message: string;
  targetName?: string;
  helperText?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
}

interface ConfirmationState {
  isOpen: boolean;
  options: ConfirmationOptions | null;
  confirm: (options: ConfirmationOptions) => void;
  close: () => void;
}

export const useConfirmationStore = create<ConfirmationState>((set) => ({
  isOpen: false,
  options: null,
  confirm: (options) => set({ isOpen: true, options }),
  close: () => set({ isOpen: false, options: null })
}));
