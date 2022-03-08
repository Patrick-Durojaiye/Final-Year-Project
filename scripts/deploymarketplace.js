const main = async () => {
    const marketplaceFactory = await hre.ethers.getContractFactory('Marketplace');
    const marketplaceContract = await marketplaceFactory.deploy();
    await marketplaceContract.deployed();
    console.log("Contract deployed to:", marketplaceContract.address)

};

const runMain = async () => {
    try {
        await main();
        process.exit(0);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

runMain();