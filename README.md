#  VeriFund — Trustless Crowdfunding on Ethereum

> *"Fund what matters. With zero trust required."*

VeriFund is a decentralized crowdfunding platform built on Ethereum where every donation is held in a smart contract escrow and funds are only released when donors vote to approve milestones. If a campaign fails to meet its goal, donors are automatically refunded — no humans, no delays, no promises.

[![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)](https://soliditylang.org/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev/)
[![Ethers.js](https://img.shields.io/badge/Ethers.js-v6-3C3C3D)](https://docs.ethers.org/v6/)
[![Network](https://img.shields.io/badge/Network-Sepolia%20Testnet-6F4FBB)](https://sepolia.etherscan.io/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

<video src="verifund.mp4" controls width="600"></video>


---

## 📋 Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [How It Works](#how-it-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Smart Contract](#smart-contract)
- [Getting Started](#getting-started)
- [Deployment Guide](#deployment-guide)
- [Project Structure](#project-structure)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Contract Address](#contract-address)

---

## 🔴 The Problem

Traditional crowdfunding platforms operate on trust — donors send money and hope it reaches the right person and is spent as promised. There is no mechanism to verify fund usage, no recourse if the creator disappears, and no guaranteed refund if the campaign fails.

In India alone, thousands of online fundraisers turn out to be fraudulent every year. Donors lose faith, legitimate creators lose credibility, and billions of rupees vanish with zero accountability.

---

## ✅ The Solution

VeriFund replaces trust with mathematics. Every campaign is governed entirely by a **smart contract** — a piece of code deployed on the Ethereum blockchain that:

- **Holds all funds in escrow** — donations never touch the creator's wallet until approved
- **Requires donor majority vote** to release any funds via milestones
- **Automatically refunds donors** if the goal isn't met by the deadline
- **Records every transaction publicly** — verifiable by anyone on Etherscan

No platform admin. No central authority. No human can override the rules.

---

## ⚙️ How It Works

```
1. CREATOR  →  Deploys campaign (sets goal + deadline on-chain)
2. DONORS   →  Contribute ETH → locked in smart contract escrow
3. CREATOR  →  Submits milestone request with proof of work
4. DONORS   →  Vote YES/NO on-chain to approve fund release
5. CONTRACT →  Automatically releases funds if majority approves
               OR refunds all donors if goal not met by deadline
```

### Step-by-Step

| Step | Who | What Happens |
|------|-----|--------------|
| 1 | Creator | Creates campaign with title, description, goal (ETH), and duration |
| 2 | Donors | Contribute ETH directly to the smart contract escrow |
| 3 | Contract | Tracks total raised, flips `goalReached = true` when goal is met |
| 4 | Creator | Submits a milestone request describing fund usage |
| 5 | Donors | Each donor votes approve or reject on-chain |
| 6 | Contract | Transfers ETH to creator if majority approves, or marks as rejected |
| 7 | Donors | If deadline passes without goal being met, call `claimRefund()` to get ETH back |

---

## 🌟 Features

### For Donors
- ✅ Full transparency — every donation visible on Etherscan
- ✅ Vote on every milestone before funds are released
- ✅ Automatic refund eligibility if campaign goal is not met
- ✅ See exactly how much of their contribution remains in escrow
- ✅ One vote per wallet per milestone — fair and tamper-proof

### For Creators
- ✅ Launch a fundraising campaign in minutes
- ✅ No platform fees or intermediaries
- ✅ Submit milestone requests to release funds progressively
- ✅ Build credibility through transparent, on-chain accountability
- ✅ Borderless — accept donations from anyone with a crypto wallet

### Platform
- ✅ Fully decentralized — no central server holds funds
- ✅ Open source — contract code verifiable on Etherscan
- ✅ Immutable rules — no admin can change the contract logic
- ✅ MetaMask wallet integration
- ✅ Animated, responsive UI with warm community-first design
- ✅ Real-time campaign stats and milestone tracking

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Smart Contract | Solidity 0.8.20 |
| Blockchain | Ethereum (Sepolia Testnet) |
| Frontend | React 18 + Vite |
| Blockchain Library | Ethers.js v6 |
| Wallet | MetaMask |
| Contract Development | Remix IDE |
| Deployment | Netlify / Vercel |
| Fonts | Lora (serif) + Nunito (sans-serif) |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                          │
│                                                              │
│  ┌─────────────────┐         ┌──────────────────────────┐  │
│  │   React App     │◄───────►│      MetaMask Wallet     │  │
│  │  (Vite + JSX)   │         │  (Signs Transactions)    │  │
│  └────────┬────────┘         └──────────┬───────────────┘  │
│           │                             │                    │
└───────────┼─────────────────────────────┼────────────────────┘
            │                             │
            │  Ethers.js v6               │ JSON-RPC
            ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                    ETHEREUM SEPOLIA                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              CrowdFund.sol Smart Contract             │  │
│  │                                                       │  │
│  │  State:                  Functions:                   │  │
│  │  • campaigns mapping     • createCampaign()           │  │
│  │  • milestones mapping    • donate()                   │  │
│  │  • donations mapping     • addMilestone()             │  │
│  │  • hasVoted mapping      • vote()                     │  │
│  │  • donors array          • claimRefund()              │  │
│  │  • totalCampaigns        • getCampaign()              │  │
│  │                          • getMilestone()             │  │
│  │                          • getMyDonation()            │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 📄 Smart Contract

### Contract: `CrowdFund.sol`

Deployed at: `0x2d3D8f0e3cad89773205e4Ea4783f129266D17a1` (Sepolia Testnet)

### Data Structures

```solidity
struct Campaign {
    uint256 id;
    address payable creator;
    string  title;
    string  description;
    uint256 goalAmount;      // in wei
    uint256 deadline;        // unix timestamp
    uint256 totalRaised;     // in wei
    bool    goalReached;
    bool    isCancelled;
}

struct Milestone {
    uint256 id;
    string  description;
    uint256 releaseAmount;   // in wei
    bool    isApproved;
    bool    isRejected;
    uint256 approveVotes;
    uint256 rejectVotes;
}
```

### Key Functions

| Function | Access | Description |
|----------|--------|-------------|
| `createCampaign(title, desc, goalETH, days)` | Public | Creates a new campaign |
| `donate(campaignId)` | Public Payable | Donates ETH to a campaign |
| `addMilestone(campaignId, desc, amountETH)` | Creator Only | Submits a fund release request |
| `vote(campaignId, milestoneId, approve)` | Donors Only | Votes on a milestone |
| `claimRefund(campaignId)` | Donors Only | Claims refund if goal not met |
| `getCampaign(id)` | View | Returns full campaign data |
| `getMilestone(cId, mId)` | View | Returns full milestone data |
| `getMyDonation(campaignId)` | View | Returns caller's donation amount |
| `getDonorCount(campaignId)` | View | Returns total number of donors |
| `getTimeRemaining(campaignId)` | View | Returns seconds until deadline |

### Security Features

- **Re-entrancy protection** on `claimRefund()` — zeroes balance before transfer
- **Creator cannot donate** to their own campaign
- **Only donors can vote** — one vote per wallet per milestone
- **Funds can only release** after majority donor approval
- **Deadline enforcement** — donations rejected after deadline

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- [MetaMask](https://metamask.io/) browser extension
- Sepolia testnet ETH (free from faucet)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/verifund.git
cd verifund

# Install dependencies
npm install

# Install ethers.js
npm install ethers

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Get Test ETH

1. Open MetaMask and switch to **Sepolia Testnet**
2. Copy your wallet address
3. Visit [Google Cloud Faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia)
4. Paste your address and request ETH
5. Wait ~30 seconds for it to arrive

---

## 📦 Deployment Guide

### Deploy the Smart Contract (Remix IDE)

1. Open [Remix IDE](https://remix.ethereum.org)
2. Create a new file: `CrowdFund.sol`
3. Paste the contract code from `/contracts/CrowdFund.sol`
4. In the **Compiler** tab:
   - Set version to `0.8.20`
   - Click **Compile CrowdFund.sol**
5. In the **Deploy & Run** tab:
   - Set Environment to **Injected Provider - MetaMask**
   - Ensure MetaMask is on **Sepolia**
   - Click **Deploy & Verify**
   - Confirm in MetaMask
6. Copy the deployed contract address

### Update Frontend

In `src/App.jsx`, replace the contract address:

```javascript
const CONTRACT_ADDRESS = "YOUR_NEW_CONTRACT_ADDRESS_HERE";
```

### Deploy Frontend to Netlify

```bash
# Build the project
npm run build

# Option 1: Drag the dist/ folder to https://app.netlify.com/drop
# Option 2: Install Netlify CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## 📁 Project Structure

```
verifund/
├── src/
│   ├── App.jsx              ← Main React application (entire DApp)
│   └── main.jsx             ← React entry point
├── contracts/
│   └── CrowdFund.sol        ← Solidity smart contract
├── public/
│   └── vite.svg
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## ⚠️ Known Limitations

| Limitation | Description | Planned Fix |
|------------|-------------|-------------|
| **Oracle Problem** | Milestone proof is text only — contract cannot verify real-world claims | IPFS file upload integration |
| **Gas Fees** | Ethereum mainnet gas fees make small donations impractical | Deploy on Polygon/Base L2 |
| **ETH Volatility** | Campaign goals in ETH fluctuate in real-world value | USDC stablecoin support |
| **Mobile Wallets** | Only MetaMask desktop supported | WalletConnect v2 integration |
| **Manual Refunds** | Donors must manually call claimRefund() | Chainlink Automation |
| **No Notifications** | Donors not notified when milestones submitted | Push Protocol integration |
| **Whale Voting** | 1 wallet = 1 vote regardless of contribution | Quadratic voting |
| **No Dispute Resolution** | No recourse if donors vote unfairly | Kleros arbitration layer |

---

## 🗺️ Roadmap

### Phase 1 — Core (Complete ✅)
- [x] Smart contract with escrow + milestone voting
- [x] Automatic refund mechanism
- [x] React frontend with MetaMask integration
- [x] Campaign creation, donation, milestone submission
- [x] On-chain voting system

### Phase 2 — In Progress 🔄
- [ ] IPFS milestone proof (file/photo upload)
- [ ] Deploy on Polygon for low gas fees
- [ ] USDC stablecoin support

### Phase 3 — Planned 📋
- [ ] WalletConnect v2 (mobile wallet support)
- [ ] Chainlink Automation for auto-refunds
- [ ] Push Protocol notifications
- [ ] Quadratic voting
- [ ] Creator reputation score system

### Phase 4 — Future 🔮
- [ ] NFT donation receipts (Soulbound Tokens)
- [ ] DAO governance token
- [ ] Multi-sig support for large campaigns
- [ ] Kleros dispute resolution

---

## 📊 Contract Address

| Network | Address |
|---------|---------|
| Sepolia Testnet | [`0x2d3D8f0e3cad89773205e4Ea4783f129266D17a1`](https://sepolia.etherscan.io/address/0x2d3D8f0e3cad89773205e4Ea4783f129266D17a1) |

---

## 🧪 Testing the Full Flow

### Test 1 — Create a Campaign
1. Connect MetaMask (Sepolia)
2. Click **New Campaign**
3. Fill in title, description, goal (1 ETH), duration (3 days)
4. Click **Deploy** → Confirm in MetaMask
5. ✅ Campaign appears on the homepage

### Test 2 — Donate
1. Switch to a different MetaMask account
2. Open the campaign → Enter `0.01` ETH
3. Click **Donate** → Confirm in MetaMask
4. ✅ Progress bar updates, donor count increases

### Test 3 — Milestone Voting
1. Switch back to creator account
2. Once goal is reached, submit a milestone
3. Switch to donor account → Vote to approve
4. ✅ Funds transfer to creator automatically

### Test 4 — Refund
1. Create a campaign with a goal you can't meet
2. Wait for deadline to pass (or set 1-day duration)
3. Open the campaign as donor → Click **Claim Refund**
4. ✅ ETH returned to your wallet

---

## 📖 Key Concepts Demonstrated

| Concept | Where It Appears |
|---------|-----------------|
| **Smart Contract** | `CrowdFund.sol` — all campaign logic |
| **Escrow Pattern** | Funds held by contract, not creator |
| **Access Control** | `onlyCreator` modifier |
| **Structs** | Campaign and Milestone data types |
| **Mappings** | Donations, votes, milestone data |
| **Events** | All major state changes emitted |
| **Re-entrancy Guard** | `claimRefund()` — zero before transfer |
| **View Functions** | Free reads without gas |
| **Payable Functions** | `donate()` accepts ETH |
| **Wallet Integration** | MetaMask via Ethers.js v6 |
| **State Management** | React useState and useCallback |
| **ABI Interaction** | JSON ABI for contract calls |

---

## 👨‍💻 Author

Built as a portfolio project demonstrating real-world application of:
- Ethereum smart contract development (Solidity)
- DeFi / Web3 application architecture
- React frontend development
- Blockchain-frontend integration with Ethers.js
- Decentralized governance mechanisms (voting, escrow)

---

## 📄 License

MIT License — feel free to use, modify, and distribute.

---

## 🙏 Acknowledgements

- [Ethereum Foundation](https://ethereum.org) — for the underlying blockchain
- [OpenZeppelin](https://openzeppelin.com) — for Solidity patterns and security inspiration
- [Remix IDE](https://remix.ethereum.org) — for contract development and deployment
- [MetaMask](https://metamask.io) — for wallet integration
- [Ethers.js](https://ethers.org) — for blockchain interaction

---

> *"The best charity is the one you can verify."*
> 
> VeriFund — Where every donation is protected by code, not promises.
