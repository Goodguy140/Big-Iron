import mongoose = require('mongoose');
import Discord = require('discord.js');
import models = require('../database/models')
import config = require('../config.json');
const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    autoIndex: false,
    connectTimeoutMS: 10000,
    family: 4,
}
export function init(): void {
    mongoose.connect(config.DBURI, dbOptions);
    mongoose.Promise = global.Promise;

    mongoose.connection.on('connected', () => {
        console.log('Connected to MongoDB');
    });
    mongoose.connection.on('disconnected', () => {
        console.log('Disconnect from MongoDB');
    });
    mongoose.connection.on('err', (err) => {
        console.log(err);
    });
}
export function messageInc(message: Discord.Message): void {
}