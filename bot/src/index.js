const {
	Client,
	IntentsBitField,
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
} = require('discord.js');
require('dotenv').config();

const client = new Client({
	intents: [
		IntentsBitField.Flags.Guilds,
		IntentsBitField.Flags.GuildMembers,
		IntentsBitField.Flags.GuildMessages,
		IntentsBitField.Flags.MessageContent,
	],
});

client.on('messageCreate', async (message) => {
	if (message.content === '!verify') {
		await message.delete();

		const button = new ActionRowBuilder().addComponents(
			new ButtonBuilder()
				.setCustomId('verify_btn')
				.setLabel('Verify')
				.setStyle(ButtonStyle.Primary)
		);

		const embed = new EmbedBuilder()
			.setColor('Green')
			.setTitle('Click to Verify')
			.setDescription(
				'Click the button below to verify if your account is subscribed'
			);

		message.channel.send({ embeds: [embed], components: [button] });

		const collector = message.channel.createMessageComponentCollector();
		collector.on('collect', async (i) => {
			const body = {
				userid: i.user.id,
			};
			const res = await fetch(
				'https://martintabz-discord.vercel.app/api/discord-verification',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(body),
				}
			);
			const { exist, subscribed } = await res.json();

			if (exist && !subscribed) {
				const link = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setLabel('Subscribe link')
						.setStyle(ButtonStyle.Link)
						.setURL('https://martintabz-discord.vercel.app/subscribe')
				);
				const existfailed = new EmbedBuilder()
					.setColor('Red')
					.setTitle('Subscribe first')
					.setDescription(
						'You are not subscribed! Click the link button below, subscribe and then come back and try again.'
					);
				await i.reply({
					embeds: [existfailed],
					components: [link],
					ephemeral: true,
				});
			} else if (exist && subscribed) {
				//Desired role id: 1096779979758510151
				console.log(i);
				await i.reply({
					content: "Successfuly verified",
					ephemeral: true,
				});
			} else {
				const link = new ActionRowBuilder().addComponents(
					new ButtonBuilder()
						.setLabel('Sign Up')
						.setStyle(ButtonStyle.Link)
						.setURL('https://martintabz-discord.vercel.app/')
				);
				const existfailed = new EmbedBuilder()
					.setColor('Grey')
					.setTitle('Sign Up and Subscribe')
					.setDescription(
						'You havent registered yet. Click on the link button bellow, sign up, subscribe and come back.'
					);
				await i.reply({
					embeds: [existfailed],
					components: [link],
					ephemeral: true,
				});
			}
		});
	}
});

client.login(process.env.TOKEN);
