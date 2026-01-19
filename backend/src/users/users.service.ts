import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email: email.toLowerCase().trim() }).exec();
  }

  async createUser(params: {
    email: string;
    passwordHash: string;
  }): Promise<UserDocument> {
    try {
      const created = new this.userModel({
        email: params.email.toLowerCase().trim(),
        passwordHash: params.passwordHash,
      });
      return await created.save();
    } catch (err: any) {
      // Duplicate key error
      if (err?.code === 11000) {
        throw new ConflictException('Email already registered');
      }
      throw err;
    }
  }
}
