const express = require('express');
const bodyParser = require('body-parser');
const connection  = require('./utils/dbConfig');
// const session = require('express-session');   
const cors = require('cors');
const jwt = require('jsonwebtoken');

// const app = express();

// const http = require('http');
// const server = http.createServer(app);
// const { Server } = require("socket.io");
// const io = new Server(server);

const app = require('express')();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  cors: {origin : '*'}
});




// Middleware para analizar el cuerpo de las solicitudes como JSON
app.use(bodyParser.json());
app.use(cors({
  origin: '*'
}));


app.use(express.urlencoded({ extended: true }));
const secretKey = 'miClaveSecreta';


io.on('connection', (socket) => {
  console.log('Cliente conectado');

  // Manejar eventos desde el cliente
  socket.on('mensajeAlServidor', (data) => {
    console.log('Mensaje desde el cliente:', data);

    // Enviar un mensaje de vuelta al cliente
    io.emit('mensajeDesdeServidor', { mensaje: 'Hola desde el servidor' });
  });

  // Desconectar al cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});


app.post('/api/login', (req, res) => {
  const data = req.body; // Accede a los datos enviados en el cuerpo de la solicitud
  const query = 'SELECT * FROM usuario WHERE login_usuario = ? AND pass_usuario = ?';
  connection.query(query, [data.email, data.password], (error, results) => {
    if (error) {
      console.log(error);
      res.json({estado:'error!!!'});
      throw error;
    }
    if(results.length === 0){
      // res.json({estado:'Correo o contraseña invalido!!'});
      const query = 'SELECT * FROM chofer WHERE login_chofer = ? AND pass_chofer = ?';
      connection.query(query, [data.email, data.password], (error, results) => {
        if (error) {
          console.log(error);
          res.json({estado:'error!!!'});
          throw error;
        }
        if(results.length === 0){
          res.json({estado:'Correo o contraseña invalido!!'});
        }
        else{
          let usuario = results[0];
          let data  = { usuario:usuario.nombre_chofer, identificador: usuario.id_chofer, cargo: 'chofer', unidad: 0 };
          const token = jwt.sign(data, secretKey, { expiresIn: '2h' });
          res.json({ token });
        }
      });
    }else{
      let usuario = results[0];
      let data = { usuario:usuario.nombre_usuario, identificador: usuario.id_usuario, cargo: 'usuario', unidad: usuario.id_unidad};
      const token = jwt.sign( data, secretKey, { expiresIn: '2h' });
      res.json({ token });
    }
  });   
});

app.get('/api/vehiculo',verificarToken,(req, res) => {
  connection.query('SELECT id_vehiculo, detalle_vehiculo, placa_vehiculo, tipo_vehiculo, km_vehiculo, estado_vehiculo, nombre_unidad, id_unidad FROM vehiculo INNER JOIN unidad USING(id_unidad)', (error, results, fields) => {
    if (error) {
      console.log(error);
      // throw error;
      res.json({ error });
      throw error;
    }else{
      res.json(results);
    }
  });    
});

app.post('/api/vehiculo',verificarToken, (req, res)=> {
  try {
    const valor = req.body;
    const query = 'INSERT INTO vehiculo(placa_vehiculo,tipo_vehiculo,detalle_vehiculo,estado_vehiculo,km_vehiculo,id_unidad) VALUES (?,?,?,?,?,?)';
    connection.query(query, [valor.placa_vehiculo,valor.tipo_vehiculo,valor.detalle_vehiculo,valor.estado_vehiculo,valor.km_vehiculo,valor.id_unidad], (error, results) => {
      if (error) {
        // throw error;
        res.json({ error });
        throw error;
      }else{
        valor.id_vehiculo = results.insertId;
        // console.log(chofer);
        io.emit('agregarVehiculo', valor);
		    res.json({resultado: results.affectedRows}); // Envía los resultados como respueverificarTokensta  
      }
    });    
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }
});

app.delete('/api/vehiculo/:id', verificarToken, (req, res) => {
  try {
    let idVehiculo = req.params.id;
    const query = 'DELETE FROM vehiculo WHERE id_vehiculo = ?';
    connection.query(query, [idVehiculo], (error, results) => {
      if (error) {
        // throw error;
        res.json({ error });
        throw error;
      }else{
        io.emit('eliminarVehiculo', idVehiculo);
        res.json({resultado:results.affectedRows});
      }
    });     
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }
});

app.put('/api/vehiculo', verificarToken, (req, res)=> {
  try {
    const vehiculo = req.body;
    const query = 'UPDATE vehiculo SET placa_vehiculo = ? ,tipo_vehiculo = ?, detalle_vehiculo = ?,estado_vehiculo = ?, km_vehiculo = ?, id_unidad = ? WHERE id_vehiculo = ?';
    connection.query(query, [vehiculo.placa_vehiculo,vehiculo.tipo_vehiculo,vehiculo.detalle_vehiculo,vehiculo.estado_vehiculo,vehiculo.km_vehiculo,vehiculo.id_unidad,vehiculo.id_vehiculo], (error, results) => {
      if (error) {
        res.status(500).json({error});
        throw error;
      }else{
        // console.log(vehiculo);
        io.emit('editarVehiculo', vehiculo);
		    res.json({resultado: results.affectedRows}); // Envía los resultados como respueverificarTokensta  
      }
    });    
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({error});
  }
});

app.get('/api/vehiculosDisponiblesUnidad/:id', verificarToken,(req, res) => {
  try {
    let idUnidad = req.params.id;
    console.log(idUnidad);
    const query = 'SELECT id_vehiculo, CONCAT(detalle_vehiculo," - ",tipo_vehiculo) AS nombre FROM vehiculo WHERE id_unidad = ?';
    connection.query(query, [idUnidad], (error, results) => {
      if (error) {
        // throw error;
        res.json({ error });
        throw error;
      }else{
        // io.emit('eliminarVehiculo', idVehiculo);
        // res.json({resultado:results.affectedRows});
        console.log(results);
        res.json(results);
      }
    });     
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }
});

app.get('/api/vehiculosAsignadosChofer/:id', verificarToken, (req, res) => {
  try {
    let idChofer = req.params.id;
    const query = 'SELECT id_vehiculo FROM chofer_vehiculo WHERE id_chofer = ?';
    connection.query(query, [idChofer], (error, results) => {
      if (error) {
        // throw error;
        res.json({ error });
        throw error;
      }else{
        console.log(results);
        res.json(results);
      }
    });     
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }
});

app.get('/api/vehiculosDisponiblesPorChofer/:id', verificarToken, (req, res) => {
  try {
    let idChofer = req.params.id;
    const query = 'SELECT id_vehiculo, CONCAT(detalle_vehiculo," - ",tipo_vehiculo) AS nombre FROM chofer_vehiculo INNER JOIN vehiculo USING(id_vehiculo) WHERE id_chofer = ? AND estado_vehiculo = 1';
    connection.query(query, [idChofer], (error, results) => {
      if (error) {
        // throw error;
        res.json({ error });
        throw error;
      }else{
        console.log(results);
        res.json(results);
      }
    });     
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }
});

app.get('/api/vehiculosDisponibles', verificarToken, (req, res) => {
  try {
    const query = 'SELECT id_vehiculo, CONCAT(detalle_vehiculo," - ",tipo_vehiculo) AS nombre, false AS checked FROM vehiculo';
    connection.query(query, [], (error, results) => {
      if (error) {
        // throw error;
        res.json({ error });
        throw error;
      }else{
        console.log(results);
        res.json(results);
      }
    });     
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }
});

app.post('/api/asignarVehiculoChofer', verificarToken, (req, res)=> {
  try {
    console.log(req.body);
    const valor = req.body;
    connection.query('CALL asignarVehiculoChofer(?,?)',[valor.idChofer, valor.listaVehiculoAsignados.join(',')], (error, results, fields) => {
      if (error) {
        console.log(error);
        // throw error;
        res.json({ error });
      }else{
        res.json(results[0]);
      }
    }); 
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }
});

// =================================================
app.get('/api/unidadDisponibles',verificarToken,(req, res) => {
  connection.query('SELECT id_unidad, nombre_unidad FROM unidad WHERE estado_unidad = 1', (error, results, fields) => {
    if (error) {
      console.log(error);
      // throw error;
      res.json({ error });
    }else{
      res.json(results);
    }
  });    
});

app.get('/api/unidad',verificarToken,(req, res) => {
  connection.query('SELECT * FROM unidad', (error, results, fields) => {
    if (error) {
      res.json({ error });
      throw error;
      
    }else{
      res.json(results);
    }
  });    
});

app.post('/api/unidad', verificarToken, (req, res)=> {
  try {
    const valor = req.body;
    const query = 'INSERT INTO unidad(nombre_unidad,estado_unidad,descripcion_unidad) VALUES (?,?,?)';
    connection.query(query, [valor.nombre_unidad,valor.estado_unidad,valor.descripcion_unidad], (error, results) => {
      if (error) {
        // throw error;
        res.json({ error });
        throw error;
      }else{
        valor.id_unidad = results.insertId;
        io.emit('agregarUnidad', valor);
		    res.json({resultado: results.affectedRows}); // Envía los resultados como respueverificarTokensta  
      }
    });    
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }
});

app.delete('/api/unidad/:id', verificarToken,(req, res) => {
  try {
    let idUnidad = req.params.id;
    const query = 'DELETE FROM unidad WHERE id_unidad = ?';
    connection.query(query, [idUnidad], (error, results) => {
      if (error) {
        res.json({ error });
        throw error;
      }else{
        io.emit('eliminarUnidad', idUnidad);
        res.json({resultado:results.affectedRows});
      }
    });     
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }
});

app.put('/api/unidad', verificarToken,(req, res)=> {
  try {
    const unidad = req.body;
    const query = 'UPDATE unidad SET nombre_unidad = ?, descripcion_unidad = ?, estado_unidad = ? WHERE id_unidad = ?';
    connection.query(query, [unidad.nombre_unidad,unidad.descripcion_unidad,unidad.estado_unidad,unidad.id_unidad], (error, results) => {
      if (error) {
        res.json({ error });
        throw error;
      }else{
        io.emit('editarUnidad', unidad);
		    res.json({resultado: results.affectedRows}); // Envía los resultados como respueverificarTokensta  
      }
    });    
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }
});

// =================================================
app.get('/api/choferDisponibles',verificarToken, (req, res) => {
  connection.query('SELECT id_chofer, nombre_chofer FROM chofer WHERE estado_chofer = 1', (error, results, fields) => {
    if (error) {
      console.log(error);
      res.json({ error });
      throw error;
    }else{
      res.json(results);
    }
  });    
});

app.get('/api/chofer', verificarToken,(req, res) => {
  connection.query('SELECT * FROM chofer', (error, results, fields) => {
    if (error) {
      res.json({ error });
      throw error;
    }else{
      res.json(results);
    }
  });    
});

app.post('/api/chofer', verificarToken, (req, res)=> {
  try {
    const chofer = req.body;
    const query = 'INSERT INTO chofer(carnet_chofer,nombre_chofer,celular_chofer,estado_chofer,login_chofer,pass_chofer) VALUES (?,?,?,?,?,?)';
    connection.query(query, [chofer.carnet_chofer,chofer.nombre_chofer,chofer.celular_chofer,chofer.estado_chofer,chofer.login_chofer,chofer.pass_chofer], (error, results) => {
      if (error) {
        throw error;
      }else{
        chofer.id_chofer = results.insertId;
        io.emit('agregarChofer', chofer);
		    res.json({resultado: results.affectedRows}); // Envía los resultados como respueverificarTokensta  
      }
    });    
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }
});

app.delete('/api/chofer/:id', verificarToken, (req, res) => {
  try {
    let idChofer = req.params.id;
    const query = 'DELETE FROM chofer WHERE id_chofer = ?';
    connection.query(query, [idChofer], (error, results) => {
      if (error) {
        throw error;
      }else{
        io.emit('eliminarChofer', idChofer);
        res.json({resultado:results.affectedRows});
      }
    });     
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }
});

app.put('/api/chofer', verificarToken, (req, res)=> {
  try {
    const chofer = req.body;
    const query = 'UPDATE chofer SET carnet_chofer = ?,nombre_chofer = ?,celular_chofer = ?,estado_chofer = ?,login_chofer = ?,pass_chofer = ? WHERE id_chofer = ?';
    connection.query(query, [chofer.carnet_chofer,chofer.nombre_chofer,chofer.celular_chofer,chofer.estado_chofer,chofer.login_chofer,chofer.pass_chofer,chofer.id_chofer], (error, results) => {
      if (error) {
        res.json({ error });
        throw error;
      }else{
        io.emit('editarChofer', chofer);
		    res.json({resultado: results.affectedRows}); // Envía los resultados como respueverificarTokensta  
      }
    });    
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }
});

//================================================
// app.get('/api/usuario', verificarToken,(req, res) => {
app.get('/api/usuario', verificarToken,(req, res) => {
  connection.query('SELECT id_usuario,carnet_usuario,nombre_usuario,celular_usuario,estado_usuario,login_usuario,pass_usuario,id_unidad,nombre_unidad FROM usuario INNER JOIN unidad USING(id_unidad)', (error, results, fields) => {
    if (error) {
      res.json({ error });
      throw error;
    }else{
      res.json(results);
    }
  });    
});

app.get('/api/usuariosDisponibles', verificarToken,(req, res) => {
  connection.query('SELECT id_usuario,id_unidad , nombre_usuario FROM usuario WHERE estado_usuario = 1', (error, results, fields) => {
    if (error) {
      res.json({ error });
      throw error;
    }else{
      res.json(results);
    }
  });    
});

app.post('/api/usuario', verificarToken,(req, res) => {
  try {
    const usuario = req.body;
    const query = 'INSERT INTO usuario(carnet_usuario,nombre_usuario,celular_usuario,estado_usuario,login_usuario,pass_usuario,id_unidad) VALUES (?,?,?,?,?,?,?)';
    connection.query(query, [usuario.carnet_usuario,usuario.nombre_usuario,usuario.celular_usuario,usuario.estado_usuario,usuario.login_usuario,usuario.pass_usuario,usuario.id_unidad], (error, results) => {
      if (error) {
        res.json({ error });
        throw error;
      }else{
        io.emit('agregarUsuario', usuario);
		    res.json({resultado: results.affectedRows}); // Envía los resultados como respueverificarTokensta  
      }
    });    
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }  
});

app.delete('/api/usuario/:id', verificarToken,(req, res) => {
  try {
    let idUsuario = req.params.id;
    console.log(idUsuario);
    const query = 'DELETE FROM usuario WHERE id_usuario = ?';
    connection.query(query, [idUsuario], (error, results) => {
      if (error) {
        res.json({ error });
        throw error;
      }else{
        io.emit('eliminarUsuario', idUsuario);
        res.json({resultado:results.affectedRows});
      }
    });     
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }
});

app.put('/api/usuario',verificarToken, (req, res)=> {
  try {
    const usuario = req.body;
    console.log(usuario);
    const query = 'UPDATE usuario SET carnet_usuario = ?,nombre_usuario = ?,celular_usuario = ?,estado_usuario = ?,login_usuario = ?,pass_usuario = ?, id_unidad = ? WHERE id_usuario = ?';
    connection.query(query, [usuario.carnet_usuario,usuario.nombre_usuario,usuario.celular_usuario,usuario.estado_usuario,usuario.login_usuario,usuario.pass_usuario,usuario.id_unidad,usuario.id_usuario], (error, results) => {
      if (error) {
        res.json({ error });
        throw error;
      }else{
        io.emit('editarUsuario', usuario);
		    res.json({resultado: results.affectedRows}); // Envía los resultados como respueverificarTokensta  
      }
    });    
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).json({resultado:'Ocurrió un error en el servidor.'});
  }
});

// ==============================================

app.get('/logout', (req, res) => {
  res.json({ 'estado': 'exito' });
  // if (err) {
  //   console.error('Error al destruir la sesión:', err);
  //   res.json({ 'estado': err });
  // } else {
  //   res.json({ 'estado': 'exito' });
  // }


  // req.session.destroy(err => {
  //   if (err) {
  //     console.error('Error al destruir la sesión:', err);
  //     res.json({ 'estado': err });
  //   } else {
  //     res.json({ 'estado': 'exito' });
  //   }
  // });   
});


app.post('/api/reserva', (req, res)=> {
  try {
    const valor = req.body;
    const query = 'INSERT INTO bitacora(id_vehiculo,id_usuario,fecha_bitacora,'+
      'hora_inicio,hora_final,estado_bitacora,destino_bitacora,nro_vale,kilometraje_inicio,kilometraje_final) VALUES (?,?,?,?,?,?,?,?,?,?)';
    connection.query(query, [valor.id_vehiculo,valor.usuario,valor.fecha,valor.horarioInicio,valor.horario,'Reservado',valor.destino,valor.nroVale,valor.kmInicial,valor.kmFinal], (error, results) => {
      if (error) {
        throw error;
      }else{
        
        io.emit('agregarReserva', valor);
		    res.json(results.affectedRows); // Envía los resultados como respueverificarTokensta  
      }
    });    
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).send('Ocurrió un error en el servidor.');
  }
});

