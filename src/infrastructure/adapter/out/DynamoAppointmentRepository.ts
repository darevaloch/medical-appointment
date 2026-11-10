import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  QueryCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { AppointmentRepository } from '../../../domain/port/AppointmentRepository';
import { Appointment, AppointmentPrimitives } from '../../../domain/model/Appointment';

export class DynamoAppointmentRepository implements AppointmentRepository {
  constructor(
    private readonly client: DynamoDBDocumentClient,
    private readonly tableName: string,
  ) {}

  async save(appointment: Appointment): Promise<void> {
    await this.client.send(
      new PutCommand({
        TableName: this.tableName,
        Item: appointment.toPrimitives(),
      }),
    );
  }

  async findById(insuredId: string, id: string): Promise<Appointment | null> {
    const { Item } = await this.client.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { insuredId, id },
      }),
    );
    return Item ? Appointment.fromPrimitives(Item as AppointmentPrimitives) : null;
  }

  async findByInsuredId(insuredId: string): Promise<Appointment[]> {
    const items: AppointmentPrimitives[] = [];
    let lastKey: QueryCommandOutput['LastEvaluatedKey'];

    do {
      const page = await this.client.send(
        new QueryCommand({
          TableName: this.tableName,
          KeyConditionExpression: 'insuredId = :insuredId',
          ExpressionAttributeValues: { ':insuredId': insuredId },
          ScanIndexForward: false,
          ExclusiveStartKey: lastKey,
        }),
      );
      items.push(...((page.Items ?? []) as AppointmentPrimitives[]));
      lastKey = page.LastEvaluatedKey;
    } while (lastKey);

    return items.map((item) => Appointment.fromPrimitives(item));
  }
}
