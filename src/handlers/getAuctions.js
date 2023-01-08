import AWS from "aws-sdk";

import commonMiddleware from "../lib/commonMiddleware";
import validator from "@middy/validator";
import { transpileSchema } from "@middy/validator/transpile";

import getAuctionsSchema from "../lib/schemas/getActionsSchema";

import createError from "http-error";

const dynamodb = new AWS.DynamoDB.DocumentClient();

async function getAuctions(event, context) {
  const { status } = event.queryStringParameters;

  let auctions;

  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    IndexName: "statusAndEndDate",
    KeyConditionExpression: "#status = :status",
    ExpressionAttributeValues: {
      ":status": status,
    },
    ExpressionAttributeNames: {
      "#status": "status",
    },
  };

  try {
    const res = await dynamodb.query(params).promise();

    auctions = res.Items;
  } catch (e) {
    console.log(e);
    throw new createError.InternalServerError(e);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(auctions),
  };
}

export const handler = commonMiddleware(getAuctions).use(
  validator({
    eventSchema: transpileSchema(getAuctionsSchema),
    useDefaults: true,
  })
);
