-- Crear table temporal
CREATE TABLE temporal(
	nombre_compania varchar(500),
    contacto_compania varchar(500),
    correo_compania varchar(500),
    telefono_compania varchar(500),
    tipo char(10),
    nombre varchar(500),
    correo varchar(500),
    telefono varchar(500),
    fecha_registro date,
    direccion varchar(500),
    ciudad varchar(500),
    codigo_postal int8,
    region varchar(500),
    producto varchar(500),
    categoria_producto varchar(500),
    cantidad int,
    precio_unitario decimal(19,2)
);

-- Carga de datos a la tabla temporal

LOAD DATA INFILE 'mysqlfiles/DataCenterData.csv'
INTO TABLE temporal
FIELDS TERMINATED BY  ';'
LINES TERMINATED BY '\n'
IGNORE 1 LINES
(nombre_compania, contacto_compania, correo_compania, telefono_compania, tipo, nombre, correo, telefono, @var_fec, direccion, ciudad, codigo_postal, region, producto, categoria_producto, cantidad, precio_unitario)
SET fecha_registro = STR_TO_DATE(@var_fec, '%d/%m/%Y');

-- Insertar en el Modelo

INSERT INTO producto(producto,categoria_producto) select distinct upper(trim(producto)), upper(trim(categoria_producto)) from temporal;

INSERT INTO tipo(tipo) select distinct upper(trim(tipo)) from temporal;

INSERT INTO ubicacion(direccion,ciudad,codigo_postal,region) SELECT distinct upper(trim(direccion)),upper(trim(ciudad)),upper(trim(codigo_postal)),upper(trim(region)) from temporal;

INSERT INTO compania(nombre_compania,contacto_compania,correo_compania, telefono_compania) select distinct upper(trim(nombre_compania)),upper(trim(contacto_compania)),upper(trim(correo_compania)), trim(telefono_compania) from temporal;



INSERT INTO usuario(nombre,correo,telefono,fecha_registro,id_tipo,id_ubicacion) 
select distinct 
	   tmp.nombre,
       tmp.correo,
       tmp.telefono,
       tmp.fecha_registro,
       t.id_tipo,
       ubc.id_ubicacion
	 from temporal tmp
	inner join tipo t
		on upper(trim(tmp.tipo)) = upper(trim(t.tipo))
	inner join ubicacion ubc
		on upper(trim(tmp.direccion)) = upper(trim(ubc.direccion));


INSERT INTO orden(
id_usuario,id_compania)
select distinct
	usr.id_usuario,
    com.id_compania
    from temporal tmp
    inner join compania com
		on (upper(trim(tmp.nombre_compania))= upper(trim(com.nombre_compania)))
    inner join usuario usr
		on (upper(trim(tmp.nombre)) = upper(trim(usr.nombre))) and
		   (upper(trim(tmp.fecha_registro))= upper(trim(usr.fecha_registro)));



INSERT INTO detalle(
cantidad,
precio_unitario,
id_producto,
id_orden)
select tmp.cantidad,
   tmp.precio_unitario,
   pr.id_producto,
   o.id_orden
from temporal tmp
	inner join producto pr
		on (upper(trim(tmp.producto))= upper(trim(pr.producto)))
	inner join compania cmp
		on upper(trim(tmp.nombre_compania)) = upper(trim(cmp.nombre_compania))
	inner join usuario usr
		on upper(trim(usr.nombre)) = upper(trim(tmp.nombre))
	inner join orden o
	on  usr.id_usuario = o.id_usuario and 
	    cmp.id_compania = o.id_compania;
