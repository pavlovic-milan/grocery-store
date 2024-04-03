import { FacilityType } from '../../src/enums/FacilityType';
import { FacilityModel } from '../../src/models/Facility';

export const mockFacility = (
  overrides: Partial<FacilityModel> = {}
): Partial<FacilityModel> => ({
  _id: '1',
  name: 'Facility',
  type: FacilityType.STORE,
  ...overrides,
});
