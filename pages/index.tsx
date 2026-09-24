import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Loader } from '@mantine/core';
import PrivateRouter from '@/hook/privateRouter';

const Index = () => {
    const router = useRouter();

    useEffect(() => {
        const redirect = async () => {
            try {
               
                const group = localStorage.getItem("group");
                // const role = res?.designation;

                if (group === 'Admin') {
                    router.replace('/real-estate/admin_dashboard');
                } else if (group === 'Developer') {
                    router.replace('/real-estate/dashboard');
                } 
            } catch {
                router.replace('/auth/signin');
            }
        };
        redirect();
    }, []);

    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader size="lg" color="blue" variant="dots" />
        </div>
    );
};

export default PrivateRouter(Index);
