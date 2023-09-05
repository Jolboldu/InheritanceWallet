import path from 'path';
import fs from 'fs';
import solc from 'solc';
import Web3 from 'web3';
import { fileURLToPath } from 'url';
import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contractPath = path.resolve(__dirname, 'Inheritance.sol');

// Get contract
const source = fs.readFileSync(contractPath, 'utf8');
const input = {
    language: 'Solidity',
    sources: {
        'Inheritance.sol': {
            content: source,
        },
    },
    settings: {
        outputSelection: {
            '*': {
                '*': ['*'],
            },
        },
    },
};

const endpoint = process.env.ALHECMY_ENDPOINT;
const ownerAddress = process.env.OWNER_WALLET_ADDRESS;
const privateKey = process.env.OWNER_WALLET_PRIVATE_KEY;
const heirAddress = process.env.HEIR_WALLET_ADDRESS;

const web3 = new Web3(new Web3.providers.HttpProvider(endpoint))

const loadCompilerVersion = async (version) => {
    return new Promise((resolve, reject) => {
        solc.loadRemoteVersion(version, (err, solcInstance) => {
            if (err) {
                reject(err);
            } else {
                resolve(solcInstance);
            }
        });
    });
}

// Deploy contract
const deploy = async() => {
    console.log('starting deployment')

    // Load a specific version of the compiler
    const solcSpecific = await loadCompilerVersion('v0.8.19+commit.7dd6d404');

    // Compile contract
    const tempFile = JSON.parse(solcSpecific.compile(JSON.stringify(input)));
    const contractFile = tempFile.contracts['Inheritance.sol']['InheritanceWallet'];
    const encodedArguments = web3.eth.abi.encodeParameters(['address'], [heirAddress]);

    // Initialization
    const bytecode = contractFile.evm.bytecode.object;
    console.log('Attempting to deploy from account:', ownerAddress);

    // Create transaction
    const gasEstimate = 969936n;
    const gasPrice = 455593406n;

    const tx = {
        data: bytecode + encodedArguments.slice(2),
        from: ownerAddress,
        value: 0,
        gas: gasEstimate,
        gasPrice: gasPrice
    };
    
    // Sign the transaction
    const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey);
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


deploy();
  