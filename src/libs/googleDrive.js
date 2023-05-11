const { google } = require('googleapis');



// GoogleDrive Implementation
exports.createDriveClient = () => {
    const { GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, GOOGLE_DRIVE_REDIRECT_URI, GOOGLE_DRIVE_REFRESH_TOKEN } = process.env;
    const client = new google.auth.OAuth2(GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, GOOGLE_DRIVE_REDIRECT_URI);

    client.setCredentials({ refresh_token: GOOGLE_DRIVE_REFRESH_TOKEN });

    return google.drive({
        version: 'v3',
        auth: client,
    });
}

exports.createFolder = (folderName, folderId, driveClient) => {
    return driveClient.files.create({
        resource: {
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder',
            parents: folderId ? [folderId] : [],
        },
        fields: 'id, name',
    });
}

exports.uploadFile = (fileName, file, fileMimeType, folderId, driveClient) => {
    return driveClient.files.create({
        requestBody: {
            name: fileName,
            mimeType: fileMimeType,
            parents: folderId ? [folderId] : [],
        },
        media: {
            mimeType: fileMimeType,
            body: file,
        },
    });
}

exports.searchFolder = (folderName, driveClient) => {
    return new Promise((resolve, reject) => {
        driveClient.files.list(
            {
                q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}'`,
                fields: 'files(id, name)',
            },
            (err, res) => {
                if (err) {
                    return reject(err);
                }

                return resolve(res.data.files ? res.data.files[0] : null);
            },
        );
    });
}