import { ObjectId } from 'mongodb';
import Facility from '../models/Facility';

// function for getting all descendant facility ids together with provided parent facility id
export const getRelevantFacilityIds = async (
  parentFacilityId: string
): Promise<ObjectId[]> => {
  const parentFacilityObjectId = new ObjectId(parentFacilityId);
  const pipeline = [
    { $match: { _id: parentFacilityObjectId } },

    {
      $graphLookup: {
        from: 'facilities',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'descendants',
      },
    },

    { $unwind: '$descendants' },

    { $project: { descendantId: '$descendants._id' } },
  ];

  const result = await Facility.aggregate(pipeline);

  const descendantIds: ObjectId[] = result.map((doc) => doc.descendantId);

  return [parentFacilityObjectId, ...descendantIds];
};
