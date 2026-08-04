-- Static reference/lookup data required for development.
-- More inserts will be appended here as development progresses.

INSERT INTO gender (code, label) VALUES
    ('FEMALE', 'Female'),
    ('MALE', 'Male'),
    ('UNIDENTIFIED', 'Unidentified')
ON CONFLICT (code) DO NOTHING;

INSERT INTO rate_set_support_item_pricing_region (code, label, full_label) VALUES
    ('ACT', 'ACT', 'Australian Capital Territory'),
    ('NSW', 'NSW', 'New South Wales'),
    ('NT', 'NT', 'Northern Territory'),
    ('QLD', 'QLD', 'Queensland'),
    ('SA', 'SA', 'South Australia'),
    ('TAS', 'TAS', 'Tasmania'),
    ('VIC', 'VIC', 'Victoria'),
    ('WA', 'WA', 'Western Australia'),
    ('REMOTE', 'Remote', 'Remote'),
    ('VERY_REMOTE', 'Very Remote', 'Very Remote')
ON CONFLICT (code) DO NOTHING;

INSERT INTO client (
    first_name, last_name, gender_id, dob, ndis_number,
    email, phone_number, address, unit_building, pricing_region
) VALUES
    ('Olivia', 'Nguyen', (SELECT id FROM gender WHERE code = 'FEMALE'),
        '1994-03-12', '4301567890', 'olivia.nguyen@example.com', '0412345678',
        '22 Banksia Street', NULL, 'NSW'),

    ('Liam', 'Smith', (SELECT id FROM gender WHERE code = 'MALE'),
        '1988-11-02', '4301567891', 'liam.smith@example.com', '0423456789',
        '8 Wattle Avenue', 'Unit 3', 'VIC'),

    ('Ava', 'Johnson', (SELECT id FROM gender WHERE code = 'FEMALE'),
        '2001-07-19', '4301567892', 'ava.johnson@example.com', '0434567890',
        '15 Grevillea Court', NULL, 'QLD'),

    ('Noah', 'Williams', (SELECT id FROM gender WHERE code = 'MALE'),
        '1976-05-30', '4301567893', 'noah.williams@example.com', '0445678901',
        '101 Eucalypt Road', NULL, 'WA'),

    ('Charlotte', 'Brown', (SELECT id FROM gender WHERE code = 'UNIDENTIFIED'),
        '1999-09-08', '4301567894', 'charlotte.brown@example.com', '0456789012',
        '4 Melaleuca Place', 'Unit 12', 'SA'),

    ('Jack', 'Taylor', (SELECT id FROM gender WHERE code = 'MALE'),
        '1965-01-23', '4301567895', 'jack.taylor@example.com', '0467890123',
        '77 Acacia Drive', NULL, 'TAS'),

    ('Mia', 'Anderson', (SELECT id FROM gender WHERE code = 'FEMALE'),
        '2010-12-15', '4301567896', 'mia.anderson@example.com', '0478901234',
        '3 Bottlebrush Lane', NULL, 'ACT'),

    ('William', 'Thomas', (SELECT id FROM gender WHERE code = 'MALE'),
        '1982-04-04', '4301567897', 'william.thomas@example.com', '0489012345',
        '56 Casuarina Way', 'Unit 5', 'NT'),

    ('Amelia', 'Jackson', (SELECT id FROM gender WHERE code = 'FEMALE'),
        '1993-06-27', '4301567898', 'amelia.jackson@example.com', '0490123456',
        '19 Paperbark Crescent', NULL, 'REMOTE'),

    ('Ethan', 'White', (SELECT id FROM gender WHERE code = 'MALE'),
        '1970-10-11', '4301567899', 'ethan.white@example.com', '0401234567',
        '2 Ironbark Terrace', NULL, 'VERY_REMOTE')
ON CONFLICT (ndis_number) WHERE deleted_at IS NULL DO NOTHING;
