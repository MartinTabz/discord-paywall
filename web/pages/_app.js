import UserProvider from '@/context/user';
import '@/styles/globals.css';

export default function App({ Component, pageProps }) {
	return (
		<UserProvider>
			<Component {...pageProps} />
		</UserProvider>
	);
}