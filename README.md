# Phishing Site Checker
Phishing Site Checker is a Chrome extension that helps you stay safe online by checking if the current website is a phishing site. It uses the latest phishing URL data from trusted sources to protect you from fraudulent websites and scams.

## Features
- **Real-time phishing detection**: Instantly checks if a site is flagged as unsafe.
- **Lightweight**: Works seamlessly without slowing down your browsing experience.
- **Local storage**: Stores phishing URLs locally for fast checks without needing an internet connection.

## How it Works
The extension checks the active tab's URL against a local database of phishing sites, which is updated regularly. If the site is detected as phishing, the extension will alert you.

![Safe Site](https://raw.githubusercontent.com/vishwas-r/Phishing-Site-Checker/refs/heads/main/screenshots/firefox-addon-safe-site.png)

## Permissions
- **storage**: To store phishing URLs locally for quick checks.
- **tabs**: To access the URL of the current active tab.
- **scripting**: To inject scripts for checking URLs against the phishing database.
- **host_permissions**: To check URLs on all websites visited.

## Disclaimer
This extension is intended for security research and educational purposes. It uses a publicly available phishing URL database and is not responsible for any damage caused by phishing attacks.
