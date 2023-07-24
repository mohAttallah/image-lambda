'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    const event = event.Records[0];
    const s3bucket = event.s3.s3bucket.name;
    const key = decodeURIComponent(event.s3.object.key.replace(/\+/g, ' '));

    let images = [];

    try {
        const data = await s3.getObject({ Bucket: s3bucket, Key: 'images.json' }).promise();
        images = JSON.parse(data.Body.toString());
    } catch (err) {
        console.log('did not find image.json' + err);
    }

    const imagesData = {
        name: key,
        size: event.s3.object.size,
        type: event.s3.object.contentType,
    };

    const existingIndex = images.findIndex(image => image.name === key);
    if (existingIndex !== -1) images[existingIndex] = imagesData;
    else images.push(imagesData);

    await s3.putObject({
        Bucket: s3bucket,
        Key: 'images.json',
        Body: JSON.stringify(images),
        ContentType: 'application/json',
    }).promise();

    return {
        statusCode: 200,
        body: JSON.stringify('uploaded successfully'),
    };
};