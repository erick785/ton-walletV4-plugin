const { Address, beginCell, toNano } = require("@ton/core");
const { mnemonicToWalletKey, sign } = require("@ton/crypto");
const { TonClient, WalletContractV4, internal, external } = require("@ton/ton");
import { getHttpEndpoint } from "@orbs-network/ton-access";

async function main() {

    // 替换成你的助记词
    const userMnemonicArray = "monkey parrot ..."
    const keyPair = await mnemonicToWalletKey(userMnemonicArray.split(" "));

    // plugin address hash
    const pluginAddrHash = "0x70b25ec54e354c3d14ab16e996ea46716a6c6574f05e9a77e5bd51a933a73b38"

    const wallet = WalletContractV4.create({ publicKey: keyPair.publicKey, workchain: 0 });

    // initialize ton rpc client on testnet
    const endpoint = await getHttpEndpoint({ network: "testnet" });
    const client = new TonClient({ endpoint });

    const walletContract = client.open(wallet);
    const seqno = await walletContract.getSeqno();
    console.log("seqno:", seqno);


    // 用来测试是否intsall了插件
    // let getMethodResult3 = await client.runMethod(userAddress, "is_plugin_installed",
    //     [
    //         { type: "int", value: BigInt("0") }, // pass workchain as int
    //         { type: "int", value: BigInt(pluginAddrHash) } // pass plugin address hash as int
    //     ]);

    // let success = getMethodResult3.stack.readBoolean();
    // console.log("is_plugin_installed", success);


    // make sure wallet is deployed
    if (!await client.isContractDeployed(wallet.address)) {
        console.log("wallet is not deployed");
    } else {
        console.log("wallet is deployed");
    }


    let toSign = beginCell()
        .storeUint(698983191, 32) // subwallet_id | We consider this further
        .storeUint(Math.floor(Date.now() / 1e3) + 60, 32) // Message expiration time, +60 = 1 minute
        .storeUint(seqno, 32) // store seqno
        .storeUint(2, 8) // op 2
        .storeUint(0, 8)
        .storeUint(BigInt(pluginAddrHash), 256) // plugin address
        .storeCoins(toNano("0.1"))
        .storeUint(698983291, 64) // query_id 

    let signature = sign(toSign.endCell().hash(), keyPair.secretKey); // get the hash of our message to wallet smart contract and sign it to get signature

    console.log(toSign.endCell().hash().toString("hex"));

    let body = beginCell()
        .storeBuffer(signature) // store signature
        .storeBuilder(toSign) // store our message
        .endCell();

    // 如果没有部署walletV4合约，这里会部署，然后会install插件  
    await walletContract.send(
        body
    )

}

main().finally(() => console.log("Exiting..."));