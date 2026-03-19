-- Add Cardiff Dogs Home rescue
-- Required by the collect-cardiff-dogs workflow which queries for a rescue with 'cardiff' in the name

INSERT INTO dogadopt.rescues (name, type, region, website, phone, address, postcode, latitude, longitude)
VALUES (
  'Cardiff Dogs Home',
  'Full',
  'South Wales',
  'www.cardiffdogshome.co.uk',
  '029 2071 1243',
  'Cardiff Dogs Home, Westpoint Industrial Estate, Penarth Road, Cardiff',
  'CF11 8JQ',
  51.4657,
  -3.1935
)
ON CONFLICT (name) DO NOTHING;
