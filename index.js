require('dotenv').config();
const axios = require('axios');
const nodemailer = require('nodemailer');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv)).options({
    stock: {
        describe: 'Stock symbol to monitor',
        type: 'string',
        demandOption: true
    },
    target: {
        describe: 'Target price to trigger the notification',
        type: 'number',
        demandOption: true
    },
    email: {
        describe: 'Email address to receive the notification',
        type: 'string',
        demandOption: true
    }
}).argv;

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function checkStockPrice(stock, target, email) {
    try {
        const response = await axios.get(`https://api.example.com/stocks/${stock}`, {
            headers: { 'Authorization': `Bearer ${process.env.API_KEY}` }
        });
        const currentPrice = response.data.price;
        console.log(`Current price of ${stock} is ${currentPrice}`);

        if (currentPrice >= target) {
            await transporter.sendMail({
                from: '"Stock Notifier" <notifier@example.com>',
                to: email,
                subject: `Stock Alert for ${stock}`,
                text: `The stock ${stock} has reached your target price of ${target}. Current price: ${currentPrice}.`
            });
            console.log('Notification sent!');
        } else {
            console.log('Target price not reached yet.');
        }
    } catch (error) {
        console.error('Failed to fetch stock price or send email:', error);
    }
}

checkStockPrice(argv.stock, argv.target, argv.email);
