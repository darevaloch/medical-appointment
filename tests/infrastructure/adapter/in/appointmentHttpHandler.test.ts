import {
  SCHEDULING_IN_PROGRESS_MESSAGE,
  makeAppointmentHttpHandler,
} from '../../../../src/infrastructure/adapter/in/http/appointmentHttpHandler';
import { OPENAPI_SPEC_URL } from '../../../../src/infrastructure/adapter/in/http/swaggerPage';
import { buildPrimitives } from '../../../helpers/fakes';
import { httpEvent } from '../../../helpers/events';

const setup = () => {
  const create = { execute: jest.fn().mockResolvedValue(buildPrimitives()) };
  const list = { execute: jest.fn().mockResolvedValue([buildPrimitives()]) };
  return { create, list, handler: makeAppointmentHttpHandler({ create, list }) };
};

const postEvent = (body: string | null) => httpEvent({ httpMethod: 'POST', resource: '/appointments', body });
const getEvent = (insuredId?: string) =>
  httpEvent({
    httpMethod: 'GET',
    resource: '/appointments/{insuredId}',
    pathParameters: insuredId ? { insuredId } : null,
  });

describe('appointment HTTP handler', () => {
  beforeEach(() => jest.spyOn(console, 'error').mockImplementation(() => undefined));

  describe('POST /appointments', () => {
    it('responde 202 con el mensaje "en proceso" y la cita creada', async () => {
      const { create, handler } = setup();
      const body = { insuredId: '00123', scheduleId: 100, countryISO: 'PE' };

      const result = await handler(postEvent(JSON.stringify(body)));

      expect(create.execute).toHaveBeenCalledWith(body);
      expect(result.statusCode).toBe(202);
      expect(result.headers).toEqual({ 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      expect(JSON.parse(result.body)).toEqual({ message: SCHEDULING_IN_PROGRESS_MESSAGE, data: buildPrimitives() });
    });

    it.each([
      ['body vacío', null],
      ['JSON roto', '{insuredId'],
    ])('responde 400 con %s', async (_, body) => {
      const { create, handler } = setup();

      const result = await handler(postEvent(body));

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).message).toBe('El body no es un JSON válido');
      expect(create.execute).not.toHaveBeenCalled();
    });

    it('responde 400 con el detalle de los campos con tipo incorrecto', async () => {
      const { handler } = setup();

      const result = await handler(postEvent(JSON.stringify({ insuredId: 123, countryISO: 'PE' })));

      const body = JSON.parse(result.body);
      expect(result.statusCode).toBe(400);
      expect(body.code).toBe('INVALID_REQUEST');
      expect(body.details).toEqual(expect.arrayContaining([expect.stringMatching(/^insuredId:/), expect.stringMatching(/^scheduleId:/)]));
    });

    it('responde 400 si el body no es un objeto', async () => {
      const { handler } = setup();

      const result = await handler(postEvent('5'));

      expect(result.statusCode).toBe(400);
      expect(JSON.parse(result.body).details[0]).toMatch(/^\(raíz\):/);
    });

    it.each([
      ['insuredId sin 5 dígitos', { insuredId: '123', scheduleId: 1, countryISO: 'PE' }, /^insuredId: debe tener 5 dígitos/],
      ['país no soportado', { insuredId: '00123', scheduleId: 1, countryISO: 'AR' }, /^countryISO:/],
      ['scheduleId no positivo', { insuredId: '00123', scheduleId: 0, countryISO: 'PE' }, /^scheduleId:/],
    ])('responde 400 con %s', async (_, body, detail) => {
      const { create, handler } = setup();

      const result = await handler(postEvent(JSON.stringify(body)));

      const response = JSON.parse(result.body);
      expect(result.statusCode).toBe(400);
      expect(response.code).toBe('INVALID_REQUEST');
      expect(response.details[0]).toMatch(detail);
      expect(create.execute).not.toHaveBeenCalled();
    });

    it('responde 500 sin exponer el detalle de un error inesperado', async () => {
      const { create, handler } = setup();
      create.execute.mockRejectedValue(new Error('dynamo timeout'));

      const result = await handler(postEvent(JSON.stringify({ insuredId: '00123', scheduleId: 1, countryISO: 'PE' })));

      expect(result.statusCode).toBe(500);
      expect(JSON.parse(result.body)).toEqual({ code: 'INTERNAL_ERROR', message: 'Ocurrió un error inesperado' });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('GET /appointments/{insuredId}', () => {
    it('responde 200 con las citas del asegurado', async () => {
      const { list, handler } = setup();

      const result = await handler(getEvent('00123'));

      expect(list.execute).toHaveBeenCalledWith('00123');
      expect(result.statusCode).toBe(200);
      expect(JSON.parse(result.body)).toEqual({ data: [buildPrimitives()] });
    });

    it('responde 400 si falta el path parameter', async () => {
      const { list, handler } = setup();

      const result = await handler(getEvent());

      expect(result.statusCode).toBe(400);
      expect(list.execute).not.toHaveBeenCalled();
    });

    it('responde 400 si el insuredId no tiene 5 dígitos', async () => {
      const { list, handler } = setup();

      const result = await handler(getEvent('abc'));

      expect(result.statusCode).toBe(400);
      expect(list.execute).not.toHaveBeenCalled();
    });
  });

  it('GET /docs responde la página de Swagger UI apuntando al OpenAPI del repo', async () => {
    const { handler } = setup();

    const result = await handler(httpEvent({ httpMethod: 'GET', resource: '/docs' }));

    expect(result.statusCode).toBe(200);
    expect(result.headers).toEqual({ 'Content-Type': 'text/html; charset=utf-8' });
    expect(result.body).toContain('SwaggerUIBundle');
    expect(result.body).toContain(OPENAPI_SPEC_URL);
  });

  it('responde 404 para una ruta desconocida', async () => {
    const { handler } = setup();

    const result = await handler(httpEvent({ httpMethod: 'DELETE', resource: '/appointments' }));

    expect(result.statusCode).toBe(404);
    expect(JSON.parse(result.body).code).toBe('ROUTE_NOT_FOUND');
  });
});