// app.post('/api/bitacora',verificarToken, (req, res)=> {
app.post('/api/bitacora', (req, res)=> {
  try {
    const valor = req.body;
    let fechaInicio;
    let fechaFinal;
    console.log(valor);
    if(isEmpty(valor)){
      fechaInicio = new Date();
      fechaFinal = new Date();
      fechaFinal.setDate(fechaInicio.getDate() + 7);
    }else{
      fechaInicio = new Date(valor.fecha+"T00:00:00");
      fechaFinal = new Date();
      fechaFinal.setDate(fechaInicio.getDate() + 7);
    }
    const query = 'SELECT * FROM bitacora WHERE id_vehiculo = ? AND fecha_bitacora BETWEEN ? AND ?';
    connection.query(query, [valor.id_vehiculo ,formatoMysql(fechaInicio), formatoMysql(fechaFinal)], (error, results) => {
      if (error) {
        throw error;
      }else{
        let semana = ordenarPordiasFecha(fechaInicio);
        res.json(agruparPorDia(semana,results)); // Envía los resultados como respuesta  
      }
    });    
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).send('Ocurrió un error en el servidor.');
  }
});

app.get('/getBitacora', (req, res) => {
  connection.query('SELECT * FROM bitacora', (error, results, fields) => {
    if (error) {
      throw error;
    }else{
      res.json({ bitacoras: results });
    }
  });    
});

