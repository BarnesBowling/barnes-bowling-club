-- Update How to Bowl section body text (add knee rule)

update public.how_to_play
set body = 'Stand with the opposite foot to your bowling hand on the step. Do not touch the green — the other foot must not be on the step. Face your target, holding the wood with the bias facing inward (toward the centre line of your intended path). Swing the arm smoothly and release the wood close to the ground — a high release causes bouncing. Do not touch the step with your knee on release. Aim to the outside of your intended line; the bias will curve the wood back toward the jack.

Reading the green — knowing how much to allow for slope and bias — comes with experience.'
where title = 'How to Bowl';
