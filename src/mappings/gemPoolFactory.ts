/* eslint-disable prefer-const */
import { Address, BigDecimal, BigInt } from '@graphprotocol/graph-ts';
import { NFTGemPoolCreated } from '../../generated/NFTGemPoolFactory/NFTGemPoolFactory';
import { NFTGemPool } from '../../generated/templates';
import { GemPoolFactory, GemPool } from '../../generated/schema';
import { log } from '@graphprotocol/graph-ts'

const BITGEM_ID = 'gemPoolFactoryV0';
const FACTORY_ADDRESS = '';

let ZERO_BI = BigInt.fromI32(0);

export function handleNFTGemPoolCreated(event: NFTGemPoolCreated): void {
  // load factory (create if first exchange)
  let gemPoolFactory = GemPoolFactory.load(BITGEM_ID) as GemPoolFactory;
  if (gemPoolFactory === null) {
    gemPoolFactory = new GemPoolFactory(BITGEM_ID);
    gemPoolFactory.factoryAddress = FACTORY_ADDRESS;
    gemPoolFactory.claimsCount = ZERO_BI;
    gemPoolFactory.claimsQuantity = ZERO_BI;
    gemPoolFactory.claimsOpenCount = ZERO_BI;
    gemPoolFactory.claimsOpenQuantity = ZERO_BI;
    gemPoolFactory.claimsStakedAmount = ZERO_BI;
    gemPoolFactory.claimsStakedTimeSecs = ZERO_BI;
    gemPoolFactory.claimsStakedActualSeconds = ZERO_BI;
    gemPoolFactory.claimsSentCount = ZERO_BI;
    gemPoolFactory.gemsMintedCount = ZERO_BI;
    gemPoolFactory.gemsMintedQuantity = ZERO_BI;
    gemPoolFactory.gemsStakedAmount = ZERO_BI;
    gemPoolFactory.gemsSentCount = ZERO_BI;
    gemPoolFactory.gemsSentQuantity = ZERO_BI;
    gemPoolFactory.gemPoolsCount = 0;
  }
  // increment the number of pools
  gemPoolFactory.gemPoolsCount += 1;
  gemPoolFactory.save();

  let out = '';
  if(event.params.gemSymbol === 'RUBY') {
    out = '0xbaB564f8aBEEb7e8Ce01764609908345709A1A6f';
  } 
  else if(event.params.gemSymbol === 'OPAL') {
    out = '0xC451A8D4780E99858f07533442277187C88591ff';
  }
  else if(event.params.gemSymbol === 'MRLD') {
    out = '0xC935ef4A86bDBcD5F00a6b9E81E7dFD41F521c45';
  }
  else if(event.params.gemSymbol === 'SPHR') {
    out = '0x3336dC7468DeBF22e2C2826864b12698e216aCDB';
  }
  else if(event.params.gemSymbol === 'DNMD') {
    out = '0x829FB494aF6FFF29748db21D9027F2ED0735DAcF';
  }
  else if(event.params.gemSymbol === 'JADE') {
    out = '0x821b1aD6637A6a2DE5B05d6Bf2f920be9B2A66ED';
  }
  else if(event.params.gemSymbol === 'TPAZ') {
    out = '0x677A60C52B69a062192CD0281E8721F5c3A47f40';
  }
  else if(event.params.gemSymbol === 'PERL') {
    out = '0x6F487C473b36E3d0148d421a5a09A6c00cf97218';
  }
  else if(event.params.gemSymbol === 'PEPE') {
    out = '0x3F5ff26246046573A1D9044AE328Ff886d3a45a9';
  }

  log.info('SYMBOL / ADDRESS: {}, {}', [
    event.params.gemSymbol,
    out,
  ])

  let gemPool = new GemPool(out) as GemPool;
  // link it to the parent for lookups
  gemPool.factory = gemPoolFactory.id;
  gemPool.symbol = event.params.gemSymbol;
  gemPool.name = event.params.gemName;
  gemPool.diffStep = event.params.diffstep;
  gemPool.stakingPrice = event.params.ethPrice;
  gemPool.minTimeSecs = event.params.mintTime;
  gemPool.maxTimeSecs = event.params.maxTime;
  gemPool.maxMint = event.params.maxMint;

  gemPool.claimsCount = ZERO_BI;
  gemPool.claimsQuantity = ZERO_BI;
  gemPool.claimsOpenCount = ZERO_BI;
  gemPool.claimsOpenQuantity = ZERO_BI;
  gemPool.claimsStakedAmount = ZERO_BI;
  gemPool.claimsStakedTimeSecs = ZERO_BI;
  gemPool.claimsStakedActualSeconds = ZERO_BI;
  gemPool.claimsSentCount = ZERO_BI;

  gemPool.gemsMintedCount = ZERO_BI;
  gemPool.gemsMintedQuantity = ZERO_BI;
  gemPool.gemsSentCount = ZERO_BI;
  gemPool.gemsSentQuantity = ZERO_BI;
  gemPool.gemsStakedAmount = ZERO_BI;

  gemPool.save();

  // Bind the pool to this address to listen for events
  NFTGemPool.create(Address.fromHexString(out) as Address);
}
