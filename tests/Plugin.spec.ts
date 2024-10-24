import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Plugin } from '../wrappers/Plugin';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Plugin', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Plugin');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let plugin: SandboxContract<Plugin>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');


        plugin = blockchain.openContract(Plugin.createFromConfig({
            admin: deployer.address,
        }, code));

        const deployResult = await plugin.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: plugin.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and plugin are ready to use
    });

    it('should change admin', async () => {
        const newAdmin = await blockchain.treasury('newAdmin');

        const changeAdminResult = await plugin.sendChangeAdmin(deployer.getSender(), newAdmin.address);

        expect(changeAdminResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: plugin.address,
            success: true,
        });

        expect((await plugin.getAdmin()).toString()).toEqual(newAdmin.address.toString());
    });

    it('install plugin', async () => {
        const user = await blockchain.treasury('user');

        user.sendMessages


    });
});
