-- Rename "The Green & The Rink" section and update body text

update public.how_to_play
set
  title = 'The Green',
  body  = 'The Barnes green sits in a walled garden behind the Sun Inn and is unlike any modern bowling green. It is naturally undulating — built up over 300 years of play with bumps, slopes and hollows that give the game its unique character.

The green is divided into quartiles for competitive play. The long edges are gently banked for a more competitive game. A shallow ditch surrounds the perimeter.

The diagrams below show the layout of the green, the boundaries, and the area around the green.'
where title = 'The Green & The Rink';
