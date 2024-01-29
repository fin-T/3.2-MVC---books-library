import { exec } from 'child_process';

/**
 * Saves a database backup to a .sql file.
 */
export function backup() {
    let backupFileName = getBackupFileName();
    let backupFilePath = process.env.BACKUP_PATH + backupFileName;
    let mysqldumpCommand = `mysqldump -u${process.env.MYSQL_USER} -p${process.env.MYSQL_PASSWORD} ` +
        `--databases ${process.env.MYSQL_DATABASE} > ${backupFilePath}`;
    exec(mysqldumpCommand, (error) => {
        if (error) {
            console.log(error);
        } else {
            console.log(`The backup was successfully created: ${backupFilePath}`);
        }
    });
}

/**
 * Generates and returns a string for the name of the backup file.
 * 
 * @returns A string like "backup_mm-dd-yyyy_hh:mm_PM.sql".
 */
function getBackupFileName() {
    return 'backup_' + new Date()
        .toLocaleString()
        .replaceAll('\/', '-')
        .replace(', ', '_')
        .replace(/:\d+\s+/, '_') + '.sql';
}

module.exports = {
    backup
}