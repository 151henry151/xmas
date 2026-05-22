import { pickCustomer } from './characters.js';

const DIALOG = {
  budget_mom: [
    {
      text: 'She eyes a six-foot balsam. "That one says ninety on the tag."',
      choices: [
        { label: 'Offer a fresh-cut special at seventy-five.', score: 3, reply: 'She smiles. "Deal — wrap it up."' },
        { label: 'Insist premium trees start at one-twenty.', score: -2, reply: 'She walks toward the subway.' },
        { label: 'Point at the park lot across the street.', score: -1, reply: '"Rude." She leaves.' },
      ],
    },
    {
      text: '"Does it shed? My kid has allergies."',
      choices: [
        { label: 'Recommend a low-shed Douglas fir.', score: 2, reply: '"Okay, show me that one."' },
        { label: 'Say all trees shed equally.', score: -1, reply: 'She looks doubtful.' },
        { label: 'Offer a free stand and net.', score: 3, reply: '"You know how to sell."' },
      ],
    },
  ],
  fancy_couple: [
    {
      text: '"We saw a sad tree on 6th Ave. Yours better be worth it."',
      choices: [
        { label: 'Walk them to your freshest Fraser.', score: 3, reply: '"Now that\'s shape."' },
        { label: 'Complain about competition.', score: -2, reply: 'They exchange a look and leave.' },
        { label: 'Offer champagne and delivery.', score: 2, reply: '"Delivery by when?"' },
      ],
    },
    {
      text: '"Our doorman hates needles in the lobby."',
      choices: [
        { label: 'Promise burlap wrap and lobby drop.', score: 3, reply: '"Book it."' },
        { label: 'Tell them to tip the doorman.', score: 0, reply: 'Neutral — they hesitate.' },
        { label: 'Say they should buy plastic.', score: -3, reply: 'They walk off laughing.' },
      ],
    },
  ],
  grumpy_local: [
    {
      text: '"You blocked my dog\'s hydrant last year."',
      choices: [
        { label: 'Apologize and move the display six inches.', score: 2, reply: 'He grunts approval.' },
        { label: 'Argue about city permits.', score: -3, reply: '"Enjoy your needles alone."' },
        { label: 'Offer a neighborhood discount card.', score: 1, reply: 'He pauses.' },
      ],
    },
    {
      text: '"Why should I buy from you?"',
      choices: [
        { label: 'Same family lot fifteen years on this corner.', score: 3, reply: '"Fine. Medium spruce."' },
        { label: 'Because you look cold.', score: -1, reply: '"Don\'t patronize me."' },
        { label: 'Free hot cider while you browse.', score: 2, reply: 'He sips. "Alright."' },
      ],
    },
  ],
  tourist: [
    {
      text: '"Will the tree fit in my Uber to JFK?"',
      choices: [
        { label: 'Suggest a tabletop tree with ornaments.', score: 3, reply: '"Perfect for Instagram!"' },
        { label: 'Sell the tallest tree on the lot.', score: -2, reply: 'Uber driver shakes his head.' },
        { label: 'Offer shipping to their hotel.', score: 2, reply: '"New York service!"' },
      ],
    },
  ],
  dog_owner: [
    {
      text: 'The husky sniffs a spruce.',
      choices: [
        { label: 'Recommend a sturdy Noble fir.', score: 2, reply: 'Dog approves. Owner nods.' },
        { label: 'Yell at the dog.', score: -3, reply: 'They leave offended.' },
        { label: 'Offer pet-safe flocking.', score: 1, reply: '"Maybe next year."' },
      ],
    },
  ],
  panic: [
    {
      text: '"Two hours! Apartment on 10th floor, no elevator!"',
      choices: [
        { label: 'Grab a pre-wrapped slim tree + express carry.', score: 3, reply: '"You\'re a lifesaver!"' },
        { label: 'Suggest they throw a wreath party instead.', score: -2, reply: '"Not funny."' },
        { label: 'Call your cousin with a van — extra fee.', score: 2, reply: '"Do it!"' },
      ],
    },
  ],
  romp_inspector: [
    {
      text: 'The inspector folds his arms. "Romp Family doesn\'t hire tourists."',
      choices: [
        { label: 'Recite your season stats and customer wins.', score: 3, reply: 'He nods once.' },
        { label: 'Brag about other cities.', score: -2, reply: '"This is Jane Street."' },
        { label: 'Ask what the Romp family values most.', score: 2, reply: '"Loyalty and hustle."' },
      ],
    },
    {
      text: '"Sell me this tree like I\'m your toughest customer."',
      choices: [
        { label: 'Lead with heritage, then close on service.', score: 3, reply: '"You\'ve got Romp blood."' },
        { label: 'Drop the price immediately.', score: -1, reply: '"We don\'t discount prestige."' },
        { label: 'Offer to work the lot opening week unpaid.', score: 2, reply: 'Almost there…' },
      ],
    },
  ],
};

