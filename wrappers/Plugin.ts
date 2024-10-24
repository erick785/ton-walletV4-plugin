import {
    Address, beginCell, Cell, Contract, contractAddress,
    ContractProvider, Sender, SendMode, toNano
} from '@ton/core';

export type PluginConfig = {
    admin: Address;
};

export function pluginConfigToCell(config: PluginConfig): Cell {
    return beginCell().storeAddress(config.admin).endCell();
}

export class Plugin implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    static createFromAddress(address: Address) {
        return new Plugin(address);
    }

    static createFromConfig(config: PluginConfig, code: Cell, workchain = 0) {
        const data = pluginConfigToCell(config);
        const init = { code, data };
        return new Plugin(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendChangeAdmin(provider: ContractProvider, via: Sender, to: Address) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0xb985df84, 32)
                .storeAddress(to).endCell(),
            value: toNano("0.01"),
        });
    }

    async sendPayRequest(provider: ContractProvider, via: Sender, to: Address, amount: bigint) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x667b4abb, 32)
                .storeAddress(to).storeCoins(amount).endCell(),
            value: toNano("0.01"),
        });
    }

    async sendDestruct(provider: ContractProvider, via: Sender, to: Address) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().storeUint(0x6a88ab15, 32).storeAddress(to).endCell(),
            value: toNano("0.01"),
        });
    }


    async getAdmin(provider: ContractProvider): Promise<Address> {
        const result = await provider.get('get_admin', []);
        return result.stack.readAddress();
    }

}
