-- Update Types of Game body text with Singles and Pairs descriptions
-- Uses 'woods' terminology throughout per club convention

update public.how_to_play
set body = 'Singles is bowls at its purest — just two players, head to head. Each player delivers two woods, alternating with their opponent (A, B, A, B). Once all four woods are down, the player whose wood lies closest to the jack scores one point per counting wood — a maximum of two per end.

In a competition, singles is played to 21 points. In a friendly, you can agree any target — 11 is the usual choice for a relaxed game.

Pairs follows the same rhythm but with teammates alongside you. The length of a pairs game is either an agreed number of ends or set by the Captain for a competition.'
where title = 'Types of Game';
