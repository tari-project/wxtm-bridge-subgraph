import {
  OwnershipTransferred as OwnershipTransferredEvent,
  TokensUnwrapped as TokensUnwrappedEvent
} from "../generated/wXTMBridge/wXTMBridge"
import { OwnershipTransferred, TokensUnwrapped } from "../generated/schema"

export function handleOwnershipTransferred(
  event: OwnershipTransferredEvent
): void {
  let entity = new OwnershipTransferred(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.previousOwner = event.params.previousOwner
  entity.newOwner = event.params.newOwner

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleTokensUnwrapped(event: TokensUnwrappedEvent): void {
  let entity = new TokensUnwrapped(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.from = event.params.from
  entity.targetTariAddress = event.params.targetTariAddress
  entity.amount = event.params.amount

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
