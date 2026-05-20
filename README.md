# ⚡ Vortex - Premium Discord Bot & Dashboard

Vortex is a next-generation, high-performance Discord bot engine coupled with a state-of-the-art web-based management dashboard. It includes feature-rich modules for advanced AI moderation, custom welcome messages, automated logs, levels and XP, roles management, voice channel leveling, high-fidelity music playback, and professional ticket support with HTML transcript generation.

Originally designed for remote databases, Vortex has been fully refactored to run locally using a robust SQLite3 database architecture, making it highly portable and lightweight.

---

## ✨ Features

- **🤖 AI-Powered Suite:** Fully integrated with Google Gemini API for context-aware conversations and automated AI content moderation.
- **🎨 Sleek Dark-Mode Dashboard:** Developed using React, Vite, Framer Motion, and Tailwind CSS. Features smooth micro-animations, glassmorphic UI, and ambient floating light orbs.
- **📈 Visual Analytics:** Track member counts, guild statistics, message activity, and voice XP levels via responsive interactive charts.
- **🛡️ AutoMod & Logs:** Comprehensive security system protecting against raids, bad words, and malicious invites with instant logging.
- **🎫 Professional Ticket System:** Setup support channels, select active managers, and auto-generate HTML transcripts when tickets are closed.
- **🎵 Music Integration:** Lavalink-backed high-fidelity audio system for latency-free music playback.
- **🪙 Economy & Shop:** Custom economy modules with level-up events, XP multipliers, and virtual items shop.
- **🗃️ SQLite3 Backend:** Complete migration from Supabase to local SQLite (`database.sqlite`) using a robust database compatibility wrapper.

---

## 📂 Project Architecture

Here is an overview of the directory structure:

```
Discord-Dashboard/
├── commands/               # Discord Slash Commands
│   ├── ai/                 # AI text/sentiment analysis, debate, personas
│   ├── economy/            # balance, shop, buy, inventory, pay
│   ├── fun/                # 8ball, quiz, rps, memes, joke, roll
│   ├── leveling/           # rank, setxp, leaderboard
│   ├── music/              # play, pause, queue, volume, skip
│   └── voice247/           # voice24, voicejoin, voiceleave, voicestop
├── dashboard/              # React + Vite Frontend Dashboard
│   ├── src/
│   │   ├── components/     # Layout, Error Boundary, Credits, Server Selector
│   │   ├── pages/          # Admin Manager, AutoMod, Economy, Embeds, Landing
│   │   ├── App.jsx         # Navigation and state management
│   │   └── index.css       # Premium custom Tailwind design tokens
│   └── server/             # Express.js Session & OAuth2 Dashboard Backend API
├── lavalink/               # Lavalink Server configuration
├── sqliteDB.js             # SQLite Database handler & initialization script
├── supabaseDB.js           # Supabase compatibility wrapper layer
├── bot.js                  # Main Discord client execution file
└── init_sqlite.js          # SQLite3 database schemas installer
```

