import { TokensUnwrapped as TokensUnwrappedEvent } from "../generated/wXTMBridge/wXTMBridge";
import { TokensUnwrappedDetails } from "../generated/schema";
import { Bytes, ethereum, BigInt } from "@graphprotocol/graph-ts";

export function handleTokensUnwrapped(event: TokensUnwrappedEvent): void {
  const data = encodeTokensUnwrappedNotification(event);

  insertTokensUnwrappedDetails(
    event,
    TokensUnwrappedDetailsSignature.TokensUnwrapped,
    event.params.nonce,
    data
  );
}

function insertTokensUnwrappedDetails(
  event: ethereum.Event,
  transactionDataSignature: TokensUnwrappedDetailsSignature,
  nonce: BigInt,
  transactionData: Bytes
): void {
  let tokensUnwrappedDetails = new TokensUnwrappedDetails(
    `${event.transaction.hash.toHex()}-${event.logIndex.toString()}-${nonce.toString()}`
  );

  tokensUnwrappedDetails.nonce = nonce;
  tokensUnwrappedDetails.contract = event.address;
  tokensUnwrappedDetails.timestamp = event.block.timestamp;
  tokensUnwrappedDetails.blockHash = event.block.hash;
  tokensUnwrappedDetails.blockNumber = event.block.number;
  tokensUnwrappedDetails.transactionHash = event.transaction.hash;
  tokensUnwrappedDetails.logIndex = event.logIndex;
  tokensUnwrappedDetails.signature = transactionDataSignature;
  tokensUnwrappedDetails.transactionData = transactionData;

  tokensUnwrappedDetails.save();
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

export namespace TokensUnwrappedDetailsSignature {
  export const TokensUnwrapped = "TokensUnwrapped";
}

export type TokensUnwrappedDetailsSignature = string;
