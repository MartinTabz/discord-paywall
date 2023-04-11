import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';

const Context = createContext();

const Provider = ({ children }) => {
	const router = useRouter();
	const [user, setUser] = useState(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const getUserProfile = async () => {
			const user = await supabase.auth.getUser();
			if (user.data.user) {
				const { data: profile } = await supabase
					.from('profile')
					.select('*')
					.eq('id', user.data.user.id)
					.single();

				setUser({
					...user.data.user,
					...profile,
				});
			}
			setIsLoading(false);
		};

		getUserProfile();
	}, [router]);

	useEffect(() => {
		if (user) {
			const profile = supabase
				.channel('custom-update-channel')
				.on(
					'postgres_changes',
					{
						event: 'UPDATE',
						schema: 'public',
						table: 'profile',
						filter: `id=eq.${user.id}`,
					},
					(payload) => {
						setUser({ ...user, ...payload.new });
					}
				)
				.subscribe();

			return () => {
				supabase.removeChannel(profile);
			};
		}
	}, [user]);

	const signin = async () => {
		await supabase.auth.signInWithOAuth({
			provider: 'discord',
		});
	};
	const signout = async () => {
		await supabase.auth.signOut();
		setUser(null);
		router.push('/');
	};

	const exposed = {
		user,
		signin,
		signout,
		isLoading,
	};

	return <Context.Provider value={exposed}>{children}</Context.Provider>;
};

export const useUser = () => useContext(Context);

export default Provider;
