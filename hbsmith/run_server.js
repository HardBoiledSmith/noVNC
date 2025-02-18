const http = require('http');
const { exec } = require('child_process');
const url = require('url');
const util = require('util');
const execAsync = util.promisify(exec);

async function killApplications() {
    const processes = [
        'ms-teams',
        'EXCEL',
        'POWERPNT',
        'WINWORD',
        'chrome',
        'explorer'
    ];

    for (const process of processes) {
        try {
            await execAsync(`taskkill /F /IM ${process}.exe /T`, { windowsHide: true });
            console.log(`killed: ${process}`)
        } catch (error) {
            console.log(`Process ${process} not found or could not be killed`);
        }
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        await execAsync('explorer.exe', { windowsHide: true });
        console.log('Explorer restarted successfully');
    } catch (error) {
        console.error('Failed to restart Explorer:', error);
    }
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = url.parse(req.url);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    if (req.method !== 'POST') {
        res.writeHead(405);
        res.end('Method Not Allowed');
        return;
    }

    try {
        switch (parsedUrl.pathname) {
            case '/cleanup-session':
                await killApplications();
                res.writeHead(200);
                res.end('Success');
                break;

            default:
                res.writeHead(404);
                res.end('Not Found');
        }
    } catch (error) {
        console.error(`Error: ${error}`);
        res.writeHead(500);
        res.end('Internal Server Error');
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
