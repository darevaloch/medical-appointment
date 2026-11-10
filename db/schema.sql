CREATE TABLE IF NOT EXISTS appointments (
  appointment_id VARCHAR(26)  NOT NULL,
  insured_id     CHAR(5)      NOT NULL,
  schedule_id    INT UNSIGNED NOT NULL,
  country_iso    CHAR(2)      NOT NULL,
  requested_at   DATETIME(3)  NOT NULL,
  registered_at  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (appointment_id),
  KEY idx_appointments_insured (insured_id),
  KEY idx_appointments_schedule (schedule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
