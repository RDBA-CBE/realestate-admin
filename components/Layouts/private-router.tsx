import { useRouter } from 'next/router';
import { useEffect } from 'react';

const PrivateRouter = (WrappedComponent) => {
  const PrivateRouteComponent = (props) => {
    const router = useRouter();

    useEffect(() => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace("/login"); // Redirect to login if no token is found
      }
    }, []);

    return <WrappedComponent {...props} />;
  };

  // Add display name for debugging
  PrivateRouteComponent.displayName = `PrivateRouter(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return PrivateRouteComponent;
};

export default PrivateRouter;
