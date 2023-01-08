import AWS from "aws-sdk";

import commonMiddleware from "../lib/commonMiddleware";

import createError from "http-error";

import { getAuctionById } from "./getAuction";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  const { id } = event.pathParameters;
  const { amount } = event.body;

  const auction = await getAuctionById(id);

  if (auction.status !== "OPEN") {
    return {
      statusCode: 403,
      body: JSON.stringify({ err: "You cannot bid on closed options!" }),
    };
  }

  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(403, err, {
      err: `Your bid must be higher than ${auction.highestBid.amount}!`,
    });
  }

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set highestBid.amount = :amount",
    ExpressionAttributeValues: {
      ":amount": amount,
    },
    ReturnValues: "ALL_NEW",
  };

  let updatedAction;

  try {
    const res = await dynamodb.update(params).promise();

    updatedAction = res.Attributes;
  } catch (e) {
    console.error(e);
    throw new createError.InternalServerError(e);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAction),
  };
}

export const handler = commonMiddleware(placeBid);
