const { Client } = require('ssh2');
const { updateServiceStatus, getServicesFromDB } = require('./database');

// Función para monitorear un servicio en un servidor remoto usando SSH
function monitorService(service) {
  const conn = new Client();

  // Configuración de conexión SSH
  const sshConfig = {
    host: service.ip,          // IP del servidor remoto
    port: service.sshPort,     // Puerto SSH (usualmente 22)
    username: service.user,    // Usuario SSH
    password: service.password // Contraseña SSH
  };

  // Establecer conexión SSH al servidor
  conn.on('ready', () => {
    console.log(`Conexión establecida con el servidor ${service.ip} para monitorear el servicio: ${service.name}`);

    // Primer comando: Obtener el estado del servicio para extraer el PID
    conn.exec(`systemctl status ${service.name} | grep 'Main PID'`, (err, stream) => {
      if (err) {
        console.error(`Error al obtener el estado del servicio en ${service.ip}:`, err);
        return updateServiceStatus(service._id, 'error');
      }

      let mainPID = '';

      // Procesar la salida del comando para obtener el Main PID
      stream.on('data', (data) => {
        const output = data.toString().trim();
        console.log(`Salida del comando systemctl para ${service.name}: ${output}`);

        // Extraer el PID de la línea "Main PID: <number>"
        const pidMatch = output.match(/Main PID:\s+(\d+)/);
        if (pidMatch) {
          mainPID = pidMatch[1];
          console.log(`Main PID del servicio ${service.name}: ${mainPID}`);
        }
      });

      stream.on('close', () => {
        if (!mainPID) {
          console.error(`No se encontró un Main PID para el servicio ${service.name} en ${service.ip}`);
          updateServiceStatus(service._id, 'inactive'); // Si no hay PID, el servicio está inactivo
          return conn.end();
        }

        // Segundo comando: Usar el PID para obtener uso de CPU, memoria y tiempo de ejecución
        conn.exec(`ps -p ${mainPID} -o pid,etimes,pcpu,pmem,comm --no-headers`, (err, stream) => {
          if (err) {
            console.error(`Error al obtener uso de CPU/memoria para el PID ${mainPID} en ${service.ip}:`, err);
            return updateServiceStatus(service._id, 'error');
          }

          let cpuUsage = 0;
          let memoryUsage = 0;
          let elapsedTime = 0;
          let command = '';
          let status = 'active';  // Si encontramos el PID, el servicio está activo

          stream.on('data', (data) => {
            const output = data.toString().trim();
            console.log(`Uso de CPU/memoria/tiempo de ejecución para PID ${mainPID}: ${output}`);

            // La salida tiene el formato: PID ELAPSED %CPU %MEM COMMAND
            const [pid, elapsed, cpu, mem, comm] = output.split(/\s+/);
            cpuUsage = parseFloat(cpu);
            memoryUsage = parseFloat(mem);
            elapsedTime = parseInt(elapsed, 10);  // Elapsed time está en segundos
            command = comm;

            console.log(`Tiempo de ejecución (segundos): ${elapsedTime}`);
          });

          // Cerrar la conexión SSH después de extraer los datos
          stream.on('close', () => {
            console.log(`El servicio ${service.name} en ${service.ip} está ${status}. CPU: ${cpuUsage}%, Memoria: ${memoryUsage}%, Uptime: ${elapsedTime} segundos`);

            // Actualizar el estado del servicio en la base de datos
            updateServiceStatus(service._id, status, cpuUsage, memoryUsage, elapsedTime);

            conn.end(); // Terminar la conexión SSH
          });
        });
      });
    });

  // Manejar errores de conexión SSH
  }).on('error', (err) => {
    console.error(`Error al conectar por SSH a ${service.ip}:`, err);
    updateServiceStatus(service._id, 'error'); // Marcar el servicio como 'error' si no se puede conectar
  }).connect(sshConfig); // Conectar utilizando la configuración SSH
}

// Función para iniciar el monitoreo periódico de todos los servicios
function startMonitoring() {
  setInterval(() => {
    // Obtener todos los servicios desde la base de datos y monitorearlos
    getServicesFromDB().then(services => {
      services.forEach(service => {
        monitorService(service); // Monitorear cada servicio
      });
    }).catch(err => {
      console.error('Error al obtener los servicios de la base de datos:', err);
    });
  }, 5000); // Intervalo de monitoreo de 5 segundos
}

module.exports = { startMonitoring };

