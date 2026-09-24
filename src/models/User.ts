import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { Document } from "mongoose";

interface IUser extends Document {
  email: string;
  password: string;
  activeToken?: string | null;
  matchPassword(entered: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    activeToken: {
      type: String,
      default: null,
      select: false,
    },
  },
  { timestamps: true }
);

// Hash password
UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = function (entered: string) {
  return bcrypt.compare(entered, this.password);
};

const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
export default User;
