import { newMockEvent } from "matchstick-as";
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts";
import { TokensUnwrapped } from "../generated/wXTMBridge/wXTMBridge";

export function createTokensUnwrappedEvent(
  from: Address,
  targetTariAddress: string,
  amount: BigInt
): TokensUnwrapped {
  let tokensUnwrappedEvent = changetype<TokensUnwrapped>(newMockEvent());

  tokensUnwrappedEvent.parameters = new Array();

  tokensUnwrappedEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  );
  tokensUnwrappedEvent.parameters.push(
    new ethereum.EventParam(
      "targetTariAddress",
      ethereum.Value.fromString(targetTariAddress)
    )
  );
  tokensUnwrappedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  );

  return tokensUnwrappedEvent;
}
