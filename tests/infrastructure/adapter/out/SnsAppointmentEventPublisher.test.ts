import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { mockClient } from 'aws-sdk-client-mock';
import { SnsAppointmentEventPublisher } from '../../../../src/infrastructure/adapter/out/SnsAppointmentEventPublisher';
import { buildAppointment, buildPrimitives } from '../../../helpers/fakes';

const TOPIC_ARN = 'arn:aws:sns:us-east-1:000000000000:appointments';
const snsMock = mockClient(SNSClient);

describe('SnsAppointmentEventPublisher', () => {
  beforeEach(() => snsMock.reset());

  it.each(['PE', 'CL'] as const)('publica la cita con el atributo countryISO=%s para la filter policy', async (country) => {
    snsMock.on(PublishCommand).resolves({ MessageId: '1' });
    const publisher = new SnsAppointmentEventPublisher(new SNSClient({ region: 'us-east-1' }), TOPIC_ARN);

    await publisher.publishRequested(buildAppointment({ countryISO: country }));

    expect(snsMock.commandCalls(PublishCommand)[0].args[0].input).toEqual({
      TopicArn: TOPIC_ARN,
      Message: JSON.stringify(buildPrimitives({ countryISO: country })),
      MessageAttributes: { countryISO: { DataType: 'String', StringValue: country } },
    });
  });
});
