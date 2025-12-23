
import { Client } from "ssh2";

const config = {
    host: "161.97.77.9",
    port: 22,
    username: "root",
    password: "6l35QkMy8",
};

async function setupSSL() {
    const conn = new Client();

    conn.on("ready", async () => {
        console.log("Connected. Attempting to run Certbot...");

        conn.exec("certbot --nginx -d pdf-converters.online -d www.pdf-converters.online --non-interactive --agree-tos --email admin@pdf-converters.online --redirect", (err, stream) => {
            if (err) throw err;
            stream.on('close', (code, signal) => {
                console.log('Certbot process closed with code ' + code);
                conn.end();
            }).on('data', (data) => {
                console.log('STDOUT: ' + data);
            }).stderr.on('data', (data) => {
                console.log('STDERR: ' + data);
            });
        });

    }).connect(config);
}

setupSSL();
