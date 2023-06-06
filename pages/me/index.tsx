import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

const ProtectedPage = () => {
    const { data: session, status } = useSession()
    const router = useRouter();

    // If session is not loaded, show a loading indicator
    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    // If session is null, redirect to the login page
    if (!session) {
        router.replace('/api/auth/signin');
        return null;
    }

    // If session is valid, render the protected content
    return (
        <div>
            <h1>Welcome, {session.user?.username}!</h1>
            <p>This is a protected page.</p>
        </div>
    );
};

export default ProtectedPage;