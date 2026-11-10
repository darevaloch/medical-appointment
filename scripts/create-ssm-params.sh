#!/usr/bin/env bash
set -euo pipefail

STAGE="${STAGE:-dev}"
PREFIX="/reto-rimac/${STAGE}"

put() {
  local name="$1" value="$2" type="${3:-String}"
  aws ssm put-parameter --name "${PREFIX}/${name}" --value "${value}" --type "${type}" --overwrite >/dev/null
  echo "OK ${PREFIX}/${name} (${type})"
}

for country in pe cl; do
  upper=$(echo "$country" | tr '[:lower:]' '[:upper:]')
  host_var="${upper}_DB_HOST"; port_var="${upper}_DB_PORT"; user_var="${upper}_DB_USER"
  pass_var="${upper}_DB_PASSWORD"; name_var="${upper}_DB_NAME"

  put "${country}/db-host" "${!host_var:-mysql-${country}.example.internal}"
  put "${country}/db-port" "${!port_var:-3306}"
  put "${country}/db-user" "${!user_var:-appointments_app}"
  put "${country}/db-password" "${!pass_var:?Falta ${pass_var}}" SecureString
  put "${country}/db-name" "${!name_var:-appointments_${country}}"
done
