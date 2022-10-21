import { useEffect, useState } from "react";

import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { contractSwapAddress } from "../config";

import ContractSwap from "../artifacts/contracts/ContractSwap.sol/ContractSwap.json";
export const Header = (props) => {
  const [saleContracts, setSaleContracts] = useState(false);
  const [offeredContracts, setOfferedContracts] = useState(false);
  const [errorState, setErrorState] = useState(false);
  const [currencyState, setCurrencyState] = useState("OASIS");
  const [loadingState, setLoadingState] = useState("not-loaded");
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [formInput, updateFormInput] = useState({ contractAddress: "", buyerAddress: "", price: "" });
  // this should be wallet connected
  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    //remember that the provider will need to be updated right now is null as is local
    const web3Modal = new Web3Modal();
    console.log("we are definitly here");
    if (web3Modal.cachedProvider !== "") {
      const connection = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(connection);
      const chain = await provider.getNetwork();
      console.log("NETWORK", await provider.getNetwork());
      if (chain.chainId !== 9001 && chain.chainId !== 1337) {
        setWrongNetwork(true);
        return;
      }
      requireWallet();
    }
  }

  async function switchToOASIS() {
    console.log("we are here");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x2329",
          rpcUrls: ["https://eth.bd.OASIS.org:8545"],
          chainName: "Matic Mainnet",
          nativeCurrency: {
            name: "OASIS",
            symbol: "OASIS",
            decimals: 18,
          },
          blockExplorerUrls: ["https://evm.OASIS.org/"],
        },
      ],
    });
    window.location.reload(false);
  }

  async function requireWallet() {
    //remember that the provider will need to be updated right now is null as is local
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractSwapAddress, ContractSwap.abi, signer);

    // load saleContracts too
    let userContracts = [];
    let returnedContracts = await contract.getUserListedContracts();
    setLoadingState("loaded");
    if (returnedContracts.length > 0) {
      for (let i = 0; i < returnedContracts.length; i++) {
        let price = ethers.utils.formatUnits(returnedContracts[i].price.toString(), "ether");
        let userContract = {
          contractAddress: returnedContracts[i].contractAddress,
          buyerAddress: returnedContracts[i].buyerAddress,
          price,
          contractSubmitted: "No",
          currency: returnedContracts[i].currency.toString(),
        };
        let ownableContract = new ethers.Contract(returnedContracts[i].contractAddress, ContractSwap.abi, signer);
        if ((await ownableContract.owner()) === contractSwapAddress) {
          userContract.contractSubmitted = "Yes";
        }
        userContracts.push(userContract);
      }
      setSaleContracts(userContracts);
    }
    userContracts = [];
    returnedContracts = await contract.getUserOfferedContracts();

    if (returnedContracts.length > 0) {
      for (let i = 0; i < returnedContracts.length; i++) {
        let price = ethers.utils.formatUnits(returnedContracts[i].price.toString(), "ether");
        console.log("aqui siii", returnedContracts[i]);
        let userContract = {
          contractAddress: returnedContracts[i].contractAddress,
          sellerAddress: returnedContracts[i].sellerAddress,
          price,
          contractSubmitted: "No",
          currency: returnedContracts[i].currency.toString(),
        };
        let ownableContract = new ethers.Contract(returnedContracts[i].contractAddress, ContractSwap.abi, signer);
        if ((await ownableContract.owner()) === contractSwapAddress) {
          userContract.contractSubmitted = "Yes";
        }
        userContracts.push(userContract);
      }
      console.log("hellooo aquiii11", userContracts);

      setOfferedContracts(userContracts);
    }
  }

  async function contractSwapState() {
    setLoadingState("contractSwap");
  }

  async function transferContract(contractAddress) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, ContractSwap.abi, signer);
    const transaction = await contract.transferOwnership(contractSwapAddress);
  }

  async function returnContract(contractAddress) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractSwapAddress, ContractSwap.abi, signer);
    const transaction = await contract.returnContract(contractAddress);
  }

  async function purchaseContract(contractAddress, contractPrice) {
    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractSwapAddress, ContractSwap.abi, signer);
    // !!! aqui falta
    const price = ethers.utils.parseUnits(contractPrice, "ether");
    const abi = require("erc-20-abi");
    const token = new ethers.Contract("0xe11A86849d99F524cAC3E7A0Ec1241828e332C62", abi, signer);
    await token.approve("0x20054a1376eE6864783e2f7601E53d1F93d29FC1", price);
    const transaction = await contract.purchaseContract(contractAddress, { value: price });
  }

  async function createContractSwap() {
    // connect it to the contract
    // do the check and then do an error state you know
    const reg = /^0x[a-fA-F0-9]{40}$/;

    let validAddress = formInput.contractAddress.match(reg);
    if (validAddress == null) {
      setErrorState("Invalid Contract Address");
      return;
    }
    validAddress = formInput.buyerAddress.match(reg);
    if (validAddress == null) {
      setErrorState("Invalid Buyer Address");
      return;
    }

    const web3Modal = new Web3Modal();
    const connection = await web3Modal.connect();
    const provider = new ethers.providers.Web3Provider(connection);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractSwapAddress, ContractSwap.abi, signer);
    // transform to ether denomination

    const price = ethers.utils.parseUnits(formInput.price, "ether");
    try {
      if (currencyState === "USDC") {
        const transaction = await contract.createContractSwap(formInput.contractAddress, formInput.buyerAddress, price, 2);
        transaction.wait();
      } else {
        const transaction = await contract.createContractSwap(formInput.contractAddress, formInput.buyerAddress, price, 1);
        transaction.wait();
      }

      setLoadingState("loaded");
    } catch (err) {
      setErrorState(err.reason);
    }
  }

  async function sellUsingOASIS() {
    setCurrencyState("OASIS");
  }
  async function sellUsingUSDC() {
    setCurrencyState("USDC");
  }
  if (loadingState === "loaded") {
    return (
      <header id="header">
        <div className="intro">
          <div className="overlay">
            <div className="">
              <div className="row">
                <div className="col-md-8 col-md-offset-2 intro-text">
                  <h3 class="text-4xl font-extrabold">
                    Pending Contract Sales:
                    <span></span>
                  </h3>
                  {saleContracts ? (
                    <div>
                      {saleContracts.map((contract) => (
                        <div class="overflow-x-auto relative rounded">
                          <table class="w-full text-xl text-left text-gray-500 dark:text-gray-400 border rounded-r-md">
                            <thead class="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 bg-opacity-55 dark:text-gray-400">
                              <tr>
                                <th scope="col" class="py-3 px-6">
                                  Contract Address
                                </th>
                                <th scope="col" class="py-3 px-6">
                                  Buyer Address
                                </th>
                                <th scope="col" class="py-3 px-6">
                                  Contract Price
                                </th>
                                <th scope="col" class="py-3 px-6">
                                  Contract Submitted
                                </th>
                                <th scope="col" class="py-3 px-6">
                                  Return Contract
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th scope="row" class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                  {contract.contractAddress}
                                </th>
                                <td class="py-4 px-6">{contract.buyerAddress}</td>
                                <td class="py-4 px-6">
                                  {contract.currency === "1" ? <div>{contract.price} OASIS</div> : <div>{contract.price} USDC</div>}
                                </td>
                                <td class="py-4 px-6">
                                  {contract.contractSubmitted === "No" ? (
                                    <button
                                      onClick={() => transferContract(contract.contractAddress)}
                                      class="bg-transparent bg-blue-500 font-semibold text-white py-2 px-3 border-t border border-gray-400 hover:border-transparent hover:bg-green-500 rounded-lg">
                                      Submit Contract
                                    </button>
                                  ) : (
                                    <div>Yes</div>
                                  )}
                                </td>

                                <td class="py-4 px-6">
                                  {contract.contractSubmitted === "No" ? (
                                    <div>Contract hasn't been submitted</div>
                                  ) : (
                                    <button
                                      onClick={() => returnContract(contract.contractAddress)}
                                      class="bg-transparent bg-blue-500 font-semibold text-white py-2 px-3 border-t border border-gray-400 hover:border-transparent hover:bg-green-500 rounded-lg">
                                      Return Contract
                                    </button>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <h3 class="text-3xl font-bold">
                      No contracts available
                      <span></span>
                    </h3>
                  )}
                  <h3 class="text-4xl font-extrabold">
                    Contract Offers:
                    <span></span>
                  </h3>
                  {offeredContracts ? (
                    <div>
                      {offeredContracts.map((contract) => (
                        <div class="overflow-x-auto relative rounded">
                          <table class="w-full text-xl   text-left text-gray-500 dark:text-gray-400 border rounded-r-md">
                            <thead class="text-sm text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 bg-opacity-55 dark:text-gray-400">
                              <tr>
                                <th scope="col" class="py-3 px-6">
                                  Contract Address
                                </th>
                                <th scope="col" class="py-3 px-6">
                                  Seller Address
                                </th>
                                <th scope="col" class="py-3 px-6">
                                  Contract Price
                                </th>
                                <th scope="col" class="py-3 px-6">
                                  Contract Submitted
                                </th>
                                <th scope="col" class="py-3 px-6">
                                  Purchase Contract
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th scope="row" class="py-4 px-6 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                  {contract.contractAddress}
                                </th>
                                <td class="py-4 px-6">{contract.sellerAddress}</td>
                                <td class="py-4 px-6">
                                  {contract.currency === "1" ? <div>{contract.price} OASIS</div> : <div>{contract.price} USDC</div>}
                                </td>
                                <td class="py-4 px-6">{contract.contractSubmitted === "No" ? <div>No</div> : <div>Yes</div>}</td>

                                <td class="py-4 px-6">
                                  {contract.contractSubmitted === "No" ? (
                                    <div>Contract hasn't been submitted</div>
                                  ) : (
                                    <button
                                      onClick={() => purchaseContract(contract.contractAddress, contract.price)}
                                      class="bg-transparent bg-blue-500 font-semibold text-white py-2 px-3 border-t border border-gray-400 hover:border-transparent hover:bg-green-500 rounded-lg">
                                      Purchase Contract
                                    </button>
                                  )}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <h3 class="text-3xl font-bold">
                      No contracts available
                      <span></span>
                    </h3>
                  )}
                  <br></br>
                  <br></br>
                  <a clasll="rounded-full" className="btn btn-custom btn-lg" onClick={contractSwapState}>
                    Create New Contract Swap
                  </a>{" "}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  } else if (loadingState === "contractSwap") {
    return (
      <header id="header">
        <div className="intro">
          <div className="overlay">
            <div className="container">
              <div className="row">
                <div className="col-md-8 col-md-offset-2 intro-text">
                  <div>
                    <div>
                      <h3 class="block text-md font-bold center text-gray-700 " for="Contract_Address">
                        Create Contract Swap
                      </h3>{" "}
                    </div>
                  </div>
                  <div class="w-full max-w-2xl	 center">
                    <form class="shadow-md rounded px-8 pt-6 pb-8 mb-4">
                      <div class="mb-4">
                        <label class="block left text-gray-700 text-md font-bold mb-2" for="Contract_Address">
                          Contract Address
                        </label>
                        <input
                          onChange={(e) => updateFormInput({ ...formInput, contractAddress: e.target.value })}
                          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="username"
                          type="text"
                          placeholder="0xContract Address"
                        />
                      </div>
                      <div class="mb-4">
                        <label class="block text-gray-700 text-md font-bold mb-2" for="buyerAddress">
                          Buyer Address
                        </label>
                        <input
                          onChange={(e) => updateFormInput({ ...formInput, buyerAddress: e.target.value })}
                          class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          id="buyerAddress"
                          type="buyerAddress"
                          placeholder="0xBuyer Address"
                        />
                      </div>
                      <div class="mb-4">
                        <label
                          onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
                          class="block text-gray-700 text-xl font-bold mb-2 "
                          for="price">
                          Price
                        </label>
                        {currencyState === "USDC" ? (
                          <input
                            type="number"
                            name="price"
                            onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
                            class=" block font-normal rounded border border-grey-lighter font-bold shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="USDC"
                          />
                        ) : (
                          <input
                            type="number"
                            name="price"
                            onChange={(e) => updateFormInput({ ...formInput, price: e.target.value })}
                            class=" block font-normal rounded border border-grey-lighter font-bold shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            placeholder="OASIS"
                          />
                        )}
                        <div>
                          <ul class="grid grid-cols-2 float-left">
                            <span>
                              <input onClick={sellUsingOASIS} class="sr-only peer" type="radio" value="OASIS" name="answer" id="OASIS" />
                              <label
                                class="flex p-5 bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none hover:bg-gray-50 peer-checked peer-checked:ring-2 peer-checked:border-transparent"
                                for="OASIS">
                                OASIS
                              </label>
                            </span>
                            <span>
                              <input onClick={sellUsingUSDC} class="sr-only peer" type="radio" value="USDC" name="answer" id="USDC" />
                              <label
                                class="flex p-5 bg-white border border-gray-300 rounded-lg cursor-pointer focus:outline-none hover:bg-gray-50 peer-checked peer-checked:ring-2 peer-checked:border-transparent"
                                for="USDC">
                                USDC
                              </label>
                            </span>
                          </ul>
                        </div>
                      </div>
                      <br></br>
                      <br></br>
                      <br></br>
                      <a className="btn btn-custom btn-lg text-bold" onClick={createContractSwap}>
                        Submit
                      </a>{" "}
                    </form>
                  </div>
                  <div class="text-red-500 text-3xl font-bold font-mono">{errorState}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  } else {
    return (
      <header id="header">
        <div className="intro">
          <div className="overlay">
            <div className="container">
              <div className="row">
                <div className="col-md-8 col-md-offset-2 intro-text">
                  <h2 class="font-extrabold">
                    The easiest way to trade Smart Contracts on web3
                    <span></span>
                  </h2>
                  <p></p>

                  {wrongNetwork === true ? (
                    <a className="btn btn-danger btn-lg" onClick={() => switchToOASIS()}>
                      Wrong Network click here to connect to OASIS
                    </a>
                  ) : (
                    <a className="btn btn-custom btn-lg" onClick={requireWallet}>
                      Connect Wallet to Start | OASIS BLockchain
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
};
