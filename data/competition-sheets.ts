// Add new sheets here.
// competition values: 'cup' | 'shield' | 'pairs' | 'manser'
// type values: 'bracket' | 'image' | 'pdf' | 'round-robin'
// For bracket type, populate rounds[]. For round-robin, populate players[]. For image/pdf, set src.

export type Competition = 'cup' | 'shield' | 'pairs' | 'manser';
export type SheetType = 'bracket' | 'image' | 'pdf' | 'round-robin';

export interface BracketMatch {
  player1: string;
  player2: string;
  winner?: string;
}

export interface BracketRound {
  name: string;
  deadline: string;
  matches: BracketMatch[];
}

export interface CompetitionSheet {
  id: string;
  title: string;
  competition: Competition;
  date: string;
  type: SheetType;
  src?: string;
  rules?: string;
  note?: string;
  rounds?: BracketRound[];
  players?: string[];
  initialScores?: Record<string, string>;
}

const blank = (n: number): BracketMatch[] =>
  Array.from({ length: n }, () => ({ player1: '', player2: '' }));

export const competitionSheets: CompetitionSheet[] = [
  {
    id: 'cup-2026',
    title: 'The Fisher Cup',
    competition: 'cup',
    date: '2026 Season',
    type: 'bracket',
    rules: 'To 21 Points · No Handicap',
    note: 'First named player is responsible for contacting their opponent to arrange their match',
    rounds: [
      {
        name: 'Round 1',
        deadline: 'By June 23rd',
        matches: [
          { player1: 'Rhona Vose',         player2: 'Andrew Cleven'     },
          { player1: "Bernard O'Keeffe",   player2: 'Tracy Greasley'    },
          { player1: 'Danny Peel',          player2: 'Stephen Gaskell'  },
          { player1: 'Marisa Talbot',       player2: 'Simon Danciger'   },
          { player1: 'Sarah Crosbie-Smith', player2: 'Toby Steedman'    },
          { player1: 'Gareth Ballance',     player2: 'Alaric Evans'     },
          { player1: 'Gerry Summers',       player2: 'Judith Heaton'    },
          { player1: 'Roger Ford',          player2: 'Venina Rees'      },
          { player1: 'Brian Evans',         player2: 'Hayley Steedman'  },
          { player1: "Jim O'Neill",         player2: 'Ginette Grimes'   },
          { player1: 'Brian Coles',         player2: 'Mark Hunter'      },
          { player1: 'Rupert Warburton',    player2: 'Phil Thompson'    },
          { player1: 'Fausto More',         player2: 'Jeremy Frearson'  },
          { player1: 'Colin Clarke',        player2: 'Jeff Black'       },
          { player1: "Noel O'Hara",         player2: 'David Priestley'  },
          { player1: 'Catherine Mitrenas',  player2: 'Bye'              },
        ],
      },
      { name: 'Round 2',        deadline: 'By July 26th', matches: blank(8) },
      { name: 'Quarter Finals', deadline: 'By Aug 16th',  matches: blank(4) },
      { name: 'Semi-Finals',    deadline: 'By Aug 31st',  matches: blank(2) },
      { name: 'Final',          deadline: 'September',    matches: blank(1) },
    ],
  },

  {
    id: 'shield-2026',
    title: 'The Hurlingham Shield',
    competition: 'shield',
    date: '2026 Season',
    type: 'bracket',
    rules: 'To 21 Points · Full Handicap',
    note: 'First named player is responsible for contacting their opponent to arrange their match',
    rounds: [
      {
        name: 'Round 1',
        deadline: 'By July 7th',
        matches: [
          { player1: 'Andrew Cleven',       player2: 'Gareth Ballance'   },
          { player1: 'Phil Thompson',       player2: 'Ginette Grimes'    },
          { player1: 'Danny Peel',          player2: "Jim O'Neill"       },
          { player1: 'Marisa Talbot',       player2: 'Hayley Steedman'   },
          { player1: 'Tracy Greasley',      player2: 'Catherine Mitrenas'},
          { player1: 'Gerry Summers',       player2: 'Colin Clarke'      },
          { player1: 'Sarah Crosbie-Smith', player2: 'Brian Evans'       },
          { player1: 'Venina Rees',         player2: 'Fausto More'       },
          { player1: 'Stephen Gaskell',     player2: 'Michael Perkins'   },
          { player1: 'Roger Ford',          player2: 'Peter Evans'       },
          { player1: "Noel O'Hara",         player2: 'Rupert Warburton'  },
          { player1: 'Rhona Vose',          player2: 'Brian Coles'       },
          { player1: 'Simon Danciger',      player2: 'Toby Steedman'     },
          { player1: 'Judith Heaton',       player2: 'Alaric Evans'      },
          { player1: 'Jeff Black',          player2: "Bernard O'Keeffe"  },
          { player1: 'Ian Livingstone',     player2: 'Mark Hunter'       },
        ],
      },
      { name: 'Round 2',        deadline: 'By July 31st', matches: blank(8) },
      { name: 'Quarter Finals', deadline: 'By Aug 20th',  matches: blank(4) },
      { name: 'Semi-Finals',    deadline: 'By Aug 31st',  matches: blank(2) },
      { name: 'Final',          deadline: 'September',    matches: blank(1) },
    ],
  },

  {
    id: 'pairs-2026',
    title: 'The Pairs Cup',
    competition: 'pairs',
    date: '2026 Season',
    type: 'bracket',
    rules: 'Rounds 1–3 to 15 Points · Semi-Finals & Final to 21 Points · Half Combined Handicap',
    note: 'The first named pair are responsible for contacting their opponents to arrange the match',
    rounds: [
      {
        name: 'Round 1',
        deadline: 'By June 21st',
        matches: [
          { player1: 'Brian C & Jim',       player2: 'Bernard & Ian'      },
          { player1: 'Toby & Hayley',       player2: 'Simon D & Andrew F' },
          { player1: 'Fee & Terry',         player2: 'Tracy & Mark'       },
          { player1: 'Colin & Fausto',      player2: 'Alaric & Jane'      },
        ],
      },
      { name: 'Round 2',    deadline: 'By July 12th', matches: blank(4) },
      { name: 'Semi-Finals', deadline: 'By Aug 9th',  matches: blank(2) },
      { name: 'Final',       deadline: 'September',   matches: blank(1) },
    ],
  },

  {
    id: 'manser-2026',
    title: 'The Manser Cup',
    competition: 'manser',
    date: '2026 Season',
    type: 'round-robin',
    rules: 'Each game to 11 points. Half Handicap',
    players: [
      'Andrew Fox', 'Mark Hunter', 'Tracy', 'Gerry the Jeweller',
      'Alaric', 'Brian Coles', 'David Priestley', 'Ginnette Grimes',
      "Jim O'Neill", 'Judith Heaton', 'Rhona', 'Venina',
      'Andrew Cleven', 'Bernard O', 'Catherine M', "Noel O'Hara",
      'Fee Power', 'Lucas Papa',
    ],
    initialScores: {
      '0:1': '1',   // Andrew Fox → Mark Hunter
      '0:3': '10',  // Andrew Fox → Gerry the Jeweller
      '1:0': '11',  // Mark Hunter → Andrew Fox
      '1:5': '11',  // Mark Hunter → Brian Coles
      '3:0': '11',  // Gerry the Jeweller → Andrew Fox
      '3:5': '-1',  // Gerry the Jeweller → Brian Coles
      '5:1': '3',   // Brian Coles → Mark Hunter
      '5:3': '11',  // Brian Coles → Gerry the Jeweller
      '6:4': '11',  // David Priestley → Alaric
      '4:5': '11',  // Alaric → Brian Coles
      '4:6': '4',   // Alaric → David Priestley
    },
  },
];
