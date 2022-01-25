import { Address, BigInt } from "@graphprotocol/graph-ts"
import {
  OfferAccepted,
  OfferRegistered,
  OfferUnregistered,
} from "../../generated/SwapMeet/SwapMeet"

import { SwapMeet, Offer, User, OfferAccept, OfferRegistration, OfferUnregistration } from "../../generated/schema"
let ZERO_BI = BigInt.fromI32(0);
let ONE_BI = BigInt.fromI32(1);

function getOrCreateSwapMeet(): SwapMeet {
  let swapMeet = SwapMeet.load("swapMeet") as SwapMeet;
  if (swapMeet === null) {
    swapMeet = new SwapMeet("swapMeet");
    swapMeet.offerCount = ZERO_BI;
  }
  return swapMeet;
}

function getOrCreateUser(userAddress: string): User {
  let user = User.load(userAddress) as User;
  if (user === null) {
    user = new User(userAddress);
    user.save();
  }
  return user;
}

/**
 * Update the offer count for the swap meet
 * @param event The event that triggered this function
 */
export function handleOfferRegistered(event: OfferRegistered): void {

  // load swap meet, creating them if they don't exist
  let swapMeet = getOrCreateSwapMeet();
  swapMeet.offerCount = swapMeet.offerCount.plus(ONE_BI);
  swapMeet.save();

  // load registrant, creating them if they don't exist
  let user = getOrCreateUser(event.params._from.toHexString());
  user.offersRegisteredCount = user.offersRegisteredCount.plus(ONE_BI);
  user.save();

  // create offer and save it
  let offer = new Offer(event.params._offerId.toHexString());
  offer.swapMeet = swapMeet.id;
  offer.owner = event.params._from.toHexString();
  offer.pool = event.params._pool.toHexString();
  offer.gem = event.params._gem.toHexString();
  offer.quantity = event.params._quantity;

  // TODO: figure out why I can't set these array values
  // event.params._pools.forEach(pool => {
  //   let gp = GemPool.load(pool.toHexString()) as GemPool;
  //   offer.pools.push(gp.id);
  // });
  //offer.gems = event.params._gems.map((gem: any) => gem.toHexString());

  offer.quantities = event.params._quantities;
  offer.open = true;
  offer.save();

  // create an offer accept and save it
  let offerRegister = new OfferRegistration(event.transaction.hash.toHexString());
  offerRegister.offer = offer.id;
  offerRegister.pool = offer.pool;
  offerRegister.gem = offer.gem;
  offerRegister.fee = ZERO_BI;
  offerRegister.createdAtTimestamp = event.block.timestamp;
  offerRegister.createdAtBlockNumber = event.block.number;
  offerRegister.transactionHash = event.transaction.hash;
  offerRegister.save();
}

/**
 * @dev Handles the event of an offer being accepted.
 * @param event The event that triggered this handler.
 * @returns void
 */
export function handleOfferUnregistered(event: OfferUnregistered): void {
  // load swap meet, creating them if they don't exist
  let swapMeet = getOrCreateSwapMeet();
  if (swapMeet.offerCount.gt(ZERO_BI)) swapMeet.offerCount = swapMeet.offerCount.minus(ONE_BI);
  swapMeet.save();

  // update the offer and close it
  let offer = Offer.load(event.params._offerId.toHexString());
  if (offer != null) {
    offer.open = false;
    offer.save();
    // create an offer accept and save it
    let offerUnregister = new OfferUnregistration(event.transaction.hash.toHexString());
    offerUnregister.offer = offer.id;
    offerUnregister.createdAtTimestamp = event.block.timestamp;
    offerUnregister.createdAtBlockNumber = event.block.number;
    offerUnregister.transactionHash = event.transaction.hash;
    offerUnregister.save();
  }
}

/**
 * @dev This function is called when an offer is accepted. It updates the offer and user tables.
 * @param event The event that triggered this function.
 * @param userAddress The address of the user who accepted the offer.
 * @param offerId The id of the offer that was accepted.
 * @param pool The pool that the offer was accepted for.
 * @param gem The gem that the offer was accepted for.
 * @param quantity The quantity of the gem that the offer was accepted for.
 * @param fee The fee that was paid for the offer.
 * @param timestamp The timestamp of the block that the offer was accepted in.
 * @param blockNumber The block number that the offer was accepted in.
 * @param transactionHash The transaction hash that the offer was accepted in.
 * @returns void
 */
export function handleOfferAccepted(event: OfferAccepted): void {
  // load swap meet, creating them if they don't exist
  let swapMeet = getOrCreateSwapMeet();
  if (swapMeet.offerCount.gt(ZERO_BI)) swapMeet.offerCount = swapMeet.offerCount.minus(ONE_BI);
  swapMeet.save();

  // load registrant, creating them if they don't exist
  let user = getOrCreateUser(event.params._acceptor.toHexString());
  user.offersAcceptedCount = user.offersAcceptedCount.plus(ONE_BI);
  user.save();

  // create offer and save it
  let offer = Offer.load(event.params._offerId.toHexString());
  if (offer != null) {
    offer.open = false;
    offer.save();
    // create an offer accept and save it
    let offerAccept = new OfferAccept(event.transaction.hash.toHexString());
    offerAccept.offer = offer.id;
    offerAccept.pool = offer.pool;
    offerAccept.gem = offer.gem;
    offerAccept.fee = event.params._acceptFee;
    //offerAccept.gems = event.params._gems.map((gem: any) => gem.toHexString());
    offerAccept.createdAtTimestamp = event.block.timestamp;
    offerAccept.createdAtBlockNumber = event.block.number;
    offerAccept.transactionHash = event.transaction.hash;
    offerAccept.save();
  }
}
