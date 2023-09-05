import Web3 from 'web3';
import 'dotenv/config'
const contractABI = [{"inputs":[{"internalType":"address payable","name":"_heir","type":"address"}],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"currentOwner","type":"address"},{"indexed":false,"internalType":"address","name":"currentHeir","type":"address"},{"indexed":false,"internalType":"bool","name":"canClaimOwnership","type":"bool"},{"indexed":false,"internalType":"uint256","name":"timeSinceLastWithdrawal","type":"uint256"}],"name":"CurrentState","type":"event"},{"inputs":[],"name":"claimOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"deposit","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"heir","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"lastWithdrawal","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"logCurrentState","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"owner","outputs":[{"internalType":"address payable","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address payable","name":"_newHeir","type":"address"}],"name":"setHeir","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[],"name":"timeForHeirToTakeOver","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"amount","type":"uint256"}],"name":"withdraw","outputs":[],"stateMutability":"nonpayable","type":"function"}];

const endpoint = process.env.ALHECMY_ENDPOINT;
const contractAddress = process.env.CONTRACT_ADDRESS
const ownerWalletAddress = process.env.HEIR_WALLET_ADDRESS;
const ownerWalletPrivateKey = process.env.HEIR_WALLET_PRIVATE_KEY;
const heirWalletAddress = process.env.NEW_HEIR_WALLET_ADDRESS;

const web3 = new Web3(new Web3.providers.HttpProvider(endpoint))

const setHeir = async() => {
    console.log('starting setting heir')

    const sepoliaContract = new web3.eth.Contract(contractABI, contractAddress);
    const baseGasPrice = await web3.eth.getGasPrice();
    const gasLimit = await sepoliaContract.methods.setHeir(heirWalletAddress).estimateGas({ from: ownerWalletAddress });
    const gasLimitWithBuffer = gasLimit * 2n;
    const adjustedGasPrice = baseGasPrice * 2n

    const tx = {
        data: sepoliaContract.methods.setHeir(heirWalletAddress).encodeABI(),
        from: ownerWalletAddress,
        value:0,
        gas: gasLimitWithBuffer,
        gasPrice: adjustedGasPrice,
        to: contractAddress,
    };

    // Sign the transaction
    const signedTx = await web3.eth.accounts.signTransaction(tx, ownerWalletPrivateKey);
    console.log(signedTx)

    // Send the transaction
    try{
        const sent = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        console.log(sent)
    
    }catch(e){
        console.log('something went wrong')
        console.log(e);
    }
};

setHeir();
  