
import { Client } from "ssh2";
import fs from "fs";
import path from "path";

const config = {
    host: "161.97.77.9",
    port: 22,
    username: "root",
    password: "6l35QkMy8",
};

const setupScriptPath = path.resolve(process.cwd(), "setup_server.sh");

function uploadFile(sftp: any, localPath: string, remotePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log(`Uploading ${localPath} to ${remotePath}...`);
        sftp.fastPut(localPath, remotePath, (err: any) => {
            if (err) reject(err);
            else {
                console.log(`Uploaded ${remotePath}`);
                resolve();
            }
        });
    });
}

function executeCommand(conn: Client, command: string): Promise<void> {
    return new Promise((resolve, reject) => {
        console.log(`Executing: ${command}`);
        conn.exec(command, (err, stream) => {
            if (err) return reject(err);
            stream
                .on("close", (code: any, signal: any) => {
                    console.log(`Stream :: close :: code: ${code}, signal: ${signal}`);
                    if (code !== 0) reject(new Error(`Command failed with code ${code}`));
                    else resolve();
                })
                .on("data", (data: any) => {
                    console.log("STDOUT: " + data);
                })
                .stderr.on("data", (data: any) => {
                    console.log("STDERR: " + data);
                });
        });
    });
}

async function fixConfig() {
    const conn = new Client();

    conn.on("ready", async () => {
        console.log("Client :: ready");

        try {
            // 1. Upload just the setup script
            conn.sftp(async (err, sftp) => {
                if (err) throw err;

                try {
                    await uploadFile(sftp, setupScriptPath, "/tmp/setup_server.sh");

                    console.log("Script uploaded. Running setup script to fix Nginx...");

                    // 2. Execute setup (Skip extracting tarball to save time, logic handles it?)
                    // actually the script requires tarball or it errors? 
                    // "if [ -f "/tmp/deployment.tar.gz" ]; then ... else exit 1"

                    // I should probably remove that check or upload a dummy tarball?
                    // OR just assume tarball is still there? It's /tmp, might contain it from previous run.
                    // BUT if it's not there, it will fail.

                    // Let's just run the certbot command directly via SSH to be FAST and SAFE?
                    // No, I want to use the script for consistency for future deploys.
                    // I will use a separate script to just fix nginx.

                    // Wait, I can just execute the certbot command directly.
                    await executeCommand(conn, "certbot --nginx -d pdf-converters.online -d www.pdf-converters.online --non-interactive --agree-tos --email admin@pdf-converters.online --redirect --keep-until-expiring");

                    console.log("SSL Config repaired.");
                    conn.end();
                    process.exit(0);
                } catch (e) {
                    console.error("Error during tasks:", e);
                    conn.end();
                    process.exit(1);
                }
            });

        } catch (e) {
            console.error(e);
            conn.end();
        }
    }).connect(config);
}

fixConfig();
