import { useState, useEffect } from 'react';

export const usePermission = (permissionName) => {
  const [state, setState] = useState('prompt');

  useEffect(() => {
    if (!navigator.permissions) {
      setState('not-supported');
      return;
    }

    let mounted = true;

    navigator.permissions.query({ name: permissionName })
      .then(permissionStatus => {
        if (!mounted) return;
        
        setState(permissionStatus.state);
        
        const handleChange = () => {
          if (mounted) {
            setState(permissionStatus.state);
          }
        };
        
        permissionStatus.addEventListener('change', handleChange);
        
        return () => {
          permissionStatus.removeEventListener('change', handleChange);
        };
      })
      .catch(() => {
        if (mounted) {
          setState('not-supported');
        }
      });

    return () => {
      mounted = false;
    };
  }, [permissionName]);

  return state;
};