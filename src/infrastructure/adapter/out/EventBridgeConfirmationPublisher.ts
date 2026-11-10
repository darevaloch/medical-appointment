import { EventBridgeClient, PutEventsCommand } from '@aws-sdk/client-eventbridge';
import { AppointmentConfirmationPublisher } from '../../../domain/port/AppointmentConfirmationPublisher';
import { Appointment } from '../../../domain/model/Appointment';

export const APPOINTMENT_EVENT_SOURCE = 'rimac.appointment';
export const APPOINTMENT_CONFIRMED_DETAIL_TYPE = 'AppointmentConfirmed';

export class EventBridgeConfirmationPublisher implements AppointmentConfirmationPublisher {
  constructor(
    private readonly client: EventBridgeClient,
    private readonly eventBusName: string,
  ) {}

  async publishConfirmed(appointment: Appointment): Promise<void> {
    const result = await this.client.send(
      new PutEventsCommand({
        Entries: [
          {
            EventBusName: this.eventBusName,
            Source: APPOINTMENT_EVENT_SOURCE,
            DetailType: APPOINTMENT_CONFIRMED_DETAIL_TYPE,
            Detail: JSON.stringify(appointment.toPrimitives()),
          },
        ],
      }),
    );

    if (result.FailedEntryCount) {
      const entry = result.Entries?.[0];
      throw new Error(`EventBridge rechazó el evento: ${entry?.ErrorCode} ${entry?.ErrorMessage}`);
    }
  }
}
