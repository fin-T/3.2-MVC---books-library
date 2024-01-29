import multer from 'multer';
import fs from "fs";   
import { RowDataPacket } from 'mysql2/promise';
import { pool } from './connect_to_db';

/**
 * A StorageEngine implementation configured to store files on the local file system.
 */
const storage = multer.diskStorage({
    destination: 'front/books/books-page/books-page_files/',
    filename: async (req, file, cb) => {
        let fileName = file.originalname;
        let formatFile = fileName.substring(fileName.lastIndexOf('.'));
        let getBooks = fs.readFileSync('sqlScripts/get_books.sql', 'utf-8');
        let [books] = await pool.query<RowDataPacket[]>(getBooks);
        let uploadedFileName = (books.length + 1) + formatFile;
        cb(null, uploadedFileName);
    }
})

/**
 * The StorageEngine specified in storage will be used to store files. If storage is not set and dest is, 
 * files will be stored in dest on the local file system with random names. 
 * If neither are set, files will be stored in memory.
 */
export const upload = multer({ storage: storage });

module.exports = {
    upload
}