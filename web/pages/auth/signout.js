import { useUser } from '@/context/user';
import { useEffect } from 'react';

export default function Signin() {
	const { signout } = useUser();
	useEffect(() => {
		signout();
	}, []);
	return <p>Signing out...</p>;
}