---

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v16.x or higher)
- Discord Bot Token & OAuth2 Client Credentials (from the [Discord Developer Portal](https://discord.com/developers/applications))
- Google Gemini API Key (Optional, for AI modules)
- A running Lavalink node (Optional, for music features)

### 1. Clone & Install Dependencies
Clone the repository to your local system and install package dependencies for both the Bot Core and the React Dashboard.

```bash
# Install Bot dependencies
npm install

# Install Dashboard Frontend dependencies
cd dashboard
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory of the project. A template of the required variables is shown below:

```env
# Discord Auth & Bot Credentials
DISCORD_BOT_TOKEN=your_discord_bot_token
CLIENT_ID=your_discord_client_id
CLIENT_SECRET=your_discord_client_secret
REDIRECT_URI=http://localhost:5173/auth/callback

# AI Engine
GEMINI_API_KEY=your_gemini_api_key

# Lavalink Configuration (Music)
LAVALINK_URL=lavalink_node_address:port
LAVALINK_AUTH=your_lavalink_password
LAVALINK_SECURE=false

# Bot Administration
OWNER_ID=your_discord_user_id
bot_admins=your_discord_user_id
```

> [!WARNING]
> Do NOT share your `.env` or commit it to GitHub. It contains secret authorization keys and Discord credentials.

### 3. Initialize the Local Database
Vortex uses a local SQLite database (`database.sqlite`). You must initialize the database schemas before starting the application:

```bash
node init_sqlite.js
```

### 4. Running the Project Locally
To run the bot backend and frontend dashboard in development mode:

**Start the Bot & Backend API:**
```bash
# From the root directory
node bot.js
```
The Dashboard API will spin up and listen on `http://localhost:3001`.

**Start the Vite Frontend Dev Server:**
```bash
# Open a new terminal window
cd dashboard
npm run dev
```
The client dashboard will start and run on `http://localhost:5173`. Open this URL in your web browser to access the setup.

---

## 🤖 Slash Commands Guide

Vortex includes **60 slash commands** organized into functional modules:

### 🤖 AI Suite (`/commands/`)
- `/ask` - Chat with Google Gemini AI.
- `/analyze` - Run sentiment/intent analysis on a sentence.
- `/debate` - Start a debate topic with Gemini.
- `/persona` - Configure your AI's personal behavior.
- `/brainstorm` - Brainstorm creative ideas.

### 🪙 Economy & Shop
- `/balance` - Check your wallet and bank balance.
- `/shop` - Open the server-wide items shop.
- `/buy [item]` - Purchase a virtual item from the shop.
- `/sell [item]` - Sell back inventory items.
- `/inventory` - View your purchased items.
- `/pay [user] [amount]` - Send coins to another member.

### 📈 Leveling & XP
- `/rank [user]` - View your server rank card image.
- `/leaderboard` - View top XP scorers on the server.
- `/setxp [user] [xp]` - (Admin) Modify a user's XP score.

### 🎵 Music (Lavalink)
- `/play [url/search]` - Add a song and play it.
- `/pause` - Pause audio stream.
- `/resume` - Resume audio playback.
- `/skip` - Vote to skip the current song.
- `/queue` - Display current server playlist.
- `/volume [1-100]` - Modify playback volume.

### 🗣️ Voice 24/7 Channels
- `/voice24` - Enable 24/7 audio connection persistence.
- `/voicejoin` - Command bot to join a voice channel.
- `/voiceleave` - Leave the active voice session.

---

## 🗃️ Database Schemas & Migrations

The local database configuration is managed in `sqliteDB.js` which parses dynamic statements into tables. The full structural layout can be viewed in the following configuration files:
* [admin_system_schema.sql](file:///d:/New%20folder/Discord-Dashboard/admin_system_schema.sql)
* [ai_suite_schema.sql](file:///d:/New%20folder/Discord-Dashboard/ai_suite_schema.sql)
* [economy_shop_schema.sql](file:///d:/New%20folder/Discord-Dashboard/economy_shop_schema.sql)
* [invite_logger_schema.sql](file:///d:/New%20folder/Discord-Dashboard/invite_logger_schema.sql)
* [user_profile_schema.sql](file:///d:/New%20folder/Discord-Dashboard/user_profile_schema.sql)

---

## 📜 Credits & License

### Original Author
This project was developed, designed, and optimized by **[Drago](https://github.com)**.

### License & Attribution Terms
Vortex is released as an open-source project under a modified MIT License. 

**IMPORTANT LICENSE REQUIREMENT:** 
The developer attribution credits, brand watermarks, and author notices present in the user interface (specifically the Landing Page footer, Server Selection footer, and Dashboard Sidebar) stating **"Made by Drago"** must remain completely unmodified, fully visible, and cannot be hidden, bypassed, or removed in any fork, redistribution, or derivative work.

*Note: The frontend code includes an active integrity verification mechanism to enforce this license condition.*
