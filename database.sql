-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS users;
CREATE TABLE users
(
	id_user SERIAL,
	name VARCHAR(30) NOT NULL,
	last_name VARCHAR(30) NOT NULL,
	middle_name VARCHAR(30) NOT NULL,
	document_no VARCHAR(30) NOT NULL,
	email VARCHAR(30) NOT NULL UNIQUE,
	phone_no VARCHAR(30) NOT NULL,
	username VARCHAR(30) NOT NULL UNIQUE,
	password VARCHAR(255) NOT NULL,
	active BOOLEAN NOT NULL DEFAULT TRUE,
	profile_image VARCHAR(50),
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT pk_user PRIMARY KEY (id_user)
);

-- ----------------------------
-- Table structure for calendars
-- ----------------------------
DROP TABLE IF EXISTS calendars;
CREATE TABLE calendars
(
	id_calendar SMALLSERIAL,
	year SMALLINT NOT NULL,
	semester SMALLINT NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT pk_calendar PRIMARY KEY (id_calendar),
	CONSTRAINT uq_calendar UNIQUE(year, semester)
);

-- ----------------------------
-- Table structure for subjects
-- ----------------------------
DROP TABLE IF EXISTS subjects;
CREATE TABLE subjects
(
	id_subject SERIAL,
	name VARCHAR(30) NOT NULL UNIQUE,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT pk_subject PRIMARY KEY (id_subject)
);

