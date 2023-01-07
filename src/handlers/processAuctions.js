import createError from "http-error";

import { closeAuction } from "../lib/closeAuction";
import { getEndedAuctions } from "../lib/getEndedAuctions";

async function processAuctions(event, context) {
  try {
    const auctionsToClose = await getEndedAuctions();

    const closePromises = auctionsToClose.map((auction) =>
      closeAuction(auction)
    );

    await Promise.all(closePromises);

    return {
      closed: closePromises.length,
    };
  } catch (e) {
    console.error(e);
    throw new createError.InternalServerError(e);
  }
}

export const handler = processAuctions;
