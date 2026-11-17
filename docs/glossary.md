# Glossary of Terms

- **Maestro**: The core application namespace and script framework for managing Banque Alimentaire branch databases.
- **BA (Banque Alimentaire)**: A regional food bank branch network utilizing the Maestro application.
- **DB Key (`dbKey`)**: A unique branch identifier string (typically matching `/^ba\d{3}$/`), used to identify and namespace branch databases.
- **DB (Database)**: A dedicated Google Sheet acting as the primary local data store for a specific BA branch.
- **Database Key (`MAESTRO_DATABASE_KEY`)**: A public custom Google Drive file property tag used to automatically discover and link a branch DB spreadsheet. Note that uniqueness is not guaranteed due to decentralized user control.
- **Parameters Sheet**: The mandatory initial sheet in every DB spreadsheet storing key/value configuration pairs (`dbKey`, etc.).
- **AssoConnect**: The external data source platform from which structured member/donor data is ingested into Maestro.
- **Clasp (Command Line Apps Script Projects)**: The development tool used to push and pull Google Apps Script code between local storage and Google Drive.
- **UserProperties**: Google Apps Script storage mechanism used to persist user-specific metadata and local database index mappings (`MAESTRO_DATABASES`).
- **Soft Protections**: Programmatically applied warning-only sheet protections (`protection.setWarningOnly(true)`) preventing accidental user edits while allowing script operations.
