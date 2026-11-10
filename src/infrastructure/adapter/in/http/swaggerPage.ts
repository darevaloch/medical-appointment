import type { APIGatewayProxyResult } from 'aws-lambda';

export const OPENAPI_SPEC_URL =
  'https://raw.githubusercontent.com/darevaloch/medical-appointment/main/docs/openapi.yaml';

const SWAGGER_UI = 'https://unpkg.com/swagger-ui-dist@5.17.14';

const html = `<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <title>Medical Appointment API</title>
    <link rel="stylesheet" href="${SWAGGER_UI}/swagger-ui.css" />
    <style>
      body { margin: 0; background: #fff; }
    </style>
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="${SWAGGER_UI}/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({ url: '${OPENAPI_SPEC_URL}', dom_id: '#swagger-ui' });
    </script>
  </body>
</html>`;

export const swaggerPage = async (): Promise<APIGatewayProxyResult> => ({
  statusCode: 200,
  headers: { 'Content-Type': 'text/html; charset=utf-8' },
  body: html,
});
