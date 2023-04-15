import { getServiceSupabase } from '@/utils/supabase';

const handler = async (req, res) => {
	if (req.method === 'POST') {
		const { userid } = req.body;

		if (!userid) {
			return res.status(400).json({ error: 'You did not send the user' });
		}

		const supabase = getServiceSupabase();

		const { data: profile } = await supabase
			.from('profile')
			.select('subscribed')
			.eq('discord_id', userid)
         .single();
		if (profile) {
			return res
				.status(200)
				.json({ exist: true, subscribed: profile.subscribed });
		} else {
			return res.status(200).json({ exist: false, subscribed: null });
		}
	} else {
		return res.status(405).json({
			error: 'Method not allowed',
		});
	}
};

export default handler;
