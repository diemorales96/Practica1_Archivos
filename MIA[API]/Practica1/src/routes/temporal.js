const express = require('express');
const mysqlConnection = require('../database');
const router = express.Router();

const mysqlconnection = require('../database');
//mostrar tabla temporal
router.get('/temporal',(req,res)=>{
    mysqlConnection.query('SELECT * FROM temporal',(err,rows,fields)=>{
        if(!err){
            res.json(rows);
        }else{
            console.log(err);
        }
    });
});

//Cargar a la tabla temporal
router.post('/cargarTemporal',(req,res)=>{
  mysqlConnection.query(`LOAD DATA INFILE 'mysqlfiles/DataCenterData.csv'
  INTO TABLE temporal
  FIELDS TERMINATED BY  ';'
  LINES TERMINATED BY '\n'
  IGNORE 1 LINES
  (nombre_compania, contacto_compania, correo_compania, telefono_compania, tipo, nombre, correo, telefono, 
  @var_fec, direccion, ciudad, codigo_postal, region, producto, categoria_producto, cantidad, precio_unitario)
  SET fecha_registro = STR_TO_DATE(@var_fec, '%d/%m/%Y');`,(err,rows,fields)=>{
      if(!err){
        res.json({status: 'Tabla temporal llena'});
      }else{
          console.log(err);
      }
  });
});

//eliminar deatos de la tabla temporal
router.delete('/eliminarTemporal', (req, res) => {
  mysqlConnection.query('TRUNCATE TABLE temporal;', (err, rows, fields) => {
    if(!err) {
      res.json({status: 'Tabla temporal eliminada'});
    } else {
      console.log(err);
    }
  });
});


//Crear modelo
router.post('/cargarModelo',(req,res)=>{
  //Crear tablas del modelo
  mysqlconnection.query(`CREATE TABLE producto (id_producto INT AUTO_INCREMENT, producto VARCHAR(100), categoria_producto VARCHAR(100), PRIMARY KEY (id_producto));

  CREATE TABLE compania(id_compania INT auto_increment,nombre_compania VARCHAR(100),contacto_compania VARCHAR(100),correo_compania VARCHAR(100),telefono_compania VARCHAR(100),PRIMARY KEY (id_compania));
  
  CREATE TABLE ubicacion (id_ubicacion INT AUTO_INCREMENT, direccion VARCHAR(100), ciudad VARCHAR(100), codigo_postal int,region VARCHAR(100),PRiMARY KEY (id_ubicacion));
  
  CREATE TABLE tipo(id_tipo INT auto_increment,tipo char(10),primary key(id_tipo));
  
  CREATE TABLE usuario (id_usuario INT AUTO_INCREMENT, nombre VARCHAR(100),correo VARCHAR(100),telefono VARCHAR(100),fecha_registro DATE,id_tipo INT,id_ubicacion INT,PRIMARY KEY (id_usuario),foreign key(id_tipo) references tipo(id_tipo),foreign key(id_ubicacion) references ubicacion(id_ubicacion));
  
  CREATE TABLE orden(id_orden INT auto_increment,id_usuario INT,id_compania INT,primary key(id_orden),foreign key (id_usuario)references usuario(id_usuario),foreign key(id_compania) references compania(id_compania));
  
  CREATE TABLE detalle(id_detalle INT auto_increment,cantidad INT,precio_unitario decimal(19,2),id_producto INT,id_orden INT,foreign key(id_producto)references producto(id_producto),foreign key(id_orden)references orden(id_orden),primary key(id_detalle));  
  `,(err,rows,fields)=>{
    if(err){
      console.log(err);
    }
  });

  //Insertar datos en el modelo
  mysqlconnection.query(`INSERT INTO producto(producto,categoria_producto) select distinct upper(trim(producto)), upper(trim(categoria_producto)) from temporal;

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
`,(err,rows,fields)=>{
    if(err){
      console.log(err);
    }else{
      res.json({status:'Modelo Cargado'})
    }
  });
});

//Eliminar modelo
router.delete('/eliminarModelo',(req,res)=>{
  mysqlconnection.query(`drop table detalle;
  drop table orden;
  drop table usuario;
  drop table producto;
  drop table compania;
  drop table tipo;
  drop table ubicacion;;`,(err,rows,fields)=>{
    if(!err){
      res.json({status:'Modelo eliminado'})
    }
  });
});

//===========================================================CONSULTAS====================================================

//CONSULTA #1

router.get('/Consulta1',(req,res)=>{
  mysqlconnection.query(`SELECT * FROM(
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
  `,(err,rows,fields)=>{
    if (!err){
      res.json(rows);
    }else{
      console.log(err)
    }
  });
});

//CONSULTA #2

router.get('/Consulta2',(req,res)=>{
  mysqlconnection.query(`select* from(         
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
  `,(err,rows,fields)=>{
    if (!err){
      res.json(rows);
    }else{
      console.log(err)
    }
  });
});

//Consulta 3

router.get('/Consulta3',(req,res)=>{
  mysqlconnection.query(`(select 
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
  `,(err,rows,fields)=>{
    if (!err){
      res.json(rows);
    }else{
      console.log(err)
    }
  });
});

//Consulta 4

router.get('/Consulta4',(req,res)=>{
  mysqlconnection.query(`select usr.id_usuario,
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
  `,(err,rows,fields)=>{
    if (!err){
      res.json(rows);
    }else{
      console.log(err)
    }
  });
});

//Consulta 5

router.get('/Consulta5',(req,res)=>{
  mysqlconnection.query(`(select 
    month(usr.fecha_registro) FECHA,
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
    FECHA,
    usr.nombre
    order by TOTAL desc
    LIMIT 5)
    union
    (select 
    month(usr.fecha_registro) FECHA,
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
    FECHA,
    usr.nombre
    order by TOTAL asc
    LIMIT 5);
  `,(err,rows,fields)=>{
    if (!err){
      res.json(rows);
    }else{
      console.log(err)
    }
  });
});

//Consulta 6

router.get('/Consulta6',(req,res)=>{
  mysqlconnection.query(`(select 
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
  `,(err,rows,fields)=>{
    if (!err){
      res.json(rows);
    }else{
      console.log(err)
    }
  });
});

//COnsulta 7

router.get('/Consulta7',(req,res)=>{
  mysqlconnection.query(`select 
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
  `,(err,rows,fields)=>{
    if (!err){
      res.json(rows);
    }else{
      console.log(err)
    }
  });
});

//Consulta 8

router.get('/Consulta8',(req,res)=>{
  mysqlconnection.query(`(select 
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
  `,(err,rows,fields)=>{
    if (!err){
      res.json(rows);
    }else{
      console.log(err)
    }
  });
});

//Consulta 9

router.get('/Consulta9',(req,res)=>{
  mysqlconnection.query(`select distinct usr.nombre,
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
  limit 12;
  `,(err,rows,fields)=>{
    if (!err){
      res.json(rows);
    }else{
      console.log(err)
    }
  });
});

//Consulta 10

router.get('/Consulta10',(req,res)=>{
  mysqlconnection.query(`select usr.id_usuario,
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
  `,(err,rows,fields)=>{
    if (!err){
      res.json(rows);
    }else{
      console.log(err)
    }
  });
});
module.exports = router;