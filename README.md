![](https://i.ibb.co/XY900Xv/Contract-Swap2.png)

## Local setup

To run this project locally, follow these steps and connect your wallet to localhost.

1. Clone the project locally, change into the directory, and install the dependencies: shell

```sh
git clone https://github.com/oscargarza356/ContractSwap_Oasis
cd contractswap_Oasis

# install using NPM or Yarn
npm install

# or

yarn
```

2. Start the local Hardhat node

```sh
npx hardhat node
```

3. With the network running, deploy the contracts to the local network in a separate terminal window

```sh
npx hardhat run scripts/deploy.js --network localhost
```

4. Start the app

```
npm start
```
