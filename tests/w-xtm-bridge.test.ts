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

  test("TokensUnwrapped created and stored", () => {
    let from = Address.fromString("0x1234567890123456789012345678901234567890");
    let targetTariAddress =
      "tari1qyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqs";
    let amount = BigInt.fromI32(1000000000); // 1 billion units

    let tokensUnwrappedEvent = createTokensUnwrappedEvent(
      from,
      targetTariAddress,
      amount
    );

    logStore();

    handleTokensUnwrapped(tokensUnwrappedEvent);

    logStore();

    assert.entityCount("TokensUnwrapped", 1);

    // The ID is created using: event.transaction.hash.concatI32(event.logIndex.toI32())
    let expectedId = tokensUnwrappedEvent.transaction.hash.concatI32(
      tokensUnwrappedEvent.logIndex.toI32()
    );

    assert.fieldEquals(
      "TokensUnwrapped",
      expectedId.toHexString(),
      "from",
      "0x1234567890123456789012345678901234567890"
    );
    assert.fieldEquals(
      "TokensUnwrapped",
      expectedId.toHexString(),
      "targetTariAddress",
      targetTariAddress
    );
    assert.fieldEquals(
      "TokensUnwrapped",
      expectedId.toHexString(),
      "amount",
      "1000000000"
    );
  });

  test("Counter entity created and incremented", () => {
    // Below exists from previous test
    assert.entityCount("Counter", 1);
    assert.fieldEquals("Counter", "PUSH_NOTIFICATION", "value", "1");
  });

  test("PushNotification created and stored", () => {
    assert.entityCount("PushNotification", 1);

    // The PushNotification ID format is: txHash-logIndex-seqNumber
    let from = Address.fromString("0x1234567890123456789012345678901234567890");
    let targetTariAddress =
      "tari1qyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqszqgpqyqs";
    let amount = BigInt.fromI32(1000000000);

    let tokensUnwrappedEvent = createTokensUnwrappedEvent(
      from,
      targetTariAddress,
      amount
    );

    // Build expected ID: txHash-logIndex-seqNumber
    let expectedPushId =
      tokensUnwrappedEvent.transaction.hash.toHex() +
      "-" +
      tokensUnwrappedEvent.logIndex.toString() +
      "-1";

    assert.fieldEquals(
      "PushNotification",
      expectedPushId,
      "signature",
      "TokensUnwrapped"
    );
    assert.fieldEquals("PushNotification", expectedPushId, "seqNumber", "1");
  });

  test("Multiple TokensUnwrapped events increment counter correctly", () => {
    let from2 = Address.fromString(
      "0x9876543210987654321098765432109876543210"
    );
    let targetTariAddress2 = "tari1different_address_here";
    let amount2 = BigInt.fromI32(2000000000);

    let secondTokensUnwrappedEvent = createTokensUnwrappedEvent(
      from2,
      targetTariAddress2,
      amount2
    );

    // Manually modify the event to have different transaction hash and log index to avoid overwriting the first entity
    secondTokensUnwrappedEvent.transaction.hash = Bytes.fromHexString(
      "0xb16081f360e3847006db660bae1c6d1b2e17ec2b"
    );
    secondTokensUnwrappedEvent.logIndex = BigInt.fromI32(2);

    handleTokensUnwrapped(secondTokensUnwrappedEvent);

    assert.entityCount("TokensUnwrapped", 2);
    assert.entityCount("PushNotification", 2);
    assert.fieldEquals("Counter", "PUSH_NOTIFICATION", "value", "2");
  });

  test("TokensUnwrapped with zero amount", () => {
    let from3 = Address.fromString(
      "0x1111111111111111111111111111111111111111"
    );
    let targetTariAddress3 = "tari1zero_amount_test";
    let amount3 = BigInt.fromI32(0);

    let thirdTokensUnwrappedEvent = createTokensUnwrappedEvent(
      from3,
      targetTariAddress3,
      amount3
    );

    // Manually modify the event to have different transaction hash and log index to avoid overwriting previous entities
    thirdTokensUnwrappedEvent.transaction.hash = Bytes.fromHexString(
      "0xc16081f360e3847006db660bae1c6d1b2e17ec2c"
    );
    thirdTokensUnwrappedEvent.logIndex = BigInt.fromI32(3);

    handleTokensUnwrapped(thirdTokensUnwrappedEvent);

    assert.entityCount("TokensUnwrapped", 3);
    assert.entityCount("PushNotification", 3);

    let expectedId = thirdTokensUnwrappedEvent.transaction.hash.concatI32(
      thirdTokensUnwrappedEvent.logIndex.toI32()
    );

    assert.fieldEquals(
      "TokensUnwrapped",
      expectedId.toHexString(),
      "amount",
      "0"
    );

    assert.fieldEquals("Counter", "PUSH_NOTIFICATION", "value", "3");
  });
});