app.delete('/api/bitacora/:id', (req, res) => {
  try {
    let idBitacora = req.params.id;
    const query = 'DELETE FROM bitacora WHERE id_bitacora = ?';
    connection.query(query, [idBitacora], (error, results) => {
      if (error) {
        throw error;
      }else{
        io.emit('eliminarReserva', idBitacora);
        res.json(results.affectedRows);
      }
    });     
  } catch (error) {
    // console.error('Se produjo un error:', error);
    res.status(500).send('Ocurrió un error en el servidor.');
  }
});


app.post('/api/deleteBitacora', (req, res) => {
  try {
    let valor = req.body;
    const query = 'DELETE FROM bitacora WHERE id_bitacora = ?';
    connection.query(query, [valor.id_bitacora], (error, results) => {
      if (error) {
        throw error;
      }else{
        console.log(valor);
        io.emit('eliminarReserva', valor);
        res.json(results.affectedRows);
      }
    });     
  } catch (error) {
    // console.error('Se produjo un error:', error);
    res.status(500).send('Ocurrió un error en el servidor.');
  }
});

app.put('/api/bitacora/:id', (req, res) => {
  try {
    const valor = req.body;
    let idBitacora = req.params.id;
    const query = `UPDATE bitacora SET hora_final = ?, destino_bitacora = ?, nro_vale = ?, 
    kilometraje_inicio = ?, kilometraje_final = ? WHERE id_bitacora = ?`;
    connection.query(query, [valor.horario,valor.destino,valor.nroVale,valor.kmInicial,valor.kmFinal,idBitacora], (error, results) => {
      if (error) {
        throw error;
      }else{
        io.emit('editarReserva', valor);
        res.json(results.affectedRows);
      }
    });     
  } catch (error) {
    console.error('Se produjo un error:', error);
    res.status(500).send('Ocurrió un error en el servidor.');
  }
});

