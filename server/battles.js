import { pickCustomer, pickVendor } from './characters.js';

const DIALOG = {
  budget_mom: [
    {
      text: 'She points at a six-foot balsam. "Tag says ninety. That\'s not happening."',
      choices: [
        { label: 'Offer a fresh-cut special at seventy-five with free twine.', score: 3, reply: '"You know how to talk. Wrap it."' },
        { label: 'Insist premium trees start at one-twenty.', score: -2, reply: 'She heads for the subway entrance.' },
        { label: 'Point at the rival lot — "They\'re cheaper."', score: -1, reply: '"Then go there." She leaves.' },
      ],
    },
    {
      text: '"Does it shed? My kid has allergies."',
      choices: [
        { label: 'Recommend a low-shed Douglas fir from Maine.', score: 3, reply: '"Show me that one."' },
        { label: 'Say all real trees shed — deal with it.', score: -2, reply: 'She looks offended.' },
        { label: 'Offer a free stand, net, and delivery to the curb.', score: 2, reply: '"Okay… if delivery is included."' },
      ],
    },
    {
      text: '"I need it in the minivan. Will it fit?"',
      choices: [
        { label: 'Measure the roof rack together and pick a slim balsam.', score: 3, reply: '"Perfect. Ring it up."' },
        { label: 'Sell the tallest tree on the lot.', score: -3, reply: 'Minivan door won\'t close. She storms off.' },
      ],
    },
  ],
  fancy_couple: [
    {
      text: '"We saw a sad tree on Sixth. Yours better be worth the schlep."',
      choices: [
        { label: 'Walk them to your freshest Fraser with even branches.', score: 3, reply: '"Now that\'s a tree."' },
        { label: 'Complain about city permits and weather.', score: -2, reply: 'They exchange a look and leave.' },
        { label: 'Offer champagne delivery and white-glove setup.', score: 2, reply: '"When can you deliver?"' },
      ],
    },
    {
      text: '"Our doorman hates needles in the marble lobby."',
      choices: [
        { label: 'Promise burlap wrap, lobby mat, and timed drop.', score: 3, reply: '"Book it for Saturday."' },
        { label: 'Tell them to tip the doorman extra.', score: 0, reply: 'They hesitate…' },
        { label: 'Suggest a plastic tree from Amazon.', score: -3, reply: 'They laugh and walk off.' },
      ],
    },
  ],
  grumpy_local: [
    {
      text: '"You blocked my dog\'s hydrant last year."',
      choices: [
        { label: 'Apologize and shift the display six inches east.', score: 2, reply: 'He grunts. "Fine."' },
        { label: 'Argue about DOT permits.', score: -3, reply: '"Enjoy freezing alone."' },
        { label: 'Offer a neighborhood loyalty card — tenth tree free.', score: 2, reply: 'He pauses. "Maybe."' },
      ],
    },
    {
      text: '"Why should I buy from you?"',
      choices: [
        { label: 'Same family corner fifteen years — you know us.', score: 3, reply: '"Medium spruce. Don\'t gouge me."' },
        { label: 'Because you look cold.', score: -1, reply: '"Don\'t patronize me."' },
        { label: 'Free hot cider while he picks.', score: 2, reply: 'He sips. "Alright."' },
      ],
    },
  ],
  tourist: [
    {
      text: '"Will the tree fit in my Uber to JFK tomorrow?"',
      choices: [
        { label: 'Sell a tabletop tree plus NYC ornament bundle.', score: 3, reply: '"Perfect for the \'gram!"' },
        { label: 'Sell the nine-foot noble anyway.', score: -2, reply: 'Uber driver refuses. They leave.' },
        { label: 'Ship to their hotel — flat rate.', score: 2, reply: '"That\'s real New York service!"' },
      ],
    },
    {
      text: '"Which tree looks most like Rockefeller Center?"',
      choices: [
        { label: 'Pick a symmetrical spruce and tell the story of the city.', score: 3, reply: 'They buy immediately.' },
        { label: 'Say they should just visit the plaza.', score: -1, reply: 'They shrug and walk away.' },
      ],
    },
  ],
  dog_owner: [
    {
      text: 'The husky sniffs every trunk.',
      choices: [
        { label: 'Recommend a sturdy Noble fir — low fragrance.', score: 2, reply: 'Dog sits. Owner nods.' },
        { label: 'Yell at the dog to get off the netting.', score: -3, reply: 'They leave offended.' },
        { label: 'Offer pet-safe flocking and a chew toy.', score: 1, reply: '"Maybe next year."' },
      ],
    },
    {
      text: '"Apartment radiator is right next to the tree."',
      choices: [
        { label: 'Suggest Douglas fir and a water tray reminder.', score: 3, reply: '"Sold — if it lasts till New Year."' },
        { label: 'Promise it will be fine — no details.', score: -1, reply: 'They look skeptical.' },
      ],
    },
  ],
  panic: [
    {
      text: '"Two hours! Tenth floor walk-up!"',
      choices: [
        { label: 'Pre-wrapped slim tree + cousin\'s van in twenty minutes.', score: 3, reply: '"You\'re a lifesaver!"' },
        { label: 'Suggest a wreath party instead.', score: -2, reply: '"Not funny."' },
        { label: 'Call your cousin — express fee $40.', score: 2, reply: '"Do it!"' },
      ],
    },
  ],
  influencer: [
    {
      text: '"Needs to look chaotic-chic on camera."',
      choices: [
        { label: 'Pick an asymmetrical Fraser and offer to hold lights.', score: 3, reply: '"Content gold. Buying."' },
        { label: 'Insist on the perfect symmetrical tree only.', score: -2, reply: '"Boring." She leaves.' },
      ],
    },
    {
      text: '"Can you throw in a discount code for my followers?"',
      choices: [
        { label: 'Offer 10% if she tags the stand.', score: 2, reply: '"Deal — free marketing."' },
        { label: 'Refuse — "Trees aren\'t content."', score: -2, reply: 'She rolls her eyes and goes.' },
      ],
    },
  ],
  landlord: [
    {
      text: '"Co-op allows six feet max, no flocking."',
      choices: [
        { label: 'Show a measured five-foot spruce with lobby wrap.', score: 3, reply: '"Board will approve that."' },
        { label: 'Push a seven-foot flocked tree.', score: -3, reply: '"Absolutely not."' },
      ],
    },
    {
      text: '"Need invoice for the building corp."',
      choices: [
        { label: 'Write a proper receipt with your permit number.', score: 2, reply: '"Professional. Okay."' },
        { label: 'Say you only do cash.', score: -2, reply: 'He walks to another lot.' },
      ],
    },
  ],
  charity: [
    {
      text: '"Five trees for the shelter — what\'s your best on balsam?"',
      choices: [
        { label: 'Bundle five balsams at cost + free delivery.', score: 3, reply: '"God bless you. Sold."' },
        { label: 'Charge full retail — "charity still costs."', score: -3, reply: 'Volunteer walks away sad.' },
        { label: 'Donate one tree, discount four.', score: 2, reply: '"We\'ll take it. Thank you."' },
      ],
    },
  ],
  romp_inspector: [
    {
      text: 'Inspector folds his arms. "Romp Family doesn\'t hire tourists."',
      choices: [
        { label: 'Recite season stats, reputation, and customer wins.', score: 3, reply: 'He nods once.' },
        { label: 'Brag about selling in Boston.', score: -2, reply: '"This is Jane Street."' },
        { label: 'Ask what the Romp family values most.', score: 2, reply: '"Loyalty and hustle."' },
      ],
    },
    {
      text: '"Sell me this Noble like I\'m your toughest customer."',
      choices: [
        { label: 'Heritage first, then service, then close.', score: 3, reply: '"You\'ve got Romp blood."' },
        { label: 'Drop price twenty percent immediately.', score: -1, reply: '"We don\'t discount prestige."' },
        { label: 'Offer opening week unpaid to prove yourself.', score: 2, reply: 'Almost there…' },
      ],
    },
    {
      text: '"What do you do when the city inspector shows up?"',
      choices: [
        { label: 'Permits in pocket, smile, offer coffee.', score: 3, reply: '"Welcome to the family lot."' },
        { label: 'Pack up and run.', score: -3, reply: '"Not Romp material."' },
      ],
    },
  ],
};

