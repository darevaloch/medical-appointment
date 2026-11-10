# Medical Appointment

Backend para agendar citas médicas en Perú (PE) y Chile (CL), hecho con Serverless Framework, TypeScript y AWS.

**URL:** https://h6nrz7bib0.execute-api.us-east-1.amazonaws.com/dev

**Swagger:** https://h6nrz7bib0.execute-api.us-east-1.amazonaws.com/dev/docs ([docs/openapi.yaml](docs/openapi.yaml))

## Endpoints

| Método | Ruta | Descripción |
|---|---|---|
| POST | `/appointments` | Registra la cita en estado `pending` (responde 202) |
| GET | `/appointments/{insuredId}` | Lista las citas del asegurado |

```bash
curl -X POST https://h6nrz7bib0.execute-api.us-east-1.amazonaws.com/dev/appointments \
  -H "Content-Type: application/json" \
  -d '{"insuredId":"00123","scheduleId":100,"countryISO":"PE"}'

curl https://h6nrz7bib0.execute-api.us-east-1.amazonaws.com/dev/appointments/00123
```
