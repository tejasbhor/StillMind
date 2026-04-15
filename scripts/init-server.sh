#!/bin/bash
set -e

echo "🚀 Initializing StillMind Server for OCI (Ubuntu ARM64)"

# 1. Update and install prerequisites
sudo apt-get update
sudo apt-get upgrade -y
sudo apt-get install -y ca-certificates curl gnupg lsb-release ufw

# 2. Add Docker's official GPG key
sudo mkdir -m 0755 -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# 3. Set up the repository
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 4. Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 5. Enable Docker to start on boot
sudo systemctl enable docker
sudo systemctl start docker

# 6. Add current user to docker group
if ! getent group docker > /dev/null; then
    sudo groupadd docker
fi
sudo usermod -aG docker $USER

# 7. Configure UFW (Firewall)
echo "🛡️ Configuring Firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
echo "y" | sudo ufw enable

# 8. Create application directories
echo "📁 Creating application directories..."
sudo mkdir -p /opt/stillmind
sudo chown -R $USER:$USER /opt/stillmind

echo "✅ Server initialization complete!"
echo "⚠️  Please log out and log back in to apply Docker group permissions."
