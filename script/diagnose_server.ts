
import { Client } from "ssh2";

const config = {
    host: "161.97.77.9",
    port: 22,
    username: "root",
    password: "6l35QkMy8",
};

function executeCommand(conn: Client, command: string): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log(`\n> ${command}`);
        conn.exec(command, (err, stream) => {
            if (err) return reject(err);
            stream
                .on("close", (code: any, signal: any) => {
                    if (code !== 0) reject(new Error(`Command failed with code ${code}`));
                    else resolve();
                })
                .on("data", (data: any) => {
                    process.stdout.write(data);
                })
                .stderr.on("data", (data: any) => {
                    process.stderr.write(data);
                });
        });
    });
}

async function diagnose() {
    const conn = new Client();

    conn.on("ready", async () => {
        console.log("Connected to server for diagnosis...");

        try {
            console.log("--- Checking Nginx Sites ---");
            await executeCommand(conn, "ls -l /etc/nginx/sites-enabled/");

            console.log("\n--- Checking Nginx Config for PDF Tools ---");
            await executeCommand(conn, "cat /etc/nginx/sites-enabled/pdf-converters.online || echo 'File not found'");

            console.log("\n--- Checking Running PM2 Processes ---");
            await executeCommand(conn, "pm2 list");

            console.log("\n--- Checking Active Ports ---");
            // netstat might not be installed, try ss
            await executeCommand(conn, "ss -tuln");

            conn.end();
        } catch (e) {
            console.error(e);
            conn.end();
        }
    }).connect(config);
}

diagnose();
