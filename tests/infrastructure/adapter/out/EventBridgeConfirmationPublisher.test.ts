import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { mockClient } from 'aws-sdk-client-mock';
import {
  APPOINTMENT_CONFIRMED_DETAIL_TYPE,
  APPOINTMENT_EVENT_SOURCE,
  EventBridgeConfirmationPublisher,
} from '../../../../src/infrastructure/adapter/out/EventBridgeConfirmationPublisher';
import { buildAppointment, buildPrimitives } from '../../../helpers/fakes';

const BUS = 'reto-rimac-dev-appointments';
const ebMock = mockClient(EventBridgeClient);
const publisher = new EventBridgeConfirmationPublisher(new EventBridgeClient({ region: 'us-east-1' }), BUS);

describe('EventBridgeConfirmationPublisher', () => {
  beforeEach(() => ebMock.reset());

  it('publica el evento AppointmentConfirmed en el bus propio', async () => {
    ebMock.on(PutEventsCommand).resolves({ FailedEntryCount: 0, Entries: [{ EventId: '1' }] });

    await publisher.publishConfirmed(buildAppointment());

    expect(ebMock.commandCalls(PutEventsCommand)[0].args[0].input).toEqual({
      Entries: [
        {
          EventBusName: BUS,
          Source: APPOINTMENT_EVENT_SOURCE,
          DetailType: APPOINTMENT_CONFIRMED_DETAIL_TYPE,
          Detail: JSON.stringify(buildPrimitives()),
        },
      ],
    });
  });

  it('lanza error si EventBridge rechaza la entrada (PutEvents no lo hace solo)', async () => {
    ebMock.on(PutEventsCommand).resolves({
      FailedEntryCount: 1,
      Entries: [{ ErrorCode: 'InternalFailure', ErrorMessage: 'boom' }],
    });

    await expect(publisher.publishConfirmed(buildAppointment())).rejects.toThrow('InternalFailure boom');
  });
});
