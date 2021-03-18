CREATE DATABASE IF NOT EXISTS Practica1;

USE Practica1;

CREATE TABLE temporal(
	id INT(11) NOT NULL auto_increment,
	nombre_compania varchar(45),
    contacto_compania varchar(45),
    correo_compania varchar(45),
    telefono_compania varchar(45),
    tipo char,
    nombre varchar(45),
    correo varchar(45),
    telefono varchar(45),
    fecha_registro date,
    direccion varchar(45),
    ciudad varchar(45),
    codigo_postal int,
    region varchar(45),
    producto varchar(45),
    categoria_progucto varchar(45),
    cantidad int,
    precio_unitario float,primary key(id)
);

DESCRIBE temporal;