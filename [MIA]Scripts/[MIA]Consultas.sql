-- Consulta 1

SELECT * FROM(
select
usr.nombre,
usr.telefono,
o.id_orden, 
SUM(dt.cantidad*dt.precio_unitario) TOTAL
from detalle dt
	inner join orden o
		on o.id_orden = dt.id_orden
	inner join usuario usr
		on usr.id_usuario = o.id_usuario
	inner join tipo t
		on t.id_tipo = usr.id_tipo
Where t.tipo = 'P'
GROUP BY usr.nombre,
		 usr.telefono,
		 o.id_orden
)T1
ORDER BY TOTAL DESC
LIMIT 1;
	
    
-- Consulta 2

select* from(         
select
usr.id_usuario,
usr.telefono, 
usr.nombre,
sum(dt.cantidad) CANT,
sum(dt.cantidad*dt.precio_unitario) TOTAL
from detalle dt
	inner join orden o
		on o.id_orden = dt.id_orden
	inner join usuario usr
		on usr.id_usuario=o.id_usuario
    inner join tipo t
		on t.id_tipo = usr.id_tipo
where t.tipo = 'C' 
group by usr.id_usuario, usr.telefono,usr.nombre
)T2
order by CANT DESC
limit 1;

-- Consulta 3

(select 
	ubc.direccion,
    ubc.region,
    ubc.ciudad,
    ubc.codigo_postal,
    count(*) Total
  from orden o 
	inner join usuario usr
		on o.id_usuario = usr.id_usuario
	inner join tipo t
		on usr.id_tipo = t.id_tipo
	inner join ubicacion ubc
		on usr.id_ubicacion = ubc.id_ubicacion
	where t.tipo = 'P'
    group by ubc.direccion,
    ubc.region,
    ubc.ciudad,
    ubc.codigo_postal
    order by TOTAL desc
    limit 1)
    union
    (select 
	ubc.direccion,
    ubc.region,
    ubc.ciudad,
    ubc.codigo_postal,
    count(*) Total
  from orden o 
	inner join usuario usr
		on o.id_usuario = usr.id_usuario
	inner join tipo t
		on usr.id_tipo = t.id_tipo
	inner join ubicacion ubc
		on usr.id_ubicacion = ubc.id_ubicacion
	where t.tipo = 'P'
    group by ubc.direccion,
    ubc.region,
    ubc.ciudad,
    ubc.codigo_postal
    order by TOTAL asc
    limit 1
    );
    
-- Consulta 4

select usr.id_usuario,
usr.nombre,
count(*) CANTIDAD_ORDENES,
sum(dt.cantidad*dt.precio_unitario) TOTAL,
sum(dt.cantidad) TOTAL_comprado
from detalle dt
	inner join producto pr
		on pr.id_producto = dt.id_producto
	inner join orden o
		on o.id_orden = dt.id_orden
	inner join usuario usr
		on usr.id_usuario = o.id_usuario
	inner join tipo t
		on t.id_tipo = usr.id_tipo
where t.tipo = 'C' and pr.categoria_producto = 'CHEESE'
group by usr.id_usuario,
usr.nombre
order by TOTAL_comprado desc
LIMIT 5;

-- Consulta 5

(select 
month(usr.fecha_registro),
usr.nombre, 
sum(dt.cantidad*dt.precio_unitario) TOTAL,
'MAS' TIPO
from detalle dt
	inner join orden o
		on o.id_orden = dt.id_orden
	inner join usuario usr
		on usr.id_usuario = o.id_usuario
	inner join tipo t
		on t.id_tipo = usr.id_tipo
where t.tipo = 'C'
group by 
usr.fecha_registro,
usr.nombre
order by TOTAL desc
LIMIT 5)
union
(select 
month(usr.fecha_registro),
usr.nombre, 
sum(dt.cantidad*dt.precio_unitario) TOTAL,
'MENOS' TIPO
from detalle dt
	inner join orden o
		on o.id_orden = dt.id_orden
	inner join usuario usr
		on usr.id_usuario = o.id_usuario
	inner join tipo t
		on t.id_tipo = usr.id_tipo
where t.tipo = 'C'
group by 
usr.fecha_registro,
usr.nombre
order by TOTAL asc
LIMIT 5);

-- Consulta 6

