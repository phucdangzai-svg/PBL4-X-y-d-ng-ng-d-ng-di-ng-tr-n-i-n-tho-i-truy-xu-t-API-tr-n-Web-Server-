-- Migrate existing installations from username login to required email login.
ALTER TABLE users
  MODIFY email varchar(100) NOT NULL,
  DROP INDEX username,
  DROP COLUMN username;
