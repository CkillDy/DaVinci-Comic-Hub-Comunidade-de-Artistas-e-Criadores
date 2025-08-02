import { useState, useEffect } from 'react';

const useGitHubData = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/CkillDy/davinci-dados/main/config.json');

        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const data = await response.json();
        if (isMounted) setConfig(data);
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setConfig(/* fallback */);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  return { config, loading, error };
};

export default useGitHubData;
