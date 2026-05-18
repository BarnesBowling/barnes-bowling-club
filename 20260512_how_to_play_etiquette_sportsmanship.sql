-- Append sportsmanship and after-play content to Club Etiquette body.
-- Uses || concat so the existing text is preserved regardless of its current state.

update public.how_to_play
set body = body || E'\n\nCongratulate good shots from both sides. New members are paired with experienced players for their first sessions — there is no expectation to be competitive immediately. After play it is traditional to share a drink with your opponents at the Sun Inn.'
where title = 'Club Etiquette';
