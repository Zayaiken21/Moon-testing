# Voxelia — Survival Combat Update

This build adds a complete survival-combat layer while keeping the existing Voxelia world systems intact.

## Weapons + crafting
Six weapons are registered in the crafting system:
1. Scrap Club — melee
2. Bone Spear — melee
3. Hunting Bow — arrows
4. Hunter Crossbow — high-damage crossbow bolts/arrows
5. Pebble Sling — stones
6. Spark Caster — energy projectile

Crafted weapons are remembered for the current survival run and can be equipped with number keys **1–6**. The on-screen **CRAFT** control cycles through every weapon recipe; if a weapon is already crafted, it equips it instead.

## Crossbow
The Hunter Crossbow is a real projectile weapon with a visible bolt, longer range, higher damage, and its own recipe using wood, stone, and iron.

## Monsters
100 generated monster variants now use 10 creature families plus deterministic silhouette/detail mutations: horns, eyes, plates, limbs, spikes, accent pieces, and non-uniform body proportions. Each monster also has one of 10 combat abilities such as thrower, spitter, dasher, burrower, blinker, pulser, leaper, freezer, graviton, or swarm.

## Combat fixes
- Player-fired projectiles now collide with their targeted monster and deal damage.
- Monster projectiles still collide with the player.
- Touch controls retain independent movement/look behavior.
- Existing touch attack button and desktop attack/craft controls remain available.
- Survival HP, respawn, kills, monster spawning, and resource rewards remain active.
