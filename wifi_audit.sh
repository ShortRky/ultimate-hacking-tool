#!/bin/bash

# Wi-Fi Security Auditor
# Run with: sudo ./wifi_audit.sh

# Check for root privileges
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root (use sudo)."
  exit 1
fi

# Install dependencies (aircrack-ng, nmap)
echo "Installing dependencies..."
apt-get install -y aircrack-ng nmap > /dev/null 2>&1

# Scan Wi-Fi networks
echo "Scanning nearby Wi-Fi networks..."
interface=$(iw dev | grep Interface | awk '{print $2}')
airmon-ng start $interface > /dev/null 2>&1
mon_interface="${interface}mon"
timeout 10 airodump-ng $mon_interface --output-format csv -w scan > /dev/null 2>&1

# Parse scan results
echo "Network Summary:"
echo "----------------"
grep -E 'WPA|WEP|OPN' scan-01.csv | awk -F',' '{printf "SSID: %-20s Encryption: %s\n", $14, $6}'

# Check router open ports (replace 192.168.1.1 with your router IP)
echo -e "\nChecking router ports..."
router_ip="192.168.1.1"
nmap -T4 $router_ip | grep 'open'

# Cleanup
airmon-ng stop $mon_interface > /dev/null 2>&1
rm scan-01.csv

echo -e "\nAudit complete. Harden your network based on the findings above!"