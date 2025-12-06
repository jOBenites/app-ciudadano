import { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export function DataInitializer() {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initData = async () => {
      const hasInitialized = localStorage.getItem('data-initialized');
      
      if (!hasInitialized) {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-1cd2eafa/init-data`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${publicAnonKey}`
              }
            }
          );

          const data = await response.json();
          if (data.success) {
            localStorage.setItem('data-initialized', 'true');
            setInitialized(true);
          }
        } catch (error) {
          console.error('Error initializing data:', error);
        }
      } else {
        setInitialized(true);
      }
    };

    initData();
  }, []);

  return null;
}
