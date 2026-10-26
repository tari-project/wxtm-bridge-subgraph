import { TokensUnwrapped as TokensUnwrappedEvent } from "../generated/wTARIBridge/wTARIBridge";
import { saveTokensUnwrappedRecord } from "./tokens-unwrapped";

export function handleTokensUnwrapped(event: TokensUnwrappedEvent): void {
  saveTokensUnwrappedRecord(
    event,
    event.params.from,
    event.params.targetTariAddress,
    event.params.amount,
    event.params.nonce
  );
}
