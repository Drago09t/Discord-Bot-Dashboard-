const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const { AttachmentBuilder } = require('discord.js');
const rankingDB = require('./rankingDB');

class RankCardGenerator {
    constructor() {
        this.width = 900;
        this.height = 250;
    }

    async generateCard(user, userStats, rank, guild) {
        const canvas = createCanvas(this.width, this.height);
        const ctx = canvas.getContext('2d');

        // Background gradient
        const gradient = ctx.createLinearGradient(0, 0, this.width, this.height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(0, 0, this.width, this.height);

        // Load avatar
        try {
            const avatar = await loadImage(user.displayAvatarURL({ extension: 'png', size: 256 }));

            // Draw avatar circle
            ctx.save();
            ctx.beginPath();
            ctx.arc(125, 125, 80, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatar, 45, 45, 160, 160);
            ctx.restore();

            // Avatar border
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 6;
            ctx.beginPath();
            ctx.arc(125, 125, 80, 0, Math.PI * 2);
            ctx.stroke();
        } catch (error) {
            console.error('Error loading avatar:', error);
            // Draw placeholder circle
            ctx.fillStyle = '#cccccc';
            ctx.beginPath();
            ctx.arc(125, 125, 80, 0, Math.PI * 2);
            ctx.fill();
        }

        // Username
        ctx.font = 'bold 36px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText(user.username, 240, 80);

        // Level and Rank
        ctx.font = '24px sans-serif';
        ctx.fillStyle = '#e0e0e0';
        ctx.fillText(`Level ${userStats.level}`, 240, 120);

        if (rank) {
            ctx.fillText(`Rank #${rank}`, 420, 120);
        }

        // XP Progress Bar
        const currentLevelXP = rankingDB.getXPForLevel(userStats.level);
        const nextLevelXP = rankingDB.getXPForLevel(userStats.level + 1);
        const xpInLevel = userStats.xp - currentLevelXP;
        const xpNeeded = nextLevelXP - currentLevelXP;
        const progress = Math.min(xpInLevel / xpNeeded, 1);

        const barX = 240;
        const barY = 145;
        const barWidth = 620;
        const barHeight = 30;

        // Progress bar background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(barX, barY, barWidth, barHeight);

        // Progress bar fill
        const progressGradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
        progressGradient.addColorStop(0, '#4facfe');
        progressGradient.addColorStop(1, '#00f2fe');
        ctx.fillStyle = progressGradient;
        ctx.fillRect(barX, barY, barWidth * progress, barHeight);

        // Progress bar border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barHeight);

        // XP Text
        ctx.font = '18px sans-serif';
        ctx.fillStyle = '#ffffff';
        const xpText = `${xpInLevel.toLocaleString()} / ${xpNeeded.toLocaleString()} XP`;
        ctx.fillText(xpText, barX + barWidth - 150, barY + barHeight + 25);

        // Additional stats
        ctx.font = '16px sans-serif';
        ctx.fillStyle = '#e0e0e0';
        ctx.fillText(`Messages: ${userStats.totalMessages}`, barX, barY + barHeight + 25);

        // Server name
        ctx.fillText(`${guild.name}`, barX + 250, barY + barHeight + 25);

        return canvas.toBuffer('image/png');
    }
}

module.exports = { RankCardGenerator };
