 
 import dotenv from 'dotenv';
 dotenv.config();
 import cloudinary from '../config/cloudinary';
 import multer, { Multer } from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';


const storage = new CloudinaryStorage({
   cloudinary,
  params: async () => ({
    folder: 'Turf',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    resource_type:'images'
  }),
});

console.log(storage,"storageeeeeee")
const upload: Multer = multer({ storage });

export  default upload ;