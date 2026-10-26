import {
  assert,
  describe,
  test,
  clearStore,
  afterAll,
} from "matchstick-as/assembly/index";
import { Address, BigInt, ethereum } from "@graphprotocol/graph-ts";
import { handleTokensUnwrapped } from "../src/w-tari-bridge";
import { TokensUnwrappedRecord } from "../generated/schema";
import { createTokensUnwrappedEvent } from "./w-tari-bridge-utils";

describe("wTARI Bridge Entity Assertions", () => {
  afterAll(() => {
    clearStore();
  });

  test("TokensUnwrapped produces one record with contract and transactionData", () => {
    let bridge = Address.fromString("0x2222222222222222222222222222222222222222");
    let from = Address.fromString("0x1234567890123456789012345678901234567890");
    let targetTariAddress = "tari1wtari_target_address";
    let amount = BigInt.fromI32(1000000000);
    let nonce = BigInt.fromI32(42);

    let event = createTokensUnwrappedEvent(from, targetTariAddress, amount, nonce);
    event.address = bridge;

    handleTokensUnwrapped(event);

    assert.entityCount("TokensUnwrappedRecord", 1);

    let id =
      event.transaction.hash.toHex() +
      "-" +
      event.logIndex.toString() +
      "-" +
      nonce.toString();

    assert.fieldEquals("TokensUnwrappedRecord", id, "contract", bridge.toHexString());
    assert.fieldEquals("TokensUnwrappedRecord", id, "nonce", "42");
    assert.fieldEquals("TokensUnwrappedRecord", id, "signature", "TokensUnwrapped");

    let record = TokensUnwrappedRecord.load(id)!;
    let decoded = ethereum
      .decode("((address,string),uint256)", record.transactionData!)!
      .toTuple();
    let sender = decoded[0].toTuple();

    assert.addressEquals(sender[0].toAddress(), from);
    assert.stringEquals(sender[1].toString(), targetTariAddress);
    assert.bigIntEquals(decoded[1].toBigInt(), amount);
  });
});