const VENDOR_ROUNDS = {
  aggressive: [
    {
      text: 'Mike smirks. "Twelve trees before lunch. Beat that."',
      choices: [
        { label: 'Compare traffic honestly — pitch quality over volume.', score: 3, reply: 'He respects the honesty.' },
        { label: 'Trash his flocked trees.', score: -2, reply: 'Tension spikes.' },
        { label: 'Wager on evening sales — handshake.', score: 2, reply: '"You\'re on."' },
      ],
    },
    {
      text: '"Customers say your prices are soft."',
      choices: [
        { label: 'Explain value: delivery, fresh cut, service.', score: 2, reply: 'He grunts approval.' },
        { label: 'Admit you\'re desperate.', score: -2, reply: 'He smirks and walks off.' },
      ],
    },
  ],
  friendly: [
    {
      text: 'Sal waves. "Union Square\'s packed — coffee?"',
      choices: [
        { label: 'Trade tips on tourist peaks and lunch rush.', score: 3, reply: 'You share a laugh.' },
        { label: 'Ignore him and yell at passersby.', score: -2, reply: 'He shakes his head.' },
        { label: 'Propose splitting a wholesale truck.', score: 2, reply: '"Call me Tuesday."' },
      ],
    },
  ],
  snooty: [
    {
      text: 'Ivy looks you up and down. "Columbus clients have standards."',
      choices: [
        { label: 'Compliment her display — ask for advice.', score: 3, reply: 'She softens.' },
        { label: 'Say downtown lots are grittier anyway.', score: -1, reply: 'Cold stare.' },
        { label: 'Offer to swap spare Noble firs.', score: 2, reply: '"Maybe."' },
      ],
    },
  ],
  street: [
    {
      text: 'Dom leans on the fence. "Brooklyn buyers smell fear."',
      choices: [
        { label: 'Family business story — no bluff.', score: 3, reply: 'Respect earned.' },
        { label: 'Pretend you only sell Manhattan.', score: -2, reply: 'He laughs at you.' },
      ],
    },
  ],
  corporate: [
    {
      text: 'Pat checks a tablet. "Commuters want speed."',
      choices: [
        { label: 'Pitch express net-and-go bundles.', score: 3, reply: '"Smart."' },
        { label: 'Complain about permits for ten minutes.', score: -1, reply: 'He stops listening.' },
      ],
    },
  ],
  artsy: [
    {
      text: 'Lou gestures at the arch. "Character over height."',
      choices: [
        { label: 'Describe hand-picked asymmetrical trees.', score: 3, reply: '"Poetry. I like it."' },
        { label: 'Insist bigger is always better.', score: -2, reply: 'He sighs.' },
      ],
    },
  ],
  legend: [
    {
      text: 'Uncle Romp grins. "Think you can handle Jane Street?"',
      choices: [
        { label: 'Ask to shadow the best closer next week.', score: 3, reply: '"Show up at six a.m."' },
        { label: 'Brag about online sales.', score: -2, reply: '"This is a sidewalk lot."' },
        { label: 'Present references from three other stands.', score: 2, reply: '"We will see."' },
      ],
    },
    {
      text: '"What\'s the Romp secret?"',
      choices: [
        { label: 'Treat every tree like it\'s going to a family living room.', score: 3, reply: '"You might last here."' },
        { label: 'Say it\'s all about markup.', score: -3, reply: 'He turns away.' },
      ],
    },
  ],
};

