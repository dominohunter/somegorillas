# SomeGorillas - Blockchain Coin Flip Game 🪙

A high-stakes, adrenaline-charged coin flipping mini-game built on the Somnia Testnet. Test your luck, make predictions, and compete with other players in this fully on-chain gaming experience.

## 🎯 About

SomeGorillas is a Web3 coin flip betting game where players predict the outcome of a coin toss. Built for the Somnia v1 Mini-Games Hackathon, this game combines simple mechanics with blockchain technology to create an engaging, provably fair gaming experience.

### Key Features
- 🪙 **Fully On-Chain Gameplay** - All game logic runs on smart contracts
- 🎲 **Provably Fair** - Blockchain ensures transparent, verifiable results
- 📊 **Statistics & Leaderboards** - Track your performance and compete
- 🏆 **Achievement System** - Unlock rewards as you play
- 👥 **Social Features** - Discord integration and referral system
- 📱 **Mobile Responsive** - Play anywhere, anytime
- ⚡ **Real-time Updates** - Instant transaction monitoring

## 🎮 How to Play

### Basic Gameplay
1. **Connect Wallet** - Connect your Web3 wallet (MetaMask recommended)
2. **Choose Your Side** - Select either "Head" or "Butt" (tails)
3. **Place Your Bet** - Pay 0.0001 ETH flip fee
4. **Flip the Coin** - Submit transaction and watch the coin spin
5. **Check Results** - Win or lose, results are instant and transparent

### Game Rules
- **Flip Fee**: 0.0001 ETH per game
- **Daily Limit**: 10 flips per day count towards statistics
- **Instant Results**: Outcomes determined by blockchain randomness
- **Provably Fair**: All results verifiable on-chain

### Scoring System
- Track your win/loss ratio
- Compete on global leaderboards
- Earn achievements for milestones
- Build your reputation in the community

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Web3 wallet (MetaMask recommended)
- Somnia Testnet tokens for gameplay

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/dominohunter/somegorillas.git
cd somegorillas
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm run dev
```

4. **Open your browser**
Navigate to [http://localhost:3000](http://localhost:3000)

### Wallet Setup
1. Install MetaMask browser extension
2. Add Somnia Testnet (Chain ID: 50312)
3. Get testnet tokens from [Somnia Faucet](https://faucet.somnia.network)
4. Connect wallet to the application

## 🔧 Technical Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: TailwindCSS, Custom Components
- **Web3**: Wagmi, Ethers.js, Viem
- **Animations**: Framer Motion
- **State Management**: React Query, Context API
- **Blockchain**: Somnia Testnet (EVM Compatible)

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app router pages
├── components/
│   ├── animations/        # Coin flip animations
│   ├── cards/            # UI card components
│   ├── dashboard/        # Game dashboard components
│   ├── icons/            # Custom SVG icons
│   ├── modals/           # Result and info modals
│   └── ui/               # Reusable UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configuration
└── contexts/             # React contexts
```

## 🌐 Deployment

This application is designed for deployment on Somnia Testnet with minimal off-chain dependencies:

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Create `.env.local`:
```
NEXT_PUBLIC_API_URL=your_backend_url
```



## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request


## 🏆 Hackathon Submission

**Somnia v1 Mini-Games Hackathon Entry**
- **Category**: Blockchain Gaming / Mini-Games
- **Network**: Somnia Testnet
- **On-chain Components**: Game logic, randomness, result verification
- **Off-chain Components**: UI, statistics API, user management

Built with ❤️ for the Somnia ecosystem
