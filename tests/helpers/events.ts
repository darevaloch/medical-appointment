import type { APIGatewayProxyEvent, SQSEvent, SQSRecord } from 'aws-lambda';

export const httpEvent = (overrides: Partial<APIGatewayProxyEvent>): APIGatewayProxyEvent =>
  ({
    httpMethod: 'GET',
    resource: '/',
    body: null,
    pathParameters: null,
    ...overrides,
  }) as APIGatewayProxyEvent;

export const sqsEvent = (...bodies: string[]): SQSEvent => ({
  Records: bodies.map((body, index) => ({ messageId: `msg-${index + 1}`, body }) as SQSRecord),
});
