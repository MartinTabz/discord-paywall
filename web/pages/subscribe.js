import { useUser } from '@/context/user';
import { loadStripe } from '@stripe/stripe-js';
import Link from 'next/link';
import initStripe from 'stripe';

export default function Predplatit({ plans }) {
	const { user, signin, isLoading } = useUser();

	const handleSubscribe = async (planId) => {
		if (user && user.stripe_customer_id && !user.subscribed) {
			const body = {
				planId: planId,
				customer: user.stripe_customer_id,
			};
			const res = await fetch('/api/subscribe', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});
			const data = await res.json();
			const stripe = await loadStripe(
				process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
			);
			await stripe.redirectToCheckout({
				sessionId: data.sessionid,
			});
		}
	};

	const showSubscribeButton = !!user && !user.subscribed;
	const showLoginButton = !user;
	const showManageButton = !!user && user.subscribed;

	return (
		<div>
			{plans.map((plan) => (
				<div key={plan.id}>
					<h2>{plan.name}</h2>
					<p>
						<span style={{textTransform: "uppercase"}}>{plan.currency}</span>{" "}
						{plan.price / 100} / {plan.interval}
					</p>

					{!isLoading && (
						<div>
							{showSubscribeButton && (
								<button onClick={() => handleSubscribe(plan.id)}>
									Buy now
								</button>
							)}
							{showLoginButton && (
								<button onClick={signin}>Sign in</button>
							)}
							{showManageButton && (
								<Link href={'/profile'}>Manage subscription</Link>
							)}
						</div>
					)}
				</div>
			))}
		</div>
	);
}

export async function getServerSideProps() {
	const stripe = initStripe(process.env.STRIPE_SECRET_KEY);

	const { data: prices } = await stripe.prices.list();

	const plans = await Promise.all(
		prices.map(async (price) => {
			const product = await stripe.products.retrieve(price.product);
			return {
				id: price.id,
				name: product.name,
				price: price.unit_amount,
				interval: price.recurring.interval,
				currency: price.currency,
			};
		})
	);

	const sortedPlans = plans.sort((a, b) => a.price - b.price);

	return {
		props: {
			plans: sortedPlans,
		},
	};
}
