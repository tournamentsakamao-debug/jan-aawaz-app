# Jan Aawaz App - Privacy Policy & Legal Framework
*Last Updated: $(date)*
*App Version: 1.0.0*

## 1. Introduction
Jan Aawaz ("we", "our", "us") is a citizen engagement platform enabling anonymous problem reporting, leader accountability tracking, and public discourse. This policy outlines how we protect your rights while enabling civic participation.

## 2. Data We Collect
### 2.1 Minimal Personal Data
- Google account email (for authentication only)
- Self-chosen username (public, changeable)
- Approximate location (district/block level for public display)
- **Precise coordinates are encrypted and never displayed publicly**

### 2.2 Anonymous Reporting
- Problems can be posted with `is_anonymous = true`
- Anonymous reports show randomized IDs, not linked to your account in public views
- Admins can access encrypted location data ONLY for moderation/legal compliance with audit trail

### 2.3 Leader Verification Data
- Political figures must provide Instagram proof URL for verification
- This data is stored encrypted and used solely for role assignment
- Verification status is public; proof URLs are admin-only

## 3. How We Use Data
- To display problems on map within your selected area
- To aggregate voting results (individual votes are anonymized)
- To generate AI summaries for leaders (personal identifiers removed)
- To enforce rate limits (1 problem/week, 1 world message/day)

## 4. Data Sharing & Legal Compliance
### 4.1 We Do NOT:
- Sell your data to third parties
- Share anonymous reports with government without legal process
- Use your location for advertising without explicit consent

### 4.2 We MAY disclose data when:
- Required by Indian law with valid court order (logged in `admin_logs`)
- To prevent imminent harm (e.g., women safety emergencies)
- With your explicit consent for specific features

### 4.3 Intermediary Status
Per Section 79 of India's Information Technology Act, 2000:
> Jan Aawaz qualifies as an "intermediary" and exercises due diligence by:
> - Publishing this privacy policy
> - Maintaining audit logs of all admin actions
> - Providing grievance redressal mechanism
> - Removing unlawful content upon valid notice

## 5. Admin Protection Framework
### 5.1 Audit Trail
Every admin action is logged in `admin_logs` table with:
- Admin ID and timestamp
- Action type and target
- Before/after values
- Reason for action (mandatory for deletions)
- IP address and user agent

### 5.2 Separation of Powers
- App owner (`prounknown055@gmail.com`) has technical access only
- Content moderation decisions require documented justification
- "Ghotala Wallet" is a simulated metric for public awareness, not a legal accusation

### 5.3 Emergency Protocols
- Maintenance mode can disable all user features instantly
- Individual features can be toggled off without full shutdown
- All emergency actions require audit log entry

## 6. User Rights (DPDP Act 2023 Compliant)
- **Right to Access**: Request your data via in-app form
- **Right to Correction**: Update profile anytime
- **Right to Erasure**: Delete account (anonymized historical data retained for audit)
- **Right to Grievance**: Contact `legal@janaawaz.app` or use in-app form

## 7. Children's Privacy
- Users under 18 require parental consent (verified via OTP)
- No targeted advertising to minors
- Content moderation strictly filters adult content

## 8. Data Storage & Security
- All data stored on AWS India region via Supabase
- Encryption at rest (Supabase default) and in transit (TLS 1.3)
- Regular security audits and penetration testing
- **Admin credentials require 2FA (enforced)**

## 9. Changes to This Policy
- Updates will be notified via in-app banner
- Material changes require 30-day notice
- Continued use constitutes acceptance

## 10. Contact Information
- Grievance Officer: `legal@janaawaz.app`
- Legal Notices: `legal@janaawaz.app` with subject "LEGAL NOTICE"
- Data Protection Queries: `privacy@janaawaz.app`

*This policy is dynamically served from Supabase `admin_settings.privacy_policy_url` to allow updates without app store re-submission.*

---
**Disclaimer**: This document is for informational purposes only and does not constitute legal advice. Consult a qualified attorney specializing in Indian IT law before launching.
