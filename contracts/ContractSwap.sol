// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "hardhat/console.sol";

contract ContractSwap is OwnableUpgradeable {
    uint256 _totalContractsSold;
    address _usdcAddress;

    struct ContractSwapEntry {
        address contractAddress;
        address buyerAddress;
        address sellerAddress;
        uint256 price;
        bool entryExists;
        uint256 currency;
    }
    struct contractEntriesHoldBySeller {
        mapping(address => ContractSwapEntry) contractSwapEntries;
        address[] contractsListed;
    }
    mapping(address => contractEntriesHoldBySeller)
        private _contractsListedByUser;

    struct contractEntriesHoldByBuyer {
        mapping(address => ContractSwapEntry) contractSwapEntries;
        address[] contractsListed;
    }

    mapping(address => contractEntriesHoldByBuyer)
        private _contractsOfferedToUser;

    function initialize() public initializer {
        _totalContractsSold = 0;
        _usdcAddress = 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174;
        __Ownable_init_unchained();
    }

    function createContractSwap(
        address contractToBeSwapped,
        address buyerAddress,
        uint256 price,
        uint256 currency
    ) public {
        //Checar si el owner es el dueno del contrato
        require(
            OwnableUpgradeable(contractToBeSwapped).owner() == msg.sender,
            "You are not the owner of the contract"
        );
        //create entry
        require(
            _contractsListedByUser[msg.sender]
                .contractSwapEntries[contractToBeSwapped]
                .entryExists == false,
            "The contract swap entry already exists"
        );
        _contractsOfferedToUser[buyerAddress].contractSwapEntries[
                contractToBeSwapped
            ] = ContractSwapEntry(
            contractToBeSwapped,
            buyerAddress,
            msg.sender,
            price,
            true,
            currency
        );
        _contractsOfferedToUser[buyerAddress].contractsListed.push(
            contractToBeSwapped
        );
        _contractsListedByUser[msg.sender].contractSwapEntries[
                contractToBeSwapped
            ] = ContractSwapEntry(
            contractToBeSwapped,
            buyerAddress,
            msg.sender,
            price,
            true,
            currency
        );
        _contractsListedByUser[msg.sender].contractsListed.push(
            contractToBeSwapped
        );
    }

    function returnContract(address contractToBeReturned) public {
        require(
            _contractsListedByUser[msg.sender]
                .contractSwapEntries[contractToBeReturned]
                .entryExists,
            "There is no entry for this contract"
        );
        require(
            OwnableUpgradeable(contractToBeReturned).owner() == address(this),
            "Contract was never transfered to the ContractSwap App"
        );

        address buyerAddress = _contractsListedByUser[msg.sender]
            .contractSwapEntries[contractToBeReturned]
            .buyerAddress;
        delete _contractsOfferedToUser[buyerAddress].contractSwapEntries[
            contractToBeReturned
        ];
        // unpush _contractsOfferedToUsers[buyerAddress].contractsListed.push(contractToBeReturned);
        for (
            uint256 i = 0;
            i < _contractsOfferedToUser[buyerAddress].contractsListed.length;
            i++
        ) {
            if (
                _contractsOfferedToUser[buyerAddress].contractsListed[i] ==
                contractToBeReturned
            ) {
                delete _contractsOfferedToUser[buyerAddress].contractsListed[i];
                break;
            }
        }
        delete _contractsListedByUser[msg.sender].contractSwapEntries[
            contractToBeReturned
        ];
        // unpush _contractsListedByUsers[msg.sender].contractsListed.push(contractToBeReturned);
        for (
            uint256 i = 0;
            i < _contractsListedByUser[msg.sender].contractsListed.length;
            i++
        ) {
            if (
                _contractsListedByUser[msg.sender].contractsListed[i] ==
                contractToBeReturned
            ) {
                delete _contractsListedByUser[msg.sender].contractsListed[i];
                break;
            }
        }
        // transfer contract back to user
        OwnableUpgradeable(contractToBeReturned).transferOwnership(msg.sender);
    }

    function purchaseContract(address contractToBeSold) public payable {
        require(
            _contractsOfferedToUser[msg.sender]
                .contractSwapEntries[contractToBeSold]
                .entryExists,
            "There is no entry for this contract"
        );
        require(
            OwnableUpgradeable(contractToBeSold).owner() == address(this),
            "Contract was never transfered to the ContractSwap App"
        );
        uint256 currency = _contractsOfferedToUser[msg.sender]
            .contractSwapEntries[contractToBeSold]
            .currency;
        address sellerAddress = _contractsOfferedToUser[msg.sender]
            .contractSwapEntries[contractToBeSold]
            .sellerAddress;
        if (currency == 1) {
            require(
                msg.value ==
                    _contractsOfferedToUser[msg.sender]
                        .contractSwapEntries[contractToBeSold]
                        .price,
                "Not enough money sent to buy the contract"
            );
            require(payable(sellerAddress).send((msg.value * 975) / 1000));
            // aumentar revenue
            _totalContractsSold += 1;
        }
        //usdc
        else if (currency == 2) {
            require(
                IERC20(_usdcAddress).transferFrom(
                    msg.sender,
                    address(this),
                    (_contractsOfferedToUser[msg.sender]
                        .contractSwapEntries[contractToBeSold]
                        .price * 25) / 1000
                )
            );
            require(
                IERC20(_usdcAddress).transferFrom(
                    msg.sender,
                    sellerAddress,
                    (_contractsOfferedToUser[msg.sender]
                        .contractSwapEntries[contractToBeSold]
                        .price * 975) / 1000
                )
            );
            _totalContractsSold += 1;
        }

        // clean records
        delete _contractsListedByUser[sellerAddress].contractSwapEntries[
            contractToBeSold
        ];
        for (
            uint256 i = 0;
            i < _contractsListedByUser[sellerAddress].contractsListed.length;
            i++
        ) {
            if (
                _contractsListedByUser[sellerAddress].contractsListed[i] ==
                contractToBeSold
            ) {
                delete _contractsListedByUser[sellerAddress].contractsListed[i];
                break;
            }
        }
        delete _contractsOfferedToUser[msg.sender].contractSwapEntries[
            contractToBeSold
        ];
        for (
            uint256 i = 0;
            i < _contractsOfferedToUser[msg.sender].contractsListed.length;
            i++
        ) {
            if (
                _contractsOfferedToUser[msg.sender].contractsListed[i] ==
                contractToBeSold
            ) {
                delete _contractsOfferedToUser[msg.sender].contractsListed[i];
                break;
            }
        }

        OwnableUpgradeable(contractToBeSold).transferOwnership(msg.sender);
    }

    function getUserListedContracts()
        public
        view
        returns (ContractSwapEntry[] memory)
    {
        // returns the cotracts of the user
        // it seems like when an address is deleted in an array then it is set to 0.
        uint256 contractsOwned = _contractsListedByUser[msg.sender]
            .contractsListed
            .length;
        uint256 existingContracts = 0;
        for (uint256 i = 0; i < contractsOwned; i++) {
            address contractAddress = _contractsListedByUser[msg.sender]
                .contractsListed[i];
            console.log(contractAddress);
            ContractSwapEntry storage contractEntry = _contractsListedByUser[
                msg.sender
            ].contractSwapEntries[contractAddress];
            if (contractEntry.entryExists == true) {
                existingContracts += 1;
            }
        }
        // you have to do this because fixed arrays...
        ContractSwapEntry[] memory contractEntries = new ContractSwapEntry[](
            existingContracts
        );
        uint256 currentEntry = 0;
        for (uint256 i = 0; i < contractsOwned; i++) {
            address contractAddress = _contractsListedByUser[msg.sender]
                .contractsListed[i];
            console.log(contractAddress);
            ContractSwapEntry storage contractEntry = _contractsListedByUser[
                msg.sender
            ].contractSwapEntries[contractAddress];
            if (contractEntry.entryExists == true) {
                contractEntries[currentEntry] = contractEntry;
                currentEntry += 1;
            }
        }
        return contractEntries;
    }

    function getUserOfferedContracts()
        public
        view
        returns (ContractSwapEntry[] memory)
    {
        // returns the cotracts of the user
        // it seems like when an address is deleted in an array then it is set to 0.
        uint256 contractsOwned = _contractsOfferedToUser[msg.sender]
            .contractsListed
            .length;
        uint256 existingContracts = 0;
        for (uint256 i = 0; i < contractsOwned; i++) {
            address contractAddress = _contractsOfferedToUser[msg.sender]
                .contractsListed[i];
            console.log(contractAddress);
            ContractSwapEntry storage contractEntry = _contractsOfferedToUser[
                msg.sender
            ].contractSwapEntries[contractAddress];
            if (contractEntry.entryExists == true) {
                existingContracts += 1;
            }
        }
        // you have to do this because fixed arrays...
        ContractSwapEntry[] memory contractEntries = new ContractSwapEntry[](
            existingContracts
        );
        uint256 currentEntry = 0;
        for (uint256 i = 0; i < contractsOwned; i++) {
            address contractAddress = _contractsOfferedToUser[msg.sender]
                .contractsListed[i];
            console.log(contractAddress);
            ContractSwapEntry storage contractEntry = _contractsOfferedToUser[
                msg.sender
            ].contractSwapEntries[contractAddress];
            if (contractEntry.entryExists == true) {
                contractEntries[currentEntry] = contractEntry;
                currentEntry += 1;
            }
        }
        return contractEntries;
    }

    //getter
    function getUSDCAddress() public view returns (address) {
        return _usdcAddress;
    }

    //setter
    function setUSDCAddress(address usdcAddress) public {
        _usdcAddress = usdcAddress;
    }
}