-- ----------------------------
-- Table structure for user_subject
-- ----------------------------
DROP TABLE IF EXISTS user_subject;
CREATE TABLE user_subject
(
	id_user INTEGER NOT NULL,
	id_subject INTEGER NOT NULL,
	CONSTRAINT pk_user_subject PRIMARY KEY (id_user, id_subject),
	CONSTRAINT fk_user_subject__user FOREIGN KEY (id_user) REFERENCES users(id_user) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT fk_user_subject__subject FOREIGN KEY (id_subject) REFERENCES subjects (id_subject) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ----------------------------
-- Table structure for courses
-- ----------------------------
DROP TABLE IF EXISTS courses;
CREATE TABLE courses
(
	id_course SERIAL,
	id_calendar SMALLINT NOT NULL,
	id_user	INTEGER NOT NULL,
	id_subject INTEGER NOT NULL,
	code VARCHAR(8) NOT NULL,
	name VARCHAR(30) NOT NULL UNIQUE,
	course_goal SMALLINT DEFAULT 0,
	student_goal SMALLINT DEFAULT 0,
	active BOOLEAN NOT NULL DEFAULT true,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT pk_course PRIMARY KEY (id_course),
	CONSTRAINT uq_code_course UNIQUE (code),
	CONSTRAINT fk_course__calendar FOREIGN KEY (id_calendar) REFERENCES calendars(id_calendar) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT fk_course__user_subject FOREIGN KEY (id_user, id_subject) REFERENCES user_subject(id_user, id_subject) ON UPDATE CASCADE ON DELETE RESTRICT
);


-- ----------------------------
-- Table structure for colors
-- ----------------------------
DROP TABLE IF EXISTS colors;
CREATE TABLE colors
(
	id_color SMALLSERIAL,
	name VARCHAR(30) NOT NULL UNIQUE,
	hexadecimal CHAR(6) NOT NULL UNIQUE,
	CONSTRAINT pk_color PRIMARY KEY (id_color)
);

-- ----------------------------
-- Table structure for modules
-- ----------------------------
DROP TABLE IF EXISTS modules;
CREATE TABLE modules
(
	id_module SERIAL,
	id_course INTEGER NOT NULL,
	name VARCHAR(30) NOT NULL,
	position SMALLINT,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT pk_module PRIMARY KEY (id_module),
	CONSTRAINT fk_module__course FOREIGN KEY (id_course) REFERENCES courses(id_course) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT uq_module__name UNIQUE(id_course, name),
	CONSTRAINT uq_module__position UNIQUE(id_course, position)
);

-- ----------------------------
-- Table structure for classes
-- ----------------------------
DROP TABLE IF EXISTS classes;
CREATE TABLE classes
(
	id_class SERIAL,
	id_module INTEGER NOT NULL,
	description VARCHAR(100),
	status BOOLEAN NOT NULL DEFAULT FALSE,
	date TIMESTAMP,
   	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT pk_class PRIMARY KEY (id_class),
	CONSTRAINT fk_class__module FOREIGN KEY (id_module) REFERENCES modules(id_module) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ----------------------------
-- Table structure for activities
-- ----------------------------
DROP TABLE IF EXISTS activities;
CREATE TABLE activities
(
	id_activity SERIAL,
	id_class INTEGER NOT NULL,
	name VARCHAR(30) NOT NULL UNIQUE,
	status BOOLEAN NOT NULL DEFAULT FALSE,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT pk_activity PRIMARY KEY (id_activity),
	CONSTRAINT fk_activity__class FOREIGN KEY (id_class) REFERENCES classes(id_class) ON UPDATE CASCADE ON DELETE RESTRICT
);


-- ----------------------------
-- Table structure for categories
-- ----------------------------
DROP TABLE IF EXISTS categories;
CREATE TABLE categories
(
	id_category SERIAL,
	id_user	INTEGER NOT NULL,
	id_subject	INTEGER NOT NULL,
	name VARCHAR(30) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT pk_category PRIMARY KEY (id_category),
	CONSTRAINT fk_category__user_subject FOREIGN KEY (id_user, id_subject) REFERENCES user_subject(id_user, id_subject) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ----------------------------
-- Table structure for subcategories
-- ----------------------------
DROP TABLE IF EXISTS subcategories;
CREATE TABLE subcategories
(
	id_subcategory SERIAL,
	id_category INTEGER NOT NULL,
	name VARCHAR(30) NOT NULL,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT pk_subcategory PRIMARY KEY (id_subcategory),
	CONSTRAINT fk_subcategory__category FOREIGN KEY (id_category) REFERENCES categories(id_category) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ----------------------------
-- Table structure for questions
-- ----------------------------
DROP TABLE IF EXISTS questions;
CREATE TABLE questions
(
	id_question SERIAL,
	id_subcategory INTEGER NOT NULL,
	description VARCHAR(30) NOT NULL,
	difficulty SMALLINT NOT NULL,
	shared BOOLEAN DEFAULT FALSE,
	created_at TIMESTAMP NOT NULL DEFAULT NOW(),
	updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
	CONSTRAINT pk_question PRIMARY KEY (id_question),
	CONSTRAINT fk_question__subcategory FOREIGN KEY (id_subcategory) REFERENCES subcategories(id_subcategory) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ----------------------------
-- Table structure for difficulties
-- ----------------------------
DROP TABLE IF EXISTS difficulties;
CREATE TABLE difficulties
(
	id_difficulty SMALLSERIAL,
	name VARCHAR(30) NOT NULL UNIQUE,
	CONSTRAINT pk_difficulty PRIMARY KEY (id_difficulty)
);

-- ----------------------------
-- Table structure for roles
-- ----------------------------
DROP TABLE IF EXISTS roles;
CREATE TABLE roles
(
	id_user INTEGER NOT NULL,
	role INTEGER NOT NULL,
	CONSTRAINT pk_roles PRIMARY KEY (id_user, role),
	CONSTRAINT fk_roles__user FOREIGN KEY (id_user) REFERENCES users(id_user) ON UPDATE CASCADE ON DELETE CASCADE
);

-- ----------------------------
-- Table structure for user_course
-- ----------------------------
DROP TABLE IF EXISTS user_course;
CREATE TABLE course_student
(
	id_user INTEGER NOT NULL,
	id_course INTEGER NOT NULL,
	CONSTRAINT pk_course_student PRIMARY KEY (id_course, id_user),
	CONSTRAINT fk_course_student__user FOREIGN KEY (id_user) REFERENCES users(id_user),
	CONSTRAINT fk_course_student__course FOREIGN KEY (id_course) REFERENCES courses(id_course)
);

-- ----------------------------
-- Table structure for activity_student
-- ----------------------------
DROP TABLE IF EXISTS activity_student;
CREATE TABLE activity_student
(
	id_user INTEGER NOT NULL,
	id_activity INTEGER NOT NULL,
	status BOOLEAN NOT NULL DEFAULT FALSE,
	CONSTRAINT pk_activity_student PRIMARY KEY (id_user, id_activity),
	CONSTRAINT fk_activity_student__user FOREIGN KEY (id_user) REFERENCES users(id_user),
	CONSTRAINT fk_activity_student__activity FOREIGN KEY (id_activity) REFERENCES activities(id_activity)
);

-- ----------------------------
-- Table structure for user_subject_color
-- ----------------------------
DROP TABLE IF EXISTS user_subject_color;
CREATE TABLE user_subject_color
(
	id_user INTEGER NOT NULL,
	id_subject INTEGER NOT NULL,
	id_color INTEGER NOT NULL,
	CONSTRAINT pk_user_subject_color PRIMARY KEY (id_user, id_subject, id_color),
	CONSTRAINT fk_user_subject_color__user FOREIGN KEY (id_user) REFERENCES users(id_user) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT fk_user_subject_color__subject FOREIGN KEY (id_subject) REFERENCES subjects(id_subject) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT fk_user_subject_color__color FOREIGN KEY (id_color) REFERENCES colors (id_color) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ----------------------------
-- Table structure for question_class
-- ----------------------------
DROP TABLE IF EXISTS question_class;
CREATE TABLE question_class
(
	id_question INTEGER NOT NULL,
	id_class INTEGER NOT NULL,
	status BOOLEAN NOT NULL DEFAULT FALSE,
	CONSTRAINT pk_question_class PRIMARY KEY (id_question, id_class),
	CONSTRAINT fk_question_class__question FOREIGN KEY (id_question) REFERENCES questions(id_question),
	CONSTRAINT fk_question_class__class FOREIGN KEY (id_class) REFERENCES classes(id_class)
);

-- ----------------------------
-- Table structure for user_question_class
-- ----------------------------
DROP TABLE IF EXISTS user_question_class;
CREATE TABLE user_question_class
(
	id_user INTEGER NOT NULL,
	id_question INTEGER NOT NULL,
	id_class INTEGER NOT NULL,
	status BOOLEAN NOT NULL DEFAULT FALSE,
	CONSTRAINT pk_user_question_class PRIMARY KEY (id_user, id_question, id_class),
	CONSTRAINT fk_user_question_class__user FOREIGN KEY (id_user) REFERENCES users(id_user) ON UPDATE CASCADE ON DELETE RESTRICT,
	CONSTRAINT fk_user_question_class__question_class FOREIGN KEY (id_question, id_class) REFERENCES question_class(id_question, id_class) ON UPDATE CASCADE ON DELETE RESTRICT
);

-- ----------------------------
-- Records of users
-- ----------------------------
INSERT INTO users (document_no, name, last_name, middle_name, email, phone_no, username, password)
VALUES('183139613', 'Cristian Andrés', 'Flores', 'Sandoval', 'demo@demo.com', '+56973234391', 'demo', '$2a$10$5DLMiodMYuNoEeeBQJrSp.yyiq2LEKlOqbK.ISXMPs.CrMk1cXTt2');

-- ----------------------------
-- Records of roles
-- ----------------------------
INSERT INTO roles (id_user, role)
VALUES (1,1),(1,2),(1,3);

-- ----------------------------
-- Records of subjects
-- ----------------------------
INSERT INTO subjects (name)
VALUES ('Base de Datos');

-- ----------------------------
-- Records of user_subject
-- ----------------------------
INSERT INTO user_subject (id_user, id_subject)
VALUES (1,1);

-- ----------------------------
-- Records of colors
-- ----------------------------
INSERT INTO colors (name, hexadecimal)
VALUES ('rojo', 'F4516C'), ('verde', '34BFA3'), ('amarillo', 'FFB822'), ('morado', '716ACA');

-- ----------------------------
-- Records of calendars
-- ----------------------------
INSERT INTO calendars (year, semester)
VALUES (date_part('year', CURRENT_DATE), 1);



CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
INSERT INTO courses(id_calendar, id_user, id_subject, name, course_goal, student_goal, code) VALUES(1,1,1,'dfffsds',2323,223,LEFT(uuid_generate_v4()::text, 8));