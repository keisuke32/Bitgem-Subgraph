/* eslint-disable prefer-const */
import { BigInt } from '@graphprotocol/graph-ts';
import {
  NFTGemClaimCreated,
  NFTGemClaimRedeemed,
  NFTGemCreated,
} from '../../generated/templates/NFTGemPool/NFTGemPool';
import { GemPoolFactory, GemPool, Claim, Gem } from '../../generated/schema';

const BITGEM_ID = 'gemPoolFactoryV0';

export function handleNFTGemCreated(event: NFTGemCreated): void {
  let gemPoolFactory = GemPoolFactory.load(BITGEM_ID) as GemPoolFactory;
  if (gemPoolFactory) {
    // the default items minted on pool creation
    gemPoolFactory.gemsMintedCount = gemPoolFactory.gemsMintedCount.plus(BigInt.fromI32(1));
    gemPoolFactory.gemsMintedQuantity = gemPoolFactory.gemsMintedQuantity.plus(event.params.quantity);
    gemPoolFactory.save();
  }
  // load the gem pool and increment the counts and quantity
  let gemPool = GemPool.load(event.params.pool.toHexString());
  if (gemPool !== null) {
    gemPool.gemsMintedCount = gemPool.gemsMintedCount.plus(BigInt.fromI32(1));
    gemPool.gemsMintedQuantity = gemPool.gemsMintedQuantity.plus(event.params.quantity);
    gemPool.save();
  }
  // create a new gem
  let gem = new Gem(event.params.gemHash.toHexString());
  gem.factory = BITGEM_ID;
  gem.gemPool = event.params.pool.toHexString();
  gem.owner = event.params.account.toHexString();
  gem.claim = event.params.claimHash.toHexString();
  gem.quantity = event.params.quantity;
  gem.createdAtTimestamp = event.block.timestamp;
  gem.createdAtBlockNumber = event.block.number;
  gem.modifiedAtTimestamp = event.block.timestamp;
  gem.transactionHash = event.transaction.hash;
  gem.save();
}
