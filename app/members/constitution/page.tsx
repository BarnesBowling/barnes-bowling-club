'use client';

import { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

type Block =
  | { kind: 'para'; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'sub'; num: string; title?: string; blocks: Block[] };

interface Section {
  num: number;
  title: string;
  blocks: Block[];
}

const SECTIONS: Section[] = [
  {
    num: 1, title: 'Aims of the Club',
    blocks: [
      { kind: 'para', text: 'The Barnes Bowling Club was established in 1725 and is situated at the rear of the Sun Inn, 9 Church Road, Barnes SW13 9HE.' },
      { kind: 'para', text: 'The aims of the Club are:' },
      { kind: 'bullets', items: [
        'to promote the historic game of ‘Elizabethan Bowls’; and',
        'to ensure that its membership represents a good cross-section of the local community.',
      ]},
      { kind: 'para', text: 'The Club Playing Rules and Ground Rules are an annex to this Constitution and these Rules shall be displayed on the Club Notice Board.' },
    ],
  },

  {
    num: 2, title: 'Membership',
    blocks: [
      { kind: 'para', text: 'The full membership number should be determined annually by the Committee in light of the Club’s needs and use of the green and ratified by members at the next Annual General Meeting.' },
      { kind: 'sub', num: '2.1', title: 'Full and Probationary Membership', blocks: [
        { kind: 'sub', num: '', title: 'Approval of Applications', blocks: [] },
        { kind: 'sub', num: '2.1.1', blocks: [{ kind: 'para', text: 'Any new membership application may be approved by a simple majority vote of the Committee, conducted by ballot if required.' }] },
        { kind: 'sub', num: '2.1.2', blocks: [{ kind: 'para', text: 'Prior to approval, the applicant must have been introduced to, and played with, at least two members of the Committee.' }] },
        { kind: 'sub', num: '', title: 'Probationary Period', blocks: [] },
        { kind: 'sub', num: '2.1.3', blocks: [{ kind: 'para', text: 'All newly approved members shall serve a probationary period of one full year, as defined by this Constitution.' }] },
        { kind: 'sub', num: '2.1.4', blocks: [{ kind: 'para', text: 'The probationary year must also include one complete playing season.' }] },
        { kind: 'sub', num: '2.1.5', blocks: [{ kind: 'para', text: 'A full playing season is defined as the period commencing from the official opening day of the Club’s season and concluding on the official closing day of that season, as determined annually by the Committee.' }] },
        { kind: 'sub', num: '', title: 'Restrictions During Probation', blocks: [] },
        { kind: 'sub', num: '2.1.6', blocks: [
          { kind: 'para', text: 'During the probationary period, members shall not be permitted to:' },
          { kind: 'bullets', items: [
            'a.  Participate in Club competitions, except for International Day and the Challenger Plus Cup;',
            'b.  Vote at Club meetings;',
            'c.  Hold any Club office, except in exceptional circumstances where the Committee determines that such appointment is necessary for the effective functioning of the Club. Any such appointment must be approved by a majority vote at a Committee meeting at which a quorum is present, and the decision must be formally recorded in the minutes.',
          ]},
          { kind: 'para', text: 'The member shall remain a probationary member for all purposes and the term “acting” shall be used to denote the probationary nature of the member. Any such acting member shall not have voting rights in Committee meetings.' },
        ]},
      ]},
      { kind: 'sub', num: '2.2', title: 'Honorary Membership', blocks: [
        { kind: 'para', text: 'Honorary Membership may be awarded by an Annual General Meeting.' },
      ]},
    ],
  },

  {
    num: 3, title: 'Guests',
    blocks: [
      { kind: 'para', text: 'Members may bring guests to the Club, limited to a reasonable number at any one time.' },
      { kind: 'para', text: 'Members must accompany and are wholly responsible for their guests while they are at the Club.' },
      { kind: 'para', text: 'They must:' },
      { kind: 'bullets', items: [
        'sign their guests in when they arrive, using the Guest Book provided;',
        'ensure that Club members have priority in use of the Green; and',
        'ensure that their guests use the Green and Club premises properly.',
      ]},
      { kind: 'sub', num: '3.1', title: 'Guest Fees', blocks: [
        { kind: 'para', text: 'Any guest may use the Green for play, provided that this is recorded in the Guest Book by the responsible Member, who will be liable for the prescribed Green fee for that guest.' },
        { kind: 'para', text: 'There is no fee payable in respect of guests who do not use the Green.' },
      ]},
      { kind: 'sub', num: '3.2', title: 'Exceptions', blocks: [
        { kind: 'para', text: 'The requirement to sign in guests, and liability for guest fees for playing guests, will not apply on weekly Club Open Nights, Opening Day, Barnes Fair Day or International Day, or on occasions when the Club Captain has publicly declared the Club open to people interested in learning more about how the game is played.' },
      ]},
    ],
  },

  {
    num: 4, title: 'General Meetings',
    blocks: [
      { kind: 'sub', num: '4.1', blocks: [{ kind: 'para', text: 'The Annual General Meeting (“AGM”) shall be held on a date decided by the Committee before the beginning of each bowling season.' }] },
      { kind: 'sub', num: '4.2', blocks: [{ kind: 'para', text: 'An Extraordinary General Meeting (“EGM”) shall be called by the Secretary on the decision of the Committee, or on receipt of a written request from five or more members of the Club.' }] },
      { kind: 'sub', num: '4.3', blocks: [{ kind: 'para', text: 'Not less than twenty-one clear days’ notice of any General Meeting will be given to members by the Club Secretary, together with notice of any proposed changes to this Constitution and any non-routine issues requiring resolution.' }] },
      { kind: 'sub', num: '4.4', blocks: [{ kind: 'para', text: 'Amendments to the Playing Rules or Ground Rules may only be effected at an AGM, or at an EGM called specifically to consider such amendments.' }] },
      { kind: 'sub', num: '4.5', blocks: [
        { kind: 'para', text: 'Full Members attending the Annual General Meeting (“AGM”) shall be responsible for the election of the members of the Committee. Full Members who are unable to attend the AGM may vote by proxy. Proxy votes may be submitted electronically, including by email or through any secure electronic voting system approved by the Committee, provided that written notice of the appointment of a proxy is received by the Secretary no later than the deadline published for that AGM.' },
        { kind: 'para', text: 'Proxy voting shall apply to all matters on which Full Members are entitled to vote, including elections, motions, and resolutions, thereby affirming and protecting the voting rights of Full Members who cannot attend in person.' },
        { kind: 'para', text: 'The Committee may introduce and operate an anonymous voting system for remote voting. This system may be run alongside, or may replace, the existing non-anonymous email-based proxy process where it is determined that the new method provides a fairer, more secure, and more transparent voting process.' },
        { kind: 'para', text: 'Any transition to a revised voting method will not prejudice the rights of Full Members who attend the AGM in person, whose votes shall be counted equally alongside proxy votes.' },
      ]},
    ],
  },

  {
    num: 5, title: 'Conduct of Meetings of the Club',
    blocks: [
      { kind: 'sub', num: '5.1', blocks: [{ kind: 'para', text: 'Every member (Full/Honorary) shall have the right to speak, but only Full Members shall have the right to vote.' }] },
      { kind: 'sub', num: '5.2', blocks: [{ kind: 'para', text: 'Each Full Member shall have one vote.' }] },
      { kind: 'sub', num: '5.3', blocks: [{ kind: 'para', text: 'Any resolution, including but not limited to a resolution for the dissolution of the Club under Section 11 below, put to the vote of the meeting shall be decided by a show of hands by the Full Members present at the meeting. Full Members who are unable to attend the AGM may vote by proxy.' }] },
    ],
  },

  {
    num: 6, title: 'The Committee and Officers of the Club',
    blocks: [
      { kind: 'sub', num: '6.1', blocks: [{ kind: 'para', text: 'The Committee shall be composed of the Chair, Captain, Vice-Captain, Treasurer, Secretary and up to four Full members. The President may attend any Committee meeting, but does not have a voting entitlement unless he/she is an elected Committee Member.' }] },
      { kind: 'sub', num: '6.2', blocks: [{ kind: 'para', text: 'All members of the Committee shall be elected by the Club at its AGM.' }] },
      { kind: 'sub', num: '6.3', blocks: [
        { kind: 'para', text: 'The Officers of the Club will be:' },
        { kind: 'bullets', items: ['President', 'Chair', 'Captain', 'Vice-Captain', 'Treasurer', 'Secretary'] },
      ]},
      { kind: 'sub', num: '6.4', blocks: [{ kind: 'para', text: 'All members of the Committee shall automatically retire at the end of the AGM following that at which they were elected.' }] },
      { kind: 'sub', num: '6.5', blocks: [{ kind: 'para', text: 'Any Committee member who will be required to retire at the end of an AGM (under 6.4 above) may be re-elected by the same AGM.' }] },
      { kind: 'sub', num: '6.6', blocks: [{ kind: 'para', text: 'Ex-Officio Members may be co-opted by the Committee. They will not hold voting rights.' }] },
      { kind: 'sub', num: '6.7', blocks: [{ kind: 'para', text: 'In case of a vacancy the Committee may appoint a temporary Officer of the Club or Member of the Committee, who will be eligible for election at the following AGM.' }] },
    ],
  },

  {
    num: 7, title: 'Conduct of Committee Meetings',
    blocks: [
      { kind: 'sub', num: '7.1', blocks: [{ kind: 'para', text: 'The Committee will meet at least once per calendar month during the playing season and otherwise as necessary.' }] },
      { kind: 'sub', num: '7.2', blocks: [{ kind: 'para', text: 'Decisions of the Committee will be arrived at by a simple majority vote.' }] },
      { kind: 'sub', num: '7.3', blocks: [{ kind: 'para', text: 'Each Committee member shall be entitled to speak and have one vote.' }] },
      { kind: 'sub', num: '7.4', blocks: [{ kind: 'para', text: 'A resolution put to the vote at a Committee Meeting shall be decided by a show of hands and shall be carried by a majority of votes.' }] },
      { kind: 'sub', num: '7.5', blocks: [{ kind: 'para', text: 'In the event of equality of votes the Chair shall be entitled to a second or casting vote.' }] },
      { kind: 'sub', num: '7.6', blocks: [{ kind: 'para', text: 'The Chair shall conduct all Committee Meetings.' }] },
      { kind: 'sub', num: '7.7', blocks: [{ kind: 'para', text: 'Five members of the Committee shall form a quorum.' }] },
    ],
  },

  {
    num: 8, title: 'Responsibilities of the Committee',
    blocks: [
      { kind: 'sub', num: '8.1', blocks: [{ kind: 'para', text: 'To conduct the day to day running, and to manage the property and money, of the Club.' }] },
      { kind: 'sub', num: '8.2', title: 'Player Handicaps', blocks: [
        { kind: 'para', text: 'Before the start of each playing season, the Captain is responsible for convening a Handicap Committee to determine player handicaps. Handicaps must be allocated based on players’ performance in the previous season and their relative skill levels.' },
        { kind: 'para', text: 'The Handicap Committee shall consist of:' },
        { kind: 'bullets', items: [
          'the Captain;',
          'the Vice-Captain; and',
          'two Club members (one may be a current Committee member, but at least one must not serve on the Club Committee).',
        ]},
        { kind: 'para', text: 'The Club Committee must ratify the membership of the Handicap Committee in advance.' },
        { kind: 'para', text: 'After the Handicap Committee has met and assigned handicaps, the proposed handicaps must be submitted to the Club Committee for approval before being published.' },
      ]},
    ],
  },

  {
    num: 9, title: 'Suspension, Refusal or Termination of Membership',
    blocks: [
      { kind: 'sub', num: '9.1', blocks: [{ kind: 'para', text: 'Any member who fails to pay membership fees by the date required may forfeit his/her membership subject to the provisions of Section 10 below.' }] },
      { kind: 'sub', num: '9.2', blocks: [{ kind: 'para', text: 'The Committee shall be entitled to refuse renewal of any existing membership or suspend any membership: for infringement of the Ground Rules or misconduct. Provided that the member concerned shall have the right to be heard by the full Committee before a final decision is made.' }] },
      { kind: 'sub', num: '9.3', blocks: [{ kind: 'para', text: 'The Committee shall inform a member in writing of any proposal to suspend or refuse his/her membership.' }] },
      { kind: 'sub', num: '9.4', blocks: [{ kind: 'para', text: 'A member under suspension shall not be entitled to use of the club premises.' }] },
      { kind: 'sub', num: '9.5', blocks: [{ kind: 'para', text: 'A suspended member has the right to appeal. An appeal will be heard by an Officer of the Club and two non-Committee members invited to adjudicate by the Committee.' }] },
      { kind: 'sub', num: '9.6', blocks: [{ kind: 'para', text: 'A suspended member may apply to an AGM or EGM of the club for reinstatement.' }] },
    ],
  },

  {
    num: 10, title: 'Fees',
    blocks: [
      { kind: 'sub', num: '10.1', blocks: [{ kind: 'para', text: 'Annual subscriptions, guest playing fees and joining fees shall be decided upon by the Committee in the context of the financial position of the Club and subject to ratification at the AGM.' }] },
      { kind: 'sub', num: '10.2', blocks: [{ kind: 'para', text: 'Membership fees fall due for payment when ratified by the AGM and, if not paid by 31 March, membership will automatically lapse, unless prior arrangements have been made through the Treasurer (see Clause 10.3 below).' }] },
      { kind: 'sub', num: '10.3', blocks: [{ kind: 'para', text: 'If a member is unable to meet full subscription requirements by 31 March, then he/she should submit a request, in writing, by 14 March, and the Treasurer will invite the Committee to assess the acceptability of a deferred payment.' }] },
    ],
  },

  {
    num: 11, title: 'Dissolution of the Club',
    blocks: [
      { kind: 'para', text: 'The Club may be dissolved by resolution carried by a majority of at least two-thirds of members attending an AGM, or an EGM called specifically to consider such dissolution.' },
      { kind: 'para', text: 'In the event of such a resolution, it shall be the responsibility of the Committee to divide any assets and money of the Club, after all debts of the Club have been discharged, equally between all members whose subscriptions have been duly paid.' },
    ],
  },
];

const paraStyle: React.CSSProperties = {
  fontFamily: "'Libre Baskerville', serif",
  fontSize: '15px',
  lineHeight: 2,
  color: 'var(--text-mid)',
  margin: '0 0 0.75rem 0',
};

function RenderBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.kind === 'para') {
          return <p key={i} style={paraStyle}>{b.text}</p>;
        }
        if (b.kind === 'bullets') {
          return (
            <ul key={i} style={{ margin: '0 0 0.75rem 0', paddingLeft: '1.25rem', listStyle: 'disc' }}>
              {b.items.map((item, j) => (
                <li key={j} style={{ ...paraStyle, margin: '0 0 0.25rem 0' }}>{item}</li>
              ))}
            </ul>
          );
        }
        if (b.kind === 'sub') {
          if (b.title) {
            return (
              <div key={i} style={{ marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.4rem' }}>
                  <span style={{
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '11px',
                    fontWeight: 700,
                    letterSpacing: '.1em',
                    color: 'var(--gold)',
                    flexShrink: 0,
                  }}>{b.num}</span>
                  <span style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '16px',
                    fontWeight: 500,
                    color: 'var(--green-deep)',
                  }}>{b.title}</span>
                </div>
                <div style={{ paddingLeft: '2.5rem' }}>
                  <RenderBlocks blocks={b.blocks} />
                </div>
              </div>
            );
          }
          return (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2.75rem 1fr', gap: '0 0.5rem', marginBottom: '0.6rem' }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '.06em',
                color: 'var(--text-muted)',
                paddingTop: '5px',
                textAlign: 'right',
              }}>{b.num}</span>
              <div><RenderBlocks blocks={b.blocks} /></div>
            </div>
          );
        }
        return null;
      })}
    </>
  );
}

