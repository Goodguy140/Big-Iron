import { Schema, model, connect } from 'mongoose';
import { DBURI } from '../config.json';

interface User {
    userID: string;
    messagesSent: Number;
}

const schema = new Schema<User>({
    userID: { type: String, required: true },
    messagesSent: { type: Number, required: true },
});

const UserModel = model<User>('User', schema);



export async function incMsg(userID: String): Promise<void> {
    try {
        await connect(DBURI);

        const user = new UserModel({
            userID: userID,
            messagesSent: { $inc: 1 },

        });
        console.log(user.messagesSent);
        await user.save();


    } catch (error) {
        console.error(error);
    }
}