// Configura el puerto en el que escuchará el servidor
const port = 3000;

httpServer.listen(port, () => console.log(`listening on port ${port}`));
// httpServer.listen(port,'0.0.0.0', () => console.log(`listening on port ${port}`));

function formatoMysql(fecha){
  let respuesta = 'YYYY-mm-dd';
  respuesta = fecha.toISOString().substring(0, 10);
  return respuesta;
}

function agruparPorDia(semana,res){
  res.forEach(element => {
    let dia = new Date(element.fecha_bitacora).getDay();
    switch (dia) {
      case 0:
        semana.lunes.push(element);
        break;
      case 1:
        semana.martes.push(element);
        break;
      case 2:
        semana.miercoles.push(element);
      	break;
      case 3:
        semana.jueves.push(element);
      	break;
      case 4:
        semana.viernes.push(element);
      	break;
      case 5:
        semana.sabado.push(element);
      	break;
      default:
        semana.domingo.push(element);
        break;
    }
  });
  return semana;
}

function ordenarPordiasFecha(fecha){
  	let semana = {};
	  let diasSemana = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
  	for (let i = 0; i < 7; i++) {
      semana[diasSemana[fecha.getDay()]] = [];
		  fecha.setDate(fecha.getDate() + 1);
  	}
	return semana;
}

function verificarToken(req, res, next) {
  const token = req.headers['authorization'];
  // console.log(req.headers['authorization']);
  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado' });
  }
  let payload;
  try {
    payload = jwt.verify(token, secretKey);
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: 'Token inválido' });
  }
}

function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}