interface RuleItem { num: number; blocks: Block[] }
interface RuleSection { heading: string; items: RuleItem[] }

const GROUND_RULES_DOC: RuleSection[] = [
  {
    heading: 'Playing Rules',
    items: [
      { num: 1,  blocks: [{ kind: 'para', text: 'The playing season will not commence before the last Saturday in April and shall normally end on 30th September, unless the Committee extend the season due to favourable weather and green conditions.' }] },
      { num: 2,  blocks: [{ kind: 'para', text: 'No player will play with a Wood of less than No. 7 Bias.' }] },
      { num: 3,  blocks: [{ kind: 'para', text: 'The Jack, when played, must have traversed at least two thirds of the length of the green and one half of the width of the green; at such points markers will be placed.' }] },
      { num: 4,  blocks: [
        { kind: 'para', text: 'Under no circumstances will the Jack be moved from where it has been played unless it is:' },
        { kind: 'bullets', items: [
          'less than 6 feet from the boundary line',
          'less than 4 feet from the centre line when both greens are in use',
        ]},
        { kind: 'para', text: 'in which case it will be repositioned to conform to these requirements.' },
      ]},
      { num: 5,  blocks: [{ kind: 'para', text: 'Should the Jack overrun the green, or fail to traverse two thirds of the length of the green, or fail to traverse one half of the width of the green, the opposing player(s) shall have the option of placing it anew, but not bowling first.' }] },
      { num: 6,  blocks: [{ kind: 'para', text: 'Scoring Woods are those of one player, or team, that are not more than four feet from the Jack, and nearer than the opposing Woods.' }] },
      { num: 7,  blocks: [
        { kind: 'para', text: 'A completed game will consist of:' },
        { kind: 'bullets', items: [
          'a.  For Cup and Shield Competitions 21 points',
          'b.  For all other Competitions, an agreed number of ‘Ends’ or ‘Points’ as defined by the Captain, Vice-Captain or Competition Manager prior to the start of a competition',
          'c.  For non-competitive games as agreed between players before commencement of a match with consideration for those waiting to play.',
        ]},
      ]},
      { num: 8,  blocks: [{ kind: 'para', text: 'Members and their guests who have completed a game should not continue to play a further game to the exclusion of a member who is waiting.' }] },
      { num: 9,  blocks: [
        { kind: 'para', text: '“No End” will be declared under the following conditions:' },
        { kind: 'bullets', items: [
          'a.  Jack knocked off the green during play. A Jack rebounding onto the green after having been knocked off shall constitute a “No End”',
          'b.  Prior to the score being agreed, Jack being moved by any other than a Wood in play.',
          'c.  Prior to the score being agreed, Wood(s) being moved by any other means than other Woods or the Jack in play.',
          'd.  First scoring Wood of the opposite side being equi-distant from the Jack.',
          'e.  In the event of No End being declared for reasons b or c above having been caused by a player or players (even if accidentally): the opposing player(s) will be awarded the maximum scoring points possible.',
        ]},
      ]},
      { num: 10, blocks: [{ kind: 'para', text: 'On the Club’s Final’s Day, in the event of inclement weather only the players involved in the Final, plus the Captain, should decide whether play should continue. In the event of a disagreement the Captain’s decision will be final.' }] },
      { num: 11, blocks: [{ kind: 'para', text: 'All competition rules for the season should be decided by the Committee prior to the commencement of play. These rules once in place can only be changed by full Committee agreement.' }] },
      { num: 12, blocks: [{ kind: 'para', text: 'Players should notify other members in advance when they wish to use the green for a competition by fixing a notice to the Board. Only one competition is to be played at any one time, so, provided that competitors agree to it, leaving the unused part of the green free for non-competition bowlers.' }] },
    ],
  },
  {
    heading: 'Ground Rules',
    items: [
      { num: 1, blocks: [{ kind: 'para', text: 'All drinks consumed on Club premises, by members and/or guests, must be purchased from the Sun Inn, this being a condition of our Lease. Failure to abide by this requirement may result in the Committee suspending an offending member’s club membership.' }] },
      { num: 2, blocks: [{ kind: 'para', text: 'Mobile phones must not be used whilst any Competition game is in progress.' }] },
      { num: 3, blocks: [{ kind: 'para', text: 'Shirts or t-shirts must be worn at all times whilst in the Club.' }] },
      { num: 4, blocks: [{ kind: 'para', text: 'Children are not allowed on the Green and not allowed to run around the Club.' }] },
      { num: 5, blocks: [{ kind: 'para', text: 'Members must return glasses to the Sun Inn and clear away any litter at the end of each session.' }] },
      { num: 6, blocks: [{ kind: 'para', text: 'When the Club is to host a corporate event or visiting teams are due to play at the Club an advance notice must be posted on the notice board at least two weeks prior to play. Club members must be allowed to take part. Permission for such an event or visit must in all cases have been granted by the Committee, in advance, and payment agreed.' }] },
    ],
  },
];

