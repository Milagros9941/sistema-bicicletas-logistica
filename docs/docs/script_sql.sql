-- 1. Crear las tablas principales
CREATE TABLE estacion (
    codigo            VARCHAR(10)  PRIMARY KEY,
    direccion         VARCHAR(150) NOT NULL,
    capacidad_maxima  INTEGER      NOT NULL CHECK (capacidad_maxima > 0)
);

CREATE TABLE usuario (
    dni     VARCHAR(8)   PRIMARY KEY CHECK (dni ~ '^[0-9]{7,8}$'),
    nombre  VARCHAR(100) NOT NULL
);

CREATE TABLE operario (
    legajo  INTEGER      PRIMARY KEY,
    nombre  VARCHAR(100) NOT NULL
);

CREATE TABLE bicicleta (
    numero_serie     VARCHAR(20) PRIMARY KEY,
    estado           VARCHAR(20) NOT NULL
        CHECK (estado IN ('disponible', 'en_uso', 'en_mantenimiento')),
    codigo_estacion  VARCHAR(10) NOT NULL REFERENCES estacion(codigo)
);

CREATE TABLE medio_pago (
    dni_usuario    VARCHAR(8)  NOT NULL REFERENCES usuario(dni),
    id_medio_pago  INTEGER     NOT NULL,
    marca          VARCHAR(30) NOT NULL,
    ultimos4       CHAR(4)     NOT NULL CHECK (ultimos4 ~ '^[0-9]{4}$'),
    PRIMARY KEY (dni_usuario, id_medio_pago)
);

CREATE TABLE viaje (
    id_viaje            INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    dni_usuario         VARCHAR(8)  NOT NULL,
    id_medio_pago       INTEGER     NOT NULL,
    numero_serie        VARCHAR(20) NOT NULL REFERENCES bicicleta(numero_serie),
    codigo_est_origen   VARCHAR(10) NOT NULL REFERENCES estacion(codigo),
    codigo_est_destino  VARCHAR(10) REFERENCES estacion(codigo),
    fecha_hora_inicio   TIMESTAMPTZ NOT NULL,
    fecha_hora_fin      TIMESTAMPTZ,
    FOREIGN KEY (dni_usuario, id_medio_pago)
        REFERENCES medio_pago(dni_usuario, id_medio_pago),
    CONSTRAINT ck_destino_y_fin_juntos
        CHECK ((codigo_est_destino IS NULL) = (fecha_hora_fin IS NULL)),
    CONSTRAINT ck_fin_posterior_a_inicio
        CHECK (fecha_hora_fin IS NULL OR fecha_hora_fin > fecha_hora_inicio)
);

CREATE UNIQUE INDEX uq_viaje_bici_en_curso
    ON viaje(numero_serie) WHERE fecha_hora_fin IS NULL;
CREATE UNIQUE INDEX uq_viaje_usuario_en_curso
    ON viaje(dni_usuario)  WHERE fecha_hora_fin IS NULL;

CREATE TABLE tarea_mantenimiento (
    id_tarea         INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha            DATE         NOT NULL,
    descripcion      VARCHAR(255) NOT NULL,
    estado           VARCHAR(20)  NOT NULL DEFAULT 'programada'
        CHECK (estado IN ('programada', 'realizada', 'cancelada')),
    codigo_estacion  VARCHAR(10)  NOT NULL REFERENCES estacion(codigo),
    legajo_operario  INTEGER      NOT NULL REFERENCES operario(legajo)
);

-- 2. Insertar datos de prueba ficticios
INSERT INTO estacion (codigo, direccion, capacidad_maxima) 
VALUES ('E01', 'Av. Libertad 100', 2),
       ('E02', 'Calle San Martin 250', 5);

INSERT INTO usuario (dni, nombre) 
VALUES ('12345678', 'Luis Gomez'),
       ('30123456', 'Ana Perez');

INSERT INTO medio_pago (dni_usuario, id_medio_pago, marca, ultimos4) 
VALUES ('12345678', 1, 'Visa', '5678'),
       ('30123456', 1, 'Visa', '1234');

INSERT INTO bicicleta (numero_serie, estado, codigo_estacion) 
VALUES ('BIC001', 'disponible', 'E01'),
       ('BIC002', 'disponible', 'E01');

INSERT INTO operario (legajo, nombre) 
VALUES (1001, 'Carlos Ruiz');

INSERT INTO tarea_mantenimiento (fecha, descripcion, estado, codigo_estacion, legajo_operario) 
VALUES ('2026-11-01', 'Revision de anclajes', 'programada', 'E01', 1001);
