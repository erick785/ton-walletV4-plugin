import { toNano } from '@ton/core';
import { Plugin } from '../wrappers/Plugin';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {

    const sender = provider.sender().address;

    if (sender === undefined) {
        throw new Error("Sender address is undefined");
    }

    const plugin = provider.open(Plugin.createFromConfig({
        admin: sender,
    }, await compile('Plugin')));

    await plugin.sendDeploy(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(plugin.address);


    // plugin addr hash 70b25ec54e354c3d14ab16e996ea46716a6c6574f05e9a77e5bd51a933a73b38
    console.log("plugin addr hash", plugin.address.hash.toString("hex"))
}
