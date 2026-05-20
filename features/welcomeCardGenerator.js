const { createCanvas, loadImage } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');

class WelcomeCardGenerator {
    constructor() {
        this.width = 1024;
        this.height = 450;
    }

    async generate(member, settings) {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // 1. Background
        try {
            if (settings.welcome_background_url) {
                const background = await loadImage(settings.welcome_background_url);
                // Draw aspect fill
                const ratio = Math.max(this.width / background.width, this.height / background.height);
                const x = (this.width - background.width * ratio) / 2;
                const y = (this.height - background.height * ratio) / 2;
                ctx.drawImage(background, x, y, background.width * ratio, background.height * ratio);
            } else {
                // Default gradient background
                const grad = ctx.createLinearGradient(0, 0, this.width, this.height);
                grad.addColorStop(0, '#1e1e2e');
                grad.addColorStop(1, '#11111b');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, this.width, this.height);
            }
        } catch (error) {
            console.error('Error loading welcome background:', error);
            ctx.fillStyle = '#1e1e2e';
            ctx.fillRect(0, 0, this.width, this.height);
        }

        // Overlay for better text readability
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, this.width, this.height);

        // 2. Avatar
        const avatarSize = 200;
        const avatarX = (this.width - avatarSize) / 2;
        const avatarY = 80;

        try {
            const avatarUrl = member.user.displayAvatarURL({ extension: 'png', size: 256 });
            const avatar = await loadImage(avatarUrl);

            ctx.save();
            ctx.beginPath();
            ctx.arc(this.width / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
            ctx.restore();

            // Avatar Ring
            ctx.strokeStyle = settings.welcome_text_color || '#ffffff';
            ctx.lineWidth = 8;
            ctx.beginPath();
            ctx.arc(this.width / 2, avatarY + avatarSize / 2, avatarSize / 2 + 4, 0, Math.PI * 2);
            ctx.stroke();
        } catch (error) {
            console.error('Error loading avatar for welcome card:', error);
        }

        // 3. Text
        ctx.textAlign = 'center';
        ctx.fillStyle = settings.welcome_text_color || '#ffffff';

        // Welcome Text
        ctx.font = 'bold 42px sans-serif';
        ctx.fillText('WELCOME', this.width / 2, 330);

        // Username Text
        ctx.font = 'bold 60px sans-serif';
        const name = member.user.username.toUpperCase();
        ctx.fillText(name, this.width / 2, 395);

        // Member Count Text
        ctx.font = '24px sans-serif';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillText(`Member #${member.guild.memberCount}`, this.width / 2, 430);

        return canvas.toBuffer('image/png');
    }
}

module.exports = new WelcomeCardGenerator();