function RenderRuleDoc({ sections }: { sections: RuleSection[] }) {
  return (
    <div>
      {sections.map((section, si) => (
        <div key={section.heading} style={{ marginBottom: si < sections.length - 1 ? '2rem' : 0 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: '16px',
            fontWeight: 500,
            color: 'var(--green-deep)',
            letterSpacing: '.02em',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: '1px solid rgba(45,90,61,.1)',
          }}>
            {section.heading}
          </div>
          {section.items.map(item => (
            <div key={item.num} style={{ display: 'grid', gridTemplateColumns: '2.75rem 1fr', gap: '0 0.5rem', marginBottom: '0.6rem' }}>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '.06em',
                color: 'var(--text-muted)',
                paddingTop: '5px',
                textAlign: 'right',
              }}>{item.num}.</span>
              <div><RenderBlocks blocks={item.blocks} /></div>
            </div>
          ))}
        </div>
      ))}
      <p style={{
        fontFamily: "'Libre Baskerville', serif",
        fontSize: '13px',
        lineHeight: 1.8,
        color: 'var(--text-muted)',
        fontStyle: 'italic',
        margin: '1.5rem 0 0',
      }}>
        Amended at AGM November 27th 2025
      </p>
    </div>
  );
}

export default function ConstitutionPage() {
  const [groundRulesOpen, setGroundRulesOpen] = useState(false);

  return (
    <>
      <Navbar />
      <main>
        {/* Header */}
        <div style={{ background: 'var(--green-deep)', padding: '1rem 2rem 4rem', color: 'var(--cream)' }}>
          <div className="section-inner">
            <a href="/members/dashboard" className="section-tag" style={{ color: 'var(--gold)', borderTopColor: 'var(--gold)', textDecoration: 'none' }}>Members Area</a>
            <h1 className="section-h2" style={{ color: 'var(--cream)', fontSize: 'clamp(1.75rem,4vw,2.75rem)' }}>
              Club Constitution — <em style={{ color: 'var(--gold-light)' }}>November 2025</em>
            </h1>
            <p className="section-lead" style={{ color: 'rgba(245,240,232,.65)' }}>
              The governing constitution of Barnes Bowling Club, adopted by resolution of members at the AGM held on 27th November 2025.
            </p>
          </div>
        </div>

        <div className="section-inner" style={{ padding: '3rem 2rem 5rem', maxWidth: '760px' }}>

          {SECTIONS.map((s) => (
            <div key={s.num} style={{ marginBottom: '2.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '1.25rem', marginBottom: '0.75rem' }}>
                <span style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  fontWeight: 700,
                  letterSpacing: '.12em',
                  color: 'var(--gold)',
                  flexShrink: 0,
                }}>
                  {String(s.num).padStart(2, '0')}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(45,90,61,.12)' }} />
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '20px',
                  fontWeight: 500,
                  color: 'var(--green-deep)',
                  margin: 0,
                }}>
                  {s.title}
                </h2>
              </div>
              <div style={{ marginLeft: '3rem' }}>
                <RenderBlocks blocks={s.blocks} />
              </div>
            </div>
          ))}

          {/* Date of adoption */}
          <div style={{
            marginTop: '1rem',
            padding: '1.5rem 2rem',
            background: 'rgba(45,90,61,.04)',
            borderLeft: '3px solid rgba(45,90,61,.2)',
          }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--green-deep)',
              marginBottom: '6px',
            }}>
              Date of Adoption
            </div>
            <p style={{
              fontFamily: "'Libre Baskerville', serif",
              fontSize: '13px',
              lineHeight: 1.8,
              color: 'var(--text-mid)',
              margin: 0,
            }}>
              Revised following AGM – 27 November 2025.
            </p>
          </div>

          {/* Download link */}
          <div style={{ marginTop: '1.5rem' }}>
            <a
              href="https://barnesbowling.club/wp-content/uploads/2024/02/BBC-Constitution-November-2021.docx.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                color: 'var(--green-mid)',
                textDecoration: 'none',
                letterSpacing: '.05em',
              }}
            >
              Download PDF ↗
            </a>
          </div>

          {/* Ground Rules accordion */}
          <div style={{ marginTop: '2.75rem' }}>
            <button
              onClick={() => setGroundRulesOpen(o => !o)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'baseline',
                gap: '1.25rem',
                background: 'none',
                border: 'none',
                borderTop: '2px solid rgba(45,90,61,.12)',
                padding: '1.5rem 0 0.75rem',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '.12em',
                color: 'var(--gold)',
                flexShrink: 0,
              }}>GR</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(45,90,61,.12)', alignSelf: 'center' }} />
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: '20px',
                fontWeight: 500,
                color: 'var(--green-deep)',
                margin: 0,
                flexShrink: 0,
              }}>
                Ground Rules
              </h2>
              <span style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '16px',
                fontWeight: 400,
                color: 'var(--text-muted)',
                flexShrink: 0,
                marginLeft: '0.25rem',
                lineHeight: 1,
              }}>
                {groundRulesOpen ? '−' : '+'}
              </span>
            </button>

            {groundRulesOpen && (
              <div style={{ marginTop: '0.5rem', marginLeft: '3rem' }}>
                <div style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontSize: '11px',
                  letterSpacing: '.05em',
                  color: 'var(--text-muted)',
                  marginBottom: '1.5rem',
                }}>
                  Playing and Ground Rules 2025
                </div>
                <RenderRuleDoc sections={GROUND_RULES_DOC} />
                <div style={{ marginTop: '1.25rem' }}>
                  <a
                    href="https://barnesbowling.club/wp-content/uploads/2024/02/BBC-Playing-and-Ground-Rules-2020-Feb-2020.docx.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '12px',
                      color: 'var(--green-mid)',
                      textDecoration: 'none',
                      letterSpacing: '.05em',
                    }}
                  >
                    Download PDF ↗
                  </a>
                </div>
              </div>
            )}
          </div>

          {/* Back link */}
          <div style={{ marginTop: '3rem' }}>
            <a href="/members/dashboard" style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: '13px',
              color: 'var(--green-mid)',
              textDecoration: 'none',
              letterSpacing: '.05em',
            }}>
              ← Back to dashboard
            </a>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
}
