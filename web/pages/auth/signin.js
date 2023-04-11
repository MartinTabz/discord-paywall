import { useUser } from '@/context/user';
import { useEffect } from 'react';

export default function Signin() {
	const { signin } = useUser();
	useEffect(() => {
		signin();
	}, []);
	return <p>Signing up...</p>;
}
