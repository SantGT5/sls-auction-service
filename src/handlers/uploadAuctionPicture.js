import { getAuctionById } from "./getAuction";

import { uploadPictureToS3 } from "../lib/uploadPictureToS3";

import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";
import validator from "@middy/validator";

import uploadAuctionPictureSchema from "../lib/schemas/uploadAuctionPictureSchema";
import { transpileSchema } from "@middy/validator/transpile";

import createError from "http-error";

import { setAuctionPictureURL } from "../lib/setAuctionPictureURL";

export async function uploadAuctionPicture(event) {
  const { id } = event.pathParameters;
  const { email } = event.requestContext.authorizer;
  const auction = await getAuctionById(id);

  if (auction.seller !== email) {
    throw new createError.ForBidden("You are not the seller of this auction!");
  }

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  let updatedAuction;

  try {
    const pictureUrl = await uploadPictureToS3(auction.id + ".jpg", buffer);

    updatedAuction = await setAuctionPictureURL(auction.id, pictureUrl);
  } catch (e) {
    console.error(e);
    throw new createError.InternalServerError(e);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = middy(uploadAuctionPicture)
  .use(httpErrorHandler())
  .use(
    validator({
      eventSchema: transpileSchema(uploadAuctionPictureSchema),
    })
  );
