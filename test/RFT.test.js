const { time } = require('@openzeppelin/test-helpers')
const RFT = artifacts.require('RFT')
const NFT = artifacts.require('NFT')
const DAI = artifacts.require('DAI')

const DAI_AMOUNT = web3.utils.toWei('25000')
const SHARE_AMOUNT = web3.utils.toWei('25000')

contract('RFT', async (addresses) => {
  const [admin, buyer1, buyer2, buyer3, buyer4] = addresses

  it('ICO should work', async () => {
    const dai = await DAI.new()
    const nft = await NFT.new('My NFT', 'NFT')

    await nft.mint(admin, 1)
    await Promise.all([
      dai.mint(buyer1, DAI_AMOUNT),
      dai.mint(buyer2, DAI_AMOUNT),
      dai.mint(buyer3, DAI_AMOUNT),
      dai.mint(buyer4, DAI_AMOUNT),
    ])

    const rft = await RFT.new('My RFT', 'RFT', nft.address, 1, 1, web3.utils.toWei('100000'), dai.address)
    await nft.approve(rft.address, 1)
    await rft.startIco()

    await dai.approve(rft.address, DAI_AMOUNT, { from: buyer1 })
    await rft.buyShare(SHARE_AMOUNT, { from: buyer1 })
    await dai.approve(rft.address, DAI_AMOUNT, { from: buyer2 })
    await rft.buyShare(SHARE_AMOUNT, { from: buyer2 })
    await dai.approve(rft.address, DAI_AMOUNT, { from: buyer3 })
    await rft.buyShare(SHARE_AMOUNT, { from: buyer3 })
    await dai.approve(rft.address, DAI_AMOUNT, { from: buyer4 })
    await rft.buyShare(SHARE_AMOUNT, { from: buyer4 })

    await time.increase(7 * 86400 + 1) //1 week
    await rft.withdrawIcoProfits()

    const balanceShareBuyer1 = await rft.balanceOf(buyer1)
    const balanceShareBuyer2 = await rft.balanceOf(buyer2)
    const balanceShareBuyer3 = await rft.balanceOf(buyer3)
    const balanceShareBuyer4 = await rft.balanceOf(buyer4)

    expect(balanceShareBuyer1.toString()).to.eq(SHARE_AMOUNT)
    expect(balanceShareBuyer2.toString()).to.eq(SHARE_AMOUNT)
    expect(balanceShareBuyer3.toString()).to.eq(SHARE_AMOUNT)
    expect(balanceShareBuyer4.toString()).to.eq(SHARE_AMOUNT)

    const balanceAdminDai = await dai.balanceOf(admin)
    expect(balanceAdminDai.toString()).to.eq(web3.utils.toWei('100000'))
  })
})
