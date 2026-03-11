import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import type { SessionStateRecord } from "./types";

// ============================================================
// Singleton do DynamoDB Document Client
// Reutilizado entre invocações (Next.js mantém o módulo em cache)
// ============================================================

const rawClient = new DynamoDBClient({
  region: process.env.AWS_REGION || "sa-east-1",
  ...(process.env.DYNAMODB_ENDPOINT && {
    endpoint: process.env.DYNAMODB_ENDPOINT,
  }),
});

const docClient = DynamoDBDocumentClient.from(rawClient, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "UserSessionState";

// ============================================================
// Operações do repositório de sessão
// ============================================================

/**
 * Persiste o estado de sessão (cada evento é um novo item).
 */
export async function saveSessionState(
  state: SessionStateRecord
): Promise<void> {
  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: state,
    })
  );
}

/**
 * Busca o registro MAIS RECENTE da sessão.
 * Query reversa com Limit=1 → custo de ~0.5 RCU.
 */
export async function findLatestSession(
  sessionId: string
): Promise<SessionStateRecord | null> {
  const result = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "sessionId = :sid",
      ExpressionAttributeValues: { ":sid": sessionId },
      ScanIndexForward: false, // Decrescente → mais recente primeiro
      Limit: 1,
    })
  );

  if (!result.Items || result.Items.length === 0) return null;
  return result.Items[0] as SessionStateRecord;
}
