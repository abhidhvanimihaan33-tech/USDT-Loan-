# Tickerline Platform — Production Deployment & Operator Manual

This guide describes how to deploy and operate the **Tickerline** non-collateralized USDT lending platform on a clean Ubuntu 22.04/24.04 LTS VPS.

---

## 1. System Requirements & Hardware Sizing

- **Operating System:** Ubuntu 22.04 LTS or 24.04 LTS (x86_64)
- **Minimum Compute:** 2 vCPU, 4 GB RAM, 40 GB NVMe Storage
- **Recommended Compute:** 4 vCPU, 8 GB RAM, 80 GB NVMe Storage
- **Network:** Static Public IPv4, Domain Name (A Records pointing to VPS IP)

---

## 2. Server Hardening & Base Configuration

### A. Update Packages & Setup Non-Root User
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y ufw curl git build-essential certbot python3-certbot-nginx
```

### B. Configure UFW Firewall
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'SSH'
sudo ufw allow 80/tcp comment 'HTTP ACME'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw enable
```

### C. Install Docker Engine & Compose
```bash
# Install Docker repository
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker $USER
```

---

## 3. Clone & Environment Configuration

### A. Clone Repository
```bash
git clone https://github.com/your-org/tickerline.git /opt/tickerline
cd /opt/tickerline
```

### B. Setup Environment Variables
```bash
cp .env.example .env
nano .env
```
Generate strong secrets:
```bash
openssl rand -hex 32  # Use for JWT_SECRET
openssl rand -hex 32  # Use for SESSION_SECRET
openssl rand -base64 24 # Use for POSTGRES_PASSWORD
```

---

## 4. Obtain SSL / TLS Certificates

```bash
sudo certbot certonly --standalone -d tickerline.com -d www.tickerline.com --email legal@tickerline.com --agree-tos --non-interactive
```

---

## 5. Launch Application Stack

```bash
# Build images and start background containers
docker compose up -d --build

# Inspect running services
docker compose ps

# Follow container logs
docker compose logs -f app
```

---

## 6. Database Backups & Restoration

### Automated Daily PostgreSQL Backup Cron:
Create `/opt/tickerline/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/opt/tickerline/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p "$BACKUP_DIR"

docker exec -t tickerline-postgres pg_dump -U tickerline_admin tickerline_db | gzip > "$BACKUP_DIR/tickerline_$TIMESTAMP.sql.gz"

# Retain last 30 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -delete
```
Make executable and add to crontab:
```bash
chmod +x /opt/tickerline/backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/tickerline/backup.sh") | crontab -
```

### Restoring from Backup:
```bash
gunzip < /opt/tickerline/backups/tickerline_YYYYMMDD_HHMMSS.sql.gz | docker exec -i tickerline-postgres psql -U tickerline_admin -d tickerline_db
```

---

## 7. Production Blockers & Third-Party Regulatory Approvals Checklist

Prior to disabling Demo Mode (`VITE_ENABLE_DEMO_MODE=false`) or executing live consumer credit:

1. **State Consumer Lending Licenses:**
   - California Financing Law (CFL) license through DFPI.
   - Texas OCCC Regulated Lender License.
   - Florida Consumer Finance Company License.
   - Or an executed partnership program with an FDIC-insured charter bank (e.g. WebBank / Cross River Bank).

2. **Qualified Digital Asset Custody Partner:**
   - Executed Institutional Agreement with an approved Qualified Custodian (Fireblocks, BitGo, or Paxos).
   - Segregated cold storage vault provisioning.
   - Anti-Money Laundering (AML) / FinCEN MSB registration or bank partner coverage.

3. **Consumer Credit Bureau Agreements:**
   - Formal subscriber agreement with Experian, Equifax, or TransUnion for FCRA-compliant permissible purpose inquiries.
   - Metro 2 format credit bureau reporting agreement for loan payment data reporting.

4. **Independent Legal & Compliance Audit:**
   - Outside legal review of the TILA Regulation Z promissory note and disclosure schedules.
   - Written compliance policy for Equal Credit Opportunity Act (ECOA) adverse action reporting.
   - FinCEN BSA/AML program audit and designation of a certified BSA Compliance Officer.

---

## 8. Complete Project ZIP Export Instructions

To create a clean, transportable ZIP archive without node_modules or transient build artifacts:

```bash
cd /opt/tickerline
git clean -xfd -e .env.example
zip -r tickerline_production_source.zip . -x "*.git*" "node_modules/*" "dist/*"
```
