import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isValidFandmEmail,
  extractInitials,
  formatPrice,
  buildMetaLine,
  filterAndSortListings,
} from './filter';
import { ListingItem } from '../types';

test('email validation only accepts valid @fandm.edu addresses', () => {
  assert.equal(isValidFandmEmail('student@fandm.edu'), true);
  assert.equal(isValidFandmEmail('nlathi@fandm.edu'), true);
  assert.equal(isValidFandmEmail('prof.smith@fandm.edu'), true);
  assert.equal(isValidFandmEmail('student@gmail.com'), false);
  assert.equal(isValidFandmEmail('fake@fandm.com'), false);
  assert.equal(isValidFandmEmail(''), false);
  assert.equal(isValidFandmEmail('notanemail'), false);
});

test('extractInitials computes standard two-letter initials', () => {
  assert.equal(extractInitials('john.doe@fandm.edu'), 'JD');
  assert.equal(extractInitials('alexandra@fandm.edu'), 'AL');
  assert.equal(extractInitials('Sarah Jenkins'), 'SJ');
});

test('formatPrice correctly handles zero as Free', () => {
  assert.equal(formatPrice(0), 'Free');
  assert.equal(formatPrice(15), '$15');
  assert.equal(formatPrice(150), '$150');
});

test('buildMetaLine drops empty fields cleanly without gaps', () => {
  assert.equal(
    buildMetaLine({ size: 'M', brand: 'Nike', condition: 'Good' }),
    'M • Nike • Good'
  );
  assert.equal(
    buildMetaLine({ brand: 'Patagonia', condition: 'Like New' }),
    'Patagonia • Like New'
  );
  assert.equal(
    buildMetaLine({ condition: 'New' }),
    'New'
  );
});

test('filterAndSortListings excludes sold items from public marketplace', () => {
  const dummyItems: ListingItem[] = [
    {
      id: '1',
      name: 'Item 1',
      price: 20,
      condition: 'Good',
      photos: ['https://example.com/1.jpg'],
      sellerName: 'Alice',
      sellerEmail: 'alice@fandm.edu',
      sellerInitials: 'AL',
      createdAt: new Date().toISOString(),
      status: 'available',
      category: 'marketplace',
    },
    {
      id: '2',
      name: 'Item 2',
      price: 0,
      condition: 'Fair',
      photos: ['https://example.com/2.jpg'],
      sellerName: 'Bob',
      sellerEmail: 'bob@fandm.edu',
      sellerInitials: 'BO',
      createdAt: new Date().toISOString(),
      status: 'sold',
      category: 'marketplace',
    },
  ];

  const publicListings = filterAndSortListings(dummyItems, {
    sort: 'newest',
    includeSold: false,
  });
  assert.equal(publicListings.length, 1);
  assert.equal(publicListings[0].id, '1');

  const withSold = filterAndSortListings(dummyItems, {
    sort: 'newest',
    includeSold: true,
  });
  assert.equal(withSold.length, 2);
});

test('filterAndSortListings filters accurately by price range including Free ($0)', () => {
  const dummyItems: ListingItem[] = [
    {
      id: 'free',
      name: 'Free Mug',
      price: 0,
      condition: 'Good',
      photos: [],
      sellerName: 'Alice',
      sellerEmail: 'alice@fandm.edu',
      sellerInitials: 'AL',
      createdAt: new Date().toISOString(),
      status: 'available',
      category: 'marketplace',
    },
    {
      id: 'mid',
      name: 'Desk Lamp',
      price: 25,
      condition: 'Like New',
      photos: [],
      sellerName: 'Charlie',
      sellerEmail: 'charlie@fandm.edu',
      sellerInitials: 'CH',
      createdAt: new Date().toISOString(),
      status: 'available',
      category: 'marketplace',
    },
    {
      id: 'high',
      name: 'Microfridge',
      price: 80,
      condition: 'Good',
      photos: [],
      sellerName: 'Dana',
      sellerEmail: 'dana@fandm.edu',
      sellerInitials: 'DA',
      createdAt: new Date().toISOString(),
      status: 'available',
      category: 'marketplace',
    },
  ];

  const onlyFree = filterAndSortListings(dummyItems, {
    sort: 'newest',
    minPrice: 0,
    maxPrice: 0,
  });
  assert.equal(onlyFree.length, 1);
  assert.equal(onlyFree[0].id, 'free');

  const under30 = filterAndSortListings(dummyItems, {
    sort: 'newest',
    minPrice: 0,
    maxPrice: 30,
  });
  assert.equal(under30.length, 2);
});
