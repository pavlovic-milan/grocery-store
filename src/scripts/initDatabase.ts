import mongoose from 'mongoose';
import Facility, { FacilityModel } from '../models/Facility';
import { FacilityType } from '../enums/FacilityType';
import { config } from 'dotenv';
import { UserRole } from '../enums/UserRole';
import User from '../models/User';
import bcrypt from 'bcrypt';

config();

async function initDatabase() {
  const mongoURL = `mongodb://${process.env.DATABASE_USERNAME}:${process.env.DATABASE_PASSWORD}@${process.env.DATABASE_HOST}:${process.env.DATABASE_PORT}/${process.env.DATABASE_NAME}`;

  try {
    await mongoose.connect(mongoURL);

    await seedDatabase();
  } catch (error) {
    console.error('Initialization of database failed:', error);
  } finally {
    mongoose.disconnect();
  }
}

async function seedDatabase() {
  const facilityCount = await Facility.countDocuments();
  if (facilityCount) {
    console.log('Database already initiliazed');
    return;
  }

  const rootFacility: FacilityModel = await Facility.create({
    name: 'Srbija',
    type: FacilityType.STORE,
  });

  const storeFacility1: FacilityModel = await Facility.create({
    name: 'Grad Beograd',
    type: FacilityType.STORE,
    parentId: rootFacility._id,
  });

  const storeFacility2: FacilityModel = await Facility.create({
    name: 'Vojvodina',
    type: FacilityType.STORE,
    parentId: rootFacility._id,
  });

  const storeFacility3: FacilityModel = await Facility.create({
    name: 'Novi Beograd',
    type: FacilityType.STORE,
    parentId: storeFacility1._id,
  });

  const officeFacilities: FacilityModel[] = await Facility.insertMany([
    {
      name: 'Radnja 1',
      type: FacilityType.OFFICE,
      parentId: storeFacility2._id,
    },
    {
      name: 'Radnja 2',
      type: FacilityType.OFFICE,
      parentId: storeFacility3._id,
    },
  ]);

  await User.insertMany([
    {
      name: 'User 1',
      role: UserRole.MANAGER,
      username: 'user1',
      password: bcrypt.hashSync('password1', 10),
      facilityId: rootFacility._id,
    },
    {
      name: 'User 2',
      role: UserRole.EMPLOYEE,
      username: 'user2',
      password: bcrypt.hashSync('password2', 10),
      facilityId: rootFacility._id,
    },
    {
      name: 'User 3',
      role: UserRole.MANAGER,
      username: 'user3',
      password: bcrypt.hashSync('password3', 10),
      facilityId: storeFacility1._id,
    },
    {
      name: 'User 4',
      role: UserRole.MANAGER,
      username: 'user4',
      password: bcrypt.hashSync('password4', 10),
      facilityId: storeFacility2._id,
    },
    {
      name: 'User 5',
      role: UserRole.MANAGER,
      username: 'user5',
      password: bcrypt.hashSync('password5', 10),
      facilityId: storeFacility3._id,
    },
    {
      name: 'User 6',
      role: UserRole.EMPLOYEE,
      username: 'user6',
      password: bcrypt.hashSync('password6', 10),
      facilityId: officeFacilities[0]._id,
    },
    {
      name: 'User 7',
      role: UserRole.EMPLOYEE,
      username: 'user7',
      password: bcrypt.hashSync('password7', 10),
      facilityId: officeFacilities[1]._id,
    },
  ]);

  console.log('Initialization of database completed');
}

initDatabase();
