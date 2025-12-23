$ErrorActionPreference = "Stop"
$user = "root"
$ip = "161.97.77.9"
$password = "6l35QkMy8"

Write-Host "=========================================="
Write-Host "Deploying PDF Tools to $ip"
Write-Host "User: $user"
Write-Host "Password: $password"
Write-Host "=========================================="
Write-Host "NOTE: You will be asked for the password 3 times."
Write-Host "      1. To upload the setup script."
Write-Host "      2. To upload the project files."
Write-Host "      3. To execute the deployment."
Write-Host "=========================================="

# 1. Upload Setup Script
Write-Host "`n[1/3] Uploading setup_server.sh..."
scp -o StrictHostKeyChecking=no setup_server.sh ${user}@${ip}:/tmp/setup_server.sh

# 2. Upload Project Archive
Write-Host "`n[2/3] Uploading deployment.tar.gz..."
scp -o StrictHostKeyChecking=no deployment.tar.gz ${user}@${ip}:/tmp/deployment.tar.gz

# 3. Execute Setup
Write-Host "`n[3/3] Executing remote setup..."
ssh -t -o StrictHostKeyChecking=no ${user}@${ip} "chmod +x /tmp/setup_server.sh && bash /tmp/setup_server.sh"

Write-Host "`n------------------------------------------"
Write-Host "Deployment script finished."
Write-Host "Check the output above for any errors."
Write-Host "If successful, visit https://pdf-converters.online"
