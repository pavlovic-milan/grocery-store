import Facility from '../../../src/models/Facility';
import { getRelevantFacilityIds } from '../../../src/utils/getRelevantFacilityIds';

jest.mock('mongodb');
jest.mock('../../../src/models/Facility', () => ({
  aggregate: jest.fn(),
}));

describe('getRelevantFacilityIds unit tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  it('will call Facility.aggregate and return its mapped response', async () => {
    // arrange
    const parentFacilityId = 'parentFacilityId';
    (Facility.aggregate as jest.Mock).mockResolvedValue([
      { id: '1', descendantId: '2' },
      { id: '2', descendantId: '3' },
    ]);

    // act
    const response = await getRelevantFacilityIds(parentFacilityId);

    // assert
    expect(Facility.aggregate).toHaveBeenCalledTimes(1);
    expect(response).toEqual(expect.arrayContaining(['2', '3']));
  });
});
