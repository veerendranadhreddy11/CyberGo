# Installing CyberNex 2.0

Download the package matching your system from [CyberNex v2.0.0](https://github.com/veerendranadhreddy11/CyberGo/releases/tag/v2.0.0). Each platform has a native package and ZIP with this installation guide. [SHA-256 checksums](https://github.com/veerendranadhreddy11/CyberGo/releases/download/v2.0.0/SHA256SUMS.txt)

## Windows 10 or 11 x64

Extract the ZIP if needed, then open `CyberNex-Setup-Windows-x64.exe`. Complete the installer and open **CyberNex** from Start. The installer is unsigned, so Windows may show a publisher or SmartScreen notice. Follow your device's security policy.

## macOS 11 or later

Pick the Apple Silicon or Intel disk image for your Mac. Open it and drag **CyberNex** into **Applications**. The Mac builds use ad hoc signatures and lack Apple Developer ID notarization. Gatekeeper policy may limit installation or launch.

## Upgrade from CyberGo

Install CyberNex in the same OS user profile and close CyberGo before opening CyberNex. On first launch, CyberNex adds its Full Course table to the existing data directory. The application identifier, mission IDs, notes, dates, preferences, and evidence remain compatible. Back up data before upgrading. CyberGo v1 cannot open a schema upgraded by CyberNex.

In CyberNex, **Settings → Open data folder** opens your SQLite and evidence folder. Use **Export my data** to make a portable ZIP. A CyberGo ZIP or browser progress JSON restores old Crash Course data while keeping your current Full Course learning. A CyberNex ZIP can restore both modes.
