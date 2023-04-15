import initStripe from 'stripe';

const handler = async (req, res) => {
	if (req.method === 'POST') {
		const { planId, customer } = req.body;

		if(!planId) {
         return res.status(400).json({ error: "Some requirement is missing" });
      }
		if(!customer) {
         return res.status(401).json({ error: "Some requirement is missing" });
      }

		const stripe = initStripe(process.env.STRIPE_SECRET_KEY);

		const lineItems = [
			{
				price: planId,
				quantity: 1,
			},
		];

		const session = await stripe.checkout.sessions.create({
			customer: customer,
			mode: 'subscription',
			payment_method_types: ['card'],
			line_items: lineItems,
			success_url: `${process.env.NEXT_PUBLIC_DOMAIN}/sub/success`,
			cancel_url: `${process.env.NEXT_PUBLIC_DOMAIN}/sub/cancelled`,
		});

		return res.status(200).json({ sessionid: session.id });
	} else {
		return res.status(405).json({
			error: 'Method not allowed',
		});
	}
};

export default handler;
