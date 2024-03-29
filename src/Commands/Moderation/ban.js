const { EmbedBuilder, PermissionsBitField, SlashCommandBuilder } = require('discord.js');
const config = require('../../Database/config.json');

module.exports = {
    ownerOnly: false,
    voteOnly: false,
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban a user from the guild!')
        .addUserOption((option) => option.setName('user')
            .setDescription('Who do you want to ban?')
            .setRequired(true))
        .addStringOption(option => option.setName('reason')
            .setDescription('Why are you banning this user?')
            .setRequired(true)),
    async execute(interaction, client) {

        await interaction.deferReply();

        const user = interaction.options.getMember('user');
        const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id).catch(err => { });
        const reason = interaction.options.getString('reason');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.editReply({ content: `${config.missingPermissions}` });
        }

        if (!member) {
            return interaction.editReply({ content: 'I wasn\'t able to find that user!' });
        }

        if (interaction.member.roles.highest.position <= member.roles.highest.position) {
            return interaction.editReply({ content: 'I couldn\'t ban this user because the users role might be higher than yours!' });
        }

        if (!member.bannable || member.user.id === client.user.id) {
            return interaction.editReply({ content: 'I couldn\'t ban that user, or maybe it was me! Make sure my roles are higher than the users!' });
        }

        member.ban({ reason }).catch(error => {
            return interaction.editReply({ content: `${config.errorMessage} ${config.errorEmoji}\n${error}` });
        });

        const banEmbed = new EmbedBuilder()
            .setTitle(`${member.user.tag} had been banned! ${config.successEmoji}`)
            .addFields(
                { name: `Name`, value: `${member.user.tag}`, inline: true },
                { name: `Server`, value: `${interaction.guild.name}`, inline: true },
                { name: `Moderator`, value: `${interaction.member.user.tag}`, inline: true },
                { name: `Reason`, value: `${reason}`, inline: true },
            )
            .setColor(config.color)
            .setTimestamp()

        interaction.editReply({ embeds: [banEmbed] });
    },
};