import { TokensUnwrapped as TokensUnwrappedEvent } from "../generated/wXTMBridge/wXTMBridge";
import { TokensUnwrappedRecord } from "../generated/schema";
import { Bytes, ethereum, BigInt } from "@graphprotocol/graph-ts";

export function handleTokensUnwrapped(event: TokensUnwrappedEvent): void {
  const data = encodeTokensUnwrappedNotification(event);

  insertTokensUnwrappedRecord(
    event,
    TokensUnwrappedRecordSignature.TokensUnwrapped,
    event.params.nonce,
    data
  );
}

function insertTokensUnwrappedRecord(
  event: ethereum.Event,
  transactionDataSignature: TokensUnwrappedRecordSignature,
  nonce: BigInt,
  transactionData: Bytes
): void {
  let tokensUnwrappedRecord = new TokensUnwrappedRecord(
    `${event.transaction.hash.toHex()}-${event.logIndex.toString()}-${nonce.toString()}`
  );

  tokensUnwrappedRecord.nonce = nonce;
  tokensUnwrappedRecord.contract = event.address;
  tokensUnwrappedRecord.timestamp = event.block.timestamp;
  tokensUnwrappedRecord.blockHash = event.block.hash;
  tokensUnwrappedRecord.blockNumber = event.block.number;
  tokensUnwrappedRecord.transactionHash = event.transaction.hash;
  tokensUnwrappedRecord.logIndex = event.logIndex;
  tokensUnwrappedRecord.signature = transactionDataSignature;
  tokensUnwrappedRecord.transactionData = transactionData;

  tokensUnwrappedRecord.save();
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

export namespace TokensUnwrappedRecordSignature {
  export const TokensUnwrapped = "TokensUnwrapped";
}

export type TokensUnwrappedRecordSignature = string;
