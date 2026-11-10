import { RegisterCountryAppointmentService } from '../../src/application/service/RegisterCountryAppointmentService';
import { buildPrimitives, mockConfirmationPublisher, mockCountryRepository } from '../helpers/fakes';

describe('RegisterCountryAppointmentService', () => {
  it('guarda la cita en la BD del país y publica la confirmación', async () => {
    const repository = mockCountryRepository();
    const confirmationPublisher = mockConfirmationPublisher();
    const useCase = new RegisterCountryAppointmentService(repository, confirmationPublisher);

    await useCase.execute(buildPrimitives({ countryISO: 'CL' }));

    expect(repository.save).toHaveBeenCalledTimes(1);
    expect(repository.save.mock.calls[0][0].toPrimitives()).toEqual(buildPrimitives({ countryISO: 'CL' }));
    expect(confirmationPublisher.publishConfirmed).toHaveBeenCalledWith(repository.save.mock.calls[0][0]);
  });

  it('no confirma si falla el guardado en la BD del país', async () => {
    const repository = mockCountryRepository();
    repository.save.mockRejectedValueOnce(new Error('mysql down'));
    const confirmationPublisher = mockConfirmationPublisher();
    const useCase = new RegisterCountryAppointmentService(repository, confirmationPublisher);

    await expect(useCase.execute(buildPrimitives())).rejects.toThrow('mysql down');
    expect(confirmationPublisher.publishConfirmed).not.toHaveBeenCalled();
  });
});