(select 
pr.categoria_producto,
sum(dt.cantidad*dt.precio_unitario) TOTAL,
count(*) CANT,
'MAS VENDIDO' TIPO
from detalle dt
	inner join producto pr
		on pr.id_producto = dt.id_producto
	inner join orden o
		on o.id_orden = dt.id_orden
	inner join usuario usr
		on usr.id_usuario = o.id_usuario
	inner join tipo t
		on t.id_tipo = usr.id_tipo
where t.tipo = 'C'
group by pr.categoria_producto
order by TOTAL desc
LIMIT 1)
union
(select 
pr.categoria_producto,
sum(dt.cantidad*dt.precio_unitario) TOTAL,
count(*) CANT,
'MENOS VENDIDO' TIPO
from detalle dt
	inner join producto pr
		on pr.id_producto = dt.id_producto
	inner join orden o
		on o.id_orden = dt.id_orden
	inner join usuario usr
		on usr.id_usuario = o.id_usuario
	inner join tipo t
		on t.id_tipo = usr.id_tipo
where t.tipo = 'C'
group by pr.categoria_producto
order by TOTAL asc
LIMIT 1); 

-- Consulta 7

select 
usr.id_usuario,
usr.nombre,
count(*) CANTIDAD,
sum(dt.cantidad*dt.precio_unitario) TOTAL
from detalle dt
	inner join producto pr
		on pr.id_producto = dt.id_producto
	inner join orden o
		on o.id_orden = dt.id_orden
	inner join usuario usr
		on usr.id_usuario = o.id_usuario
	inner join tipo t
		on t.id_tipo = usr.id_tipo
where t.tipo = 'P' and pr.categoria_producto = 'Fresh Vegetables'
group by usr.id_usuario,
usr.nombre
order by TOTAL desc
LIMIT 5;


-- Consulta 8

(select 
ubc.direccion,
ubc.region,
ubc.ciudad,
ubc.codigo_postal,
sum(dt.cantidad*dt.precio_unitario) TOTAL,
'MAS' TIPO
from detalle dt
	inner join orden o 
		on o.id_orden = dt.id_orden
	inner join usuario usr
		on usr.id_usuario = o.id_usuario
	inner join tipo t
		on t.id_tipo = usr.id_tipo
	inner join ubicacion ubc
		on ubc.id_ubicacion = usr.id_ubicacion
where t.tipo = 'C'
group  by ubc.direccion,
ubc.region,
ubc.ciudad,
ubc.codigo_postal
order by TOTAL desc
LIMIT 1)
union
(select 
ubc.direccion,
ubc.region,
ubc.ciudad,
ubc.codigo_postal,
sum(dt.cantidad*dt.precio_unitario) TOTAL,
'MENOS' TIPO
from detalle dt
	inner join orden o 
		on o.id_orden = dt.id_orden
	inner join usuario usr
		on usr.id_usuario = o.id_usuario
	inner join tipo t
		on t.id_tipo = usr.id_tipo
	inner join ubicacion ubc
		on ubc.id_ubicacion = usr.id_ubicacion
where t.tipo = 'C'
group  by ubc.direccion,
ubc.region,
ubc.ciudad,
ubc.codigo_postal
order by TOTAL asc
LIMIT 1);

-- CONSULTA 9

select distinct usr.nombre,
usr.telefono,
o.id_orden ,
sum(dt.cantidad) CANT,
sum(dt.cantidad*dt.precio_unitario) TOTAL
from detalle dt
	inner join orden o
		on o.id_orden = dt.id_orden
	inner join usuario usr
		on usr.id_usuario = o.id_usuario
	inner join tipo t
		on t.id_tipo = usr.id_tipo
where t.tipo = 'P'
group by usr.nombre,
usr.telefono,
o.id_orden 
order by CANT asc
limit 13;

-- Consulta 10

select usr.id_usuario,
usr.nombre,
sum(dt.cantidad) CANT
from detalle dt
	inner join producto pr
		on pr.id_producto = dt.id_producto
	inner join orden o
		on o.id_orden = dt.id_orden
	inner join usuario usr
		on usr.id_usuario = o.id_usuario
	inner join tipo t
		on t.id_tipo = usr.id_tipo
where t.tipo = 'C' and pr.categoria_producto = 'Seafood'
group by usr.id_usuario,
usr.nombre
order by CANT desc
limit 10;
