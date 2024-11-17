# Dark Factory

**Dark Factory** combines the exploration of _Dark Forest_ with the automation and resource management systems of _Factorio_. It empowers players to design and optimize island layouts, fostering creativity and strategic thinking while leveraging blockchain and zero-knowledge proofs (ZKP) for a decentralized and secure experience.

## 🚀 Features

- **Strategic Challenge**: Design and manage resource-generating "islands" for maximum efficiency and rewards.
- **Privacy by ZKP in Blockchain**: Utilizes ZKP for transparent, privacy-preserving gameplay.
- **Rewarding Creativity**: Encourages thoughtful layouts and strategic planning.
- **Optimized Performance**: Supports in-browser proof generation, even on mobile devices.

## 🌟 Why It's Challenging

Building **Dark Factory** involved addressing multiple complex challenges:

- **Circuit Design**:

  - Proving production rates and capacity while incorporating game rules such as ensuring factories are built adjacent to roads and connected to ports.
  - Transforming variable-length road search problems into fixed-length verifiable constraints.
  - Designing efficient hint data for validation within circuits.

- **Performance Optimization**:

  - We reduced circuit constraints to under **100k**, enabling proof generation in seconds, even on mobile browsers, ensuring accessibility for a wide audience.

- **Game Logic in ZKP**:
  - Extensive work was done on paper to find optimal methods for expressing constraints, balancing efficiency and user experience.

## 🛠️ How It's Made

### Technology Stack

- **[Circom](https://github.com/iden3/circom)**: ZKP circuit development.
- **[Circomlib](https://github.com/iden3/circomlib)**: Foundational libraries for circuits.
- **[SnarkJS](https://github.com/iden3/snarkjs)**: In-browser proof generation.
- **[Vue.js](https://vuejs.org/)/[Quasar](https://quasar.dev/)**: Front-end development.
- **[Foundry](https://github.com/foundry-rs/foundry)**: Smart contract development tools.
- **[Solidity](https://soliditylang.org/)**: Smart contract programming language.
- **[Typechain](https://github.com/dethcrypto/TypeChain)**: Contract interface generation.
- **[Ethers.js](https://docs.ethers.io/)**: Blockchain interaction library.

### Development Workflow

1. **Circuit Design and Integration**:

   - Circom circuits encode game rules and generate a Solidity verifier.
   - The verifier integrates with the main `Game.sol` smart contract deployed on an EVM-compatible chain for rapid testing.

2. **Front-End and Proofs**:

   - WASM files from Circom enable in-browser proof generation via SnarkJS.
   - A canvas-based UI, powered by Vue.js/Quasar, lets players design layouts intuitively.

3. **Blockchain Interaction**:
   - Typechain automates the connection between smart contracts and the front-end.
   - Ethers.js handles seamless blockchain interactions.

## Deployment Details

- Scroll Sepolia: 0x03F80FeA1795627334C2c2ae7D623257398d0549
- Polygon zkEVM Cardona: 0x03F80FeA1795627334C2c2ae7D623257398d0549
- Linea: 0x03F80FeA1795627334C2c2ae7D623257398d0549
- World: 0x03F80FeA1795627334C2c2ae7D623257398d0549

## 🎮 Gameplay Highlights

- **Design Islands**: Players create layouts with factories and roads to maximize production.
- **Strategic Challenges**: Only factories connected to ports via roads are valid, adding depth to gameplay.
- **Optimized for All Devices**: The game runs efficiently on both desktop and mobile browsers.

## 💡 Future Improvements

- Enhanced layout visualization tools.
- Additional game mechanics for deeper strategy.
- Expanding blockchain integration to include NFTs or player-owned assets.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

**Start strategizing and building your islands in Dark Factory!** 🌌🏭
