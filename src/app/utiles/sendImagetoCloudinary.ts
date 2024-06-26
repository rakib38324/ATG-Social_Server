import { v2 as cloudinary } from 'cloudinary';
import config from '../config/config';
import multer from 'multer';
import fs from 'fs';

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export const sendImageToCloudinary = (image_name: string, path: string) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      path,
      { public_id: image_name },
      function (error, result) {
        if (error) {
          reject(error);
        }
        resolve(result);

        //delete local folder images
        fs.unlink(path, (err) => {
          if (err) {
            console.log('File not deleted.');
            reject(err);
          } else {
            console.log('File deleted.');
          }
        });
      },
    );
  });
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + '/uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

export const upload = multer({ storage: storage });
