export const SEGMENT_OPTIONS = ['Personal', 'Commercial', 'BEV'];

const PERSONAL_PROFILE_OPTIONS = [
  'Govt Salaried',
  'Pvt Salaried',
  'Self Employed/Business',
  'Contractor',
  'Retired',
  'Army',
  'Agriculturist',
  'Student',
  'Other',
];

const COMMERCIAL_PROFILE_OPTIONS = ['Captive', 'Market load operator'];

export const PROFILE_OPTIONS_BY_SEGMENT = {
  Personal: PERSONAL_PROFILE_OPTIONS,
  Commercial: COMMERCIAL_PROFILE_OPTIONS,
  BEV: PERSONAL_PROFILE_OPTIONS,
};

export const CRE_VALIDATION_OPTIONS = ['Valid', 'Invalid', 'Duplicate'];
export const CRE_TAG_OPTIONS = ['Hot', 'Warm', 'Cold'];

export const SM_STATUS_OPTIONS = [
  'Test Drive Scheduled',
  'Test Drive Done',
  'Booking Done',
  'Follow-up',
  'Not Interested',
  'Lost',
];

export const ASM_STATUS_OPTIONS = ['Converted', 'Pending', 'Lost', 'Dropped'];

export const STAGE_LABELS = {
  CREATED: 'Awaiting CRE Validation',
  CRE_TAGGED: 'Awaiting SM Status',
  SM_TAGGED: 'Awaiting ASM Final Tag',
  ASM_TAGGED: 'Closed',
};

export const ROLE_LABELS = {
  SC: 'Sales Consultant',
  CRE: 'Customer Relationship Executive',
  SM: 'Sales Manager',
  ASM: 'Area Sales Manager',
};
