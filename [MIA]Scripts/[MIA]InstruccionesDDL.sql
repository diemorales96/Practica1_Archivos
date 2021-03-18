CREATE TABLE producto (id_producto INT AUTO_INCREMENT, producto VARCHAR(100), categoria_producto VARCHAR(100), PRIMARY KEY (id_producto));

CREATE TABLE compania(id_compania INT auto_increment,nombre_compania VARCHAR(100),contacto_compania VARCHAR(100),correo_compania VARCHAR(100),telefono_compania VARCHAR(100),PRIMARY KEY (id_compania));

CREATE TABLE ubicacion (id_ubicacion INT AUTO_INCREMENT, direccion VARCHAR(100), ciudad VARCHAR(100), codigo_postal int,region VARCHAR(100),PRiMARY KEY (id_ubicacion));

CREATE TABLE tipo(id_tipo INT auto_increment,tipo char(10),primary key(id_tipo));

CREATE TABLE usuario (id_usuario INT AUTO_INCREMENT, nombre VARCHAR(100),correo VARCHAR(100),telefono VARCHAR(100),fecha_registro DATE,id_tipo INT,id_ubicacion INT,PRIMARY KEY (id_usuario),foreign key(id_tipo) references tipo(id_tipo),foreign key(id_ubicacion) references ubicacion(id_ubicacion));

CREATE TABLE orden(id_orden INT auto_increment,id_usuario INT,id_compania INT,primary key(id_orden),foreign key (id_usuario)references usuario(id_usuario),foreign key(id_compania) references compania(id_compania));

CREATE TABLE detalle(id_detalle INT auto_increment,cantidad INT,precio_unitario decimal(19,2),id_producto INT,id_orden INT,foreign key(id_producto)references producto(id_producto),foreign key(id_orden)references orden(id_orden),primary key(id_detalle));
