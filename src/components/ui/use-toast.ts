import { toast as hotToast } from 'react-hot-toast';

interface ToastOptions {
  title: string;
  description: string;
  variant?: 'default' | 'destructive';
}

export const toast = ({ title, description, variant = 'default' }: ToastOptions) => {
  if (variant === 'destructive') {
    hotToast.error(description);
  } else {
    hotToast.success(description);
  }
};

export const useToast = () => {
  return { toast };
}; 