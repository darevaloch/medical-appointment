import { ListAppointmentsByInsuredService } from '../../src/application/service/ListAppointmentsByInsuredService';
import { buildAppointment, buildPrimitives, mockAppointmentRepository } from '../helpers/fakes';

describe('ListAppointmentsByInsuredService', () => {
  it('devuelve las citas del asegurado en formato plano', async () => {
    const repository = mockAppointmentRepository();
    repository.findByInsuredId.mockResolvedValue([buildAppointment(), buildAppointment({ id: 'otro' })]);
    const useCase = new ListAppointmentsByInsuredService(repository);

    const result = await useCase.execute('00123');

    expect(repository.findByInsuredId).toHaveBeenCalledWith('00123');
    expect(result).toEqual([buildPrimitives(), buildPrimitives({ id: 'otro' })]);
  });

  it('devuelve lista vacía si no hay citas', async () => {
    const useCase = new ListAppointmentsByInsuredService(mockAppointmentRepository());

    await expect(useCase.execute('00123')).resolves.toEqual([]);
  });
});
