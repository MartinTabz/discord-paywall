import { getServiceSupabase } from '@/utils/supabase';
import { Client } from 'discord.js';
import { buffer } from 'micro';
import initStripe from 'stripe';

export const config = { api: { bodyParser: false } };

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
	],
});
client.login(process.env.DISCORD_TOKEN);

const handler = async (req, res) => {
	const stripe = initStripe(process.env.STRIPE_SECRET_KEY);
	const signature = req.headers['stripe-signature'];
	const signingSecret = process.env.STRIPE_WEBHOOK_SECRET;
	const reqBuffer = await buffer(req);

	let event;

	try {
		event = stripe.webhooks.constructEvent(reqBuffer, signature, signingSecret);
	} catch (error) {
		console.log(error);
		return res.status(400).json({ error: `Webhook error: ${error.message}` });
	}

	const supabase = getServiceSupabase();

	switch (event.type) {
		case 'customer.subscription.updated':
			await supabase
				.from('profile')
				.update({ subscribed: true, in_jail: false })
				.eq('stripe_customer_id', event.data.object.customer);
			break;
		case 'customer.subscription.deleted':
			const guild = client.guilds.cache.get(process.env.DISCORD_GUILD_ID);
			const { data: profile } = await supabase
				.from('profile')
				.select('discord_id')
				.eq('stripe_customer_id', event.data.object.customer)
				.single();
			const member = guild.members.cache.get(profile.discord_id);

			const subscribedRole = guild.roles.cache.find(
				(role) => role.id == '1096779979758510151'
			);
			member.roles.remove(subscribedRole);

			await supabase
				.from('profile')
				.update({ subscribed: false, in_jail: true })
				.eq('stripe_customer_id', event.data.object.customer);
			break;
	}

	return res.status(200).json({ message: 'User was updated' });
};

export default handler;
