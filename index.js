(async () => {

    const
        {fromPairs, invert, range, flatMap} = _,
        {SpriteSheet, loadImage} = utils,

        canvas = document.getElementById('canvas'),
        ctx = canvas.getContext('2d'),

        spriteSheet = await loadImage('assets/characters/player.png').then((sheetImg) => {
            return new SpriteSheet({
                image: sheetImg,
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
            })
        }),

        player = {
            spriteSheet,

            direction: 'down',

            animation: (() => {
                const animation = spriteSheet.getAnimation('idle-down')
                animation.start()
                return animation
            })(),

            x: 0,
            y: 0,

            xVel: 0,
            yVel: 0,

            handleInput: function (input, keysState) {
                this.yVel = (
                    (keysState['ArrowUp'] ? -50 : 0)
                    + (keysState['ArrowDown'] ? 50 : 0)
                )

                this.xVel = (
                    (keysState['ArrowLeft'] ? -50 : 0)
                    + (keysState['ArrowRight'] ? 50 : 0)
                )

                if (this.xVel)
                    this.direction = this.xVel > 0 ? 'right' : 'left'

                else if (this.yVel)
                    this.direction = this.yVel > 0 ? 'down' : 'up'

                let nextAnimationName;

                if (this.animation.name.startsWith('attack'))
                    return

                if (
                    input.code == 'Space'
                    && input.type == 'keydown'
                    && input.repeat == false
                )
                    nextAnimationName = 'attack-' + this.direction

                else
                    nextAnimationName =
                        (this.xVel || this.yVel)
                            ? 'walk-' + this.direction
                            : 'idle-' + this.direction

                if (nextAnimationName != this.animation.name) {
                    this.animation.stop()
                    this.animation =
                        this.spriteSheet.getAnimation(nextAnimationName)

                    if (this.animation.name.startsWith('attack'))
                        this.animation.once('complete', () => {
                            this.animation = this.spriteSheet.getAnimation(
                                'idle-' + this.direction
                            )
                            this.animation.start()
                        })
                }

                if (!this.animation.active)
                    this.animation.start()
            },

            update: function (deltaTime) {
                this.x += this.xVel * (deltaTime)
                this.y += this.yVel * (deltaTime)

                this.animation.update(deltaTime)
            },

            render (ctx, deltaTime) {
                const currentFrame = this.animation.getCurrentFrame()
                currentFrame.draw(ctx, this.x, this.y)
            }
        },

        main = () => {
            const keysState = {}

            ;['keydown', 'keyup'].forEach((eventName) => {
                document.addEventListener(eventName, (e) => {
                    keysState[e.key] = eventName == 'keydown' ? true : false
                    player.handleInput(e, keysState)
                })
            })

            let
                lastTime = Date.now() / 1000,
                deltaTime = 0

            const loop = () => {
                update(deltaTime)
                render(ctx, deltaTime)

                now = Date.now() / 1000
                deltaTime = now - lastTime
                lastTime = now
            }

            setInterval(loop, 1000 / 60)
        },

        update = (deltaTime) => {
            player.update(deltaTime)
        },

        render = (deltaTime) => {
            ctx.fillStyle = 'lightgray'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            player.render(ctx)
        }


    main()
})()
