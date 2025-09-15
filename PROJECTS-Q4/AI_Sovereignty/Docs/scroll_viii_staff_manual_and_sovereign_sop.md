# Scroll VIII — Staff Manual and Sovereign SOP
*The Guardian’s Handbook of AURA-BREE*

---

## 1. Purpose
This manual distills the sovereign architecture of AURA-BREE into clear daily practices for clinic staff. It transforms protocol into practice, ensuring that sovereignty is preserved not only in code but in conduct.

---

## 2. Roles and Responsibilities
- **Receptionist (Gatekeeper)**: Oversees patient check-ins, verifies presence, manages front-desk flow.
- **Nurse (Guardian of Dosages)**: Administers medication, records dosage, monitors alerts.
- **Administrator (Keeper of Access)**: Manages staff accounts, enforces security, oversees audits.
- **Technical Lead (Custodian of Systems)**: Monitors backend, maintains WhisperNet, handles incidents.

---

## 3. Daily Operations

### 3.1 Start of Day
- Power on clinic server, ensure `aura-bree` service is running.
- Verify dashboard loads locally on staff consoles.
- Confirm time sync (`timedatectl` or NTP) is accurate.
- Check previous day’s audit hash seal.

### 3.2 Patient Intake
- Patients with AURA-BREE app will auto check-in (BLE/LAN).
- If auto check-in fails: offer manual QR scan or reception entry.
- Verify sync indicator shows successful arrival.

### 3.3 Dosage Logging
- Nurse enters dosage through dashboard.
- Verify confirmation prompt appears.
- Confirm sync completes (<1s typical).
- Audit log entry automatically generated.

### 3.4 Alerts & Exceptions
- Dashboard highlights anomalies (missed check-ins, dosage irregularities).
- Respond immediately; escalate to Admin if policy violation detected.

### 3.5 End of Day
- Generate daily audit hash and seal.
- Confirm backups encrypted and stored locally.
- Shut down consoles; leave server running unless maintenance scheduled.

---

## 4. Security Hygiene
- Use MFA for all staff logins.
- Lock workstation when unattended.
- Never share credentials or tokens.
- If suspicious activity observed, notify Admin immediately.

### 4.1 Revocation Procedures
- Admin marks compromised device or account.
- System blocks further access attempts.
- Record event in audit log.

### 4.2 Phishing and Social Engineering
- Never install unknown software on staff consoles.
- Verify patient requests against known identity.
- Report unusual messages or requests.

---

## 5. Sovereign Workflows

### 5.1 Offline Operation
- If internet is lost: continue normal operations.
- Check-ins and dosages will sync via LAN/WhisperNet.
- Confirm WhisperNet relay is active.

### 5.2 Backup & Recovery
- Daily encrypted backup is mandatory.
- Test restoration weekly.
- In case of disaster: restore from latest backup, verify audit chain.

### 5.3 Audit Ritual
- Each morning, verify yesterday’s audit hash.
- Post hash seal in clinic logbook.
- This ensures tamper-evident trust.

---

## 6. Incident Response
- **LEVEL 1**: Anomaly — monitor and record.
- **LEVEL 2**: Repeated failed logins — investigate immediately.
- **LEVEL 3**: Suspected compromise — isolate affected device/server.
- **LEVEL 4**: Confirmed breach — revoke, rotate keys, notify patients.

---

## 7. Compliance Reference
- All operations align with HIPAA/PHIPA standards.
- Patients retain full rights of access, consent, and revocation.
- Transparency portal must remain accessible at all times.

---

## 8. Quick Reference Cards

### Receptionist
- Verify arrivals on dashboard.
- Handle manual check-ins.
- Watch sync indicator.

### Nurse
- Enter dosage immediately after administration.
- Confirm sync and audit.
- Watch for dosage alerts.

### Administrator
- Review audit logs daily.
- Approve/revoke staff accounts.
- Seal daily audit hash.

### Technical Lead
- Monitor system health.
- Apply key rotations.
- Lead incident response.

---

## 9. Closing Benediction
*Guardians of sovereignty, you are more than staff — you are keepers of dignity. Each login is a vow, each dosage a covenant, each audit a testimony. Through your discipline, AURA-BREE remains not just software, but a living sanctuary of trust.*

