import {
  OwnershipTransferred as OwnershipTransferredEvent,
  TokensUnwrapped as TokensUnwrappedEvent,
} from "../generated/wXTMBridge/wXTMBridge";
import {
  OwnershipTransferred,
  TokensUnwrapped,
  Counter,
  PushNotification,
} from "../generated/schema";
import { Bytes, ethereum } from "@graphprotocol/graph-ts";

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.previousOwner = event.params.previousOwner;
  entity.newOwner = event.params.newOwner;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  const data = encodeOwnershipTransferredNotification(event);

  insertPushNotification(
    event,
    PushNotificationSignature.OwnershipTransferred,
    data
  );
}

export function handleTokensUnwrapped(event: TokensUnwrappedEvent): void {
  let entity = new TokensUnwrapped(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );
  entity.from = event.params.from;
  entity.targetTariAddress = event.params.targetTariAddress;
  entity.amount = event.params.amount;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  const data = encodeTokensUnwrappedNotification(event);

  insertPushNotification(
    event,
    PushNotificationSignature.TokensUnwrapped,
    data
  );
}

function getCounterValue(name: string): i32 {
  const counter = Counter.load(name);
  return counter ? counter.value : 0;
}

function incrementCounter(name: string): i32 {
  let counter = Counter.load(name);
  let newCounterValue = getCounterValue(name) + 1;
  if (!counter) {
    counter = new Counter(name);
  }
  counter.value = newCounterValue;
  counter.save();
  return newCounterValue;
}

function insertPushNotification(
  event: ethereum.Event,
  transactionDataSignature: PushNotificationSignature,
  transactionData: Bytes
): void {
  const newPushNotificationId = incrementCounter("PUSH_NOTIFICATION");
  let pushNotification = new PushNotification(
    `${event.transaction.hash.toHex()}-${event.logIndex.toString()}-${newPushNotificationId}`
  );
  pushNotification.contract = event.address;
  pushNotification.timestamp = event.block.timestamp;
  pushNotification.blockHash = event.block.hash;
  pushNotification.blockNumber = event.block.number;
  pushNotification.transactionHash = event.transaction.hash;
  pushNotification.logIndex = event.logIndex;
  pushNotification.signature = transactionDataSignature;
  pushNotification.transactionData = transactionData;
  pushNotification.seqNumber = newPushNotificationId;
  pushNotification.save();
}

function encodeOwnershipTransferredNotification<
  T extends OwnershipTransferredEvent,
>(event: T): Bytes {
  const previousOwner = ethereum.Value.fromAddress(event.params.previousOwner);
  const newOwner = ethereum.Value.fromAddress(event.params.newOwner);

  const fixedSizedArray = ethereum.Value.fromFixedSizedArray([
    previousOwner,
    newOwner,
  ]);
  const tupleArray: Array<ethereum.Value> = [fixedSizedArray];
  const tuple = changetype<ethereum.Tuple>(tupleArray);
  const encoded = ethereum.encode(ethereum.Value.fromTuple(tuple))!;

  return encoded;
}

function encodeTokensUnwrappedNotification<T extends TokensUnwrappedEvent>(
  event: T
): Bytes {
  const from = ethereum.Value.fromAddress(event.params.from);
  const targetTariAddress = ethereum.Value.fromString(
    event.params.targetTariAddress
  );
  const amount = ethereum.Value.fromUnsignedBigInt(event.params.amount);
  const fixedSizedArray = ethereum.Value.fromFixedSizedArray([
    from,
    targetTariAddress,
  ]);
  const tupleArray: Array<ethereum.Value> = [fixedSizedArray, amount];
  const tuple = changetype<ethereum.Tuple>(tupleArray);
  const encoded = ethereum.encode(ethereum.Value.fromTuple(tuple))!;

  return encoded;
}

export namespace PushNotificationSignature {
  export const OwnershipTransferred = "OwnershipTransferred";
  export const TokensUnwrapped = "TokensUnwrapped";
}

export type PushNotificationSignature = string;
