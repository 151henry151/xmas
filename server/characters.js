export const SELLERS = [
  { id: 'rookie', name: 'Rookie Rick', bonus: 0, desc: 'Learning the ropes on the sidewalk.' },
  { id: 'hustler', name: 'Hustler Hank', bonus: 1, desc: '+1 on price and closing lines.' },
  { id: 'charmer', name: 'Charmer Carla', bonus: 1, desc: '+1 on friendly and story beats.' },
  { id: 'expert', name: 'Expert Eddie', bonus: 2, desc: 'Veteran closer; reads customers fast.' },
];

export const CUSTOMERS = [
  {
    id: 'budget_mom',
    name: 'Budget Mom',
    opening: 'I need something under eighty bucks that still looks full for the kids.',
    resistance: 70,
    basePrice: 75,
    prefer: 'budget',
  },
  {
    id: 'fancy_couple',
    name: 'Fancy Couple',
    opening: 'We want a Fraser fir — nothing droopy. Price is secondary.',
    resistance: 85,
    basePrice: 195,
    prefer: 'premium',
  },
  {
    id: 'grumpy_local',
    name: 'Grumpy Local',
    opening: 'Every year you people block the sidewalk. Convince me.',
    resistance: 90,
    basePrice: 95,
    prefer: 'classic',
  },
  {
    id: 'tourist',
    name: 'Lost Tourist',
    opening: 'Is this a real New York Christmas tree? I need a photo for Instagram.',
    resistance: 55,
    basePrice: 130,
    prefer: 'family',
  },
  {
    id: 'dog_owner',
    name: 'Dog Owner',
    opening: 'My husky sheds — will this tree survive apartment heat?',
    resistance: 65,
    basePrice: 110,
    prefer: 'family',
  },
  {
    id: 'panic',
    name: 'Last-Minute Panic',
    opening: 'Party in two hours! Walk-up on ten — no elevator!',
    resistance: 50,
    basePrice: 155,
    prefer: 'family',
  },
  {
    id: 'influencer',
    name: 'TikTok Influencer',
    opening: 'Need a tall asymmetrical tree for content. Got anything photogenic?',
    resistance: 60,
    basePrice: 175,
    prefer: 'premium',
  },
  {
    id: 'landlord',
    name: 'Building Super',
    opening: 'Co-op board allows max six feet and no flocking in the lobby.',
    resistance: 75,
    basePrice: 140,
    prefer: 'classic',
  },
  {
    id: 'charity',
    name: 'Church Volunteer',
    opening: 'Buying for the shelter — five trees, tight budget, big hearts.',
    resistance: 80,
    basePrice: 60,
    prefer: 'budget',
    bulk: true,
  },
  {
    id: 'romp_inspector',
    name: 'Romp Quality Inspector',
    opening: 'Romp Family standards: show me you belong on Jane Street.',
    resistance: 100,
    basePrice: 280,
    prefer: 'premium',
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
  return { ...pool[Math.floor(Math.random() * pool.length)] };
}

export function pickVendor(standId) {
  return VENDOR_NPCS.find((n) => n.standId === standId) || VENDOR_NPCS[0];
}
