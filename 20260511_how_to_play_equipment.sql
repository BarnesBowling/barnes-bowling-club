-- Update Equipment & Clothing section body text

update public.how_to_play
set body = 'Barnes Bowling Club plays the Elizabethan game using just two woods per player — unlike modern bowls which uses four. The woods are slightly asymmetric, giving them a natural bias (curve) as they travel. No player is allowed to play with a bias less than 7.

Flat-soled shoes are required on the green to protect the surface. Dress is smart casual, and shirts or t-shirts must be worn at all times.

The club has a variety of woods available for use by new members and guests.'
where title = 'Equipment & Clothing';
