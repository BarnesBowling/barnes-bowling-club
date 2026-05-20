-- Update The Green section body text (quartiles, jack placement rules)

update public.how_to_play
set body = 'The green is divided into quartiles marked by white sticks on the boundary of the green.

The jack must land within the quartile and be within 6 feet of the edge of the green. If the jack lands on a quartile line, it may be moved further in by agreement between the players.'
where title = 'The Green';
