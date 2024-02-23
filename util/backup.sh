mkdir backups
suffix=$(date "+%Y-%m-%dT%H%M")
zip -qru backups/backup$suffix.zip photos db/auth.txt db/directory.db assets
