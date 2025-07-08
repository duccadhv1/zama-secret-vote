# SecretVote 🗳️

A decentralized voting application built with Zama's Fully Homomorphic Encryption (FHE) technology, ensuring complete vote privacy until results are revealed.

## 🌟 Features

- **Private Voting**: Votes are encrypted using FHE and remain private until decryption
- **Transparent Results**: Results are verifiable on-chain after decryption
- **Modern UI**: Built with Next.js 15, React 19, and TailwindCSS
- **Secure Smart Contracts**: Solidity contracts with comprehensive testing
- **Multi-Choice Support**: Up to 4 voting options per proposal

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Smart Contract │    │   FhEVM Network │
│   (Next.js)     │────│   (SecretVote)   │────│   (Zama)        │
│                 │    │                  │    │                 │
│ • Vote Encrypt  │    │ • Vote Storage   │    │ • FHE Compute   │
│ • UI/UX        │    │ • Decryption     │    │ • Key Management│
│ • Wallet Conn. │    │ • Access Control │    │ • Privacy Layer │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- MetaMask or compatible Web3 wallet
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/secretvote.git
   cd secretvote
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Compile contracts**

   ```bash
   pnpm compile
   ```

5. **Run tests**

   ```bash
   pnpm test
   ```

6. **Deploy contracts (testnet)**

   ```bash
   pnpm deploy:testnet
   ```

7. **Start development server**
   ```bash
   pnpm dev
   ```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 📋 Usage

### Creating a Proposal

1. Connect your wallet to Zama testnet
2. Click "Create Proposal"
3. Enter proposal description and voting duration
4. Submit transaction and wait for confirmation

### Voting

1. Browse active proposals on the dashboard
2. Click "Vote" on any proposal
3. Select your choice (A, B, C, or D)
4. Your vote is encrypted client-side and submitted
5. Transaction confirms your encrypted vote is recorded

### Viewing Results

1. After voting deadline, click "Request Decryption"
2. Wait for FHE decryption process to complete
3. View results with vote counts for each option
4. Results are permanently recorded on-chain

## 🛠️ Development

### Project Structure

```
secretvote/
├── contracts/              # Solidity smart contracts
│   ├── SecretVote.sol      # Main voting contract
│   └── interfaces/         # Contract interfaces
├── src/
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and config
│   └── types/            # TypeScript types
├── test/                 # Contract tests
├── scripts/              # Deploy scripts
└── docs/                 # Documentation
```

### Smart Contract API

#### Core Functions

```solidity
// Create a new proposal (owner only)
function createProposal(string description, uint256 duration) returns (uint256)

// Cast encrypted vote
function vote(uint256 proposalId, inEuint8 encryptedChoice, bytes proof)

// Request decryption after deadline
function requestDecryption(uint256 proposalId)

// Get decrypted results
function getResults(uint256 proposalId) returns (uint64[4])
```

#### View Functions

```solidity
function getProposal(uint256 id) returns (Proposal)
function getProposalCount() returns (uint256)
function getHasVoted(uint256 id, address voter) returns (bool)
function getVotingStatus(uint256 id) returns (VotingStatus)
```

### Frontend Hooks

```typescript
// FhEVM integration
const { instance, encrypt, initFhevm } = useFhevm();

// Contract interaction
const { proposalCount, createProposal, vote, requestDecryption } =
  useSecretVote(contractAddress);
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
# Unit tests
pnpm test

# Coverage report
pnpm test:coverage

# Gas report
REPORT_GAS=true pnpm test
```

Tests cover:

- ✅ Proposal creation and management
- ✅ Vote casting and validation
- ✅ Access control and security
- ✅ Decryption workflow
- ✅ Edge cases and error handling

## 🌐 Networks

### Zama Testnet

- **Chain ID**: 8009
- **RPC**: https://devnet.zama.ai
- **Explorer**: https://main.explorer.zama.ai
- **Faucet**: [Get testnet tokens](https://faucet.zama.ai)

### Configuration

```typescript
// Add to your wallet
{
  chainId: 8009,
  chainName: "Zama Network Testnet",
  rpcUrls: ["https://devnet.zama.ai"],
  nativeCurrency: {
    name: "ZAMA",
    symbol: "ZAMA",
    decimals: 18
  }
}
```

## 🔒 Security

### Cryptographic Security

- **FHE Encryption**: Client-side vote encryption using fhevmjs
- **Zama Protocol**: Leverages battle-tested FHE cryptography
- **No Vote Buying**: Impossible to prove individual votes

### Smart Contract Security

- **Access Control**: Owner-only functions for proposal creation
- **Reentrancy Protection**: ReentrancyGuard on state-changing functions
- **Input Validation**: Comprehensive validation of all parameters
- **Overflow Protection**: Solidity 0.8+ built-in overflow checks

### Audit Status

🚧 **Pre-Audit**: This is demonstration code. Professional audit required before mainnet deployment.

## 📚 Documentation

- [Architecture Overview](./docs/architecture.md)
- [Deployment Guide](./docs/deployment.md)
- [API Reference](./docs/api.md)
- [Security Considerations](./docs/security.md)

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Ensure all tests pass (`pnpm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Zama](https://zama.ai) for FHE technology and fhEVM
- [OpenZeppelin](https://openzeppelin.com) for secure contract libraries
- [Next.js](https://nextjs.org) and [TailwindCSS](https://tailwindcss.com) for frontend framework
- [Hardhat](https://hardhat.org) for development tooling

## 📞 Support

- 📧 Email: support@secretvote.com
- 💬 Discord: [Join our community](https://discord.gg/secretvote)
- 🐛 Issues: [GitHub Issues](https://github.com/your-username/secretvote/issues)
- 📚 Docs: [Documentation Site](https://docs.secretvote.com)

---

**⚠️ Disclaimer**: This is demonstration software. Thoroughly test and audit before any production use.
