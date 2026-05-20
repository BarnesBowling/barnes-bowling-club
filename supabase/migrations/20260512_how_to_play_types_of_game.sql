-- Update Types of Game section body text

update public.how_to_play
set body = 'Elizabethan Bowls is a wonderful game to play with up to 4 people. In a practice session you can play against or with any number of players, but competitive fixtures are played in two recognised formats: Singles or Pairs.'
where title = 'Types of Game';
