const assets = (() => {
    const
        {fromPairs, range} = _, // eslint disable no-undef
        {SpriteSheet, loadImage} = utils,

        playerSpriteSheet = loadImage('assets/characters/player.png').then(
            image => new SpriteSheet({
                image,

                frames: fromPairs(range(0, 6).flatMap((i) => ([
                    [`idle-down-${i}`, {x: i * 48, y: 0, w: 48, h: 48}],
                    [`idle-right-${i}`, {x: i * 48, y: 48, w: 48, h: 48}],
                    [`idle-left-${i}`, {
                        x: i * 48, y: 48, w: 48, h: 48, flip: true,
                    }],
                    [`idle-up-${i}`, {x: i * 48, y: 2 * 48, w: 48, h: 48}],

                    [`walk-right-${i}`, {x: i * 48, y: 4 * 48, w: 48, h: 48}],
                    [`walk-left-${i}`, {
                        x: i * 48, y: 4 * 48, w: 48, h: 48, flip: true,
                    }],
                    [`walk-up-${i}`, {x: i * 48, y: 5 * 48, w: 48, h: 48}],
                    [`walk-down-${i}`, {x: i * 48, y: 3 * 48, w: 48, h: 48}],

                    [`attack-down-${i}`, {x: i * 48, y: 6 * 48, w: 48, h: 48}],
                    [`attack-right-${i}`, {x: i * 48, y: 7 * 48, w: 48, h: 48}],
                    [`attack-left-${i}`, {
                        x: i * 48, y: 7 * 48, w: 48, h: 48, flip: true,
                    }],
                    [`attack-up-${i}`, {x: i * 48, y: 8 * 48, w: 48, h: 48}],
                ]))),

                animations: {
                    'idle-down': {
                        frames: range(0,6).map((i) => `idle-down-${i}`),
                        frameRate: 6,
                    },
                    'idle-right': {
                        frames: range(0,6).map((i) => `idle-right-${i}`),
                        frameRate: 6,
                    },
                    'idle-left': {
                        frames: range(0,6).map((i) => `idle-left-${i}`),
                        frameRate: 6,
                    },
                    'idle-up': {
                        frames: range(0,6).map((i) => `idle-up-${i}`),
                        frameRate: 6,
                    },


                    'walk-right': {
                        frames: range(0,6).map((i) => `walk-right-${i}`),
                        frameRate: 6,
                    },
                    'walk-up': {
                        frames: range(0,6).map((i) => `walk-up-${i}`),
                        frameRate: 6,
                    },
                    'walk-left': {
                        frames: range(0,6).map((i) => `walk-left-${i}`),
                        frameRate: 6,
                    },
                    'walk-down': {
                        frames: range(0,6).map((i) => `walk-down-${i}`),
                        frameRate: 6,
                    },


                    'attack-down': {
                        frames: range(0,4).map((i) => `attack-down-${i}`),
                        frameRate: 8,
                    },
                    'attack-right': {
                        frames: range(0,4).map((i) => `attack-right-${i}`),
                        frameRate: 8,
                    },
                    'attack-left': {
                        frames: range(0,4).map((i) => `attack-left-${i}`),
                        frameRate: 8,
                    },
                    'attack-up': {
                        frames: range(0,4).map((i) => `attack-up-${i}`),
                        frameRate: 8,
                    },
                },

                scale: 2,
            }),
        ),

        slimeSpriteSheet = loadImage('assets/characters/slime.png').then(
            image => new SpriteSheet({
                image,

                frames: fromPairs(range(0, 7).flatMap((i) => ([
                    [`idle-right-${i}`, {x: i * 32, y: 0, w: 32, h: 32}],
                    [`idle-left-${i}`, {
                        x: i * 32, y: 0, w: 32, h: 32, flip: true,
                    }],
                    [`jump-right-${i}`, {x: i * 32, y: 32, w: 32, h: 32}],
                    [`jump-left-${i}`, {
                        x: i * 32, y: 32, w: 32, h: 32, flip: true,
                    }],
                    [`dead-right-${i}`, {x: i * 32, y: 64, w: 32, h: 32}],
                    [`dead-left-${i}`, {
                        x: i * 32, y: 64, w: 32, h: 32, flip: true,
                    }],
                ]))),

                animations: {
                    'idle-right': {
                        frames: range(0,4).map((i) => `idle-right-${i}`),
                        frameRate: 6,
                    },

                    'idle-left': {
                        frames: range(0,4).map((i) => `idle-left-${i}`),
                        frameRate: 6,
                    },

                    'jump-right': {
                        frames: range(0,6).map((i) => `jump-right-${i}`),
                        frameRate: 6,
                    },

                    'jump-left': {
                        frames: range(0,6).map((i) => `jump-left-${i}`),
                        frameRate: 6,
                    },

                    'dead-right': {
                        frames: range(0,6).map((i) => `dead-right-${i}`),
                        frameRate: 6,
                    },

                    'dead-left': {
                        frames: range(0,6).map((i) => `dead-left-${i}`),
                        frameRate: 6,
                    },
                },

                scale: 2,
            })
        )


    return {playerSpriteSheet, slimeSpriteSheet}
})()
