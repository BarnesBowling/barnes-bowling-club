-- Insert The Quartiles as a new section between The Green (2) and Types of Game (3)

-- Shift sort_orders >= 3 up by one to make room
update public.how_to_play set sort_order = sort_order + 1 where sort_order >= 3;

-- Insert The Quartiles at sort_order 3
insert into public.how_to_play (title, body, sort_order) values (
  'The Quartiles',
  'The green is divided into quartiles and the jack must land within the quartile to be in play. The jack must land no more than 6 feet from the edge of the green.

If the jack is over the centre line when one green is in use, or within 4 feet of the centre line when both greens are in use, it will be repositioned to conform to these requirements.

If the jack overruns the green, or fails to traverse two thirds of the green, the opposing player has the option of placing it anew but not bowling first.',
  3
);
