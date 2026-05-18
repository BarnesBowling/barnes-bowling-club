-- Update The Quartiles section body text

update public.how_to_play
set body = 'The green is divided into quartiles and the jack must land within the quartile to be in play. The jack must land no more than 6 feet from the edge of the green.

If the jack is over the centre line when one green is in use, or within 4 feet of the centre line when both greens are in use, it will be repositioned to conform to these requirements.

If the jack overruns the green, or fails to traverse two thirds of the green, the opposing player has the option of placing it anew but not bowling first.'
where title = 'The Quartiles';
