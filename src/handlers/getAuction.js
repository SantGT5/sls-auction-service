import AWS from "aws-sdk";

import commonMiddleware from "../lib/commonMiddleware";

import createError from "http-error";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuction(event, context) {
  let auction;

  const { id } = event.pathParameters;

  try {
    const res = await dynamodb
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
      })
      .promise()

    auction = res.Item;
  } catch (e) {
    console.error(e);
    throw new createError.InternalServerError(e);
  }

  if (!auction) {
    throw new createError.NotFount(`Auction with ID "${id}" not found!`);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(getAuction)