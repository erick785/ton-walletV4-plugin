import { Address, OpenedContract, toNano } from '@ton/core';
import { Plugin } from '../wrappers/Plugin';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {

    const sender = provider.sender();

    // 插件合约地址
    const pluginsAddr = Address.parse('kQBwsl7FTjVMPRSrFumW6kZxamxldPBemnflvVGpM6c7ONpJ');
    if (!(await provider.isContractDeployed(pluginsAddr))) {
        console.log("plugin not deploy")
        return;
    }

    const PluginsInstance: OpenedContract<Plugin> = provider.open(Plugin.createFromAddress(pluginsAddr));


    const user = Address.parse("0QAiKPm5a0KZrm4XdqFaPq9tJmR4kHouoU4GZ5g44uNZUeGw");

    await PluginsInstance.sendDestruct(sender, user);


}
