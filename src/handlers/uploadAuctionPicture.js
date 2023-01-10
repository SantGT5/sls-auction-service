import { getAuctionById } from "./getAuction";

import { uploadPictureToS3 } from "../lib/uploadPictureToS3";

import middy from "@middy/core";
import httpErrorHandler from "@middy/http-error-handler";

import createError from "http-error";

export async function uploadAuctionPicture(event, context) {
  const { id } = event.pathParameters;

  const auction = await getAuctionById(id);

  const base64 = event.body.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64, "base64");

  try {
    const uploadPictureResult = await uploadPictureToS3(
      auction.id + ".jpg",
      buffer
    );

    console.log(uploadPictureResult);
  } catch (e) {
    console.error(e);
    throw new createError.InternalServerError(e);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ msg: "is working" }),
  };
}

export const handler = middy(uploadAuctionPicture).use(httpErrorHandler());
