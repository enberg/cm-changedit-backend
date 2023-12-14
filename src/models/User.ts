import { Document, Schema, Model, model, MongooseError } from 'mongoose';
import bcrypt from 'bcrypt';

// En interface ser till att TS kan meddela om fel
// Vi bygger på mongoose's Document
interface IUser extends Document {
    userName: string;
    password: string;
    createdAt: Date;
    updatedAt: Date;
}

// Genom att skapa ett schema i kod kan vi få lite garantier om datan
// Till skillnad mot sql behöver vi inte uppdatera databasen
const UserSchema = new Schema<IUser>({
    userName: {
        type: String,
        required: true, // Varje användare måste ha ett användarnamn
        unique: true, // Varje användarnamn måste vara unikt
        trim: true // Vi vill ta bort alla onödiga mellanslag som kan ha blivit kvar
    },
    password: {
        type: String,
        select: false,
        required: true
    },
 }, {
    timestamps: true
})

// Vi skapar ett mongoose middleware som kör innan användare sparas
UserSchema.pre('save', async function(next) {
    // Vi kör endast om lösenordet ändrats
    if (!this.isModified('password')) return next();

    try {
        // Vi byter ut klartext lösenordet mot vårt hashade
        this.password = await bcrypt.hash(this.password, 10);
        next();
    } catch (error) {
        // Om vi får ett fel som genererats av mongoose så låter vi
        // mongoose hantera det
        if (error instanceof MongooseError) next(error);
        // Annars bubblar vi det uppåt
        else throw error;
    }
})

// model kopplar vårt schema med mongoose och MongoDB
// Mongoose ser till att vi har en User samling
const User = model<IUser>('User', UserSchema);

export default User;