import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';

function randomPort(): number {
    return Math.floor(Math.random() * 200) + 11500
}

const AUTHORIZED_IPS = ["::1", "127.0.0.1", "::ffff:127.0.0.1"]

export class GeoGebraServer {
    serverInstance: http.Server
    port: number

    constructor(port?: number) {
        this.port = port ? port : randomPort()

        this.serverInstance = http.createServer((req, res) => {
            if (!req.socket.remoteAddress || !AUTHORIZED_IPS.includes(req.socket.remoteAddress)) {
                res.writeHead(401);
                res.end();
            }

            const url = req.url ? new URL(req.url, `http://${req.headers.host}`) : null;
            const urlpath = url?.pathname
            const filePath = app.vault.adapter.getFullPath(path.join(".obsidian/plugins/geogebra-for-obsidian/", urlpath || "index.html"))
            const fileExtension = path.extname(filePath);
            const contentType = getContentType(fileExtension);

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('File not found');
                } else {
                    res.writeHead(200, { 'Content-Type': contentType });
                    res.end(data);
                }
            });
        });
    }

    start() {
        this.serverInstance.listen(this.port, () => {
            console.log(`Geogebra server is running on port ${this.port}`);
        });

    }

    stop() {
        this.serverInstance.close(err => {
            if (err) {
                console.error("Cannot close the server Geogebra server, Module threw an error")
                console.error(err)
            } else {
                console.log("Closed GeoGebra server")
            }
        })
    }
}

function getContentType(fileExtension: string): string {
    switch (fileExtension) {
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.js':
            return 'text/javascript';
        case '.json':
            return 'application/json';
        case '.png':
            return 'image/png';
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        default:
            return 'application/octet-stream';
    }
}