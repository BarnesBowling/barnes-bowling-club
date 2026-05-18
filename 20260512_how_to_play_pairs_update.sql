-- Update Types of Game body text — replace Pairs description with new copy
-- Singles text unchanged; Pairs rewritten with woods terminology and 6-end format

update public.how_to_play
set body = 'Singles is bowls at its purest — just two players, head to head. Each player delivers two woods, alternating with their opponent (A, B, A, B). Once all four woods are down, the player whose wood lies closest to the jack scores one point per counting wood — a maximum of two per end.

In a competition, singles is played to 21 points. In a friendly, you can agree any target — 11 is the usual choice for a relaxed game.

In Pairs, two players form a team. Each player delivers 2 woods in the sequence shown above. Play usually runs to 6 ends, and the team with the most points wins.

As in singles, the player or team winning the end throws the jack for the next, and the order of play is determined by whoever throws the jack. The number of ends can be however many is agreed between players, or as determined by the Captain in a competition.'
where title = 'Types of Game';
