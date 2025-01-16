# ClashBot 🎮

ClashBot is a Telegram bot that brings Web3 excitement to Clash of Clans by enabling players to place SOL bets on their war attacks. Predict your attack stars, place bets with SOL, and win rewards for accurate predictions—making clan wars more thrilling than ever!

## Features

- 🎯 Place bets on your war attacks using SOL
- 💰 Win multiplied rewards for accurate predictions
- 🔄 Real-time war attack verification
- 🏦 Secure escrow system for bets
- 📱 Easy-to-use Telegram interface
- ⚡ Integration with Solana blockchain

## Prerequisites

- Node.js v16 or higher
- Telegram Bot Token
- Clash of Clans API Token
- Solana Wallet (for handling transactions)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/clashbot.git
cd clashbot
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
BOT_TOKEN=your_telegram_bot_token
COC_API_TOKEN=your_clash_of_clans_api_token
SOLANA_RPC_URL=your_solana_rpc_url
```

## Usage

1. Start the bot:
```bash
npm start
```

2. In Telegram, interact with the bot using these commands:
- `/start` - Initialize the bot
- `/register <player_tag>` - Register your Clash of Clans account
- `/bet <amount> <target_position> <predicted_stars>` - Place a bet
- `/verify` - Verify your attack and claim rewards
- `/balance` - Check your SOL balance
- `/help` - View all commands

## Project Structure

```
clashBot/
├── src/
│   ├── index.ts           # Main bot file
│   ├── stateManager.ts    # State management
│   ├── types.ts          # TypeScript interfaces
│   └── utils/            # Utility functions
├── data/                 # Persistent data storage
├── package.json
└── tsconfig.json
```

## Technical Stack

- TypeScript
- Node.js
- Telegram Bot API
- Clash of Clans API
- Solana Web3.js

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- [@twitter](https://x.com/ritikbhatt020)
