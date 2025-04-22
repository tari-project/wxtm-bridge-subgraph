import { newMockEvent } from "matchstick-as"
import { ethereum, Address, BigInt } from "@graphprotocol/graph-ts"
import {
  OwnershipTransferred,
  TokensUnwrapped
} from "../generated/wXTMBridge/wXTMBridge"

export function createOwnershipTransferredEvent(
  previousOwner: Address,
  newOwner: Address
): OwnershipTransferred {
  let ownershipTransferredEvent =
    changetype<OwnershipTransferred>(newMockEvent())

  ownershipTransferredEvent.parameters = new Array()

  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam(
      "previousOwner",
      ethereum.Value.fromAddress(previousOwner)
    )
  )
  ownershipTransferredEvent.parameters.push(
    new ethereum.EventParam("newOwner", ethereum.Value.fromAddress(newOwner))
  )

  return ownershipTransferredEvent
}

export function createTokensUnwrappedEvent(
  from: Address,
  targetTariAddress: string,
  amount: BigInt
): TokensUnwrapped {
  let tokensUnwrappedEvent = changetype<TokensUnwrapped>(newMockEvent())

  tokensUnwrappedEvent.parameters = new Array()

  tokensUnwrappedEvent.parameters.push(
    new ethereum.EventParam("from", ethereum.Value.fromAddress(from))
  )
  tokensUnwrappedEvent.parameters.push(
    new ethereum.EventParam(
      "targetTariAddress",
      ethereum.Value.fromString(targetTariAddress)
    )
  )
  tokensUnwrappedEvent.parameters.push(
    new ethereum.EventParam("amount", ethereum.Value.fromUnsignedBigInt(amount))
  )

  return tokensUnwrappedEvent
}
