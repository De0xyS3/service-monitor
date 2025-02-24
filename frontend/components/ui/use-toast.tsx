import { useState } from 'react';

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  function toast(newMessage: string) {
    setMessage(newMessage);
    setTimeout(() => {
      setMessage(null);
    }, 3000);  // El mensaje desaparecerá después de 3 segundos
  }

  return {
    message,
    toast,
  };
}

