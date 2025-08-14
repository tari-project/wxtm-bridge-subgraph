import { TokensUnwrapped as TokensUnwrappedEvent } from "../generated/wXTMBridge/wXTMBridge";
import {
  TokensUnwrapped,
  Counter,
  PushNotification,
} from "../generated/schema";
import { Bytes, ethereum } from "@graphprotocol/graph-ts";

export function handleTokensUnwrapped(event: TokensUnwrappedEvent): void {
  let entity = new TokensUnwrapped(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  );

  entity.from = event.params.from;
  entity.targetTariAddress = event.params.targetTariAddress;
  entity.amount = event.params.amount;
  entity.nonce = event.params.nonce;

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

function encodeTokensUnwrappedNotification<T extends TokensUnwrappedEvent>(
  event: T
): Bytes {
  const from = ethereum.Value.fromAddress(event.params.from);
  const targetTariAddress = ethereum.Value.fromString(
    event.params.targetTariAddress
  );
  const amount = ethereum.Value.fromUnsignedBigInt(event.params.amount);
  const nonce = ethereum.Value.fromUnsignedBigInt(event.params.nonce);

  const fixedSizedArray = ethereum.Value.fromFixedSizedArray([
    from,
    targetTariAddress,
  ]);

  const tupleArray: Array<ethereum.Value> = [fixedSizedArray, amount, nonce];
  const tuple = changetype<ethereum.Tuple>(tupleArray);
  const encoded = ethereum.encode(ethereum.Value.fromTuple(tuple))!;

  return encoded;
}

export namespace PushNotificationSignature {
  export const TokensUnwrapped = "TokensUnwrapped";
}

export type PushNotificationSignature = string;
