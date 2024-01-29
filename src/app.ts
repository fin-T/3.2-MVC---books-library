import express from "express";
import cron from 'node-cron';
import { backup } from './utils/backup';
import { removeDeletedBooks } from './utils/remove_deleted_books_from_db';

const app = express();
let client = require(`./routes/client`);
let admin = require('./routes/admin');

app.use('/static', express.static('front'));
app.use("/", client);
app.use("/admin", admin);

backup();
setCron();

/**
 * Sets up cron. Plans actions that will occur once a day (01:00).
 */
function setCron() {
    cron.schedule('0 3 * * *', () => {
        console.log('Cron job is running!');
        backup();
        removeDeletedBooks();
    });
}

app.listen(process.env.PORT, () => {
    console.log("Server listening port on", Number(process.env.PORT));
});


