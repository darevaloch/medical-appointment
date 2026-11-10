import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import { DynamoAppointmentRepository } from '../../../../src/infrastructure/adapter/out/DynamoAppointmentRepository';
import { FIXED_ID, buildAppointment, buildPrimitives } from '../../../helpers/fakes';

const TABLE = 'appointments-test';
const ddbMock = mockClient(DynamoDBDocumentClient);
const repository = new DynamoAppointmentRepository(
  DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'us-east-1' })),
  TABLE,
);

describe('DynamoAppointmentRepository', () => {
  beforeEach(() => ddbMock.reset());

  it('save guarda la cita en formato plano', async () => {
    ddbMock.on(PutCommand).resolves({});

    await repository.save(buildAppointment());

    expect(ddbMock.commandCalls(PutCommand)[0].args[0].input).toEqual({
      TableName: TABLE,
      Item: buildPrimitives(),
    });
  });

  it('findById busca por insuredId + id y reconstruye la entidad', async () => {
    ddbMock.on(GetCommand).resolves({ Item: buildPrimitives() });

    const result = await repository.findById('00123', FIXED_ID);

    expect(ddbMock.commandCalls(GetCommand)[0].args[0].input).toEqual({
      TableName: TABLE,
      Key: { insuredId: '00123', id: FIXED_ID },
    });
    expect(result?.toPrimitives()).toEqual(buildPrimitives());
  });

  it('findById devuelve null si no existe', async () => {
    ddbMock.on(GetCommand).resolves({});

    await expect(repository.findById('00123', 'x')).resolves.toBeNull();
  });

  it('findByInsuredId consulta por PK, más recientes primero, y recorre todas las páginas', async () => {
    ddbMock
      .on(QueryCommand)
      .resolvesOnce({ Items: [buildPrimitives({ id: 'B' })], LastEvaluatedKey: { insuredId: '00123', id: 'B' } })
      .resolvesOnce({ Items: [buildPrimitives({ id: 'A' })] });

    const result = await repository.findByInsuredId('00123');

    const calls = ddbMock.commandCalls(QueryCommand);
    expect(calls).toHaveLength(2);
    expect(calls[0].args[0].input).toMatchObject({
      TableName: TABLE,
      KeyConditionExpression: 'insuredId = :insuredId',
      ExpressionAttributeValues: { ':insuredId': '00123' },
      ScanIndexForward: false,
    });
    expect(calls[1].args[0].input.ExclusiveStartKey).toEqual({ insuredId: '00123', id: 'B' });
    expect(result.map((a) => a.id)).toEqual(['B', 'A']);
  });

  it('findByInsuredId devuelve lista vacía si no hay items', async () => {
    ddbMock.on(QueryCommand).resolves({});

    await expect(repository.findByInsuredId('00123')).resolves.toEqual([]);
  });
});