const VENDOR_LINES = {
  aggressive: {
    opening: 'Mike smirks. "My lot moved twelve trees before lunch. Beat that."',
    choices: [
      { label: 'Compare foot traffic honestly and pitch your quality.', score: 2 },
      { label: 'Trash-talk his flocked trees.', score: -1 },
      { label: 'Propose a friendly wager on evening sales.', score: 3 },
    ],
  },
  friendly: {
    opening: 'Sal waves. "Union Square\'s packed — share a coffee?"',
    choices: [
      { label: 'Trade tips on tourist peaks.', score: 3 },
      { label: 'Ignore him and hawk louder.', score: -2 },
      { label: 'Ask to split a wholesale delivery.', score: 2 },
    ],
  },
  snooty: {
    opening: 'Ivy looks you up and down. "Columbus Circle clients have standards."',
    choices: [
      { label: 'Compliment her display and ask advice.', score: 3 },
      { label: 'Say downtown lots are grittier anyway.', score: -1 },
      { label: 'Offer to swap spare noble firs.', score: 2 },
    ],
  },
  street: {
    opening: 'Dom leans on a fence. "Brooklyn buyers smell fear."',
    choices: [
      { label: 'Keep it real — family business story.', score: 3 },
      { label: 'Pretend you\'re from Manhattan only.', score: -2 },
      { label: 'Challenge him to best single sale tonight.', score: 2 },
    ],
  },
  corporate: {
    opening: 'Pat checks a tablet. "Grand Central commuters want speed."',
    choices: [
      { label: 'Pitch express net-and-go bundles.', score: 3 },
      { label: 'Complain about permits.', score: 0 },
      { label: 'Undercut prices by half.', score: -2 },
    ],
  },
  artsy: {
    opening: 'Lou gestures at the arch. "Washington Square wants character."',
    choices: [
      { label: 'Describe hand-selected asymmetrical trees.', score: 3 },
      { label: 'Insist bigger is always better.', score: -1 },
      { label: 'Offer student discounts.', score: 2 },
    ],
  },
  legend: {
    opening: 'Uncle Romp grins. "Think you can handle Jane Street?"',
    choices: [
      { label: 'Thank him and ask to shadow the best closer.', score: 3 },
      { label: 'Boast about your online sales.', score: -2 },
      { label: 'Present three references from other stands.', score: 2 },
    ],
  },
};

export function startSaleBattle(stand, sellerBonus = 0) {
  const customer = pickCustomer(stand.id, stand.boss);
  const rounds = DIALOG[customer.id] || DIALOG.budget_mom;
  return {
    type: 'sale',
    customer,
    roundIndex: 0,
    hp: customer.hp,
    maxHp: customer.hp,
    patience: customer.hp,
    sellerBonus,
    rounds,
    won: false,
    lost: false,
    earnings: 0,
  };
}

export function startVendorBattle(vendor) {
  const line = VENDOR_LINES[vendor.style] || VENDOR_LINES.friendly;
  return {
    type: 'vendor',
    vendor,
    roundIndex: 0,
    hp: 4,
    maxHp: 4,
    patience: 4,
    opening: line.opening,
    choices: line.choices.map((c) => ({ ...c, reply: c.score >= 2 ? 'Respect earned.' : c.score < 0 ? 'Tension rises.' : 'Staredown continues.' })),
    won: false,
    lost: false,
  };
}

export function getCurrentRound(battle) {
  if (battle.type === 'vendor') {
    return { text: battle.opening, choices: battle.choices };
  }
  const rounds = battle.rounds;
  const r = rounds[battle.roundIndex];
  if (!r) return null;
  return { text: r.text, choices: r.choices };
}

export function applyChoice(battle, choiceIndex) {
  const round = getCurrentRound(battle);
  if (!round) return { error: 'no_round' };
  const choice = round.choices[choiceIndex];
  if (!choice) return { error: 'bad_choice' };

  let dmg = 0;
  if (battle.type === 'sale') {
    const score = (choice.score || 0) + (battle.sellerBonus || 0);
    if (score >= 2) dmg = 2;
    else if (score === 1) dmg = 1;
    else if (score === 0) dmg = 0;
    else dmg = -1;
  } else {
    const score = choice.score || 0;
    dmg = score >= 2 ? 2 : score >= 0 ? 1 : -1;
  }

  battle.patience = Math.max(0, Math.min(battle.maxHp, battle.patience - dmg));
  const reply = choice.reply || '…';
  let phase = 'continue';

  if (battle.type === 'sale') {
    if (battle.patience <= 0) {
      battle.won = true;
      battle.earnings = battle.customer.treePrice;
      phase = 'won';
    } else if (dmg < 0 && battle.patience <= 2 && Math.random() < 0.35) {
      battle.lost = true;
      phase = 'lost';
    } else if (battle.roundIndex >= battle.rounds.length - 1) {
      if (battle.patience >= 2) {
        battle.won = true;
        battle.earnings = Math.floor(battle.customer.treePrice * 0.85);
        phase = 'won';
      } else {
        battle.lost = true;
        phase = 'lost';
      }
    } else {
      battle.roundIndex += 1;
    }
  } else {
    if (battle.patience <= 0) {
      battle.won = true;
      phase = 'won';
    } else if (dmg < 0) {
      battle.lost = true;
      phase = 'lost';
    } else {
      battle.won = true;
      phase = 'won';
    }
  }

  return { reply, phase, battle, dmg };
}
