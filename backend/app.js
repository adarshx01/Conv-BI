
const { spawn } = require('child_process');
const path = require('path');

function startServer(scriptPath, name) {
    const server = spawn('node', [scriptPath], {
        stdio: 'pipe'
    });

    server.stdout.on('data', (data) => {
        console.log(`[${name}] ${data}`);
    });

    server.stderr.on('data', (data) => {
        console.error(`[${name}] Error: ${data}`);
    });

    server.on('close', (code) => {
        console.log(`[${name}] Process exited with code ${code}`);
    });

    return server;
}

// Start both servers
const mainServer = startServer(path.join(__dirname, 'server.js'), 'MainServer');
const canvasServer = startServer(path.join(__dirname, 'canvasApi.js'), 'CanvasAPI');

// Handle process termination
process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Shutting down servers...');
    mainServer.kill();
    canvasServer.kill();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('Received SIGINT. Shutting down servers...');
    mainServer.kill();
    canvasServer.kill();
    process.exit(0);
});