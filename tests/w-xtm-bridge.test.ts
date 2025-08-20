import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll,
  logStore,
} from "matchstick-as/assembly/index";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { handleTokensUnwrapped } from "../src/w-xtm-bridge";
import { createTokensUnwrappedEvent } from "./w-xtm-bridge-utils";

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("wXTM Bridge Entity Assertions", () => {
  beforeAll(() => {
    clearStore();
  });

  afterAll(() => {
    clearStore();
  });

  test("TokensUnwrappedRecord created and stored", () => {
    let from = Address.fromString("0x1234567890123456789012345678901234567890");
    let targetTariAddress =
      "tari1qyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqs";
    let amount = BigInt.fromI32(1000000000);
    let nonce = BigInt.fromI32(123456);

    let tokensUnwrappedEvent = createTokensUnwrappedEvent(
      from,
      targetTariAddress,
      amount,
      nonce
    );

    logStore();

    handleTokensUnwrapped(tokensUnwrappedEvent);

    logStore();

    assert.entityCount("TokensUnwrappedRecord", 1);

    // The ID is created using: txHash-logIndex-nonce
    let expectedId =
      tokensUnwrappedEvent.transaction.hash.toHex() +
      "-" +
      tokensUnwrappedEvent.logIndex.toString() +
      "-" +
      nonce.toString();

    assert.fieldEquals(
      "TokensUnwrappedRecord",
      expectedId,
      "signature",
      "TokensUnwrapped"
    );
    assert.fieldEquals("TokensUnwrappedRecord", expectedId, "nonce", "123456");
  });

  test("Multiple TokensUnwrappedRecord events created correctly", () => {
    let from2 = Address.fromString(
      "0x9876543210987654321098765432109876543210"
    );
    let targetTariAddress2 = "tari1different_address_here";
    let amount2 = BigInt.fromI32(2000000000);
    let nonce2 = BigInt.fromI32(789012);

    let secondTokensUnwrappedEvent = createTokensUnwrappedEvent(
      from2,
      targetTariAddress2,
      amount2,
      nonce2
    );

    // Manually modify the event to have different transaction hash and log index to avoid overwriting the first entity
    secondTokensUnwrappedEvent.transaction.hash = Bytes.fromHexString(
      "0xb16081f360e3847006db660bae1c6d1b2e17ec2b"
    );
    secondTokensUnwrappedEvent.logIndex = BigInt.fromI32(2);

    handleTokensUnwrapped(secondTokensUnwrappedEvent);

    assert.entityCount("TokensUnwrappedRecord", 2);

    // Verify the second entity has the correct nonce
    let expectedId2 =
      secondTokensUnwrappedEvent.transaction.hash.toHex() +
      "-" +
      secondTokensUnwrappedEvent.logIndex.toString() +
      "-" +
      nonce2.toString();

    assert.fieldEquals("TokensUnwrappedRecord", expectedId2, "nonce", "789012");
  });

  test("TokensUnwrappedRecord with large amount", () => {
    let from3 = Address.fromString(
      "0x1111111111111111111111111111111111111111"
    );
    let targetTariAddress3 = "tari1large_amount_test";
    let amount3 = BigInt.fromI32(5);
    let nonce3 = BigInt.fromI32(999);

    let thirdTokensUnwrappedEvent = createTokensUnwrappedEvent(
      from3,
      targetTariAddress3,
      amount3,
      nonce3
    );

    // Manually modify the event to have different transaction hash and log index to avoid overwriting previous entities
    thirdTokensUnwrappedEvent.transaction.hash = Bytes.fromHexString(
      "0xc16081f360e3847006db660bae1c6d1b2e17ec2c"
    );
    thirdTokensUnwrappedEvent.logIndex = BigInt.fromI32(3);

    handleTokensUnwrapped(thirdTokensUnwrappedEvent);

    assert.entityCount("TokensUnwrappedRecord", 3);

    let expectedId3 =
      thirdTokensUnwrappedEvent.transaction.hash.toHex() +
      "-" +
      thirdTokensUnwrappedEvent.logIndex.toString() +
      "-" +
      nonce3.toString();

    assert.fieldEquals("TokensUnwrappedRecord", expectedId3, "nonce", "999");
    assert.fieldEquals(
      "TokensUnwrappedRecord",
      expectedId3,
      "signature",
      "TokensUnwrapped"
    );
  });
});
