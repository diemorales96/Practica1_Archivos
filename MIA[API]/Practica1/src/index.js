const express = require('express');
const app = express();

//Configuaracion
app.set('port',process.env.PORT || 3000);

//Acciones Iniciales
app.use(express.json());

//Rutas
app.use(require('./routes/temporal'));

//Inicializar el servidor
app.listen(app.get('port'), () =>{
    console.log('Server on port',app.get('port'))
});