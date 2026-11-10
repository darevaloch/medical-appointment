import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CreateAppointmentService } from '../../../../application/service/CreateAppointmentService';
import { ListAppointmentsByInsuredService } from '../../../../application/service/ListAppointmentsByInsuredService';
import { parseJson, parseWith } from '../shared/validation';
import { createAppointmentBodySchema, insuredPathSchema } from './httpSchemas';
import { errorResponse, jsonResponse } from './advice/httpResponse';
import { swaggerPage } from './swaggerPage';

export const SCHEDULING_IN_PROGRESS_MESSAGE = 'El agendamiento está en proceso';

export interface AppointmentHttpUseCases {
  create: Pick<CreateAppointmentService, 'execute'>;
  list: Pick<ListAppointmentsByInsuredService, 'execute'>;
}

type RouteHandler = (event: APIGatewayProxyEvent) => Promise<APIGatewayProxyResult>;

export const makeAppointmentHttpHandler = ({ create, list }: AppointmentHttpUseCases): RouteHandler => {
  const createAppointment: RouteHandler = async (event) => {
    const input = parseWith(createAppointmentBodySchema, parseJson(event.body));
    const appointment = await create.execute(input);
    return jsonResponse(202, { message: SCHEDULING_IN_PROGRESS_MESSAGE, data: appointment });
  };

  const listAppointments: RouteHandler = async (event) => {
    const { insuredId } = parseWith(insuredPathSchema, event.pathParameters ?? {});
    const appointments = await list.execute(insuredId);
    return jsonResponse(200, { data: appointments });
  };

  const routes: Record<string, RouteHandler> = {
    'POST /appointments': createAppointment,
    'GET /appointments/{insuredId}': listAppointments,
    'GET /docs': swaggerPage,
  };

  return async (event) => {
    const route = routes[`${event.httpMethod} ${event.resource}`];
    if (!route) {
      return jsonResponse(404, { code: 'ROUTE_NOT_FOUND', message: 'Ruta no encontrada' });
    }
    try {
      return await route(event);
    } catch (error) {
      return errorResponse(error);
    }
  };
};
