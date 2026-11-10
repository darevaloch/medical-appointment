import { PublishCommand, SNSClient } from '@aws-sdk/client-sns';
import { AppointmentEventPublisher } from '../../../domain/port/AppointmentEventPublisher';
import { Appointment } from '../../../domain/model/Appointment';

export class SnsAppointmentEventPublisher implements AppointmentEventPublisher {
  constructor(
    private readonly client: SNSClient,
    private readonly topicArn: string,
  ) {}

  async publishRequested(appointment: Appointment): Promise<void> {
    const message = appointment.toPrimitives();

    await this.client.send(
      new PublishCommand({
        TopicArn: this.topicArn,
        Message: JSON.stringify(message),
        MessageAttributes: {
          countryISO: { DataType: 'String', StringValue: message.countryISO },
        },
      }),
    );
  }
}
