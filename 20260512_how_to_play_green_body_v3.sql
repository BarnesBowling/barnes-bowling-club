-- Update The Green section body text (first paragraph only)

update public.how_to_play
set body = 'Barnes Bowling Club proudly plays Elizabethan Bowls — a historic game using highly-biased Lignum Vitae woods, played corner to corner across an irregular rectangular green that has likely remained unchanged since the 18th Century. The book Bowled Over recognises Barnes as one of the most important sites of sporting heritage in Britain, and the green is one of the few remaining walled gardens in the borough, of interest to the Richmond Garden Society.'
where title = 'The Green';
