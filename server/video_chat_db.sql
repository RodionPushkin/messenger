DROP SCHEMA IF EXISTS "user_schema","message_schema","data_schema" CASCADE;
CREATE SCHEMA IF NOT EXISTS "user_schema";
CREATE SCHEMA IF NOT EXISTS "message_schema";
CREATE SCHEMA IF NOT EXISTS "data_schema";
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
CREATE TABLE IF NOT EXISTS "message_schema"."chat"(
  	"id" BIGSERIAL NOT NULL PRIMARY KEY,
  	"is_group" BOOLEAN NOT NULL DEFAULT false,
  	"title" CHARACTER VARYING(128),
	"deleted_at" TIMESTAMP(3) WITHOUT TIME ZONE,
  	"created_at" TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP(3)::TIMESTAMP
); 
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
CREATE TABLE IF NOT EXISTS "user_schema"."user"(
  	"id" BIGSERIAL NOT NULL PRIMARY KEY,
  	"email" CHARACTER VARYING(255) NOT NULL,
  	"password" CHARACTER VARYING(60) NOT NULL,
  	"is_activated" BOOLEAN NOT NULL DEFAULT FALSE,
  	"activation_link" CHARACTER VARYING(255) NOT NULL,
	"chat" BIGINT REFERENCES "message_schema"."chat"("id") ON DELETE CASCADE,
  	"username" CHARACTER VARYING(32) NOT NULL,
  	"banned_for" TIMESTAMP(3) WITHOUT TIME ZONE,
	"deleted_at" TIMESTAMP(3) WITHOUT TIME ZONE,
  	"created_at" TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP(3)::TIMESTAMP,
  	"online_at" TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP(3)::TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "user_schema"."token"(
  	"id" BIGSERIAL NOT NULL PRIMARY KEY,
  	"id_user" BIGINT NOT NULL REFERENCES "user_schema"."user"("id") ON DELETE CASCADE,
  	"device_id" TEXT NOT NULL,
  	"refresh_token" TEXT NOT NULL,
  	"access_token" TEXT NOT NULL,
  	"expires" TIMESTAMP(3) WITHOUT TIME ZONE NOT NULL,
  	"location" CHARACTER VARYING (255)
);
CREATE TABLE IF NOT EXISTS "user_schema"."connection"(
  	"id" BIGSERIAL NOT NULL PRIMARY KEY,
  	"id_token" BIGINT NOT NULL REFERENCES "user_schema"."token"("id") ON DELETE CASCADE,
  	"peer" CHARACTER VARYING(36) NOT NULL
);
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
CREATE TABLE IF NOT EXISTS "data_schema"."file"(
  	"id" BIGSERIAL NOT NULL PRIMARY KEY,
  	"title" CHARACTER VARYING(500) NOT NULL,
  	"path" CHARACTER VARYING(2000) NOT NULL,
  	"created_at" TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP(3)::TIMESTAMP
);
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||

CREATE TABLE IF NOT EXISTS "message_schema"."chat_avatar"(
  	"id" BIGSERIAL NOT NULL PRIMARY KEY,
  	"id_chat" BIGINT NOT NULL REFERENCES "message_schema"."chat"("id"),
	"id_setter" BIGINT NOT NULL REFERENCES "user_schema"."user"("id"),
  	"id_file" BIGINT NOT NULL REFERENCES "data_schema"."file"("id") ON DELETE CASCADE,
	"deleted_at" TIMESTAMP(3) WITHOUT TIME ZONE,
  	"created_at" TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP(3)::TIMESTAMP
);
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
CREATE TABLE IF NOT EXISTS "message_schema"."folder"(
  	"id" BIGSERIAL NOT NULL PRIMARY KEY,
	"id_user" BIGINT NOT NULL REFERENCES "user_schema"."user"("id") ON DELETE CASCADE,
  	"title" CHARACTER VARYING(128),
	"index" INT,
	"deleted_at" TIMESTAMP(3) WITHOUT TIME ZONE,
  	"created_at" TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP(3)::TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "message_schema"."chat_folder"(
  	"id" BIGSERIAL NOT NULL PRIMARY KEY,
	"id_folder" BIGINT NOT NULL REFERENCES "message_schema"."folder"("id") ON DELETE CASCADE,
  	"id_chat" BIGINT NOT NULL REFERENCES "message_schema"."chat"("id") ON DELETE CASCADE
);
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
CREATE TABLE IF NOT EXISTS "message_schema"."stickerpack"(
  	"id" BIGSERIAL NOT NULL PRIMARY KEY,
  	"title" CHARACTER VARYING(200) NOT NULL
);
CREATE TABLE IF NOT EXISTS "message_schema"."sticker"(
  	"id" BIGSERIAL NOT NULL PRIMARY KEY,
  	"id_file" BIGINT NOT NULL REFERENCES "data_schema"."file"("id") ON DELETE CASCADE,
  	"id_stickerpack" BIGINT NOT NULL REFERENCES "message_schema"."stickerpack"("id") ON DELETE CASCADE
);
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
CREATE TABLE IF NOT EXISTS "message_schema"."message"(
 	"id" BIGSERIAL NOT NULL PRIMARY KEY,
 	"id_chat_from" BIGINT NOT NULL REFERENCES "message_schema"."chat"("id") ON DELETE CASCADE,
 	"id_chat_to" BIGINT NOT NULL REFERENCES "message_schema"."chat"("id") ON DELETE CASCADE,
	"id_forwarded_from" BIGINT REFERENCES "message_schema"."chat"("id") ON DELETE CASCADE,
	"content" CHARACTER VARYING (8000),
  	"edited_at" TIMESTAMP(3) WITHOUT TIME ZONE,
	"deleted_at" TIMESTAMP(3) WITHOUT TIME ZONE,
  	"created_at" TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP(3)::TIMESTAMP
);
CREATE TABLE IF NOT EXISTS "message_schema"."viewed"(
  	"id" BIGSERIAL NOT NULL PRIMARY KEY,
  	"id_user" BIGINT NOT NULL REFERENCES "user_schema"."user"("id") ON DELETE CASCADE,
  	"id_message" BIGINT NOT NULL REFERENCES "message_schema"."message"("id") ON DELETE CASCADE,
  	"created_at" TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP(3)::TIMESTAMP
);
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
CREATE TABLE IF NOT EXISTS "message_schema"."reaction"(
  	"id" BIGSERIAL NOT NULL PRIMARY KEY,
  	"title" CHARACTER VARYING(200) NOT NULL,
  	"id_file" BIGINT NOT NULL REFERENCES "data_schema"."file"("id") ON DELETE CASCADE,
  	"index" INT -- индекс в порядке реакций
);
CREATE TABLE IF NOT EXISTS "message_schema"."message_reaction"(
  	"id" BIGSERIAL NOT NULL PRIMARY KEY,
  	"id_message" BIGINT NOT NULL REFERENCES "message_schema"."message"("id") ON DELETE CASCADE,
  	"id_reaction" BIGINT NOT NULL REFERENCES "message_schema"."reaction"("id") ON DELETE CASCADE,
  	"id_user" BIGINT NOT NULL REFERENCES "user_schema"."user"("id") ON DELETE CASCADE,
  	"created_at" TIMESTAMP(3) WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP(3)::TIMESTAMP
);
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
-- удаление сообщения
CREATE OR REPLACE FUNCTION prevent_delete_message() 
  RETURNS TRIGGER AS $$
  BEGIN
  	UPDATE "message_schema"."message" SET deleted_at = CURRENT_TIMESTAMP(3)::TIMESTAMP
      WHERE id = OLD.id;
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER before_delete_message
  BEFORE DELETE ON "message_schema"."message"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_delete_message();
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
-- удаление папки
CREATE OR REPLACE FUNCTION prevent_delete_folder() 
  RETURNS TRIGGER AS $$
  BEGIN
  	UPDATE "message_schema"."folder" SET deleted_at = CURRENT_TIMESTAMP(3)::TIMESTAMP
      WHERE id = OLD.id;
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER before_delete_folder
  BEFORE DELETE ON "message_schema"."folder"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_delete_folder();
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
-- удаление юзера
CREATE OR REPLACE FUNCTION prevent_delete_user() 
  RETURNS TRIGGER AS $$
  BEGIN
  	UPDATE "user_schema"."user" SET deleted_at = CURRENT_TIMESTAMP(3)::TIMESTAMP
      WHERE id = OLD.id;
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER before_delete_user
  BEFORE DELETE ON "user_schema"."user"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_delete_user();
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
-- удаление чата
CREATE OR REPLACE FUNCTION prevent_delete_chat() 
  RETURNS TRIGGER AS $$
  BEGIN
  	UPDATE "message_schema"."chat" SET deleted_at = CURRENT_TIMESTAMP(3)::TIMESTAMP
      WHERE id = OLD.id;
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER before_delete_chat
  BEFORE DELETE ON "message_schema"."chat"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_delete_chat();
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
-- удаление аватара
CREATE OR REPLACE FUNCTION prevent_delete_avatar() 
  RETURNS TRIGGER AS $$
  BEGIN
  	UPDATE "message_schema"."chat_avatar" SET deleted_at = CURRENT_TIMESTAMP(3)::TIMESTAMP
      WHERE id = OLD.id;
    RETURN NULL;
  END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER before_delete_avatar
  BEFORE DELETE ON "message_schema"."chat_avatar"
  FOR EACH ROW
  EXECUTE FUNCTION prevent_delete_avatar();
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
-- триггер который записывает id chat в табличку user
CREATE OR REPLACE FUNCTION before_insert_user_function() RETURNS trigger AS $$
BEGIN
    INSERT INTO "message_schema"."chat" ("title") VALUES (NEW."username") RETURNING "id" INTO NEW."chat";
    RETURN NEW;
END;
$$ language plpgsql;
CREATE OR REPLACE TRIGGER before_insert_user
BEFORE INSERT ON "user_schema"."user"
FOR EACH ROW
EXECUTE PROCEDURE before_insert_user_function();
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
-- триггер который обновляет онлайн в табличке user
CREATE OR REPLACE FUNCTION before_insert_viewed_function() RETURNS trigger AS $$
BEGIN
	UPDATE "user_schema"."user" SET "online_at" = CURRENT_TIMESTAMP(3)::TIMESTAMP WHERE "id" = NEW."id_user";
    RETURN NEW;
END;
$$ language plpgsql;
CREATE OR REPLACE TRIGGER before_insert_viewed
BEFORE INSERT ON "message_schema"."viewed"
FOR EACH ROW
EXECUTE PROCEDURE before_insert_viewed_function();
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
-- обновление онлайн, когда юзер подключился
CREATE OR REPLACE FUNCTION before_insert_connection_function() RETURNS trigger AS $$
BEGIN
	UPDATE "user_schema"."user" SET "online_at" = CURRENT_TIMESTAMP(3)::TIMESTAMP 
	WHERE "id" = (SELECT "id_user" FROM "user_schema"."token" WHERE "id" = NEW."id_token");
    RETURN NEW;
END;
$$ language plpgsql;
CREATE OR REPLACE TRIGGER before_insert_connection
BEFORE INSERT ON "user_schema"."connection"
FOR EACH ROW
EXECUTE PROCEDURE before_insert_connection_function();
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
-- обновление онлайн, когда юзер подключился
CREATE OR REPLACE TRIGGER before_update_connection
BEFORE INSERT ON "user_schema"."connection"
FOR EACH ROW
EXECUTE PROCEDURE before_insert_connection_function();
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
-- обновление онлайн, когда человек отправил сообщение
CREATE OR REPLACE FUNCTION before_insert_message_function() RETURNS trigger AS $$
BEGIN
	UPDATE "user_schema"."user" SET "online_at" = CURRENT_TIMESTAMP(3)::TIMESTAMP 
	WHERE "id" = NEW."id_chat_from";
    RETURN NEW;
END;
$$ language plpgsql;
CREATE OR REPLACE TRIGGER before_insert_message
BEFORE INSERT ON "message_schema"."message"
FOR EACH ROW
EXECUTE PROCEDURE before_insert_message_function();
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
--обновление онлайн, когда человек изменил сообщение
CREATE OR REPLACE FUNCTION before_update_message_function() RETURNS trigger AS $$
BEGIN
	UPDATE "user_schema"."user" SET "online_at" = CURRENT_TIMESTAMP(3)::TIMESTAMP 
	WHERE "id" = NEW."id_chat_from";
    RETURN NEW;
END;
$$ language plpgsql;
CREATE OR REPLACE TRIGGER before_update_message
BEFORE UPDATE ON "message_schema"."message"
FOR EACH ROW
EXECUTE PROCEDURE before_update_message_function();
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
-- посмотреть чаты по папке
DROP FUNCTION IF EXISTS view_get_chats_by_folder;
CREATE OR REPLACE FUNCTION view_get_chats_by_folder(id_folder BIGINT, id_user BIGINT)
RETURNS TABLE (
	"id" BIGINT,
	"is_group" BOOLEAN,
	"title" CHARACTER VARYING(128),
	"avatar" BIGINT,
	"online" TIMESTAMP(3) WITHOUT TIME ZONE,
	"last_message_created" TIMESTAMP(3) WITHOUT TIME ZONE,
	"last_message_edited" TIMESTAMP(3) WITHOUT TIME ZONE,
	"last_message_content" CHARACTER VARYING(8000)
) AS $$
BEGIN
IF id_folder IS NULL THEN
  RETURN QUERY SELECT
	"chat"."id" AS "id",
	"chat"."is_group" AS "is_group",
	"chat"."title" AS "title",
	"chat_avatar"."id_file" AS "avatar",
	"user"."online_at" AS "online",
	"last_message"."created_at" AS "last_message_created",
	"last_message"."edited_at" AS "last_message_edited",
	"last_message"."content" AS "last_message_content"
	FROM "message_schema"."chat" AS "chat"
	INNER JOIN "user_schema"."user" AS "user" ON "chat"."id" = "user"."chat"
	LEFT JOIN "message_schema"."chat_folder" AS "chat_folder" ON "chat"."id" = "chat_folder"."id_chat" 
	LEFT JOIN "message_schema"."chat_avatar" AS "chat_avatar" ON "chat_avatar"."id" = "user"."chat"
	LEFT JOIN (SELECT * FROM view_messages_from_chat(id_user) LIMIT 1) AS "last_message" ON "last_message"."id_chat_from" = "user"."chat"
	OR "last_message"."id_chat_to" = "user"."chat"
	WHERE "chat"."deleted_at" IS NULL AND "user"."id" = id_user;
ELSE
  RETURN QUERY SELECT
	"chat"."id" AS "id",
	"chat"."is_group" AS "is_group",
	"chat"."title" AS "title",
	"chat_avatar"."id_file" AS "avatar",
	"user"."online_at" AS "online",
	"last_message"."created_at" AS "last_message_created",
	"last_message"."edited_at" AS "last_message_edited",
	"last_message"."content" AS "last_message_content"
	FROM "message_schema"."chat" AS "chat"
	INNER JOIN "user_schema"."user" AS "user" ON "chat"."id" = "user"."chat"
	INNER JOIN "message_schema"."chat_folder" AS "chat_folder" ON "chat"."id" = "chat_folder"."id_chat" 
	LEFT JOIN "message_schema"."chat_avatar" AS "chat_avatar" ON "chat_avatar"."id" = "user"."chat"
	LEFT JOIN (SELECT * FROM view_messages_from_chat(id_user) LIMIT 1) AS "last_message" ON "last_message"."id_chat_from" = "user"."chat"
	OR "last_message"."id_chat_to" = "user"."chat"
	WHERE "chat"."deleted_at" IS NULL AND "user"."chat" = 1
	AND "chat_folder"."id_folder" = id_folder;
END IF;
END;
$$ LANGUAGE plpgsql;
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
-- данные о чате
DROP FUNCTION IF EXISTS view_messages_from_chat;
CREATE OR REPLACE FUNCTION view_messages_from_chat(id_chat BIGINT)
RETURNS TABLE (
	"id" BIGINT,
	"id_chat_from" BIGINT,
	"id_chat_to" BIGINT,
	"id_forwarded_from" BIGINT,
	"created_at" TIMESTAMP(3) WITHOUT TIME ZONE,
	"edited_at" TIMESTAMP(3) WITHOUT TIME ZONE,
	"content" CHARACTER VARYING(8000)
) AS $$
BEGIN
  RETURN QUERY SELECT
	"message"."id" AS "id",
	"message"."id_chat_from" AS "id_chat_from",
	"message"."id_chat_to" AS "id_chat_to",
	"message"."id_forwarded_from" AS "id_forwarded_from",
	"message"."created_at" AS "created_at",
	"message"."edited_at" AS "edited_at",
	"message"."content" AS "content"
	FROM "message_schema"."message" AS "message"
	INNER JOIN "user_schema"."user" AS "user" ON 
	"user"."chat" = "message"."id_chat_from" OR "user"."chat" = "message"."id_chat_to"
	WHERE "message"."deleted_at" IS NULL AND 
	("message"."id_chat_to" = "user"."chat" AND "message"."id_chat_from" = 2)
	OR ("message"."id_chat_to" = 2 AND "message"."id_chat_from" = "user"."chat") 
	ORDER BY "message"."created_at" DESC;
END;
$$ LANGUAGE plpgsql;
--|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
INSERT INTO "user_schema"."user" ("email", "password", "activation_link", "username")
SELECT
    'email' || generate_series(1, 100) || '@example.com',
    'password' || generate_series(1, 100),
    'activation_link' || generate_series(1, 100),
    'username' || generate_series(1, 100)
FROM generate_series(1, 1);

INSERT INTO "message_schema"."message" ("id_chat_from", "id_chat_to","content") VALUES (1,2,'привет');
INSERT INTO "message_schema"."message" ("id_chat_from", "id_chat_to","content") VALUES (2,1,'пока!');
INSERT INTO "message_schema"."message" ("id_chat_from", "id_chat_to","content") VALUES (1,2,'кай?');
-- view reactions of message

SELECT * FROM view_messages_from_chat(1);
SELECT * FROM view_get_chats_by_folder(NULL,1);