export function startSaleBattle(stand, sellerBonus, tree, priceMult = 1) {
  const customer = pickCustomer(stand.id, stand.boss);
  const rounds = [...(DIALOG[customer.id] || DIALOG.budget_mom)];
  const base = Math.floor(customer.basePrice * priceMult * (tree?.cost ? 1 + tree.cost / 80 : 1));
  return {
    type: 'sale',
    customer,
    tree,
    roundIndex: 0,
    resistance: customer.resistance,
    maxResistance: customer.resistance,
    sellerBonus,
    rounds,
    won: false,
    lost: false,
    earnings: 0,
    basePrice: base,
  };
}

export function startVendorBattle(vendor) {
  const rounds = [...(VENDOR_ROUNDS[vendor.style] || VENDOR_ROUNDS.friendly)];
  return {
    type: 'vendor',
    vendor,
    roundIndex: 0,
    resistance: 60,
    maxResistance: 60,
    rounds,
    won: false,
    lost: false,
    repGain: 0,
  };
}

export function getCurrentRound(battle) {
  const rounds = battle.rounds;
  const r = rounds[battle.roundIndex];
  if (!r) return null;
  return { text: r.text, choices: r.choices };
}

function scoreToDelta(score, bonus) {
  const s = score + bonus;
  if (s >= 3) return 28;
  if (s === 2) return 20;
  if (s === 1) return 12;
  if (s === 0) return 4;
  if (s === -1) return -10;
  return -18;
}

export function applyChoice(battle, choiceIndex, bonus = 0) {
  const round = getCurrentRound(battle);
  if (!round) return { error: 'no_round' };
  const choice = round.choices[choiceIndex];
  if (!choice) return { error: 'bad_choice' };

  const delta = scoreToDelta(choice.score || 0, bonus);
  battle.resistance = Math.max(0, Math.min(battle.maxResistance, battle.resistance - delta));
  const reply = choice.reply || '…';
  let phase = 'continue';

  if (battle.type === 'sale') {
    if (battle.resistance <= 0) {
      battle.won = true;
      battle.earnings = battle.basePrice;
      if (battle.customer.bulk) battle.earnings = Math.floor(battle.basePrice * 4.5);
      phase = 'won';
    } else if (delta < 0 && battle.resistance > 40 && Math.random() < 0.22) {
      battle.lost = true;
      phase = 'lost';
    } else if (battle.roundIndex >= battle.rounds.length - 1) {
      if (battle.resistance <= 25) {
        battle.won = true;
        battle.earnings = Math.floor(battle.basePrice * 0.88);
        phase = 'won';
      } else {
        battle.lost = true;
        phase = 'lost';
      }
    } else {
      battle.roundIndex += 1;
    }
  } else {
    if (battle.resistance <= 0) {
      battle.won = true;
      battle.repGain = 2;
      phase = 'won';
    } else if (delta < 0 && battle.resistance > 30) {
      battle.lost = true;
      phase = 'lost';
    } else if (battle.roundIndex >= battle.rounds.length - 1) {
      if (battle.resistance <= 20) {
        battle.won = true;
        battle.repGain = 1;
        phase = 'won';
      } else {
        battle.lost = true;
        phase = 'lost';
      }
    } else {
      battle.roundIndex += 1;
    }
  }

  return { reply, phase, battle, delta };
}
