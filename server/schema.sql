CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) PRIMARY KEY,
  username VARCHAR(80) NULL UNIQUE,
  name VARCHAR(160) NOT NULL,
  email VARCHAR(254) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(40) NULL,
  role VARCHAR(40) NOT NULL,
  department VARCHAR(180) NULL,
  kdf_area VARCHAR(180) NULL,
  avatar VARCHAR(8) NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS members (
  id CHAR(36) PRIMARY KEY,
  first_name VARCHAR(120) NOT NULL,
  last_name VARCHAR(120) NOT NULL,
  phone VARCHAR(40) NULL,
  address VARCHAR(500) NULL,
  date_of_birth DATE NULL,
  kdf_area VARCHAR(180) NULL,
  kdf_coordinator VARCHAR(160) NULL,
  department VARCHAR(180) NULL,
  affinity_group VARCHAR(100) NULL,
  status VARCHAR(60) NOT NULL DEFAULT 'New Convert',
  spiritual_status VARCHAR(80) NOT NULL DEFAULT 'Salvation',
  notes TEXT NULL,
  registered_by CHAR(36) NULL,
  registered_by_name VARCHAR(160) NULL,
  date_registered DATE NOT NULL DEFAULT (CURRENT_DATE),
  follow_up_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX members_registered_by_idx (registered_by),
  INDEX members_kdf_area_idx (kdf_area),
  INDEX members_department_idx (department),
  CONSTRAINT members_registered_by_fk FOREIGN KEY (registered_by) REFERENCES profiles(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS follow_ups (
  id CHAR(36) PRIMARY KEY,
  member_id CHAR(36) NULL,
  member_name VARCHAR(240) NULL,
  pastor_id CHAR(36) NULL,
  pastor_name VARCHAR(160) NULL,
  kdf_area VARCHAR(180) NULL,
  date DATE NOT NULL DEFAULT (CURRENT_DATE),
  method VARCHAR(60) NOT NULL DEFAULT 'Visit',
  notes TEXT NULL,
  outcome TEXT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'In Progress',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX follow_ups_pastor_idx (pastor_id),
  INDEX follow_ups_kdf_idx (kdf_area),
  CONSTRAINT follow_ups_member_fk FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL,
  CONSTRAINT follow_ups_pastor_fk FOREIGN KEY (pastor_id) REFERENCES profiles(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance (
  id CHAR(36) PRIMARY KEY,
  date DATE NOT NULL,
  service VARCHAR(120) NOT NULL,
  count INT NOT NULL,
  dept_name VARCHAR(180) NULL,
  dept_count INT NULL,
  recorded_by CHAR(36) NULL,
  recorded_by_name VARCHAR(160) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX attendance_date_idx (date),
  INDEX attendance_department_idx (dept_name),
  CONSTRAINT attendance_recorder_fk FOREIGN KEY (recorded_by) REFERENCES profiles(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS greatness_attendees (
  id CHAR(36) PRIMARY KEY,
  name VARCHAR(240) NOT NULL,
  phone VARCHAR(40) NULL,
  phone_normalized VARCHAR(40) NULL,
  email VARCHAR(254) NULL,
  department VARCHAR(180) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX greatness_attendees_phone_idx (phone),
  INDEX greatness_attendees_phone_normalized_idx (phone_normalized)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS greatness_attendance (
  id CHAR(36) PRIMARY KEY,
  attendee_id CHAR(36) NOT NULL,
  day_number INT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Present',
  marked_by VARCHAR(160) NULL,
  marked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY greatness_attendance_day_unique (attendee_id, day_number),
  CONSTRAINT greatness_attendance_attendee_fk FOREIGN KEY (attendee_id) REFERENCES greatness_attendees(id) ON DELETE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS attendance_programmes (
  id VARCHAR(120) PRIMARY KEY,
  name VARCHAR(180) NOT NULL,
  programme_type VARCHAR(60) NOT NULL DEFAULT 'custom',
  start_date DATE NULL,
  end_date DATE NULL,
  total_days INT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_by CHAR(36) NULL,
  created_by_name VARCHAR(160) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT attendance_programmes_creator_fk FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS programme_attendance_records (
  id CHAR(36) PRIMARY KEY,
  programme_id VARCHAR(120) NOT NULL,
  programme_name VARCHAR(180) NOT NULL,
  programme_type VARCHAR(60) NOT NULL DEFAULT 'custom',
  attendance_date DATE NOT NULL,
  day_number INT NULL,
  attendee_source VARCHAR(60) NULL,
  attendee_source_id VARCHAR(120) NULL,
  attendee_name VARCHAR(240) NOT NULL,
  phone VARCHAR(40) NULL,
  phone_normalized VARCHAR(40) NULL,
  salem_family VARCHAR(180) NULL,
  date_of_birth DATE NULL,
  email VARCHAR(254) NULL,
  department VARCHAR(180) NULL,
  church_position VARCHAR(100) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'Present',
  marked_by VARCHAR(160) NULL,
  marked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX programme_records_date_idx (programme_id, attendance_date),
  INDEX programme_records_phone_idx (phone_normalized)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activity_logs (
  id CHAR(36) PRIMARY KEY,
  user_id CHAR(36) NULL,
  user_name VARCHAR(160) NULL,
  action VARCHAR(120) NULL,
  detail TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX activity_logs_created_idx (created_at),
  CONSTRAINT activity_logs_user_fk FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS assignments (
  id CHAR(36) PRIMARY KEY,
  task VARCHAR(500) NOT NULL,
  assignee VARCHAR(160) NOT NULL,
  priority VARCHAR(40) NOT NULL DEFAULT 'Normal',
  due_date DATE NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Active',
  created_by CHAR(36) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX assignments_created_idx (created_at),
  CONSTRAINT assignments_creator_fk FOREIGN KEY (created_by) REFERENCES profiles(id) ON DELETE SET NULL
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sms_config (
  id TINYINT UNSIGNED PRIMARY KEY DEFAULT 1,
  api_key TEXT NULL,
  sender_id VARCHAR(11) NOT NULL DEFAULT 'SICC',
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO attendance_programmes (id, name, programme_type, start_date, total_days, is_active) VALUES
  ('greatness-32-days', 'Leadership Training', '32_days', CURRENT_DATE, 32, 1),
  ('sunday-service', 'Sunday Service', 'service', NULL, NULL, 1),
  ('mid-week-service', 'Mid-Week Service', 'service', NULL, NULL, 1),
  ('prayer-night', 'Prayer Night', 'service', NULL, NULL, 1),
  ('special-programme', 'Special Programme', 'service', NULL, NULL, 1),
  ('conference', 'Conference', 'service', NULL, NULL, 1),
  ('department-meeting', 'Department Meeting', 'service', NULL, NULL, 1)
ON DUPLICATE KEY UPDATE start_date = COALESCE(attendance_programmes.start_date, VALUES(start_date));
