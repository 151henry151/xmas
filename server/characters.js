export const SELLERS = [
  { id: 'rookie', name: 'Rookie Rick', bonus: 0, desc: 'Just learning the lot.' },
  { id: 'hustler', name: 'Hustler Hank', bonus: 1, desc: '+1 persuasion on price talks.' },
  { id: 'charmer', name: 'Charmer Carla', bonus: 1, desc: '+1 on friendly approaches.' },
  { id: 'expert', name: 'Expert Eddie', bonus: 2, desc: 'Veteran closer from Queens lots.' },
];

export const CUSTOMERS = [
  {
    id: 'budget_mom',
    name: 'Budget Mom',
    opening: 'I need something under eighty bucks that still looks full.',
    hp: 4,
    treePrice: 75,
  },
  {
    id: 'fancy_couple',
    name: 'Fancy Couple',
    opening: 'We want a Fraser fir — nothing droopy. Price is secondary.',
    hp: 5,
    treePrice: 180,
  },
  {
    id: 'grumpy_local',
    name: 'Grumpy Local',
    opening: 'Every year you people block the sidewalk. Convince me.',
    hp: 6,
    treePrice: 95,
  },
  {
    id: 'tourist',
    name: 'Lost Tourist',
    opening: 'Is this a real New York Christmas tree? I need a photo op.',
    hp: 4,
    treePrice: 120,
  },
  {
    id: 'dog_owner',
    name: 'Dog Owner',
    opening: 'My husky sheds — will this tree survive apartment heat?',
    hp: 5,
    treePrice: 110,
  },
  {
    id: 'panic',
    name: 'Last-Minute Panic',
    opening: 'Party in two hours. What have you got left?',
    hp: 3,
    treePrice: 140,
  },
  {
    id: 'romp_inspector',
    name: 'Romp Quality Inspector',
    opening: 'Romp Family standards: show me you belong on Jane Street.',
    hp: 8,
    treePrice: 250,
    bossOnly: true,
  },
];

export const VENDOR_NPCS = [
  { id: 'v_mike', name: 'Mike from Midtown Lots', standId: 'times', style: 'aggressive' },
  { id: 'v_sal', name: 'Sal the Union Squarer', standId: 'union', style: 'friendly' },
  { id: 'v_ivy', name: 'Ivy at Columbus Circle', standId: 'columbus', style: 'snooty' },
  { id: 'v_dom', name: 'Dom from Brooklyn Bridge', standId: 'brooklyn', style: 'street' },
  { id: 'v_pat', name: 'Pat at Grand Central', standId: 'grand', style: 'corporate' },
  { id: 'v_lou', name: 'Lou in Washington Square', standId: 'washington', style: 'artsy' },
  { id: 'v_romp', name: 'Uncle Romp', standId: 'romp', style: 'legend', boss: true },
];

export function pickCustomer(standId, isBossStand) {
  const pool = CUSTOMERS.filter((c) => {
    if (c.bossOnly) return isBossStand;
    return !c.bossOnly;
  });
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickVendor(standId) {
  const v = VENDOR_NPCS.find((n) => n.standId === standId);
  return v || VENDOR_NPCS[0];
}
